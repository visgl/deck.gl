import {
  Layer,
  UpdateParameters,
  LayerProps,
  Unit,
  AccessorFunction,
  Position,
  Accessor,
  Color,
  DefaultProps
} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
/** All properties supported by ArcLayer. */
export declare type ArcLayerProps<DataT = any> = _ArcLayerProps<DataT> & LayerProps<DataT>;
/** Properties added by ArcLayer. */
declare type _ArcLayerProps<DataT> = {
  /**
   * If `true`, create the arc along the shortest path on the earth surface.
   * @default false
   */
  greatCircle?: boolean;
  /**
   * The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`
   * @default 'pixels'
   */
  widthUnits?: Unit;
  /**
   * The scaling multiplier for the width of each line.
   * @default 1
   */
  widthScale?: number;
  /**
   * The minimum line width in pixels.
   * @default 0
   */
  widthMinPixels?: number;
  /**
   * The maximum line width in pixels.
   * @default Number.MAX_SAFE_INTEGER
   */
  widthMaxPixels?: number;
  /**
   * Method called to retrieve the source position of each object.
   * @default object => object.sourcePosition
   */
  getSourcePosition?: AccessorFunction<DataT, Position>;
  /**
   * Method called to retrieve the target position of each object.
   * @default object => object.targetPosition
   */
  getTargetPosition?: AccessorFunction<DataT, Position>;
  /**
   * The rgba color is in the format of `[r, g, b, [a]]`.
   * @default [0, 0, 0, 255]
   */
  getSourceColor?: Accessor<DataT, Color>;
  /**
   * The rgba color is in the format of `[r, g, b, [a]]`.
   * @default [0, 0, 0, 255]
   */
  getTargetColor?: Accessor<DataT, Color>;
  /**
   * The line width of each object, in units specified by `widthUnits`.
   * @default 1
   */
  getWidth?: Accessor<DataT, number>;
  /**
   * Multiplier of layer height. `0` will make the layer flat.
   * @default 1
   */
  getHeight?: Accessor<DataT, number>;
  /**
   * Use to tilt the arc to the side if you have multiple arcs with the same source and target positions.
   * @default 0
   */
  getTilt?: Accessor<DataT, number>;
};
/** Render raised arcs joining pairs of source and target coordinates. */
export default class ArcLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_ArcLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<ArcLayerProps<any>>;
  state: Layer['state'] & {
    model?: Model;
  };
  getShaders(): any;
  get wrapLongitude(): boolean;
  initializeState(): void;
  updateState(opts: UpdateParameters<this>): void;
  draw({uniforms}: {uniforms: any}): void;
  protected _getModel(): Model;
}
export {};
// # sourceMappingURL=arc-layer.d.ts.map
