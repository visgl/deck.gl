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
import GL from '@luma.gl/constants';
import {Model, Geometry, Texture2D, fp64, Buffer} from 'luma.gl';
import {loadImage} from '@loaders.gl/core';
import {Matrix4} from 'math.gl';
const {fp64LowPart} = fp64;

import vs from './mesh-layer-vertex.glsl';
import fs from './mesh-layer-fragment.glsl';

const RADIAN_PER_DEGREE = Math.PI / 180;
let rotationMatrix = new Float32Array(16);
let modelMatrix = new Matrix4();

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
    return loadImage(src)
      .then(data => getTextureFromData(gl, data, opts))
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
  getRoll: {type: 'accessor', value: x => x.roll || 0},
  getScale: {type: 'accessor', value: x => x.scale || [1, 1, 1]},
  getTranslation: {type: 'accessor', value: x => x.translate || [0, 0, 0]},
  getMatrix: {type: 'accessor', value: x => x.matrix || null}
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
      instanceColors: {
        size: 4,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceModelMatrix: {
        size: 16,
        shaderAttributes: {
          instanceModelMatrixColumn1: {
            size: 4,
            stride: 64,
            offset: 0
          },
          instanceModelMatrixColumn2: {
            size: 4,
            stride: 64,
            offset: 16
          },
          instanceModelMatrixColumn3: {
            size: 4,
            stride: 64,
            offset: 32
          },
          instanceModelMatrixColumn4: {
            size: 4,
            stride: 64,
            offset: 48
          }
        },
        update: this.calculateInstanceModelMatrix
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
    for (const object of data) {
      const position = getPosition(object);
      value[i++] = fp64LowPart(position[0]);
      value[i++] = fp64LowPart(position[1]);
    }
  }

  calculateInstanceModelMatrix(attribute) {
    const {data, getYaw, getPitch, getRoll, getScale, getTranslation, getMatrix} = this.props;
    let instanceModelMatrixData = attribute.value;

    let i = 0;
    for (const object of data) {
      let matrix = getMatrix(object);

      if (!matrix) {
        let roll = getRoll(object) * RADIAN_PER_DEGREE;
        let pitch = getPitch(object) * RADIAN_PER_DEGREE;
        let yaw = getYaw(object) * RADIAN_PER_DEGREE;
        let scale = getScale(object);
        let translate = getTranslation(object);

        let sr = Math.sin(roll);
        let sp = Math.sin(pitch);
        let sw = Math.sin(yaw);

        let cr = Math.cos(roll);
        let cp = Math.cos(pitch);
        let cw = Math.cos(yaw);

        rotationMatrix[0] = cw * cp; // 0,0
        rotationMatrix[1] = sw * cp; // 1,0
        rotationMatrix[2] = -sp; // 2,0
        rotationMatrix[3] = 0;
        rotationMatrix[4] = -sw * cr + cw * sp * sr; // 0,1
        rotationMatrix[5] = cw * cr + sw * sp * sr; // 1,1
        rotationMatrix[6] = cp * sr; // 2,1
        rotationMatrix[7] = 0;
        rotationMatrix[8] = sw * sr + cw * sp * cr; // 0,2
        rotationMatrix[9] = -cw * sr + sw * sp * cr; // 1,2
        rotationMatrix[10] = cp * cr; // 2,2
        rotationMatrix[11] = 0;
        rotationMatrix[12] = 0;
        rotationMatrix[13] = 0;
        rotationMatrix[14] = 0;
        rotationMatrix[15] = 1;

        modelMatrix
          .identity()
          .translate(translate)
          .multiplyRight(rotationMatrix)
          .scale(scale);

        matrix = modelMatrix;
      }

      instanceModelMatrixData[i++] = matrix[0];
      instanceModelMatrixData[i++] = matrix[1];
      instanceModelMatrixData[i++] = matrix[2];
      instanceModelMatrixData[i++] = matrix[3];
      instanceModelMatrixData[i++] = matrix[4];
      instanceModelMatrixData[i++] = matrix[5];
      instanceModelMatrixData[i++] = matrix[6];
      instanceModelMatrixData[i++] = matrix[7];
      instanceModelMatrixData[i++] = matrix[8];
      instanceModelMatrixData[i++] = matrix[9];
      instanceModelMatrixData[i++] = matrix[10];
      instanceModelMatrixData[i++] = matrix[11];
      instanceModelMatrixData[i++] = matrix[12];
      instanceModelMatrixData[i++] = matrix[13];
      instanceModelMatrixData[i++] = matrix[14];
      instanceModelMatrixData[i++] = matrix[15];
    }
  }
}

MeshLayer.layerName = 'MeshLayer';
MeshLayer.defaultProps = defaultProps;
