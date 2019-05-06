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

import {PhongMaterial} from '@luma.gl/core';
import {CompositeLayer} from '@deck.gl/core';

import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {pointToDensityGridData} from '../utils/gpu-grid-aggregation/grid-aggregation-utils';
import {defaultColorRange} from '../utils/color-utils';
import GPUGridCellLayer from './gpu-grid-cell-layer';

const MINCOLOR = [0, 0, 0, 255];
const MAXCOLOR = [0, 255, 0, 255];
const defaultMaterial = new PhongMaterial();
const defaultProps = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorWeight: {type: 'accessor', value: x => 1},
  colorAggregation: {type: 'number', value: 1, min: 1, max: 4}, // AGGREGATION_OPERATION, SUM is default

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationWeight: {type: 'accessor', value: x => 1},
  elevationAggregation: {type: 'number', value: 1, min: 1, max: 4}, // AGGREGATION_OPERATION, SUM is default
  elevationScale: {type: 'number', min: 0, value: 1},

  // grid
  cellSize: {type: 'number', min: 0, max: 1000, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getPosition: {type: 'accessor', value: x => x.position},
  extruded: false,
  fp64: false,
  pickable: false, // TODO: Enable picking with GPU Aggregation

  // Optional material for 'lighting' shader module
  material: defaultMaterial,

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

  finalizeState() {
    super.finalizeState();
    this.state.gpuGridAggregator.delete();
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
    const {
      data,
      cellSize: cellSizeMeters,
      getPosition,
      gpuAggregation,
      getColorWeight,
      colorAggregation,
      getElevationWeight,
      elevationAggregation,
      fp64
    } = this.props;
    const weightParams = {
      color: {
        getWeight: getColorWeight,
        operation: colorAggregation,
        needMin: true,
        needMax: true,
        combineMaxMin: true
      },
      elevation: {
        getWeight: getElevationWeight,
        operation: elevationAggregation,
        needMin: true,
        needMax: true,
        combineMaxMin: true
      }
    };
    const {weights, gridSize, gridOrigin, cellSize, boundingBox} = pointToDensityGridData({
      data,
      cellSizeMeters,
      getPosition,
      weightParams,
      gpuAggregation,
      gpuGridAggregator: this.state.gpuGridAggregator,
      boundingBox: this.state.boundingBox, // avoid parsing data when it is not changed.
      aggregationFlags,
      fp64
    });
    this.setState({weights, gridSize, gridOrigin, cellSize, boundingBox});
  }

  getPickingInfo({info}) {
    // TODO: perform picking
    return info;
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
      material,
      elevationRange
    } = this.props;

    const {weights, gridSize, gridOrigin, cellSize} = this.state;
    const minColor = MINCOLOR;
    const maxColor = MAXCOLOR;

    const colorRange = new Float32Array(this.props.colorRange.length * 4);
    this.props.colorRange.forEach((color, index) => {
      const colorRangeIdnex = index * 4;
      colorRange[colorRangeIdnex] = color[0];
      colorRange[colorRangeIdnex + 1] = color[1];
      colorRange[colorRangeIdnex + 2] = color[2];
      colorRange[colorRangeIdnex + 3] = color[3] || 255;
    });

    // return props to the sublayer constructor
    return super.getSubLayerProps({
      id: 'grid-cell',
      data: this.state.layerData,
      colorBuffer: weights.color.aggregationBuffer,
      colorMaxMinBuffer: weights.color.maxMinBuffer,
      elevationBuffer: weights.elevation.aggregationBuffer,
      elevationMaxMinBuffer: weights.elevation.maxMinBuffer,
      gridSize,
      gridOrigin,
      gridOffset: cellSize,
      numInstances: gridSize[0] * gridSize[1],
      minColor,
      maxColor,
      colorRange,
      elevationRange,

      fp64,
      cellSize: cellSizeMeters,
      coverage,
      material,
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

GPUGridLayer.layerName = 'GPUGridLayer';
GPUGridLayer.defaultProps = defaultProps;
