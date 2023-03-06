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
import {
  Accessor,
  AccessorFunction,
  Color,
  Material,
  GetPickingInfoParams,
  LayerContext,
  log,
  PickingInfo,
  Position,
  DefaultProps
} from '@deck.gl/core';

import GPUGridAggregator from '../utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {AGGREGATION_OPERATION} from '../utils/aggregation-operation-utils';
import {defaultColorRange, colorRangeToFlatArray} from '../utils/color-utils';
import GPUGridCellLayer from './gpu-grid-cell-layer';
import {pointToDensityGridDataCPU} from './../cpu-grid-layer/grid-aggregator';
import GridAggregationLayer, {GridAggregationLayerProps} from '../grid-aggregation-layer';
import {getBoundingBox, getGridParams} from '../utils/grid-aggregation-utils';

const defaultProps: DefaultProps<GPUGridLayerProps> = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorWeight: {type: 'accessor', value: 1},
  colorAggregation: 'SUM',

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationWeight: {type: 'accessor', value: 1},
  elevationAggregation: 'SUM',
  elevationScale: {type: 'number', min: 0, value: 1},

  // grid
  cellSize: {type: 'number', min: 1, max: 1000, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getPosition: {type: 'accessor', value: x => x.position},
  extruded: false,

  // Optional material for 'lighting' shader module
  material: true
};

// This layer only perform GPU aggregation, no need to seperate data and weight props
// aggregation will be dirty when any of the props are changed.

const DIMENSIONS = {
  data: {
    props: ['cellSize', 'colorAggregation', 'elevationAggregation']
  }
  // rest of the changes are detected by `state.attributesChanged`
};
const POSITION_ATTRIBUTE_NAME = 'positions';

/** All properties supported by GPUGridLayer. */
export type GPUGridLayerProps<DataT = any> = _GPUGridLayerProps<DataT> &
  GridAggregationLayerProps<DataT>;

/** Properties added by GPUGridLayer. */
export type _GPUGridLayerProps<DataT> = {
  /**
   * Size of each cell in meters.
   * @default 1000
   */
  cellSize?: number;

  /**
   * Color scale domain, default is set to the extent of aggregated weights in each cell.
   * @default [min(colorWeight), max(colorWeight)]
   */
  colorDomain?: [number, number] | null;

  /**
   * Default: [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`
   */
  colorRange?: Color[];

  /**
   * Cell size multiplier, clamped between 0 - 1.
   * @default 1
   */
  coverage?: number;

  /**
   * Elevation scale input domain, default is set to between 0 and the max of aggregated weights in each cell.
   * @default [0, max(elevationWeight)]
   */
  elevationDomain?: [number, number] | null;

  /**
   * Elevation scale output range.
   * @default [0, 1000]
   */
  elevationRange?: [number, number];

  /**
   * Cell elevation multiplier.
   * @default 1
   */
  elevationScale?: number;

  /**
   * Whether to enable cell elevation. If set to false, all cell will be flat.
   * @default true
   */
  extruded?: boolean;

  /**
   * Material settings for lighting effect. Applies if `extruded: true`.
   *
   * @default true
   * @see https://deck.gl/docs/developer-guide/using-lighting
   */
  material?: Material;

  /**
   * Defines the operation used to aggregate all data object weights to calculate a cell's color value.
   * @default 'SUM'
   */
  colorAggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';

  /**
   * Defines the operation used to aggregate all data object weights to calculate a cell's elevation value.
   * @default 'SUM'
   */
  elevationAggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';

  /**
   * Method called to retrieve the position of each object.
   * @default object => object.position
   */
  getPosition?: AccessorFunction<DataT, Position>;

  /**
   * The weight of a data object used to calculate the color value for a cell.
   * @default 1
   */
  getColorWeight?: Accessor<DataT, number>;

  /**
   * The weight of a data object used to calculate the elevation value for a cell.
   * @default 1
   */
  getElevationWeight?: Accessor<DataT, number>;
};

/** Aggregate data into a grid-based heatmap. Aggregation is performed on GPU (WebGL2 only). */
export default class GPUGridLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends GridAggregationLayer<DataT, ExtraPropsT & Required<_GPUGridLayerProps<DataT>>> {
  static layerName = 'GPUGridLayer';
  static defaultProps = defaultProps;

  initializeState({gl}: LayerContext): void {
    const isSupported = GPUGridAggregator.isSupported(gl);
    if (!isSupported) {
      log.error('GPUGridLayer is not supported on this browser, use GridLayer instead')();
    }
    super.initializeAggregationLayer({
      dimensions: DIMENSIONS
    });
    this.setState({
      gpuAggregation: true,
      projectPoints: false, // aggregation in world space
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
      },
      positionAttributeName: 'positions'
    });
    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      [POSITION_ATTRIBUTE_NAME]: {
        size: 3,
        accessor: 'getPosition',
        type: GL.DOUBLE,
        fp64: this.use64bitPositions()
      },
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

  getHashKeyForIndex(index: number): string {
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

  getPositionForIndex(index: number): Position {
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

  getPickingInfo({info, mode}: GetPickingInfoParams): PickingInfo {
    const {index} = info;
    let object: any = null;
    if (index >= 0) {
      const {gpuGridAggregator} = this.state;
      const position = this.getPositionForIndex(index);
      const colorInfo = GPUGridAggregator.getAggregationData({
        pixelIndex: index,
        ...gpuGridAggregator.getData('color')
      });
      const elevationInfo = GPUGridAggregator.getAggregationData({
        pixelIndex: index,
        ...gpuGridAggregator.getData('elevation')
      });

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
          const {gridOffset, translation, boundingBox} = this.state;
          const {viewport} = this.context;
          const attributes = this.getAttributes();
          const cpuAggregation = pointToDensityGridDataCPU(props as any, {
            gridOffset,
            attributes,
            viewport,
            translation,
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

    // override object with picked cell
    info.picked = Boolean(object);
    info.object = object;

    return info;
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

    const {weights, numRow, numCol, gridOrigin, gridOffset} = this.state;
    const {color, elevation} = weights;
    const colorRange = colorRangeToFlatArray(this.props.colorRange);

    const SubLayerClass = this.getSubLayerClass('gpu-grid-cell', GPUGridCellLayer);

    return new SubLayerClass(
      {
        gridSize: [numCol, numRow],
        gridOrigin,
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
        data: {
          attributes: {
            colors: color.aggregationBuffer,
            elevations: elevation.aggregationBuffer
          }
        },
        colorMaxMinBuffer: color.maxMinBuffer,
        elevationMaxMinBuffer: elevation.maxMinBuffer,
        numInstances: numCol * numRow
      }
    );
  }

  finalizeState(context: LayerContext) {
    const {color, elevation} = this.state.weights;
    [color, elevation].forEach(weight => {
      const {aggregationBuffer, maxMinBuffer} = weight;
      maxMinBuffer.delete();
      aggregationBuffer?.delete();
    });
    super.finalizeState(context);
  }

  // Aggregation Overrides

  updateAggregationState(opts) {
    const {props, oldProps} = opts;
    const {cellSize, coordinateSystem} = props;
    const {viewport} = this.context;
    const cellSizeChanged = oldProps.cellSize !== cellSize;
    const {dimensions} = this.state;

    const positionsChanged = this.isAttributeChanged(POSITION_ATTRIBUTE_NAME);
    // any attribute changed
    const attributesChanged = positionsChanged || this.isAttributeChanged();

    let {boundingBox} = this.state;
    if (positionsChanged) {
      boundingBox = getBoundingBox(this.getAttributes(), this.getNumInstances());
      this.setState({boundingBox});
    }
    if (positionsChanged || cellSizeChanged) {
      const {gridOffset, translation, width, height, numCol, numRow} = getGridParams(
        boundingBox,
        cellSize,
        viewport,
        coordinateSystem
      );
      this.allocateResources(numRow, numCol);
      this.setState({
        gridOffset,
        translation,
        gridOrigin: [-1 * translation[0], -1 * translation[1]],
        width,
        height,
        numCol,
        numRow
      });
    }

    const aggregationDataDirty =
      attributesChanged ||
      this.isAggregationDirty(opts, {
        dimension: dimensions.data,
        compareAll: true
      });

    if (aggregationDataDirty) {
      this._updateAccessors(opts);
    }
    this.setState({
      aggregationDataDirty
    });
  }

  // Private

  _updateAccessors(opts) {
    const {colorAggregation, elevationAggregation} = opts.props;
    const {color, elevation} = this.state.weights;
    color.operation = AGGREGATION_OPERATION[colorAggregation];
    elevation.operation = AGGREGATION_OPERATION[elevationAggregation];
  }
}
