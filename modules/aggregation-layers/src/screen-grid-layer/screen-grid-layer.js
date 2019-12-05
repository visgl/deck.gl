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

import {log} from '@deck.gl/core';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION} from '../utils/aggregation-operation-utils';
import ScreenGridCellLayer from './screen-grid-cell-layer';
import GridAggregationLayer from '../grid-aggregation-layer';
import {getFloatTexture} from '../utils/resource-utils.js';

const defaultProps = Object.assign({}, ScreenGridCellLayer.defaultProps, {
  getPosition: {type: 'accessor', value: d => d.position},
  getWeight: {type: 'accessor', value: d => 1},

  gpuAggregation: true,
  aggregation: 'SUM'
});

// props , when changed requires re-aggregation
const AGGREGATION_PROPS = ['aggregation', 'getWeight'];

export default class ScreenGridLayer extends GridAggregationLayer {
  initializeState() {
    const {gl} = this.context;
    if (!ScreenGridCellLayer.isSupported(gl)) {
      // max aggregated value is sampled from a float texture
      this.setState({supported: false});
      log.error(`ScreenGridLayer: ${this.id} is not supported on this browser`)();
      return;
    }
    super.initializeState({
      aggregationProps: AGGREGATION_PROPS,
      getCellSize: props => props.cellSizePixels
    });
    const weights = {
      count: {
        size: 1,
        operation: AGGREGATION_OPERATION.SUM,
        needMax: true,
        maxTexture: getFloatTexture(gl, {id: `${this.id}-max-texture`})
      }
    };
    this.setState({
      supported: true,
      weights,
      subLayerData: {attributes: {}},
      screenSpaceAggregation: true,
      maxTexture: weights.count.maxTexture
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition'},
      // this attribute is used in gpu aggregation path only
      count: {size: 3, accessor: 'getWeight'}
    });
  }

  shouldUpdateState({changeFlags}) {
    return this.state.supported && changeFlags.somethingChanged;
  }

  updateState(opts) {
    super.updateState(opts);
  }

  renderLayers() {
    if (!this.state.supported) {
      return [];
    }
    const {maxTexture, numRow, numCol, weights} = this.state;
    const {updateTriggers} = this.props;
    const {aggregationBuffer} = weights.count;
    //   this.state.subLayerData.attributes.instanceCounts = aggregationBuffer;

    return new ScreenGridCellLayer(
      this.props,
      this.getSubLayerProps({
        id: 'cell-layer',
        updateTriggers
      }),
      {
        data: {attributes: {instanceCounts: aggregationBuffer}},
        maxTexture,
        numInstances: numRow * numCol
      }
    );
  }

  finalizeState() {
    super.finalizeState();

    const {aggregationBuffer, maxBuffer, gpuGridAggregator, maxTexture} = this.state;
    gpuGridAggregator.delete();
    if (aggregationBuffer) {
      aggregationBuffer.delete();
    }
    if (maxBuffer) {
      maxBuffer.delete();
    }
    if (maxTexture) {
      maxTexture.delete();
    }
  }

  getPickingInfo({info, mode}) {
    const {index} = info;
    if (index >= 0) {
      const {gpuGridAggregator} = this.state;
      // Get count aggregation results
      const aggregationResults = gpuGridAggregator.getData('count');

      // Each instance (one cell) is aggregated into single pixel,
      // Get current instance's aggregation details.
      info.object = GPUGridAggregator.getAggregationData(
        Object.assign({pixelIndex: index}, aggregationResults)
      );
    }

    return info;
  }

  // Private Methods

  updateResults({aggregationData, maxData}) {
    const {count} = this.state.weights;
    count.aggregationData = aggregationData;
    count.aggregationBuffer.setData({data: aggregationData});
    count.maxData = maxData;
    count.maxTexture.setImageData({data: maxData});
  }

  updateAggregationFlags(opts) {
    const cellSizeChanged = opts.oldProps.cellSizePixels !== opts.props.cellSizePixels;
    let gpuAggregation = opts.props.gpuAggregation;
    if (this.state.gpuAggregation !== opts.props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.gl)) {
        log.warn('GPU Grid Aggregation not supported, falling back to CPU')();
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    // Consider switching between CPU and GPU aggregation as data changed as it requires
    // re aggregation.
    const dataChanged =
      this.state.dataChanged || gpuAggregationChanged || opts.changeFlags.viewportChanged;

    this.setState({
      dataChanged,
      cellSizeChanged,
      cellSize: opts.props.cellSizePixels,
      needsReProjection: dataChanged || cellSizeChanged,
      gpuAggregation
    });
  }

  _getGridOffset() {
    const {cellSize} = this.state;
    return {xOffset: cellSize, yOffset: cellSize};
  }
}

ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;
