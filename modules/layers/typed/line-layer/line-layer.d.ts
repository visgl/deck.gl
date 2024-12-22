import {
  Layer,
  LayerProps,
  Unit,
  Position,
  Accessor,
  Color,
  UpdateParameters,
  DefaultProps
} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
/** All properties supported by LineLayer. */
export declare type LineLayerProps<DataT = any> = _LineLayerProps<DataT> & LayerProps<DataT>;
/** Properties added by LineLayer. */
declare type _LineLayerProps<DataT> = {
  /**
   * The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`.
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
   * Source position of each object.
   * @default object => object.sourcePosition
   */
  getSourcePosition?: Accessor<DataT, Position>;
  /**
   * Target position of each object.
   * @default object => object.targetPosition
   */
  getTargetPosition?: Accessor<DataT, Position>;
  /**
   * The rgba color is in the format of `[r, g, b, [a]]`.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
  /**
   * Width of each object
   * @default 1
   */
  getWidth?: Accessor<DataT, number>;
};
/**
 * A layer that renders straight lines joining pairs of source and target coordinates.
 */
export default class LineLayer<DataT = any, ExtraProps = {}> extends Layer<
  ExtraProps & Required<_LineLayerProps<DataT>>
> {
  static layerName: string;
  static defaultProps: DefaultProps<LineLayerProps<any>>;
  getShaders(): any;
  get wrapLongitude(): boolean;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  draw({uniforms}: {uniforms: any}): void;
  protected _getModel(): Model;
}
export {};
// # sourceMappingURL=line-layer.d.ts.map
