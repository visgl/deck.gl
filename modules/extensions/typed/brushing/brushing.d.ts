import {LayerExtension} from '@deck.gl/core';
import type {Layer, LayerContext, Accessor} from '@deck.gl/core';
export declare type BrushingExtensionProps<DataT = any> = {
  /**
   * Called to retrieve an arbitrary position for each object that it will be filtered by.
   * Only effective if `brushingTarget` is set to `custom`.
   */
  getBrushingTarget?: Accessor<DataT, [number, number]>;
  /**
   * Enable/disable brushing. If brushing is disabled, all objects are rendered.
   * @default true
   */
  brushingEnabled?: boolean;
  /**
   * The position used to filter each object by.
   */
  brushingTarget?: 'source' | 'target' | 'source_target' | 'custom';
  /** The brushing radius centered at the pointer, in meters. If a data object is within this circle, it is rendered; otherwise it is hidden.
   * @default 10000
   */
  brushingRadius?: number;
};
/** Adds GPU-based data brushing functionalities to layers. It allows the layer to show/hide objects based on the current pointer position. */
export default class BrushingExtension extends LayerExtension {
  static defaultProps: {
    getBrushingTarget: {
      type: string;
      value: number[];
    };
    brushingTarget: string;
    brushingEnabled: boolean;
    brushingRadius: number;
  };
  static extensionName: string;
  getShaders(): any;
  initializeState(
    this: Layer<BrushingExtensionProps>,
    context: LayerContext,
    extension: this
  ): void;
  finalizeState(this: Layer<BrushingExtensionProps>, context: LayerContext, extension: this): void;
  useConstantTargetPositions(attribute: any): void;
}
// # sourceMappingURL=brushing.d.ts.map
