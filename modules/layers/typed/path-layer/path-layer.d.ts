import {Layer} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
import PathTesselator from './path-tesselator';
import type {
  LayerProps,
  Color,
  Accessor,
  AccessorFunction,
  Unit,
  UpdateParameters,
  GetPickingInfoParams,
  PickingInfo,
  DefaultProps
} from '@deck.gl/core';
import type {PathGeometry} from './path';
declare type _PathLayerProps<DataT> = {
  /** The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`
   * @default 'meters'
   */
  widthUnits?: Unit;
  /**
   * Path width multiplier.
   * @default 1
   */
  widthScale?: number;
  /**
   * The minimum path width in pixels. This prop can be used to prevent the path from getting too thin when zoomed out.
   * @default 0
   */
  widthMinPixels?: number;
  /**
   * The maximum path width in pixels. This prop can be used to prevent the path from getting too thick when zoomed in.
   * @default Number.MAX_SAFE_INTEGER
   */
  widthMaxPixels?: number;
  /**
   * Type of joint. If `true`, draw round joints. Otherwise draw miter joints.
   * @default false
   */
  jointRounded?: boolean;
  /**
   * Type of caps. If `true`, draw round caps. Otherwise draw square caps.
   * @default false
   */
  capRounded?: boolean;
  /**
   * The maximum extent of a joint in ratio to the stroke width. Only works if `jointRounded` is `false`.
   * @default 4
   */
  miterLimit?: number;
  /**
   * If `true`, extrude the path in screen space (width always faces the camera).
   * If `false`, the width always faces up (z).
   * @default false
   */
  billboard?: boolean;
  /**
   * (Experimental) If `'loop'` or `'open'`, will skip normalizing the coordinates returned by `getPath` and instead assume all paths are to be loops or open paths.
   * When normalization is disabled, paths must be specified in the format of flat array. Open paths must contain at least 2 vertices and closed paths must contain at least 3 vertices.
   * @default null
   */
  _pathType?: null | 'loop' | 'open';
  /**
   * Path geometry accessor.
   */
  getPath?: AccessorFunction<DataT, PathGeometry>;
  /**
   * Path color accessor.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color | Color[]>;
  /**
   * Path width accessor.
   * @default 1
   */
  getWidth?: Accessor<DataT, number | number[]>;
  /**
   * @deprecated Use `jointRounded` and `capRounded` instead
   */
  rounded?: boolean;
};
export declare type PathLayerProps<DataT = any> = _PathLayerProps<DataT> & LayerProps<DataT>;
/** Render lists of coordinate points as extruded polylines with mitering. */
export default class PathLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_PathLayerProps<DataT>>
> {
  static defaultProps: DefaultProps<PathLayerProps<any>>;
  static layerName: string;
  state: {
    model?: Model;
    pathTesselator: PathTesselator;
  };
  getShaders(): any;
  get wrapLongitude(): boolean;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  getPickingInfo(params: GetPickingInfoParams): PickingInfo;
  /** Override base Layer method */
  disablePickingIndex(objectIndex: number): void;
  draw({uniforms}: {uniforms: any}): void;
  protected _getModel(): Model;
  protected calculatePositions(attribute: any): void;
  protected calculateSegmentTypes(attribute: any): void;
}
export {};
// # sourceMappingURL=path-layer.d.ts.map
