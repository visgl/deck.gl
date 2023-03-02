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

import GL from '@luma.gl/constants';
import {GridCellLayer} from '@deck.gl/layers';
import {Accessor, AccessorFunction, Color, Position, Material, DefaultProps} from '@deck.gl/core';

import {defaultColorRange} from '../utils/color-utils';
import {pointToDensityGridDataCPU} from './grid-aggregator';
import CPUAggregator from '../utils/cpu-aggregator';
import AggregationLayer, {AggregationLayerProps} from '../aggregation-layer';

import {Layer, UpdateParameters, GetPickingInfoParams, PickingInfo} from '@deck.gl/core';
import {AggregateAccessor} from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function nop() {}

const defaultProps: DefaultProps<CPUGridLayerProps> = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: {type: 'accessor', value: null}, // default value is calculated from `getColorWeight` and `colorAggregation`
  getColorWeight: {type: 'accessor', value: 1},
  colorAggregation: 'SUM',
  lowerPercentile: {type: 'number', min: 0, max: 100, value: 0},
  upperPercentile: {type: 'number', min: 0, max: 100, value: 100},
  colorScaleType: 'quantize',
  onSetColorDomain: nop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: {type: 'accessor', value: null}, // default value is calculated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: {type: 'accessor', value: 1},
  elevationAggregation: 'SUM',
  elevationLowerPercentile: {type: 'number', min: 0, max: 100, value: 0},
  elevationUpperPercentile: {type: 'number', min: 0, max: 100, value: 100},
  elevationScale: {type: 'number', min: 0, value: 1},
  elevationScaleType: 'linear',
  onSetElevationDomain: nop,

  gridAggregator: pointToDensityGridDataCPU,

  // grid
  cellSize: {type: 'number', min: 0, max: 1000, value: 1000},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  getPosition: {type: 'accessor', value: x => x.position},
  extruded: false,

  // Optional material for 'lighting' shader module
  material: true,

  // data filter
  _filterData: {type: 'function', value: null, optional: true}
};

/** All properties supported by CPUGridLayer. */
export type CPUGridLayerProps<DataT = any> = _CPUGridLayerProps<DataT> &
  AggregationLayerProps<DataT>;

/** Properties added by CPUGridLayer. */
type _CPUGridLayerProps<DataT> = {
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
   * Filter cells and re-calculate color by `upperPercentile`.
   * Cells with value arger than the upperPercentile will be hidden.
   * @default 100
   */
  upperPercentile?: number;

  /**
   * Filter cells and re-calculate color by `lowerPercentile`.
   * Cells with value smaller than the lowerPercentile will be hidden.
   * @default 0
   */
  lowerPercentile?: number;

  /**
   * Filter cells and re-calculate elevation by `elevationUpperPercentile`.
   * Cells with elevation value larger than the `elevationUpperPercentile` will be hidden.
   * @default 100
   */
  elevationUpperPercentile?: number;

  /**
   * Filter cells and re-calculate elevation by `elevationLowerPercentile`.
   * Cells with elevation value larger than the `elevationLowerPercentile` will be hidden.
   * @default 0
   */
  elevationLowerPercentile?: number;

  /**
   * Scaling function used to determine the color of the grid cell, default value is 'quantize'.
   * Supported Values are 'quantize', 'linear', 'quantile' and 'ordinal'.
   * @default 'quantize'
   */
  colorScaleType?: 'quantize' | 'linear' | 'quantile' | 'ordinal';

  /**
   * Scaling function used to determine the elevation of the grid cell, only supports 'linear'.
   */
  elevationScaleType?: 'linear';

  // TODO - document
  gridAggregator?: (props: any, params: any) => any;

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
   * After data objects are aggregated into cells, this accessor is called on each cell to get the value that its color is based on.
   * @default null
   */
  getColorValue?: AggregateAccessor<DataT> | null;

  /**
   * The weight of a data object used to calculate the elevation value for a cell.
   * @default 1
   */
  getElevationWeight?: Accessor<DataT, number>;

  /**
   * After data objects are aggregated into cells, this accessor is called on each cell to get the value that its elevation is based on.
   * @default null
   */
  getElevationValue?: AggregateAccessor<DataT> | null;

  /**
   * This callback will be called when bin color domain has been calculated.
   * @default () => {}
   */
  onSetColorDomain?: (minMax: [number, number]) => void;

  /**
   * This callback will be called when bin elevation domain has been calculated.
   * @default () => {}
   */
  onSetElevationDomain?: (minMax: [number, number]) => void;

  /**
   * (Experimental) Filter data objects
   */
  _filterData: null | ((d: DataT) => boolean);
};

/** Aggregate data into a grid-based heatmap. Aggregation is performed on CPU. */
export default class CPUGridLayer<
  DataT = any,
  ExtraPropsT extends {} = {}
> extends AggregationLayer<DataT, ExtraPropsT & Required<_CPUGridLayerProps<DataT>>> {
  static layerName = 'CPUGridLayer';
  static defaultProps = defaultProps;

  initializeState(): void {
    const cpuAggregator = new CPUAggregator({
      getAggregator: props => props.gridAggregator,
      getCellSize: props => props.cellSize
    });

    this.state = {
      cpuAggregator,
      aggregatorState: cpuAggregator.state
    };
    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {size: 3, type: GL.DOUBLE, accessor: 'getPosition'}
    });
    // color and elevation attributes can't be added as attributes
    // they are calcualted using 'getValue' accessor that takes an array of pints.
  }

  updateState(opts: UpdateParameters<this>) {
    super.updateState(opts);
    this.setState({
      // make a copy of the internal state of cpuAggregator for testing
      aggregatorState: this.state.cpuAggregator.updateState(opts, {
        viewport: this.context.viewport,
        attributes: this.getAttributes(),
        numInstances: this.getNumInstances()
      })
    });
  }

  getPickingInfo({info}: GetPickingInfoParams): PickingInfo {
    return this.state.cpuAggregator.getPickingInfo({info});
  }

  // create a method for testing
  _onGetSublayerColor(cell) {
    return this.state.cpuAggregator.getAccessor('fillColor')(cell);
  }

  // create a method for testing
  _onGetSublayerElevation(cell) {
    return this.state.cpuAggregator.getAccessor('elevation')(cell);
  }

  _getSublayerUpdateTriggers() {
    return this.state.cpuAggregator.getUpdateTriggers(this.props);
  }

  renderLayers(): Layer {
    const {elevationScale, extruded, cellSize, coverage, material, transitions} = this.props;
    const {cpuAggregator} = this.state;
    const SubLayerClass = this.getSubLayerClass('grid-cell', GridCellLayer);
    const updateTriggers = this._getSublayerUpdateTriggers();

    return new SubLayerClass(
      {
        cellSize,
        coverage,
        material,
        elevationScale,
        extruded,

        getFillColor: this._onGetSublayerColor.bind(this),
        getElevation: this._onGetSublayerElevation.bind(this),
        transitions: transitions && {
          getFillColor: transitions.getColorValue || transitions.getColorWeight,
          getElevation: transitions.getElevationValue || transitions.getElevationWeight
        }
      },
      this.getSubLayerProps({
        id: 'grid-cell',
        updateTriggers
      }),
      {
        data: cpuAggregator.state.layerData.data
      }
    );
  }
}
