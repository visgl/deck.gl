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
import GL from '@luma.gl/constants';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION, getValueFunc} from '../utils/aggregation-operation-utils';
import ScreenGridCellLayer from './screen-grid-cell-layer';
import GridAggregationLayer from '../grid-aggregation-layer';
import {getFloatTexture} from '../utils/resource-utils.js';

const defaultProps = Object.assign({}, ScreenGridCellLayer.defaultProps, {
  getPosition: {type: 'accessor', value: d => d.position},
  getWeight: {type: 'accessor', value: d => 1},

  gpuAggregation: true,
  aggregation: 'SUM'
});

const POSITION_ATTRIBUTE_NAME = 'positions';
const DIMENSIONS = {
  data: {
    props: ['cellSizePixels']
  },
  weights: {
    props: ['aggregation'],
    accessors: ['getWeight']
  }
};

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
      dimensions: DIMENSIONS,
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
      projectPoints: true, // aggregation in screen space
      weights,
      subLayerData: {attributes: {}},
      maxTexture: weights.count.maxTexture,
      positionAttributeName: 'positions',
      posOffset: [0, 0],
      translation: [1, -1]
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      [POSITION_ATTRIBUTE_NAME]: {
        size: 3,
        accessor: 'getPosition',
        type: GL.DOUBLE,
        fp64: this.use64bitPositions()
      },
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
    const CellLayerClass = this.getSubLayerClass('cells', ScreenGridCellLayer);

    return new CellLayerClass(
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

  // Aggregation Overrides

  updateResults({aggregationData, maxData}) {
    const {count} = this.state.weights;
    count.aggregationData = aggregationData;
    count.aggregationBuffer.setData({data: aggregationData});
    count.maxData = maxData;
    count.maxTexture.setImageData({data: maxData});
  }

  /* eslint-disable complexity, max-statements */
  updateAggregationState(opts) {
    const cellSize = opts.props.cellSizePixels;
    const cellSizeChanged = opts.oldProps.cellSizePixels !== cellSize;
    const {viewportChanged} = opts.changeFlags;
    let gpuAggregation = opts.props.gpuAggregation;
    if (this.state.gpuAggregation !== opts.props.gpuAggregation) {
      if (gpuAggregation && !GPUGridAggregator.isSupported(this.context.gl)) {
        log.warn('GPU Grid Aggregation not supported, falling back to CPU')();
        gpuAggregation = false;
      }
    }
    const gpuAggregationChanged = gpuAggregation !== this.state.gpuAggregation;
    this.setState({
      gpuAggregation
    });

    const positionsChanged = this.isAttributeChanged(POSITION_ATTRIBUTE_NAME);

    const {dimensions} = this.state;
    const {data, weights} = dimensions;
    const aggregationDataDirty =
      positionsChanged ||
      gpuAggregationChanged ||
      viewportChanged ||
      this.isAggregationDirty(opts, {
        compareAll: gpuAggregation, // check for all (including extentions props) when using gpu aggregation
        dimension: data
      });
    const aggregationWeightsDirty = this.isAggregationDirty(opts, {dimension: weights});

    this.setState({
      aggregationDataDirty,
      aggregationWeightsDirty
    });

    const {viewport} = this.context;

    if (viewportChanged || cellSizeChanged) {
      const {width, height} = viewport;
      const numCol = Math.ceil(width / cellSize);
      const numRow = Math.ceil(height / cellSize);
      this.allocateResources(numRow, numCol);
      this.setState({
        // transformation from clipspace to screen(pixel) space
        scaling: [width / 2, -height / 2, 1],

        gridOffset: {xOffset: cellSize, yOffset: cellSize},
        width,
        height,
        numCol,
        numRow
      });
    }

    if (aggregationWeightsDirty) {
      this._updateAccessors(opts);
    }
    if (aggregationDataDirty || aggregationWeightsDirty) {
      this._resetResults();
    }
  }
  /* eslint-enable complexity, max-statements */

  // Private

  _updateAccessors(opts) {
    const {getWeight, aggregation} = opts.props;
    const {count} = this.state.weights;
    if (count) {
      count.getWeight = getWeight;
      count.operation = AGGREGATION_OPERATION[aggregation];
    }
    this.setState({getValue: getValueFunc(aggregation, getWeight)});
  }

  _resetResults() {
    const {count} = this.state.weights;
    if (count) {
      count.aggregationData = null;
    }
  }
}

ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;
