import {
  Accessor,
  AccessorFunction,
  Color,
  Position,
  Material,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';
import CPUAggregator from '../utils/cpu-aggregator';
import AggregationLayer, {AggregationLayerProps} from '../aggregation-layer';
import {AggregateAccessor} from '../types';
/** All properties supported by by HexagonLayer. */
export declare type HexagonLayerProps<DataT = any> = _HexagonLayerProps<DataT> &
  AggregationLayerProps<DataT>;
/** Properties added by HexagonLayer. */
declare type _HexagonLayerProps<DataT = any> = {
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
export default class HexagonLayer<ExtraPropsT = {}> extends AggregationLayer<
  ExtraPropsT & Required<_HexagonLayerProps>
> {
  static layerName: string;
  static defaultProps: DefaultProps<HexagonLayerProps<any>>;
  state: AggregationLayer['state'] & {
    cpuAggregator: CPUAggregator;
    aggregatorState: any;
  };
  initializeState(): void;
  updateState(opts: UpdateParameters<this>): void;
  convertLatLngToMeterOffset(hexagonVertices: any): number[][];
  getPickingInfo({info}: {info: any}): any;
  _onGetSublayerColor(cell: any): any;
  _onGetSublayerElevation(cell: any): any;
  _getSublayerUpdateTriggers(): {};
  renderLayers(): ColumnLayer<any, {}>;
}
export {};
// # sourceMappingURL=hexagon-layer.d.ts.map
