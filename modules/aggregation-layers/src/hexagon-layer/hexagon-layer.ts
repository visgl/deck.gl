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

import {
  Accessor,
  AccessorFunction,
  Color,
  log,
  Position,
  Material,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';

import {defaultColorRange} from '../utils/color-utils';

import {pointToHexbin} from './hexagon-aggregator';
import CPUAggregator from '../utils/cpu-aggregator';
import AggregationLayer, {AggregationLayerProps} from '../aggregation-layer';

import GL from '@luma.gl/constants';
import {AggregateAccessor} from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function nop() {}

const defaultProps: DefaultProps<HexagonLayerProps> = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: {type: 'accessor', value: null}, // default value is calcuated from `getColorWeight` and `colorAggregation`
  getColorWeight: {type: 'accessor', value: 1},
  colorAggregation: 'SUM',
  lowerPercentile: {type: 'number', value: 0, min: 0, max: 100},
  upperPercentile: {type: 'number', value: 100, min: 0, max: 100},
  colorScaleType: 'quantize',
  onSetColorDomain: nop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: {type: 'accessor', value: null}, // default value is calcuated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: {type: 'accessor', value: 1},
  elevationAggregation: 'SUM',
  elevationLowerPercentile: {type: 'number', value: 0, min: 0, max: 100},
  elevationUpperPercentile: {type: 'number', value: 100, min: 0, max: 100},
  elevationScale: {type: 'number', min: 0, value: 1},
  elevationScaleType: 'linear',
  onSetElevationDomain: nop,

  radius: {type: 'number', value: 1000, min: 1},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: {type: 'accessor', value: x => x.position},
  // Optional material for 'lighting' shader module
  material: true,

  // data filter
  _filterData: {type: 'function', value: null, optional: true}
};

/** All properties supported by by HexagonLayer. */
export type HexagonLayerProps<DataT = any> = _HexagonLayerProps<DataT> &
  AggregationLayerProps<DataT>;

/** Properties added by HexagonLayer. */
type _HexagonLayerProps<DataT = any> = {
  /**
   * Radius of hexagon bin in meters. The hexagons are pointy-topped (rather than flat-topped).
   * @default 1000
   */
  radius?: number;

  /**
   * Function to aggregate data into hexagonal bins.
   * @default d3-hexbin
   */
  hexagonAggregator?: (props: any, params: any) => any;

  /**
   * Color scale input domain.
   * @default [min(colorWeight), max(colorWeight)]
   */
  colorDomain?: [number, number] | null;

  /**
   * Specified as an array of colors [color1, color2, ...].
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   */
  colorRange?: Color[];

  /**
   * Hexagon radius multiplier, clamped between 0 - 1.
   * @default 1
   */
  coverage?: number;

  /**
   * Elevation scale input domain. The elevation scale is a linear scale that maps number of counts to elevation.
   * @default [0, max(elevationWeight)]
   */
  elevationDomain?: [number, number] | null;

  /**
   * Elevation scale output range.
   * @default [0, 1000]
   */
  elevationRange?: [number, number];

  /**
   * Hexagon elevation multiplier.
   * @default 1
   */
  elevationScale?: number;

  /**
   * Whether to enable cell elevation. If set to false, all cell will be flat.
   * @default false
   */
  extruded?: boolean;

  /**
   * Filter bins and re-calculate color by `upperPercentile`.
   * Hexagons with color value larger than the `upperPercentile` will be hidden.
   * @default 100
   */
  upperPercentile?: number;

  /**
   * Filter bins and re-calculate color by `lowerPercentile`.
   * Hexagons with color value smaller than the `lowerPercentile` will be hidden.
   * @default 0
   */
  lowerPercentile?: number;

  /**
   * Filter bins and re-calculate elevation by `elevationUpperPercentile`.
   * Hexagons with elevation value larger than the `elevationUpperPercentile` will be hidden.
   * @default 100
   */
  elevationUpperPercentile?: number;

  /**
   * Filter bins and re-calculate elevation by `elevationLowerPercentile`.
   * Hexagons with elevation value larger than the `elevationLowerPercentile` will be hidden.
   * @default 0
   */
  elevationLowerPercentile?: number;

  /**
   * Scaling function used to determine the color of the grid cell, default value is 'quantize'.
   * Supported Values are 'quantize', 'quantile' and 'ordinal'.
   * @default 'quantize'
   */
  colorScaleType?: 'quantize' | 'quantile' | 'ordinal';

  /**
   * Scaling function used to determine the elevation of the grid cell, only supports 'linear'.
   */
  elevationScaleType?: 'linear';

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
   * The weight of a data object used to calculate the color value for a bin.
   * @default 1
   */
  getColorWeight?: Accessor<DataT, number>;

  /**
   * After data objects are aggregated into bins, this accessor is called on each cell to get the value that its color is based on.
   * @default null
   */
  getColorValue?: AggregateAccessor<DataT> | null;

  /**
   * The weight of a data object used to calculate the elevation value for a bin.
   * @default 1
   */
  getElevationWeight?: Accessor<DataT, number>;

  /**
   * After data objects are aggregated into bins, this accessor is called on each cell to get the value that its elevation is based on.
   * @default null
   */
  getElevationValue?: AggregateAccessor<DataT> | null;

  /**
   * This callback will be called when cell color domain has been calculated.
   * @default () => {}
   */
  onSetColorDomain?: (minMax: [number, number]) => void;

  /**
   * This callback will be called when cell elevation domain has been calculated.
   * @default () => {}
   */
  onSetElevationDomain?: (minMax: [number, number]) => void;

  /**
   * (Experimental) Filter data objects
   */
  _filterData: null | ((d: DataT) => boolean);
};

/** Aggregates data into a hexagon-based heatmap. The color and height of a hexagon are determined based on the objects it contains. */
export default class HexagonLayer<DataT, ExtraPropsT extends {} = {}> extends AggregationLayer<
  DataT,
  ExtraPropsT & Required<_HexagonLayerProps>
> {
  static layerName = 'HexagonLayer';
  static defaultProps = defaultProps;

  state!: AggregationLayer<DataT>['state'] & {
    cpuAggregator: CPUAggregator;
    aggregatorState: any;
  };
  initializeState() {
    const cpuAggregator = new CPUAggregator({
      getAggregator: props => props.hexagonAggregator,
      getCellSize: props => props.radius
    });

    this.state = {
      cpuAggregator,
      aggregatorState: cpuAggregator.state,
      vertices: null
    };
    const attributeManager = this.getAttributeManager()!;
    attributeManager.add({
      positions: {size: 3, type: GL.DOUBLE, accessor: 'getPosition'}
    });
    // color and elevation attributes can't be added as attributes
    // they are calculated using 'getValue' accessor that takes an array of pints.
  }

  updateState(opts: UpdateParameters<this>) {
    super.updateState(opts);

    if (opts.changeFlags.propsOrDataChanged) {
      const aggregatorState = this.state.cpuAggregator.updateState(opts, {
        viewport: this.context.viewport,
        attributes: this.getAttributes()
      });
      if (this.state.aggregatorState.layerData !== aggregatorState.layerData) {
        // if user provided custom aggregator and returns hexagonVertices,
        // Need to recalculate radius and angle based on vertices
        const {hexagonVertices} = aggregatorState.layerData || {};
        this.setState({
          vertices: hexagonVertices && this.convertLatLngToMeterOffset(hexagonVertices)
        });
      }

      this.setState({
        // make a copy of the internal state of cpuAggregator for testing
        aggregatorState
      });
    }
  }

  convertLatLngToMeterOffset(hexagonVertices) {
    const {viewport} = this.context;
    if (Array.isArray(hexagonVertices) && hexagonVertices.length === 6) {
      // get centroid of hexagons
      const vertex0 = hexagonVertices[0];
      const vertex3 = hexagonVertices[3];

      const centroid = [(vertex0[0] + vertex3[0]) / 2, (vertex0[1] + vertex3[1]) / 2];
      const centroidFlat = viewport.projectFlat(centroid);

      const {metersPerUnit} = viewport.getDistanceScales(centroid);

      // offset all points by centroid to meter offset
      const vertices = hexagonVertices.map(vt => {
        const vtFlat = viewport.projectFlat(vt);

        return [
          (vtFlat[0] - centroidFlat[0]) * metersPerUnit[0],
          (vtFlat[1] - centroidFlat[1]) * metersPerUnit[1]
        ];
      });

      return vertices;
    }

    log.error('HexagonLayer: hexagonVertices needs to be an array of 6 points')();
    return null;
  }

  getPickingInfo({info}) {
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

  renderLayers() {
    const {elevationScale, extruded, coverage, material, transitions} = this.props;
    const {aggregatorState, vertices} = this.state;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);
    const updateTriggers = this._getSublayerUpdateTriggers();

    const geometry = vertices
      ? {vertices, radius: 1}
      : {
          // default geometry
          radius: aggregatorState.layerData.radiusCommon || 1,
          radiusUnits: 'common',
          angle: 90
        };
    return new SubLayerClass(
      {
        ...geometry,
        diskResolution: 6,
        elevationScale,
        extruded,
        coverage,
        material,

        getFillColor: this._onGetSublayerColor.bind(this),
        getElevation: this._onGetSublayerElevation.bind(this),
        transitions: transitions && {
          getFillColor: transitions.getColorValue || transitions.getColorWeight,
          getElevation: transitions.getElevationValue || transitions.getElevationWeight
        }
      },
      this.getSubLayerProps({
        id: 'hexagon-cell',
        updateTriggers
      }),
      {
        data: aggregatorState.layerData.data
      }
    );
  }
}
