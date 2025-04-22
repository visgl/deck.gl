// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer, fp64LowPart, picking, UpdateParameters} from '@deck.gl/core';
import {Device} from '@luma.gl/core';
import {Model, Geometry} from '@luma.gl/engine';

const NUM_SEGMENTS = 40;
const DEFAULT_COLOR = [0, 0, 0, 255];

const WGSL_SHADER = /* WGSL */ `\
@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> @builtin(position) vec4<f32> {
  var positions = array<vec2<f32>, 3>(vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));
  return vec4<f32>(positions[vertexIndex], 0.0, 1.0);
}

@fragment
fn fragmentMain() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`;

/** Provide both GLSL and WGSL shaders */
const VS_GLSL = /* glsl */ `\
#version 300 es
const vec2 pos[3] = vec2[3](vec2(0.0f, 0.5f), vec2(-0.5f, -0.5f), vec2(0.5f, -0.5f));
void main() {
  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}
`;

const FS_GLSL = /* glsl */ `\
#version 300 es
precision highp float;
layout(location = 0) out vec4 outColor;
void main() {
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

const defaultProps = {
  strokeWidth: {type: 'number', min: 0, value: 1},
  getSourcePosition: {type: 'accessor', value: x => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: x => x.targetPosition},
  getControlPoint: {type: 'accessor', value: x => x.controlPoint},
  getColor: {type: 'accessor', value: DEFAULT_COLOR}
};

export class TriangleLayer extends Layer {
  static layerName = 'TriangleLayer';
  static defaultProps = defaultProps;

  state!: {
    model: Model;
  };

  getShaders() {
    return {
      source: WGSL_SHADER,
      vs: VS_GLSL,
      fs: FS_GLSL
      // modules: [picking]
    };
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    /* eslint-disable max-len */
    // attributeManager.addInstanced({
    //   instanceSourcePositions: {
    //     size: 3,
    //     transition: true,
    //     accessor: 'getSourcePosition'
    //   },
    //   instanceTargetPositions: {
    //     size: 3,
    //     transition: true,
    //     accessor: 'getTargetPosition'
    //   },
    //   instanceControlPoints: {
    //     size: 3,
    //     transition: false,
    //     accessor: 'getControlPoint'
    //   },
    //   instanceColors: {
    //     size: 4,
    //     type: 'uint8',
    //     transition: true,
    //     accessor: 'getColor',
    //     defaultValue: [0, 0, 0, 255]
    //   }
    // });
    /* eslint-enable max-len */
  }

  updateState(props: UpdateParameters<this>) {
    super.updateState(props);

    if (props.changeFlags.extensionsChanged) {
      const {device} = this.context;
      if (this.state.model) {
        this.state.model.destroy();
      }
      this.setState({model: this._getModel(device)});
    }
  }

  draw({uniforms}) {
    const {strokeWidth} = this.props;

    this.state.model.instanceCount = 1;
    this.state.model.isInstanced = false;
    this.state.model.draw(this.context.renderPass);
  }

  _getModel(device: Device) {
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    let positions = [];
    for (let i = 0; i <= NUM_SEGMENTS; i++) {
      positions = positions.concat([i, -1, 0, i, 1, 0]);
    }

    const model = new Model(device, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        topology: 'triangle-strip',
        attributes: {
          positions: new Float32Array(positions)
        }
      }),
      isInstanced: true,
      vertexCount: 3,
      instanceCount: 1,
      // shaderCache: this.context.shaderCache.
      parameters: {
        depthWriteEnabled: true,
        depthCompare: 'always'
      }
    });
    // work around model bug
    model.setParameters({
      depthWriteEnabled: true,
      depthCompare: 'always'
    });
    // model.setUniforms({numSegments: NUM_SEGMENTS});
    return model;
  }

  calculateInstanceSourceTargetPositions64xyLow(attribute) {
    const {data, getSourcePosition, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const sourcePosition = getSourcePosition(object);
      const targetPosition = getTargetPosition(object);
      value[i + 0] = fp64LowPart(sourcePosition[0]);
      value[i + 1] = fp64LowPart(sourcePosition[1]);
      value[i + 2] = fp64LowPart(targetPosition[0]);
      value[i + 3] = fp64LowPart(targetPosition[1]);
      i += size;
    });
  }
}
