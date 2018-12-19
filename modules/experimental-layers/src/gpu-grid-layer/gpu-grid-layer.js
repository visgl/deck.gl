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

import {} from '@deck.gl/core';
import {
  CompositeLayer,
  _GPUGridAggregator as GPUGridAggregator,
  _pointToDensityGridData as pointToDensityGridData
} from '@deck.gl/core';

import GPUGridCellLayer from './gpu-grid-cell-layer';

const MINCOLOR = [0, 0, 0, 255];
const MAXCOLOR = [0, 255, 0, 255];

const defaultProps = {
  // elevation
  elevationScale: {type: 'number', min: 0, value: 1},

  // grid
  cellSize: {type: 'number', min: 0, max: 1000, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getPosition: {type: 'accessor', value: x => x.position},
  extruded: false,
  fp64: false,
  pickable: false, // TODO: Enable picking with GPU Aggregation

  // Optional settings for 'lighting' shader module
  lightSettings: {},

  // GPU Aggregation
  gpuAggregation: true
};

export default class GPUGridLayer extends CompositeLayer {
  initializeState() {
    const {gl} = this.context;
    const options = {
      id: `${this.id}-gpu-aggregator`,
      shaderCache: this.context.shaderCache
    };
    this.state = {
      gpuGridAggregator: new GPUGridAggregator(gl, options)
    };
  }

  updateState(opts) {
    const aggregationFlags = this.getAggregationFlags(opts);
    if (aggregationFlags) {
      // project data into grid cells
      this.getLayerData(aggregationFlags);
    }
  }

  getAggregationFlags({oldProps, props, changeFlags}) {
    let aggregationFlags = null;
    if (
      changeFlags.dataChanged ||
      oldProps.gpuAggregation !== props.gpuAggregation ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPosition))
    ) {
      aggregationFlags = Object.assign({}, aggregationFlags, {dataChanged: true});
    }
    if (oldProps.cellSize !== props.cellSize) {
      aggregationFlags = Object.assign({}, aggregationFlags, {cellSizeChanged: true});
    }
    return aggregationFlags;
  }

  getLayerData(aggregationFlags) {
    const {data, cellSize: cellSizeMeters, getPosition, gpuAggregation} = this.props;
    const {
      countsBuffer,
      maxCountBuffer,
      gridSize,
      gridOrigin,
      cellSize,
      boundingBox
    } = pointToDensityGridData({
      data,
      cellSizeMeters,
      getPosition,
      gpuAggregation,
      gpuGridAggregator: this.state.gpuGridAggregator,
      boundingBox: this.state.boundingBox, // avoid parsing data when it is not changed.
      aggregationFlags
    });
    this.setState({countsBuffer, maxCountBuffer, gridSize, gridOrigin, cellSize, boundingBox});
  }

  // for subclassing, override this method to return
  // customized sub layer props
  getSubLayerProps() {
    const {
      elevationScale,
      fp64,
      extruded,
      cellSize: cellSizeMeters,
      coverage,
      lightSettings
    } = this.props;

    const {countsBuffer, maxCountBuffer, gridSize, gridOrigin, cellSize} = this.state;
    const minColor = MINCOLOR;
    const maxColor = MAXCOLOR;

    // return props to the sublayer constructor
    return super.getSubLayerProps({
      id: 'grid-cell',
      data: this.state.layerData,

      countsBuffer,
      maxCountBuffer,
      gridSize,
      gridOrigin,
      gridOffset: cellSize,
      numInstances: gridSize[0] * gridSize[1],
      minColor,
      maxColor,

      fp64,
      cellSize: cellSizeMeters,
      coverage,
      lightSettings,
      elevationScale,
      extruded,
      pickable: false
    });
  }

  // for subclassing, override this method to return
  // customized sub layer class
  getSubLayerClass() {
    return GPUGridCellLayer;
  }

  renderLayers() {
    const SubLayerClass = this.getSubLayerClass();

    return new SubLayerClass(this.getSubLayerProps());
  }
}

GPUGridLayer.layerName = 'GridLayer';
GPUGridLayer.defaultProps = defaultProps;
