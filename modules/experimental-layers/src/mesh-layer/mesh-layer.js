// Note: This file will either be moved back to deck.gl or reformatted to web-monorepo standards
// Disabling lint temporarily to facilitate copying code in and out of this repo
/* eslint-disable */

// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {Layer, COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from 'luma.gl/constants';
import {Model, Geometry, loadTextures, Texture2D, fp64} from 'luma.gl';
const {fp64LowPart} = fp64;

import vs from './mesh-layer-vertex.glsl';
import fs from './mesh-layer-fragment.glsl';

const RADIAN_PER_DEGREE = Math.PI / 180;

// Replacement for the external assert method to reduce bundle size
function assert(condition, message) {
  if (!condition) {
    throw new Error(`deck.gl: ${message}`);
  }
}

/*
 * Load image data into luma.gl Texture2D objects
 * @param {WebGLContext} gl
 * @param {String|Texture2D|HTMLImageElement|Uint8ClampedArray} src - source of image data
 *   can be url string, Texture2D object, HTMLImageElement or pixel array
 * @returns {Promise} resolves to an object with name -> texture mapping
 */
function getTexture(gl, src, opts) {
  if (typeof src === 'string') {
    // Url, load the image
    return loadTextures(gl, Object.assign({urls: [src]}, opts))
      .then(textures => textures[0])
      .catch(error => {
        throw new Error(`Could not load texture from ${src}: ${error}`);
      });
  }
  return new Promise(resolve => resolve(getTextureFromData(gl, src, opts)));
}

/*
 * Convert image data into texture
 * @returns {Texture2D} texture
 */
function getTextureFromData(gl, data, opts) {
  if (data instanceof Texture2D) {
    return data;
  }
  return new Texture2D(gl, Object.assign({data}, opts));
}

function validateGeometryAttributes(attributes) {
  assert(attributes.positions && attributes.normals && attributes.texCoords);
}

/*
 * Convert mesh data into geometry
 * @returns {Geometry} geometry
 */
function getGeometry(data) {
  if (data instanceof Geometry) {
    validateGeometryAttributes(data.attributes);
    return data;
  } else if (data.positions) {
    validateGeometryAttributes(data);
    return new Geometry({
      attributes: data
    });
  }
  throw Error('Invalid mesh');
}

const DEFAULT_COLOR = [0, 0, 0, 255];
const defaultProps = {
  mesh: null,
  texture: null,
  sizeScale: {type: 'number', value: 1, min: 0},

  // TODO - parameters should be merged, not completely overridden
  parameters: {
    depthTest: true,
    depthFunc: GL.LEQUAL
  },
  fp64: false,
  // Optional settings for 'lighting' shader module
  lightSettings: {},

  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},

  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  getYaw: {type: 'accessor', value: x => x.yaw || x.angle || 0},
  getPitch: {type: 'accessor', value: x => x.pitch || 0},
  getRoll: {type: 'accessor', value: x => x.roll || 0}
};

export default class MeshLayer extends Layer {
  getShaders() {
    const projectModule = this.use64bitProjection() ? 'project64' : 'project32';
    return {vs, fs, modules: [projectModule, 'lighting', 'picking']};
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        accessor: 'getPosition'
      },
      instancePositions64xy: {
        size: 2,
        accessor: 'getPosition',
        update: this.calculateInstancePositions64xyLow
      },
      instanceRotations: {
        size: 3,
        accessor: ['getYaw', 'getPitch', 'getRoll'],
        update: this.calculateInstanceRotations
      },
      instanceColors: {
        size: 4,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      }
    });

    this.setState({
      // Avoid luma.gl's missing uniform warning
      // TODO - add feature to luma.gl to specify ignored uniforms?
      emptyTexture: new Texture2D(this.context.gl, {
        data: new Uint8Array(4),
        width: 1,
        height: 1
      })
    });
  }

  updateState({props, oldProps, changeFlags}) {
    const attributeManager = this.getAttributeManager();

    // super.updateState({props, oldProps, changeFlags});
    if (changeFlags.dataChanged) {
      attributeManager.invalidateAll();
    }

    this._updateFP64(props, oldProps);

    if (props.texture !== oldProps.texture) {
      this.setTexture(props.texture);
    }
  }

  _updateFP64(props, oldProps) {
    if (props.fp64 !== oldProps.fp64) {
      if (this.state.model) {
        this.state.model.delete();
      }

      this.setState({model: this.getModel(this.context.gl)});

      this.setTexture(this.state.texture);

      const attributeManager = this.getAttributeManager();
      attributeManager.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {sizeScale} = this.props;

    this.state.model.render(
      Object.assign({}, uniforms, {
        sizeScale
      })
    );
  }

  getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: getGeometry(this.props.mesh),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
  }

  setTexture(src) {
    const {gl} = this.context;
    const {model, emptyTexture} = this.state;

    if (src) {
      getTexture(gl, src).then(texture => {
        model.setUniforms({sampler: texture, hasTexture: 1});
        this.setState({texture});
      });
    } else {
      // reset
      this.state.model.setUniforms({sampler: emptyTexture, hasTexture: 0});
      this.setState({texture: null});
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = fp64LowPart(position[0]);
      value[i++] = fp64LowPart(position[1]);
    }
  }

  // yaw(z), pitch(y) and roll(x) in radians
  calculateInstanceRotations(attribute) {
    const {data, getYaw, getPitch, getRoll} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      value[i++] = getRoll(point) * RADIAN_PER_DEGREE;
      value[i++] = getPitch(point) * RADIAN_PER_DEGREE;
      value[i++] = getYaw(point) * RADIAN_PER_DEGREE;
    }
  }
}

MeshLayer.layerName = 'MeshLayer';
MeshLayer.defaultProps = defaultProps;
