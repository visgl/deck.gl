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

import {Layer, COORDINATE_SYSTEM, experimental} from 'deck.gl';
const {fp64LowPart, enable64bitSupport} = experimental;
import {GL, Model, Geometry, loadTextures, Texture2D} from 'luma.gl';

import vs from './mesh-layer-vertex.glsl';
import vs64 from './mesh-layer-vertex-64.glsl';
import fs from './mesh-layer-fragment.glsl';
import project64utils from '../shaderlib/project64utils/project64utils';

function degreeToRadian(degree) {
  return degree * Math.PI / 180;
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

const defaultProps = {
  mesh: null,
  texture: null,
  sizeScale: 1,

  // TODO - parameters should be merged, not completely overridden
  parameters: {
    depthTest: true,
    depthFunc: GL.LEQUAL
  },
  fp64: false,
  // Optional settings for 'lighting' shader module
  lightSettings: {},

  getPosition: x => x.position,
  getAngleDegreesCW: x => x.angle || 0,
  getColor: x => x.color || [0, 0, 0, 255]
};

export default class MeshLayer extends Layer {
  getShaders(id) {
    const {shaderCache} = this.context;
    return enable64bitSupport(this.props)
      ? {vs: vs64, fs, modules: [project64utils, 'picking', 'lighting'], shaderCache}
      : {vs, fs, modules: ['picking', 'lighting'], shaderCache}; // 'project' module added by default.
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        accessor: 'getPosition',
        update: this.calculateInstancePositions
      },
      instanceAngles: {
        size: 1,
        accessor: 'getAngleDegreesCW',
        update: this.calculateInstanceAngles
      },
      instanceColors: {size: 4, accessor: 'getColor', update: this.calculateInstanceColors}
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

    if (changeFlags.propsChanged) {
      this._updateFP64(props, oldProps);

      if (props.sizeScale !== oldProps.sizeScale) {
        const {sizeScale} = props;
        this.state.model.setUniforms({sizeScale});
      }

      if (props.texture !== oldProps.texture) {
        this.setTexture(props.texture);
      }
    }
  }

  _updateFP64(props, oldProps) {
    if (props.fp64 !== oldProps.fp64) {
      this.setState({model: this.getModel(this.context.gl)});

      this.state.model.setUniforms({
        sizeScale: props.sizeScale
      });
      this.setTexture(this.state.texture);

      const attributeManager = this.getAttributeManager();
      attributeManager.invalidateAll();

      if (enable64bitSupport(this.props)) {
        attributeManager.addInstanced({
          instancePositions64xy: {
            size: 2,
            accessor: 'getPosition',
            update: this.calculateInstancePositions64xyLow
          }
        });
      } else {
        attributeManager.remove(['instancePositions64xy']);
      }
    }
  }

  draw({uniforms}) {
    this.state.model.render(uniforms);
  }

  getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: getGeometry(this.props.mesh),
        isInstanced: true
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

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i] = position[0];
      value[i + 1] = position[1];
      value[i + 2] = position[2] || 0;
      i += size;
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = fp64LowPart(position[0]);
      value[i++] = fp64LowPart(position[1]);
    }
  }

  calculateInstanceAngles(attribute) {
    const {data, getAngleDegreesCW} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const angle = getAngleDegreesCW(point);
      value[i] = -degreeToRadian(angle);
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point) || DEFAULT_COLOR;
      value[i++] = color[0];
      value[i++] = color[1];
      value[i++] = color[2];
      value[i++] = isNaN(color[3]) ? 255 : color[3];
    }
  }
}

MeshLayer.layerName = 'MeshLayer';
MeshLayer.defaultProps = defaultProps;
