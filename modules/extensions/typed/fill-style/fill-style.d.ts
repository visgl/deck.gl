import {LayerExtension} from '@deck.gl/core';
import type {
  Layer,
  LayerContext,
  Accessor,
  AccessorFunction,
  Texture,
  UpdateParameters
} from '@deck.gl/core';
export declare type FillStyleExtensionProps<DataT = any> = {
  /** Cheap toggle to enable/disable pattern fill. Requires the `pattern` option to be on.
   * @default true
   */
  fillPatternEnabled?: boolean;
  /** Sprite image url or texture that packs all your patterns into one layout. */
  fillPatternAtlas?: Texture;
  /** Pattern names mapped to pattern definitions, or a url that points to a JSON file. */
  fillPatternMapping?:
    | string
    | Record<
        string,
        {
          /** Left position of the pattern on the atlas */
          x: number;
          /** Top position of the pattern on the atlas */
          y: number;
          /** Width of the pattern */
          width: number;
          /** Height of the pattern */
          height: number;
        }
      >;
  /**
   * Whether to treat the patterns as transparency masks.
   * @default true
   */
  fillPatternMask?: boolean;
  /** Accessor for the name of the pattern. */
  getFillPattern?: AccessorFunction<DataT, string>;
  /** Accessor for the scale of the pattern, relative to the original size. If the pattern is 24 x 24 pixels, scale `1` roughly yields 24 meters.
   * @default 1
   */
  getFillPatternScale?: Accessor<DataT, number>;
  /**
   * Accessor for the offset of the pattern, relative to the original size. Offset `[0.5, 0.5]` shifts the pattern alignment by half.
   * @default [0, 0]
   */
  getFillPatternOffset?: Accessor<DataT, [number, number]>;
};
declare type FillStyleExtensionOptions = {
  /** If `true`, adds the ability to tile the filled area with a pattern.
   * @default false
   */
  pattern: boolean;
};
/** Adds selected features to layers that render a "fill", such as the `PolygonLayer` and `ScatterplotLayer`. */
export default class FillStyleExtension extends LayerExtension<FillStyleExtensionOptions> {
  static defaultProps: {
    fillPatternEnabled: boolean;
    fillPatternAtlas: any;
    fillPatternMapping: any;
    fillPatternMask: boolean;
    getFillPattern: {
      type: string;
      value: (d: any) => any;
    };
    getFillPatternScale: {
      type: string;
      value: number;
    };
    getFillPatternOffset: {
      type: string;
      value: number[];
    };
  };
  static extensionName: string;
  constructor({pattern}?: Partial<FillStyleExtensionOptions>);
  isEnabled(layer: Layer<FillStyleExtensionProps>): boolean;
  getShaders(this: Layer<FillStyleExtensionProps>, extension: this): any;
  initializeState(
    this: Layer<FillStyleExtensionProps>,
    context: LayerContext,
    extension: this
  ): void;
  updateState(
    this: Layer<FillStyleExtensionProps>,
    {props, oldProps}: UpdateParameters<Layer<FillStyleExtensionProps>>,
    extension: this
  ): void;
  draw(this: Layer<FillStyleExtensionProps>, params: any, extension: this): void;
  finalizeState(this: Layer<FillStyleExtensionProps>): void;
  loadPatternAtlas(this: Layer<FillStyleExtensionProps>): Promise<void>;
  loadPatternMapping(this: Layer<FillStyleExtensionProps>): Promise<void>;
  getPatternFrame(this: Layer<FillStyleExtensionProps>, name: string): any[];
}
export {};
// # sourceMappingURL=fill-style.d.ts.map
