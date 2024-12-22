import {LayerExtension} from '@deck.gl/core';
import type {Layer, LayerContext, Accessor, UpdateParameters} from '@deck.gl/core';
export declare type PathStyleExtensionProps<DataT = any> = {
  /**
   * Accessor for the dash array to draw each path with: `[dashSize, gapSize]` relative to the width of the path.
   * Requires the `dash` option to be on.
   */
  getDashArray?: Accessor<DataT, [number, number]>;
  /**
   * Accessor for the offset to draw each path with, relative to the width of the path.
   * Negative offset is to the left hand side, and positive offset is to the right hand side.
   * @default 0
   */
  getOffset?: Accessor<DataT, number>;
  /**
   * If `true`, adjust gaps for the dashes to align at both ends.
   * @default false
   */
  dashJustified?: boolean;
  /**
   * If `true`, gaps between solid strokes are pickable. If `false`, only the solid strokes are pickable.
   * @default false
   */
  dashGapPickable?: boolean;
};
declare type PathStyleExtensionOptions = {
  /**
   * Add capability to render dashed lines.
   * @default false
   */
  dash: boolean;
  /**
   * Add capability to offset lines.
   * @default false
   */
  offset: boolean;
  /**
   * Improve dash rendering quality in certain circumstances. Note that this option introduces additional performance overhead.
   * @default false
   */
  highPrecisionDash: boolean;
};
/** Adds selected features to the `PathLayer` and composite layers that render the `PathLayer`. */
export default class PathStyleExtension extends LayerExtension<PathStyleExtensionOptions> {
  static defaultProps: {
    getDashArray: {
      type: string;
      value: number[];
    };
    getOffset: {
      type: string;
      value: number;
    };
    dashJustified: boolean;
    dashGapPickable: boolean;
  };
  static extensionName: string;
  constructor({dash, offset, highPrecisionDash}?: Partial<PathStyleExtensionOptions>);
  isEnabled(layer: Layer<PathStyleExtensionProps>): boolean;
  getShaders(this: Layer<PathStyleExtensionProps>, extension: this): any;
  initializeState(
    this: Layer<PathStyleExtensionProps>,
    context: LayerContext,
    extension: this
  ): void;
  updateState(
    this: Layer<PathStyleExtensionProps>,
    params: UpdateParameters<Layer<PathStyleExtensionProps>>,
    extension: this
  ): void;
  getDashOffsets(this: Layer<PathStyleExtensionProps>, path: number[] | number[][]): number[];
}
export {};
// # sourceMappingURL=path-style.d.ts.map
