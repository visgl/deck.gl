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

import {WebMercatorViewport, log} from '@deck.gl/core';
import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION} from '../utils/aggregation-operation-utils';
import ScreenGridCellLayer from './screen-grid-cell-layer';
import GridAggregationLayer from '../grid-aggregation-layer';

import GL from '@luma.gl/constants';
import {Buffer} from '@luma.gl/core';

const defaultProps = Object.assign({}, ScreenGridCellLayer.defaultProps, {
  getPosition: {type: 'accessor', value: d => d.position},
  getWeight: {type: 'accessor', value: d => [1, 0, 0]},

  gpuAggregation: true,
  aggregation: 'SUM'
});

// props , when changed requires re-aggregation
const AGGREGATION_PROPS = ['gpuAggregation'];

export default class ScreenGridLayer extends GridAggregationLayer {
  initializeState() {
    const {gl} = this.context;
    if (!ScreenGridCellLayer.isSupported(gl)) {
      // max aggregated value is sampled from a float texture
      this.setState({supported: false});
      log.error(`ScreenGridLayer: ${this.id} is not supported on this browser`)();
      return;
    }
    super.initializeState(AGGREGATION_PROPS);
    const weights = {
      color: {
        size: 1,
        operation: AGGREGATION_OPERATION.SUM,
        needMax: true
      }
    };
    this.setState({
      supported: true,
      weights,
      subLayerData: {attributes: {}}
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition', type: GL.DOUBLE, fp64: false},
      color: {size: 3, accessor: 'getWeight'}
    });
  }

  shouldUpdateState({changeFlags}) {
    return this.state.supported && changeFlags.somethingChanged;
  }

  updateState(opts) {
    super.updateState(opts);

    const cellSizeChanged = opts.props.cellSizePixels !== opts.oldProps.cellSizePixels;
    const dataChanged = this._isAggregationDirty(opts);
    const {viewportChanged} = opts.changeFlags;

    if (cellSizeChanged || viewportChanged) {
      this._updateGridParams();
    }

    if (dataChanged || cellSizeChanged || viewportChanged) {
      this._updateAggregation({
        dataChanged,
        cellSizeChanged,
        viewportChanged
      });
    }
  }

  renderLayers() {
    if (!this.state.supported) {
      return [];
    }
    const {maxTexture, cellCount, subLayerData} = this.state;
    const {updateTriggers} = this.props;

    return new ScreenGridCellLayer(
      this.props,
      this.getSubLayerProps({
        id: 'cell-layer',
        updateTriggers
      }),
      {
        data: subLayerData,
        maxTexture,
        numInstances: cellCount
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
      // Get color aggregation results
      const aggregationResults = gpuGridAggregator.getData('color');

      // Each instance (one cell) is aggregated into single pixel,
      // Get current instance's aggregation details.
      info.object = GPUGridAggregator.getAggregationData(
        Object.assign({pixelIndex: index}, aggregationResults)
      );
    }

    return info;
  }

  // Private Methods

  _getAggregationChangeFlags({oldProps, props, changeFlags}) {
    const cellSizeChanged = props.cellSizePixels !== oldProps.cellSizePixels;
    // props.cellMarginPixels !== oldProps.cellMarginPixels; // _TODO_ why checking margin pixels
    const dataChanged = changeFlags.dataChanged || props.aggregation !== oldProps.aggregation;
    const viewportChanged = changeFlags.viewportChanged;

    if (cellSizeChanged || dataChanged || viewportChanged) {
      return {cellSizeChanged, dataChanged, viewportChanged};
    }

    return null;
  }

  _updateAggregation(changeFlags) {
    const vertexCount = this.getNumInstances();
    if (vertexCount <= 0) {
      return;
    }

    const {cellSizePixels, gpuAggregation} = this.props;

    const {weights} = this.state;
    const {viewport} = this.context;

    weights.color.operation =
      AGGREGATION_OPERATION[this.props.aggregation.toUpperCase()] || AGGREGATION_OPERATION.SUM;

    let projectPoints = false;
    let gridTransformMatrix = null;

    if (this.context.viewport instanceof WebMercatorViewport) {
      // project points from world space (lng/lat) to viewport (screen) space.
      projectPoints = true;
    } else {
      projectPoints = false;
      // Use pixelProjectionMatrix to transform points to viewport (screen) space.
      gridTransformMatrix = viewport.pixelProjectionMatrix;
    }
    const results = this.state.gpuGridAggregator.run({
      weights,
      cellSize: [cellSizePixels, cellSizePixels],
      viewport,
      changeFlags,
      useGPU: gpuAggregation,
      projectPoints,
      gridTransformMatrix,
      vertexCount,
      attributes: this.getAttributes(),
      moduleSettings: this.getModuleSettings()
    });

    this.setState({maxTexture: results.color.maxTexture});
  }

  _updateGridParams() {
    const {width, height} = this.context.viewport;
    const {cellSizePixels} = this.props;
    const {gl} = this.context;

    const numCol = Math.ceil(width / cellSizePixels);
    const numRow = Math.ceil(height / cellSizePixels);
    const cellCount = numCol * numRow;
    const dataBytes = cellCount * 4 * 4;
    let aggregationBuffer = this.state.aggregationBuffer;
    if (aggregationBuffer) {
      aggregationBuffer.delete();
    }

    aggregationBuffer = new Buffer(gl, {
      byteLength: dataBytes,
      accessor: {
        size: 4,
        type: GL.FLOAT,
        divisor: 1
      }
    });
    this.state.weights.color.aggregationBuffer = aggregationBuffer;
    this.state.subLayerData.attributes.instanceCounts = aggregationBuffer;
    this.setState({
      cellCount,
      aggregationBuffer
    });
  }
}

ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;
