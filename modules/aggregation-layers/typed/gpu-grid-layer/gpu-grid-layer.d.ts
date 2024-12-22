import {
  Accessor,
  AccessorFunction,
  Color,
  Material,
  GetPickingInfoParams,
  LayerContext,
  PickingInfo,
  Position,
  DefaultProps
} from '@deck.gl/core';
import GPUGridCellLayer from './gpu-grid-cell-layer';
import GridAggregationLayer, {GridAggregationLayerProps} from '../grid-aggregation-layer';
/** All properties supported by GPUGridLayer. */
export declare type GPUGridLayerProps<DataT = any> = _GPUGridLayerProps<DataT> &
  GridAggregationLayerProps<DataT>;
/** Properties added by GPUGridLayer. */
export declare type _GPUGridLayerProps<DataT> = {
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
export default class GPUGridLayer<DataT = any, ExtraPropsT = {}> extends GridAggregationLayer<
  ExtraPropsT & Required<_GPUGridLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<GPUGridLayerProps<any>>;
  initializeState({device}: LayerContext): void;
  updateState(opts: any): void;
  getHashKeyForIndex(index: number): string;
  getPositionForIndex(index: number): Position;
  getPickingInfo({info, mode}: GetPickingInfoParams): PickingInfo;
  renderLayers(): GPUGridCellLayer;
  finalizeState(context: LayerContext): void;
  updateAggregationState(opts: any): void;
  _updateAccessors(opts: any): void;
}
// # sourceMappingURL=gpu-grid-layer.d.ts.map
