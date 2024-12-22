import type {Device} from '@luma.gl/api';
import {Texture2D} from '@luma.gl/webgl-legacy';
import type {Effect, PreRenderOptions} from '../../lib/effect';
import type {MaskBounds} from './utils';
import type {CoordinateSystem} from '../../lib/constants';
declare type Mask = {
  /** The channel index */
  index: number;
  bounds: MaskBounds;
  coordinateOrigin: [number, number, number];
  coordinateSystem: CoordinateSystem;
};
export default class MaskEffect implements Effect {
  id: string;
  props: any;
  useInPicking: boolean;
  private dummyMaskMap?;
  private channels;
  private masks;
  private maskPass?;
  private maskMap?;
  private lastViewport?;
  preRender(
    device: Device,
    {layers, layerFilter, viewports, onViewportActive, views}: PreRenderOptions
  ): void;
  private _renderChannel;
  /**
   * Find a channel to render each mask into
   * If a maskId already exists, diff and update the existing channel
   * Otherwise replace a removed mask
   * Otherwise create a new channel
   * Returns a map from mask layer id to channel info
   */
  private _sortMaskChannels;
  getModuleParameters(): {
    maskMap: Texture2D;
    maskChannels: Record<string, Mask> | null;
  };
  cleanup(): void;
}
export {};
// # sourceMappingURL=mask-effect.d.ts.map
