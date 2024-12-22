import {Accessor, AccessorFunction, Color, Position, Material, DefaultProps} from '@deck.gl/core';
import AggregationLayer, {AggregationLayerProps} from '../aggregation-layer';
import {Layer, UpdateParameters, GetPickingInfoParams, PickingInfo} from '@deck.gl/core';
import {AggregateAccessor} from '../types';
/** All properties supported by CPUGridLayer. */
export declare type CPUGridLayerProps<DataT = any> = _CPUGridLayerProps<DataT> &
  AggregationLayerProps<DataT>;
/** Properties added by CPUGridLayer. */
export declare type _CPUGridLayerProps<DataT> = {
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
export default class CPUGridLayer<DataT = any, ExtraPropsT = {}> extends AggregationLayer<
  ExtraPropsT & Required<_CPUGridLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<CPUGridLayerProps<any>>;
  initializeState(): void;
  updateState(opts: UpdateParameters<this>): void;
  getPickingInfo({info}: GetPickingInfoParams): PickingInfo;
  _onGetSublayerColor(cell: any): any;
  _onGetSublayerElevation(cell: any): any;
  _getSublayerUpdateTriggers(): any;
  renderLayers(): Layer;
}
// # sourceMappingURL=cpu-grid-layer.d.ts.map
