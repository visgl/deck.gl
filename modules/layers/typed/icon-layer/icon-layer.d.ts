import {Layer} from '@deck.gl/core';
import {Model} from '@luma.gl/webgl-legacy';
import IconManager from './icon-manager';
import type {
  LayerProps,
  Accessor,
  AccessorFunction,
  Position,
  Color,
  Unit,
  UpdateParameters,
  LayerContext,
  DefaultProps
} from '@deck.gl/core';
import {Texture2D} from '@luma.gl/webgl-legacy';
import type {UnpackedIcon, IconMapping, LoadIconErrorContext} from './icon-manager';
declare type _IconLayerProps<DataT> = {
  /** A prepacked image that contains all icons. */
  iconAtlas?: string | Texture2D;
  /** Icon names mapped to icon definitions, or a URL to load such mapping from a JSON file. */
  iconMapping?: string | IconMapping;
  /** Icon size multiplier.
   * @default 1
   */
  sizeScale?: number;
  /**
   * The units of the icon size, one of `meters`, `common`, and `pixels`.
   *
   * @default 'pixels'
   */
  sizeUnits?: Unit;
  /**
   * The minimum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too small when zoomed out.
   */
  sizeMinPixels?: number;
  /**
   * The maximum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too big when zoomed in.
   */
  sizeMaxPixels?: number;
  /** If `true`, the icon always faces camera. Otherwise the icon faces up (z)
   * @default true
   */
  billboard?: boolean;
  /**
   * Discard pixels whose opacity is below this threshold.
   * A discarded pixel would create a "hole" in the icon that is not considered part of the object.
   * @default 0.05
   */
  alphaCutoff?: number;
  /** Anchor position accessor. */
  getPosition?: Accessor<DataT, Position>;
  /** Icon definition accessor.
   * Should return the icon id if using pre-packed icons (`iconAtlas` + `iconMapping`).
   * Return an object that defines the icon if using auto-packing.
   */
  getIcon?: AccessorFunction<DataT, string> | AccessorFunction<DataT, UnpackedIcon>;
  /** Icon color accessor.
   * @default [0, 0, 0, 255]
   */
  getColor?: Accessor<DataT, Color>;
  /** Icon size accessor.
   * @default 1
   */
  getSize?: Accessor<DataT, number>;
  /** Icon rotation accessor, in degrees.
   * @default 0
   */
  getAngle?: Accessor<DataT, number>;
  /**
   * Icon offsest accessor, in pixels.
   * @default [0, 0]
   */
  getPixelOffset?: Accessor<DataT, [number, number]>;
  /**
   * Callback called if the attempt to fetch an icon returned by `getIcon` fails.
   */
  onIconError?: ((context: LoadIconErrorContext) => void) | null;
  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: Record<number, number> | null;
};
export declare type IconLayerProps<DataT = any> = _IconLayerProps<DataT> & LayerProps<DataT>;
/** Render raster icons at given coordinates. */
export default class IconLayer<DataT = any, ExtraPropsT = {}> extends Layer<
  ExtraPropsT & Required<_IconLayerProps<DataT>>
> {
  static defaultProps: DefaultProps<IconLayerProps<any>>;
  static layerName: string;
  state: {
    model?: Model;
    iconManager: IconManager;
  };
  getShaders(): any;
  initializeState(): void;
  updateState(params: UpdateParameters<this>): void;
  get isLoaded(): boolean;
  finalizeState(context: LayerContext): void;
  draw({uniforms}: {uniforms: any}): void;
  protected _getModel(): Model;
  private _onUpdate;
  private _onError;
  protected getInstanceOffset(icon: string): number[];
  protected getInstanceColorMode(icon: string): number;
  protected getInstanceIconFrame(icon: string): number[];
}
export {};
// # sourceMappingURL=icon-layer.d.ts.map
