import {
  Accessor,
  AccessorFunction,
  Color,
  Layer,
  Position,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import GridAggregationLayer, {GridAggregationLayerProps} from '../grid-aggregation-layer';
/** All properties supported by ContourLayer. */
export declare type ContourLayerProps<DataT = any> = _ContourLayerProps<DataT> &
  GridAggregationLayerProps<DataT>;
/** Properties added by ContourLayer. */
export declare type _ContourLayerProps<DataT> = {
  /**
   * Size of each cell in meters.
   * @default 1000
   */
  cellSize?: number;
  /**
   * When set to true, aggregation is performed on GPU, provided other conditions are met.
   * @default true
   */
  gpuAggregation?: boolean;
  /**
   * Defines the type of aggregation operation, valid values are 'SUM', 'MEAN', 'MIN' and 'MAX'.
   * @default 'SUM'
   */
  aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
  /**
   * Definition of contours to be drawn.
   * @default [{threshold: 1}]
   */
  contours: {
    /**
     * Isolines: `threshold` value must be a single `Number`, Isolines are generated based on this threshold value.
     *
     * Isobands: `threshold` value must be an Array of two `Number`s. Isobands are generated using `[threshold[0], threshold[1])` as threshold range, i.e area that has values `>= threshold[0]` and `< threshold[1]` are rendered with corresponding color. NOTE: `threshold[0]` is inclusive and `threshold[1]` is not inclusive.
     */
    threshold: number | number[];
    /**
     * RGBA color array to be used to render the contour.
     * @default [255, 255, 255, 255]
     */
    color?: Color;
    /**
     * Applicable for `Isoline`s only, width of the Isoline in pixels.
     * @default 1
     */
    strokeWidth?: number;
    /** Defines z order of the contour. */
    zIndex?: number;
  }[];
  /**
   * A very small z offset that is added for each vertex of a contour (Isoline or Isoband).
   * @default 0.005
   */
  zOffset?: number;
  /**
   * Method called to retrieve the position of each object.
   * @default object => object.position
   */
  getPosition?: AccessorFunction<DataT, Position>;
  /**
   * The weight of each object.
   * @default 1
   */
  getWeight?: Accessor<DataT, number>;
};
/** Aggregate data into iso-lines or iso-bands for a given threshold and cell size. */
export default class ContourLayer<DataT = any, ExtraPropsT = {}> extends GridAggregationLayer<
  ExtraPropsT & Required<_ContourLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<ContourLayerProps<any>>;
  initializeState(): void;
  updateState(opts: UpdateParameters<this>): void;
  renderLayers(): Layer[];
  updateAggregationState(opts: any): void;
  private _updateAccessors;
  private _resetResults;
  private _generateContours;
  private _updateThresholdData;
}
// # sourceMappingURL=contour-layer.d.ts.map
