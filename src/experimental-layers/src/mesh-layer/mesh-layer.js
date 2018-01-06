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
import assert from 'assert';

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
  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.0, 5000],
    ambientRatio: 0.05,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [2.0, 0.0, 0.0, 0.0],
    numberOfLights: 2
  },

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
    const {attributeManager} = this.state;
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
  }

  updateState({props, oldProps, changeFlags}) {
    const {attributeManager} = this.state;

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
        if (props.texture) {
          this.loadTexture(props.texture);
        } else {
          // TODO - reset
        }
      }

      if (props.lightSettings !== oldProps.lightSettings) {
        this.state.model.setUniforms(props.lightSettings);
      }
    }
  }

  _updateFP64(props, oldProps) {
    if (props.fp64 !== oldProps.fp64) {
      this.setState({model: this.getModel(this.context.gl)});

      this.state.model.setUniforms({
        sizeScale: props.sizeScale
      });

      const {attributeManager} = this.state;
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
    const isValidMesh = this.props.mesh instanceof Geometry && this.props.mesh.attributes.positions;
    assert(isValidMesh);

    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: this.props.mesh,
        isInstanced: true
      })
    );
  }

  loadTexture(src) {
    const {gl} = this.context;
    const {model} = this.state;
    getTexture(gl, src).then(texture => {
      model.setUniforms({sampler1: texture});
      this.setNeedsRedraw();
    });
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
