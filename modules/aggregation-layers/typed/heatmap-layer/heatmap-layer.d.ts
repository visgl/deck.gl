import {Buffer, Texture2D} from '@luma.gl/webgl-legacy';
import {
  Accessor,
  AccessorFunction,
  AttributeManager,
  ChangeFlags,
  Color,
  Layer,
  LayerContext,
  LayersList,
  Position,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import AggregationLayer, {AggregationLayerProps} from '../aggregation-layer';
export declare type HeatmapLayerProps<DataT = any> = _HeatmapLayerProps<DataT> &
  AggregationLayerProps<DataT>;
declare type _HeatmapLayerProps<DataT> = {
  /**
   * Radius of the circle in pixels, to which the weight of an object is distributed.
   *
   * @default 30
   */
  radiusPixels?: number;
  /**
   * Specified as an array of colors [color1, color2, ...].
   *
   * @default `6-class YlOrRd` - [colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6)
   */
  colorRange?: Color[];
  /**
   * Value that is multiplied with the total weight at a pixel to obtain the final weight.
   *
   * @default 1
   */
  intensity?: number;
  /**
   * Ratio of the fading weight to the max weight, between `0` and `1`.
   *
   * For example, `0.1` affects all pixels with weight under 10% of the max.
   *
   * Ignored when `colorDomain` is specified.
   * @default 0.05
   */
  threshold?: number;
  /**
   * Controls how weight values are mapped to the `colorRange`, as an array of two numbers [`minValue`, `maxValue`].
   *
   * @default null
   */
  colorDomain?: [number, number] | null;
  /**
   * Defines the type of aggregation operation
   *
   * V valid values are 'SUM', 'MEAN'.
   *
   * @default 'SUM'
   */
  aggregation?: 'SUM' | 'MEAN';
  /**
   * Specifies the size of weight texture.
   * @default 2048
   */
  weightsTextureSize?: number;
  /**
   * Interval in milliseconds during which changes to the viewport don't trigger aggregation.
   *
   * @default 500
   */
  debounceTimeout?: number;
  /**
   * Method called to retrieve the position of each object.
   *
   * @default d => d.position
   */
  getPosition?: AccessorFunction<DataT, Position>;
  /**
   * The weight of each object.
   *
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;
};
/** Visualizes the spatial distribution of data. */
export default class HeatmapLayer<DataT = any, ExtraPropsT = {}> extends AggregationLayer<
  ExtraPropsT & Required<_HeatmapLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<HeatmapLayerProps<any>>;
  state: AggregationLayer['state'] & {
    supported: boolean;
    colorDomain?: number[];
    isWeightMapDirty?: boolean;
    weightsTexture?: Texture2D;
    zoom?: number;
    worldBounds?: number[];
    normalizedCommonBounds?: number[];
    updateTimer?: any;
    triPositionBuffer?: Buffer;
    triTexCoordBuffer?: Buffer;
  };
  initializeState(): void;
  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean;
  updateState(opts: UpdateParameters<this>): void;
  _updateHeatmapState(opts: UpdateParameters<this>): void;
  renderLayers(): LayersList | Layer;
  finalizeState(context: LayerContext): void;
  _getAttributeManager(): AttributeManager;
  _getChangeFlags(opts: UpdateParameters<this>): Partial<ChangeFlags> & {
    boundsChanged?: boolean;
    viewportZoomChanged?: boolean;
  };
  _createTextures(): void;
  _setupAttributes(): void;
  _setupTextureParams(): void;
  getShaders(type: any): any;
  _createWeightsTransform(shaders?: {}): void;
  _setupResources(): void;
  updateShaders(shaderOptions: any): void;
  _updateMaxWeightValue(): void;
  _updateBounds(forceUpdate?: any): boolean;
  _updateTextureRenderingBounds(): void;
  _updateColorTexture(opts: any): void;
  _updateWeightmap(): void;
  _debouncedUpdateWeightmap(fromTimer?: boolean): void;
  _worldToCommonBounds(
    worldBounds: any,
    opts?: {
      useLayerCoordinateSystem?: boolean;
    }
  ): number[];
  _commonToWorldBounds(commonBounds: any): number[];
}
export {};
// # sourceMappingURL=heatmap-layer.d.ts.map
