import {
  Layer,
  CoordinateSystem,
  LayerProps,
  PickingInfo,
  GetPickingInfoParams,
  UpdateParameters,
  Color,
  Texture,
  Position,
  DefaultProps
} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
/** All properties supported by BitmapLayer. */
export declare type BitmapLayerProps = _BitmapLayerProps & LayerProps;
export declare type BitmapBoundingBox =
  | [left: number, bottom: number, right: number, top: number]
  | [Position, Position, Position, Position];
/** Properties added by BitmapLayer. */
declare type _BitmapLayerProps = {
  /**
   * The image to display.
   *
   * @default null
   */
  image?: string | Texture | null;
  /**
   * Supported formats:
   *  - Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
   *  - Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`.
   *   Each position could optionally contain a third component `z`.
   * @default [1, 0, 0, 1]
   */
  bounds?: BitmapBoundingBox;
  /**
   * > Note: this prop is experimental.
   *
   * Specifies how image coordinates should be geographically interpreted.
   * @default COORDINATE_SYSTEM.DEFAULT
   */
  _imageCoordinateSystem?: CoordinateSystem;
  /**
   * The desaturation of the bitmap. Between `[0, 1]`.
   * @default 0
   */
  desaturate?: number;
  /**
   * The color to use for transparent pixels, in `[r, g, b, a]`.
   * @default [0, 0, 0, 0]
   */
  transparentColor?: Color;
  /**
   * The color to tint the bitmap by, in `[r, g, b]`.
   * @default [255, 255, 255]
   */
  tintColor?: Color;
  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: Record<number, number> | null;
};
/** Render a bitmap at specified boundaries. */
export default class BitmapLayer<ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_BitmapLayerProps>
> {
  static layerName: string;
  static defaultProps: DefaultProps<BitmapLayerProps>;
  state: Layer['state'] & {
    disablePicking?: boolean;
    model?: Model;
    mesh?: any;
    coordinateConversion?: number;
    bounds?: number[];
  };
  getShaders(): any;
  initializeState(): void;
  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void;
  getPickingInfo(params: GetPickingInfoParams): PickingInfo;
  disablePickingIndex(): void;
  restorePickingColors(): void;
  protected _updateAutoHighlight(info: any): void;
  protected _createMesh():
    | {
        vertexCount: number;
        positions: Float64Array;
        indices: Uint16Array;
        texCoords: Float32Array;
      }
    | {
        vertexCount: number;
        positions: Float64Array;
        indices: Uint32Array;
        texCoords: Float32Array;
      };
  protected _getModel(): Model;
  draw(opts: any): void;
  _getCoordinateUniforms(): {
    coordinateConversion: number;
    bounds: number[];
  };
}
export {};
// # sourceMappingURL=bitmap-layer.d.ts.map
