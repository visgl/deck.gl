// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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

import {CompositeLayer, _GPUGridAggregator as GPUGridAggregator} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';

// TODO: move out of grid-layer as common grid-aggregation util method.
import {pointToDensityGridData} from '../gpu-grid-layer/gpu-grid-utils';
import {generateContours} from './contour-utils';

const DEFAULT_COLOR = [255, 255, 255];
const DEFAULT_THRESHOLD = 1;

const defaultProps = {
  // grid aggregation
  cellSize: {type: 'number', min: 0, max: 1000, value: 1000},
  getPosition: x => x.position,
  // TODO: support for custom weights, defaults to 1

  // contour lines
  contours: [{threshold: DEFAULT_THRESHOLD, color: DEFAULT_COLOR}],
  getStrokeWidth: 1,

  fp64: false
};

export default class ContourLayer extends CompositeLayer {
  initializeState() {
    const {gl} = this.context;
    const options = {
      id: `${this.id}-gpu-aggregator`,
      shaderCache: this.context.shaderCache
    };
    this.state = {
      contourData: [],
      gridAggregator: new GPUGridAggregator(gl, options)
    };
  }

  updateState({oldProps, props, changeFlags}) {
    let contoursDirty = false;
    if (changeFlags.dataChanged || oldProps.cellSize !== props.cellSize) {
      contoursDirty = true;
      // Clear countsData cache
      this.setState({countsData: null});
      this.aggregateData();
    }

    contoursDirty = contoursDirty || this.rebuildContours({oldProps, props});
    if (contoursDirty) {
      this.generateContours();
    }
  }

  getSubLayerClass() {
    return LineLayer;
  }

  getSubLayerProps() {
    const {getStrokeWidth, fp64} = this.props;

    return super.getSubLayerProps({
      id: 'contour-line-layer',
      data: this.state.contourData,
      fp64,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor: this.onGetSublayerColor.bind(this),
      getStrokeWidth
    });
  }

  renderLayers() {
    const SubLayerClass = this.getSubLayerClass();

    return new SubLayerClass(this.getSubLayerProps());
  }

  // Private

  aggregateData() {
    const {data, cellSize, getPosition, gpuAggregation, fp64} = this.props;
    const {countsBuffer, maxCountBuffer, gridSize, gridOrigin, gridOffset} = pointToDensityGridData(
      {
        data,
        cellSizeMeters: cellSize,
        getPosition,
        gpuAggregation,
        gpuGridAggregator: this.state.gridAggregator,
        fp64
      }
    );

    this.setState({countsBuffer, maxCountBuffer, gridSize, gridOrigin, gridOffset});
  }

  generateContours() {
    const {gridSize, gridOrigin, gridOffset} = this.state;
    let {countsData} = this.state;
    if (!countsData) {
      const {countsBuffer} = this.state;
      countsData = countsBuffer.getData();
      this.setState({countsData});
    }

    const {cellWeights} = GPUGridAggregator.getCellData({countsData});
    const thresholds = this.props.contours.map(x => x.threshold);
    const contourData = generateContours({
      thresholds,
      cellWeights,
      gridSize,
      gridOrigin,
      cellSize: gridOffset
    });

    this.setState({contourData});
  }

  onGetSublayerColor(segment) {
    const {contours} = this.props;
    let color = DEFAULT_COLOR;
    contours.forEach(data => {
      if (data.threshold === segment.threshold) {
        color = data.color;
      }
    });
    return color;
  }

  rebuildContours({oldProps, props}) {
    if (oldProps.contours.length !== props.contours.length) {
      return true;
    }
    const oldThresholds = oldProps.contours.map(x => x.threshold);
    const thresholds = props.contours.map(x => x.threshold);

    return thresholds.some((_, i) => thresholds[i] !== oldThresholds[i]);
  }
}

ContourLayer.layerName = 'ContourLayer';
ContourLayer.defaultProps = defaultProps;
