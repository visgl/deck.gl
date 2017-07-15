// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import {Layer} from '../../../lib';
import {GL, Model, Geometry} from 'luma.gl';
import {fp64ify, enable64bitSupport} from '../../../lib/utils/fp64';
import {COORDINATE_SYSTEM} from '../../../lib';

import vs from './arc-layer-vertex.glsl';
import vs64 from './arc-layer-vertex-64.glsl';
import fs from './arc-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  strokeWidth: 1,
  fp64: false,

  getSourcePosition: x => x.sourcePosition,
  getTargetPosition: x => x.targetPosition,
  getSourceColor: x => x.color || DEFAULT_COLOR,
  getTargetColor: x => x.color || DEFAULT_COLOR
};

export default class ArcLayer extends Layer {
  getShaders() {
    return enable64bitSupport(this.props) ?
      {vs: vs64, fs, modules: ['project64']} :
      {vs, fs}; // 'project' module added by default.
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this._getModel(gl)});

    const {attributeManager} = this.state;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 4, accessor: ['getSourcePosition', 'getTargetPosition'], update: this.calculateInstancePositions},
      instanceSourceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getSourceColor', update: this.calculateInstanceSourceColors},
      instanceTargetColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getTargetColor', update: this.calculateInstanceTargetColors}
    });
    /* eslint-enable max-len */
  }

  updateAttribute({props, oldProps, changeFlags}) {
    if (props.fp64 !== oldProps.fp64) {
      const {attributeManager} = this.state;
      attributeManager.invalidateAll();

      if (props.fp64 && props.projectionMode === COORDINATE_SYSTEM.LNGLAT) {
        attributeManager.addInstanced({
          instancePositions64Low: {
            size: 4,
            accessor: ['getSourcePosition', 'getTargetPosition'],
            update: this.calculateInstancePositions64Low
          }
        });
      } else {
        attributeManager.remove([
          'instancePositions64Low'
        ]);
      }

    }
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    // Re-generate model if geometry changed
    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
    }
    this.updateAttribute({props, oldProps, changeFlags});
  }

  draw({uniforms}) {
    const {strokeWidth} = this.props;

    this.state.model.render(Object.assign({}, uniforms, {
      strokeWidth
    }));
  }

  _getModel(gl) {
    let positions = [];
    const NUM_SEGMENTS = 50;
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      positions = positions.concat([i, -1, 0, i, 1, 0]);
    }

    const model = new Model(gl, Object.assign({}, this.getShaders(), {
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_STRIP,
        positions: new Float32Array(positions)
      }),
      isInstanced: true,
      shaderCache: this.context.shaderCache
    }));

    model.setUniforms({numSegments: NUM_SEGMENTS});

    return model;
  }

  calculateInstancePositions(attribute) {
    const {data, getSourcePosition, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const sourcePosition = getSourcePosition(object);
      const targetPosition = getTargetPosition(object);
      value[i + 0] = sourcePosition[0];
      value[i + 1] = sourcePosition[1];
      value[i + 2] = targetPosition[0];
      value[i + 3] = targetPosition[1];
      i += size;
    }
  }

  calculateInstancePositions64Low(attribute) {
    const {data, getSourcePosition, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const sourcePosition = getSourcePosition(object);
      const targetPosition = getTargetPosition(object);
      value[i + 0] = fp64ify(sourcePosition[0])[1];
      value[i + 1] = fp64ify(sourcePosition[1])[1];
      value[i + 2] = fp64ify(targetPosition[0])[1];
      value[i + 3] = fp64ify(targetPosition[1])[1];
      i += size;
    }
  }

  calculateInstanceSourceColors(attribute) {
    const {data, getSourceColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getSourceColor(object);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = isNaN(color[3]) ? 255 : color[3];
      i += size;
    }
  }

  calculateInstanceTargetColors(attribute) {
    const {data, getTargetColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const color = getTargetColor(object);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = isNaN(color[3]) ? 255 : color[3];
      i += size;
    }
  }
}

ArcLayer.layerName = 'ArcLayer';
ArcLayer.defaultProps = defaultProps;
