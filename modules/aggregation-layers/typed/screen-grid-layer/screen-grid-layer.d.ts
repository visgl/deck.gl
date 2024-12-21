import {
  Accessor,
  Color,
  GetPickingInfoParams,
  Layer,
  LayerContext,
  LayersList,
  PickingInfo,
  Position,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import type {Texture2D} from '@luma.gl/webgl-legacy';
import GridAggregationLayer, {GridAggregationLayerProps} from '../grid-aggregation-layer';
/** All properties supported by ScreenGridLayer. */
export declare type ScreenGridLayerProps<DataT = any> = _ScreenGridLayerProps<DataT> &
  GridAggregationLayerProps<DataT>;
/** Properties added by ScreenGridLayer. */
export declare type _ScreenGridLayerProps<DataT> = {
  /**
   * Unit width/height of the bins.
   * @default 100
   */
  cellSizePixels?: number;
  /**
   * Cell margin size in pixels.
   * @default 2
   */
  cellMarginPixels?: number;
  /**
   * Expressed as an rgba array, minimal color that could be rendered by a tile.
   * @default [0, 0, 0, 255]
   * @deprecated Deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.
   */
  minColor?: Color | null;
  /**
   * Expressed as an rgba array, maximal color that could be rendered by a tile.
   * @default [0, 255, 0, 255]
   * @deprecated Deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.
   */
  maxColor?: Color | null;
  /**
   * Color scale input domain. The color scale maps continues numeric domain into discrete color range.
   * @default [1, max(weight)]
   */
  colorDomain?: [number, number] | null;
  /**
   * Specified as an array of colors [color1, color2, ...].
   *
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   */
  colorRange?: Color[];
  /**
   * Method called to retrieve the position of each object.
   *
   * @default d => d.position
   */
  getPosition?: Accessor<DataT, Position>;
  /**
   * The weight of each object.
   *
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;
  /**
   * Perform aggregation is performed on GPU.
   *
   * NOTE: GPU Aggregation requires WebGL2 support by the browser.
   * When `gpuAggregation` is set to true and browser doesn't support WebGL2, aggregation falls back to CPU.
   *
   * @default true
   */
  gpuAggregation?: boolean;
  /**
   * Defines the type of aggregation operation
   *
   * V valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'.
   *
   * @default 'SUM'
   */
  aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
};
/** Aggregates data into histogram bins and renders them as a grid. */
export default class ScreenGridLayer<DataT = any, ExtraProps = {}> extends GridAggregationLayer<
  ExtraProps & Required<_ScreenGridLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<ScreenGridLayerProps<any>>;
  state: GridAggregationLayer['state'] & {
    supported: boolean;
    gpuGridAggregator?: any;
    gpuAggregation?: any;
    weights?: any;
    maxTexture?: Texture2D;
  };
  initializeState(): void;
  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean;
  updateState(opts: UpdateParameters<this>): void;
  renderLayers(): LayersList | Layer;
  finalizeState(context: LayerContext): void;
  getPickingInfo({info}: GetPickingInfoParams): PickingInfo;
  updateResults({aggregationData, maxData}: {aggregationData: any; maxData: any}): void;
  updateAggregationState(opts: any): void;
  _updateAccessors(opts: any): void;
  _resetResults(): void;
}
// # sourceMappingURL=screen-grid-layer.d.ts.map
