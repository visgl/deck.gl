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

import {Layer, experimental, WebMercatorViewport} from '@deck.gl/core';
const {defaultColorRange} = experimental;

import GL from 'luma.gl/constants';
import {Model, Geometry, Buffer} from 'luma.gl';

import GPUGridAggregator from '../utils/gpu-grid-aggregator';

import vs from './gpu-screen-grid-layer-vertex.glsl';
import fs from './gpu-screen-grid-layer-fragment.glsl';
import assert from 'assert';

const DEFAULT_MINCOLOR = [0, 0, 0, 0];
const DEFAULT_MAXCOLOR = [0, 255, 0, 255];
const AGGREGATION_DATA_UBO_INDEX = 0;
const COLOR_PROPS = [`minColor`, `maxColor`, `colorRange`, `colorDomain`];
const COLOR_RANGE_LENGTH = 6;

const defaultProps = {
  cellSizePixels: {value: 100, min: 1},
  cellMarginSizePixels: {value: 2, min: 0, max: 5},

  colorDomain: null,
  colorRange: defaultColorRange,

  getPosition: d => d.position,
  getWeight: d => 1,

  gpuAggregation: true
};

export default class GPUScreenGridLayer extends Layer {
  getShaders() {
    return {vs, fs, modules: ['picking']};
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    const {gl} = this.context;

    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceCounts: {
        size: 4,
        transition: true,
        accessor: ['getPosition', 'getWeight'],
        update: this.calculateInstanceCounts,
        noAlloc: true
      }
    });
    /* eslint-disable max-len */

    const options = {
      id: `${this.id}-aggregator`,
      shaderCache: this.context.shaderCache
    };
    this.setState({
      model: this._getModel(gl),
      gpuGridAggregator: new GPUGridAggregator(gl, options),
      maxCountBuffer: this._getMaxCountBuffer(gl),
      aggregationData: null
    });

    this._setupUniformBuffer();
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState(opts) {
    super.updateState(opts);

    this._updateUniforms(opts);

    if (opts.changeFlags.dataChanged) {
      this._processData();
    }

    const changeFlags = this._getAggregationChangeFlags(opts);

    if (changeFlags) {
      this._updateAggregation(changeFlags);
    }
  }

  draw({uniforms}) {
    const {parameters = {}} = this.props;
    const minColor = this.props.minColor || DEFAULT_MINCOLOR;
    const maxColor = this.props.maxColor || DEFAULT_MAXCOLOR;

    // If colorDomain not specified we use default domain [1, maxCount]
    // maxCount value will be deduced from aggregated buffer in the vertex shader.
    const colorDomain = this.props.colorDomain || [1, 0];
    const {model, maxCountBuffer, cellScale, shouldUseMinMax, colorRange} = this.state;
    uniforms = Object.assign({}, uniforms, {
      minColor,
      maxColor,
      cellScale,
      colorRange,
      colorDomain,
      shouldUseMinMax
    });

    // TODO: remove index specification (https://github.com/uber/luma.gl/pull/473)
    maxCountBuffer.bind({index: AGGREGATION_DATA_UBO_INDEX});
    model.draw({
      uniforms,
      parameters: Object.assign(
        {
          depthTest: false,
          depthMask: false
        },
        parameters
      )
    });
    maxCountBuffer.unbind({index: AGGREGATION_DATA_UBO_INDEX});
  }

  calculateInstancePositions(attribute, {numInstances}) {
    const {width, height} = this.context.viewport;
    const {cellSizePixels} = this.props;
    const {numCol} = this.state;
    const {value, size} = attribute;

    for (let i = 0; i < numInstances; i++) {
      const x = i % numCol;
      const y = Math.floor(i / numCol);
      value[i * size + 0] = ((x * cellSizePixels) / width) * 2 - 1;
      value[i * size + 1] = 1 - ((y * cellSizePixels) / height) * 2;
      value[i * size + 2] = 0;
    }
  }

  calculateInstanceCounts(attribute, {numInstances}) {
    const {countsBuffer} = this.state;
    attribute.update({
      buffer: countsBuffer
    });
  }

  getPickingInfo({info, mode}) {
    const {index} = info;
    if (index >= 0) {
      let {aggregationData} = this.state;
      if (!aggregationData) {
        aggregationData = {
          countsData: this.state.countsBuffer.getData(),
          maxCountData: this.state.maxCountBuffer.getData()
        };
        // Cache aggregationData to avoid multiple buffer reads.
        this.setState({aggregationData});
      }
      const {countsData, maxCountData} = aggregationData;
      // Each instance (one cell) is aggregated into single pixel,
      // Get current instance's aggregation details.
      info.object = GPUGridAggregator.getAggregationData({
        countsData,
        maxCountData,
        pixelIndex: index
      });
    }

    return info;
  }

  // HELPER Methods

  _getAggregationChangeFlags({oldProps, props, changeFlags}) {
    const cellSizeChanged = props.cellSizePixels !== oldProps.cellSizePixels ||
      props.cellMarginSizePixels !== oldProps.cellMarginSizePixels;
    const dataChanged = changeFlags.dataChanged;
    const viewportChanged = changeFlags.viewportChanged;

    if (cellSizeChanged || dataChanged || viewportChanged) {
      return {cellSizeChanged, dataChanged, viewportChanged};
    }

    return null;
  }

  _getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          attributes: {
            vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
  }

  // Creates and returns a Uniform Buffer object to hold maxCount value.
  _getMaxCountBuffer(gl) {
    return new Buffer(gl, {
      target: GL.UNIFORM_BUFFER,
      bytes: 4 * 4, // Four floats
      size: 4,
      index: AGGREGATION_DATA_UBO_INDEX
    });
  }

  // Process 'data' and build positions and weights Arrays.
  _processData() {
    const {data, getPosition, getWeight} = this.props;
    const positions = [];
    const weights = [];

    for (const point of data) {
      const position = getPosition(point);
      positions.push(position[0]);
      positions.push(position[1]);
      weights.push(getWeight(point));
    }

    this.setState({positions, weights});
  }

  // Set a binding point for the aggregation uniform block index
  _setupUniformBuffer() {
    const gl = this.context.gl;
    const programHandle = this.state.model.program.handle;

    // TODO: Replace with luma.gl api when ready.
    const uniformBlockIndex = gl.getUniformBlockIndex(programHandle, 'AggregationData');
    gl.uniformBlockBinding(programHandle, uniformBlockIndex, AGGREGATION_DATA_UBO_INDEX);
  }

  _shouldUseMinMax() {
    const {minColor, maxColor, colorDomain, colorRange} = this.props;
    if (minColor || maxColor) {
      return true;
    }
    // minColor and maxColor not supplied, check if colorRange or colorDomain supplied.
    // NOTE: colorDomain and colorRange are experimental features, use them only when supplied.
    if (colorDomain || colorRange) {
      return false;
    }
    // None specified, use default minColor and maxColor
    return true;
  }

  _updateAggregation(changeFlags) {
    const attributeManager = this.getAttributeManager();
    if (changeFlags.cellSizeChanged || changeFlags.viewportChanged) {
      this._updateGridParams();
      attributeManager.invalidateAll();
    }
    const {cellSizePixels, gpuAggregation} = this.props;

    const {positions, weights, maxCountBuffer, countsBuffer} = this.state;

    const projectPoints = this.context.viewport instanceof WebMercatorViewport;
    this.state.gpuGridAggregator.run({
      positions,
      weights,
      cellSize: [cellSizePixels, cellSizePixels],
      viewport: this.context.viewport,
      countsBuffer,
      maxCountBuffer,
      changeFlags,
      useGPU: gpuAggregation,
      projectPoints
    });

    // Aggregation changed, enforce reading buffer data for picking.
    this.setState({aggregationData: null});

    attributeManager.invalidate('instanceCounts');
  }

  _updateUniforms({oldProps, props, changeFlags}) {
    const newState = {};
    if (this._updateMinMaxUniform({oldProps, props})) {
      newState.shouldUseMinMax = this._shouldUseMinMax();
    }

    if (oldProps.colorRange !== props.colorRange) {
      const colorRangeUniform = [];
      assert(props.colorRange && props.colorRange.length === COLOR_RANGE_LENGTH);
      props.colorRange.forEach(color => {
        colorRangeUniform.push(color[0], color[1], color[2], color[3] || 255);
      });
      newState.colorRange =  colorRangeUniform;
    }

    if (oldProps.cellMarginSizePixels !== props.cellMarginSizePixels ||
        oldProps.cellSizePixels !== props.cellSizePixels ||
        changeFlags.viewportChanged ) {

        const {width, height} = this.context.viewport;
        const {cellSizePixels, cellMarginSizePixels} = this.props;
        const margin = cellSizePixels > cellMarginSizePixels ? cellMarginSizePixels : 0;

        newState.cellScale = new Float32Array([
          ((cellSizePixels - margin) / width) * 2,
          (-(cellSizePixels - margin) / height) * 2,
          1
        ]);
    }
    this.setState(newState);
  }

  _updateGridParams() {
    const {width, height} = this.context.viewport;
    const {cellSizePixels} = this.props;
    const {gl} = this.context;

    const numCol = Math.ceil(width / cellSizePixels);
    const numRow = Math.ceil(height / cellSizePixels);
    const numInstances = numCol * numRow;
    const dataBytes = numInstances * 4 * 4;
    let countsBuffer = this.state.countsBuffer;
    if (countsBuffer) {
      countsBuffer.delete();
    }

    countsBuffer = new Buffer(gl, {
      size: 4,
      bytes: dataBytes,
      type: GL.FLOAT,
      instanced: 1
    });

    this.setState({
      numCol,
      numRow,
      numInstances,
      countsBuffer
    });
  }

  _updateMinMaxUniform({oldProps, props}) {
    if (
      COLOR_PROPS.some(key => {
        return oldProps[key] !== props[key];
      })
    ) {
      return true;
    }
    return false;
  }
}

GPUScreenGridLayer.layerName = 'GPUScreenGridLayer';
GPUScreenGridLayer.defaultProps = defaultProps;
