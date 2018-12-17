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

import {Layer} from '@deck.gl/core';
import GL from 'luma.gl/constants';
import {Model, Geometry, fp64} from 'luma.gl';
const {fp64LowPart} = fp64;

import vs from './bezier-curve-layer-vertex.glsl';
import fs from './bezier-curve-layer-fragment.glsl';

const NUM_SEGMENTS = 40;

const defaultProps = {
  strokeWidth: {type: 'number', min: 0, value: 1},
  fp64: false,
  getSourcePosition: {type: 'accessor', value: x => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: x => x.targetPosition},
  getControlPoint: {type: 'accessor', value: x => x.controlPoint},
  getColor: {type: 'accessor', value: x => x.color || [0, 0, 0, 255]}
};

export default class BezierCurveLayer extends Layer {
  getShaders() {
    return {vs, fs, modules: ['picking']};
  }

  initializeState() {
    const {attributeManager} = this.state;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        transition: true,
        accessor: 'getSourcePosition',
        update: this.calculateInstanceSourcePositions
      },
      instanceTargetPositions: {
        size: 3,
        transition: true,
        accessor: 'getTargetPosition',
        update: this.calculateInstanceTargetPositions
      },
      instanceControlPoints: {
        size: 3,
        transition: false,
        accessor: 'getControlPoint',
        update: this.calculateInstanceControlPoints
      },
      instanceColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: true,
        accessor: 'getColor',
        update: this.calculateInstanceColors
      }
    });
    /* eslint-enable max-len */
  }

  updateAttribute({props, oldProps, changeFlags}) {
    if (props.fp64 !== oldProps.fp64) {
      const {attributeManager} = this.state;
      attributeManager.invalidateAll();
    }
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      this.setState({model: this._getModel(gl)});
    }
    this.updateAttribute({props, oldProps, changeFlags});
  }

  draw({uniforms}) {
    const {strokeWidth} = this.props;

    this.state.model.render(
      Object.assign({}, uniforms, {
        strokeWidth
      })
    );
  }

  _getModel(gl) {
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

    const model = new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_STRIP,
          attributes: {
            positions: new Float32Array(positions)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
    model.setUniforms({numSegments: NUM_SEGMENTS});
    return model;
  }

  calculateInstanceSourcePositions(attribute) {
    const {data, getSourcePosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const sourcePosition = getSourcePosition(object);
      value[i + 0] = sourcePosition[0];
      value[i + 1] = sourcePosition[1];
      value[i + 2] = isNaN(sourcePosition[2]) ? 0 : sourcePosition[2];
      i += size;
    });
  }

  calculateInstanceTargetPositions(attribute) {
    const {data, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const targetPosition = getTargetPosition(object);
      value[i + 0] = targetPosition[0];
      value[i + 1] = targetPosition[1];
      value[i + 2] = isNaN(targetPosition[2]) ? 0 : targetPosition[2];
      i += size;
    });
  }

  calculateInstanceControlPoints(attribute) {
    const {data, getControlPoint} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const controlPoint = getControlPoint(object);
      value[i + 0] = controlPoint[0];
      value[i + 1] = controlPoint[1];
      value[i + 2] = isNaN(controlPoint[2]) ? 0 : controlPoint[2];
      i += size;
    });
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

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    data.forEach(object => {
      const color = getColor(object);
      value[i + 0] = color[0];
      value[i + 1] = color[1];
      value[i + 2] = color[2];
      value[i + 3] = isNaN(color[3]) ? 255 : color[3];
      i += size;
    });
  }
}

BezierCurveLayer.layerName = 'BezierCurveLayer';
BezierCurveLayer.defaultProps = defaultProps;
