import {LayerExtension} from '@deck.gl/core';
import type {Layer} from '@deck.gl/core';
export declare type MaskExtensionProps = {
  /**
   * Id of the layer that defines the mask. The mask layer must use the prop `operation: 'mask'`.
   * Masking is disabled if `maskId` is empty or no valid mask layer with the specified id is found.
   */
  maskId?: string;
  /**
   * controls whether an object is clipped by its anchor (usually defined by an accessor called `getPosition`, e.g. icon, scatterplot) or by its geometry (e.g. path, polygon).
   * If not specified, it is automatically deduced from the layer.
   */
  maskByInstance?: boolean;
};
/** Allows layers to show/hide objects by a geofence. */
export default class MaskExtension extends LayerExtension {
  static defaultProps: {
    maskId: string;
    maskByInstance: any;
  };
  static extensionName: string;
  getShaders(this: Layer<MaskExtensionProps>): any;
  draw(this: Layer<MaskExtensionProps>, {uniforms, context, moduleParameters}: any): void;
}
// # sourceMappingURL=mask.d.ts.map
