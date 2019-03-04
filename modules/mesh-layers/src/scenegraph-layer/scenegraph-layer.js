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
import {GLTFInstantiator, fp64} from 'luma.gl';

const {fp64LowPart} = fp64;

const vs = `
  // Instance attributes
  attribute vec3 instancePositions;
  attribute vec2 instancePositions64xy;
  attribute vec3 instancePickingColors;

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

    vec3 pos = POSITION.xyz;
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

const defaultProps = {
  sizeScale: {type: 'number', value: 1, min: 0},

  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},

  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  getYaw: {type: 'accessor', value: x => x.yaw || x.angle || 0},
  getPitch: {type: 'accessor', value: x => x.pitch || 0},
  getRoll: {type: 'accessor', value: x => x.roll || 0}
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
      const instantiator = new GLTFInstantiator(this.context.gl, {
        modelOptions: {
          vs,
          fs,
          modules: ['project32', 'picking'],
          isInstanced: true
        }
      });

      const scenes = instantiator.instantiate(props.gltf);
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
}

ScenegraphLayer.layerName = 'ScenegraphLayer';
ScenegraphLayer.defaultProps = defaultProps;
