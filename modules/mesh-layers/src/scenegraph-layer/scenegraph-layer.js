// Copyright (c) 2019 Uber Technologies, Inc.
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

import {Layer} from '@deck.gl/core';
import {createGLTFObjects, fp64} from 'luma.gl';
import {Matrix4} from 'math.gl';

const {fp64LowPart} = fp64;

const vs = `
  // Instance attributes
  attribute vec3 instancePositions;
  attribute vec2 instancePositions64xy;
  attribute vec3 instancePickingColors;
  attribute mat4 instanceModelMatrix;

  // Uniforms
  uniform float sizeScale;

  // Attributes
  attribute vec4 POSITION;

  #ifdef HAS_UV
    attribute vec2 TEXCOORD_0;
    varying vec2 vTEXCOORD_0;
  #endif

  void main(void) {
    #ifdef HAS_UV
      vTEXCOORD_0 = TEXCOORD_0;
    #endif

    vec3 pos = (instanceModelMatrix * POSITION).xyz;
    pos = project_scale(pos * sizeScale);

    vec4 worldPosition;
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, worldPosition);
    picking_setPickingColor(instancePickingColors);
  }
`;

const fs = `
  #ifdef HAS_UV
    varying vec2 vTEXCOORD_0;
    uniform sampler2D u_BaseColorSampler;
  #endif

  void main(void) {
    #ifdef HAS_UV
      gl_FragColor = texture2D(u_BaseColorSampler, vTEXCOORD_0);
    #else
      gl_FragColor = vec4(0, 0, 0, 1);
    #endif

    gl_FragColor = picking_filterPickingColor(gl_FragColor);
  }
`;

const DEFAULT_COLOR = [0, 0, 0, 255];
const RADIAN_PER_DEGREE = Math.PI / 180;

const defaultProps = {
  sizeScale: {type: 'number', value: 1, min: 0},

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

export default class ScenegraphLayer extends Layer {
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
      instanceModelMatrix: {
        size: 16,
        accessor: ['getYaw', 'getPitch', 'getRoll', 'getScale', 'getTranslation', 'getMatrix'],
        shaderAttributes: {
          instanceModelMatrix__0: {
            size: 4,
            stride: 64,
            offset: 0
          },
          instanceModelMatrix__1: {
            size: 4,
            stride: 64,
            offset: 16
          },
          instanceModelMatrix__2: {
            size: 4,
            stride: 64,
            offset: 32
          },
          instanceModelMatrix__3: {
            size: 4,
            stride: 64,
            offset: 48
          }
        },
        update: this.calculateInstanceModelMatrix
      }
    });
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

  updateState({props, oldProps, changeFlags}) {
    if (changeFlags.propsChanged && props.gltf) {
      const {scenes} = createGLTFObjects(this.context.gl, props.gltf, {
        modelOptions: {
          vs,
          fs,
          modules: ['project32', 'picking'],
          isInstanced: true
        }
      });
      this.setState({
        sceneGraph: scenes[0]
      });
    }
  }

  drawLayer({moduleParameters = null, uniforms = {}, parameters = {}}) {
    if (!this.state.sceneGraph) return;

    const {sizeScale} = this.props;

    const attributeManager = this.getAttributeManager();
    const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
    const numInstances = this.getNumInstances();

    this.state.sceneGraph.traverse((model, {worldMatrix}) => {
      model.setAttributes(changedAttributes);
      model.setInstanceCount(numInstances);
      model.updateModuleSettings(moduleParameters);
      model.draw({
        parameters,
        uniforms: {
          sizeScale
        }
      });
    });
  }

  calculateInstanceModelMatrix(attribute) {
    const {data, getYaw, getPitch, getRoll, getScale, getTranslation, getMatrix} = this.props;
    let instanceModelMatrixData = attribute.value;
    let rotationMatrix = new Float32Array(16);
    let modelMatrix = new Matrix4();

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

ScenegraphLayer.layerName = 'ScenegraphLayer';
ScenegraphLayer.defaultProps = defaultProps;
