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

import vs from './line-layer-vertex.glsl';
import fs from './line-layer-fragment.glsl';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  fp64: false,

  getSourcePosition: {type: 'accessor', value: x => x.sourcePosition},
  getTargetPosition: {type: 'accessor', value: x => x.targetPosition},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getStrokeWidth: {type: 'accessor', value: 1},

  // deprecated
  strokeWidth: {deprecatedFor: 'getStrokeWidth'}
};

export default class LineLayer extends Layer {
  getShaders() {
    const projectModule = this.use64bitProjection() ? 'project64' : 'project32';
    return {vs, fs, modules: [projectModule, 'picking']};
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 3,
        transition: true,
        accessor: 'getSourcePosition'
      },
      instanceTargetPositions: {
        size: 3,
        transition: true,
        accessor: 'getTargetPosition'
      },
      instanceSourceTargetPositions64xyLow: {
        size: 4,
        accessor: ['getSourcePosition', 'getTargetPosition'],
        update: this.calculateInstanceSourceTargetPositions64xyLow
      },
      instanceColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: true,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255]
      },
      instanceWidths: {
        size: 1,
        transition: true,
        accessor: 'getStrokeWidth',
        defaultValue: 1
      }
    });
    /* eslint-enable max-len */
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
      this.getAttributeManager().invalidateAll();
    }
  }

  _getModel(gl) {
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    const positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];

    return new Model(
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
  }

  calculateInstanceSourceTargetPositions64xyLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(4);
      return;
    }

    const {data, getSourcePosition, getTargetPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const object of data) {
      const sourcePosition = getSourcePosition(object);
      const targetPosition = getTargetPosition(object);
      value[i + 0] = fp64LowPart(sourcePosition[0]);
      value[i + 1] = fp64LowPart(sourcePosition[1]);
      value[i + 2] = fp64LowPart(targetPosition[0]);
      value[i + 3] = fp64LowPart(targetPosition[1]);
      i += size;
    }
  }
}

LineLayer.layerName = 'LineLayer';
LineLayer.defaultProps = defaultProps;
