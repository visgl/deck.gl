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

import {Buffer} from '@luma.gl/core';
import GL from '@luma.gl/constants';
import {log} from '@deck.gl/core';

import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION} from '../utils/aggregation-operation-utils';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import GPUGridCellLayer from './gpu-grid-cell-layer';
import {pointToDensityGridDataCPU} from './../cpu-grid-layer/grid-aggregator';
import GridAggregationLayer from '../grid-aggregation-layer';

const defaultProps = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorWeight: {type: 'accessor', value: x => 1},
  colorAggregation: 'SUM',

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationWeight: {type: 'accessor', value: x => 1},
  elevationAggregation: 'SUM',
  elevationScale: {type: 'number', min: 0, value: 1},

  // grid
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getPosition: {type: 'accessor', value: x => x.position},
  extruded: false,
  fp64: false,

  // Optional material for 'lighting' shader module
  material: true
};

// props , when changed requires re-aggregation
const AGGREGATION_PROPS = ['colorAggregation', 'elevationAggregation'];

export default class GPUGridLayer extends GridAggregationLayer {
  initializeState() {
    const {gl} = this.context;
    const isSupported = GPUGridAggregator.isSupported(gl);
    if (!isSupported) {
      log.error('GPUGridLayer is not supported on this browser, use GridLayer instead')();
    }
    super.initializeState({aggregationProps: AGGREGATION_PROPS});
    this.setState({
      gpuAggregation: true,
      isSupported,
      weights: {
        color: {
          needMin: true,
          needMax: true,
          combineMaxMin: true,
          maxMinBuffer: new Buffer(gl, {
            byteLength: 4 * 4,
            accessor: {size: 4, type: GL.FLOAT, divisor: 1}
          })
        },
        elevation: {
          needMin: true,
          needMax: true,
          combineMaxMin: true,
          maxMinBuffer: new Buffer(gl, {
            byteLength: 4 * 4,
            accessor: {size: 4, type: GL.FLOAT, divisor: 1}
          })
        }
      }
    });
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition'},
      color: {size: 3, accessor: 'getColorWeight'},
      elevation: {size: 3, accessor: 'getElevationWeight'}
    });
  }

  updateState(opts) {
    if (this.state.isSupported === false) {
      // Skip update, layer not supported
      return;
    }
    super.updateState(opts);
    const {aggregationDirty} = this.state;
    if (aggregationDirty) {
      // reset cached CPU Aggregation results (used for picking)
      this.setState({
        gridHash: null
      });
    }
  }

  getHashKeyForIndex(index) {
    const {numRow, numCol, boundingBox, gridOffset} = this.state;
    const gridSize = [numCol, numRow];
    const gridOrigin = [boundingBox.xMin, boundingBox.yMin];
    const cellSize = [gridOffset.xOffset, gridOffset.yOffset];

    const yIndex = Math.floor(index / gridSize[0]);
    const xIndex = index - yIndex * gridSize[0];
    // This will match the index to the hash-key to access aggregation data from CPU aggregation results.
    const latIdx = Math.floor(
      (yIndex * cellSize[1] + gridOrigin[1] + 90 + cellSize[1] / 2) / cellSize[1]
    );
    const lonIdx = Math.floor(
      (xIndex * cellSize[0] + gridOrigin[0] + 180 + cellSize[0] / 2) / cellSize[0]
    );
    return `${latIdx}-${lonIdx}`;
  }

  getPositionForIndex(index) {
    const {numRow, numCol, boundingBox, gridOffset} = this.state;
    const gridSize = [numCol, numRow];
    const gridOrigin = [boundingBox.xMin, boundingBox.yMin];
    const cellSize = [gridOffset.xOffset, gridOffset.yOffset];

    const yIndex = Math.floor(index / gridSize[0]);
    const xIndex = index - yIndex * gridSize[0];
    const yPos = yIndex * cellSize[1] + gridOrigin[1];
    const xPos = xIndex * cellSize[0] + gridOrigin[0];
    return [xPos, yPos];
  }

  getPickingInfo({info, mode}) {
    const {index} = info;
    let object = null;
    if (index >= 0) {
      const {gpuGridAggregator} = this.state;
      const position = this.getPositionForIndex(index);
      const colorInfo = GPUGridAggregator.getAggregationData(
        Object.assign({pixelIndex: index}, gpuGridAggregator.getData('color'))
      );
      const elevationInfo = GPUGridAggregator.getAggregationData(
        Object.assign({pixelIndex: index}, gpuGridAggregator.getData('elevation'))
      );

      object = {
        colorValue: colorInfo.cellWeight,
        elevationValue: elevationInfo.cellWeight,
        count: colorInfo.cellCount || elevationInfo.cellCount,
        position,
        totalCount: colorInfo.totalCount || elevationInfo.totalCount
      };
      if (mode !== 'hover') {
        // perform CPU aggregation for full list of points for each cell
        const {props} = this;
        let {gridHash} = this.state;
        if (!gridHash) {
          const {
            gridOffset,
            cellOffset,
            // gridTransformMatrix,
            width,
            height,
            boundingBox
          } = this.state;
          const {viewport} = this.context;
          const attributes = this.getAttributes();
          // const vertexCount = this.getNumInstances();
          const cpuAggregation = pointToDensityGridDataCPU(props, {
            gridOffset,
            width,
            height,
            // gridTransformMatrix,
            attributes,
            viewport,
            cellOffset,
            boundingBox
          });
          gridHash = cpuAggregation.gridHash;
          this.setState({gridHash});
        }
        const key = this.getHashKeyForIndex(index);
        const cpuAggregationData = gridHash[key];
        Object.assign(object, cpuAggregationData);
      }
    }

    return Object.assign(info, {
      picked: Boolean(object),
      // override object with picked cell
      object
    });
  }

  renderLayers() {
    if (!this.state.isSupported) {
      return null;
    }
    const {
      elevationScale,
      extruded,
      cellSize: cellSizeMeters,
      coverage,
      material,
      elevationRange,
      colorDomain,
      elevationDomain
    } = this.props;

    const {weights, numRow, numCol, boundingBox, gridOffset} = this.state;

    const colorRange = colorRangeToFlatArray(this.props.colorRange);

    const SubLayerClass = this.getSubLayerClass('gpu-grid-cell', GPUGridCellLayer);

    return new SubLayerClass(
      {
        gridSize: [numCol, numRow],
        gridOrigin: [boundingBox.xMin, boundingBox.yMin],
        gridOffset: [gridOffset.xOffset, gridOffset.yOffset],
        colorRange,
        elevationRange,
        colorDomain,
        elevationDomain,

        cellSize: cellSizeMeters,
        coverage,
        material,
        elevationScale,
        extruded
      },
      this.getSubLayerProps({
        id: 'gpu-grid-cell'
      }),
      {
        data: weights,
        numInstances: numCol * numRow
      }
    );
  }

  finalizeState() {
    const {color, elevation} = this.state.weights;
    [color, elevation].forEach(weight => {
      const {aggregationBuffer, maxMinBuffer} = weight;
      maxMinBuffer.delete();
      if (aggregationBuffer) {
        aggregationBuffer.delete();
      }
    });
    super.finalizeState();
  }

  // Private
  updateWeightParams(opts) {
    const {getColorWeight, colorAggregation, getElevationWeight, elevationAggregation} = opts.props;
    const {color, elevation} = this.state.weights;
    color.getWeight = getColorWeight;
    color.operation = AGGREGATION_OPERATION[colorAggregation];
    elevation.getWeight = getElevationWeight;
    elevation.operation = AGGREGATION_OPERATION[elevationAggregation];
  }

  allocateResources(numRow, numCol) {
    if (this.state.numRow !== numRow || this.state.numCol !== numCol) {
      const {color, elevation} = this.state.weights;
      const dataBytes = numCol * numRow * 4 * 4;
      const gl = this.context.gl;
      updateAggregationBuffer(gl, color, dataBytes);
      updateAggregationBuffer(gl, elevation, dataBytes);
    }
  }

  updateAggregationFlags(opts) {
    const cellSizeChanged = opts.oldProps.cellSize !== opts.props.cellSize;
    const {dataChanged} = this.state;
    this.setState({
      cellSizeChanged,
      cellSize: opts.props.cellSize,
      needsReProjection: dataChanged || cellSizeChanged
    });
  }
}

// Helper methods
function updateAggregationBuffer(gl, weight, dataBytes) {
  if (weight.aggregationBuffer) {
    weight.aggregationBuffer.delete();
  }
  weight.aggregationBuffer = new Buffer(gl, {
    byteLength: dataBytes,
    accessor: {
      size: 4,
      type: GL.FLOAT,
      divisor: 1
    }
  });
}

GPUGridLayer.layerName = 'GPUGridLayer';
GPUGridLayer.defaultProps = defaultProps;
