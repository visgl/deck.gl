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
import {Model, CubeGeometry, fp64} from 'luma.gl';
const {fp64LowPart} = fp64;

import vs from './gpu-grid-cell-layer-vertex.glsl';
import fs from './gpu-grid-cell-layer-fragment.glsl';

const DEFAULT_MINCOLOR = [0, 0, 0, 255];
const DEFAULT_MAXCOLOR = [0, 255, 0, 255];
const AGGREGATION_DATA_UBO_INDEX = 0;

const defaultProps = {
  cellSize: {type: 'number', min: 0, max: 1000, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  elevationScale: {type: 'number', min: 0, value: 1},
  extruded: true,
  fp64: false,
  pickable: false, // TODO: add picking support (read from aggregated texture)

  minColor: {type: 'color', value: DEFAULT_MINCOLOR},
  maxColor: {type: 'color', value: DEFAULT_MAXCOLOR},

  lightSettings: {}
};

export default class GPUGridCellLayer extends Layer {
  getShaders() {
    return {vs, fs, modules: ['project32', 'lighting', 'picking', 'fp64']};
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instanceCounts: {
        size: 4,
        update: this.calculateInstanceCounts,
        noAlloc: true
      }
    });
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    // Re-generate model if geometry changed
    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      const model = this._getModel(gl);
      this._setupUniformBuffer(model);
      this.setState({model});
      this.state.attributeManager.invalidate('instanceCounts');
    }
    if (props.countsBuffer !== oldProps.countsBuffer) {
      this.state.attributeManager.invalidate('instanceCounts');
    }
  }

  _getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new CubeGeometry(),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
  }

  draw({uniforms}) {
    const {
      cellSize,
      extruded,
      elevationScale,
      coverage,
      gridSize,
      gridOrigin,
      gridOffset,
      minColor,
      maxColor,
      maxCountBuffer
    } = this.props;

    const gridOriginLow = [fp64LowPart(gridOrigin[0]), fp64LowPart(gridOrigin[1])];
    const gridOffsetLow = [fp64LowPart(gridOffset[0]), fp64LowPart(gridOffset[1])];

    maxCountBuffer.bind({target: GL.UNIFORM_BUFFER, index: AGGREGATION_DATA_UBO_INDEX});
    this.state.model.render(
      Object.assign({}, uniforms, {
        cellSize,
        extruded,
        elevationScale,
        coverage,
        gridSize,
        gridOrigin,
        gridOriginLow,
        gridOffset,
        gridOffsetLow,
        minColor,
        maxColor
      })
    );
    maxCountBuffer.unbind({target: GL.UNIFORM_BUFFER, index: AGGREGATION_DATA_UBO_INDEX});
  }

  calculateInstanceCounts(attribute) {
    const {countsBuffer} = this.props;
    attribute.update({
      buffer: countsBuffer
    });
  }

  _setupUniformBuffer(model) {
    const gl = this.context.gl;
    const programHandle = model.program.handle;

    const uniformBlockIndex = gl.getUniformBlockIndex(programHandle, 'AggregationData');
    gl.uniformBlockBinding(programHandle, uniformBlockIndex, AGGREGATION_DATA_UBO_INDEX);
  }
}

GPUGridCellLayer.layerName = 'GridCellLayer';
GPUGridCellLayer.defaultProps = defaultProps;
