import type {Device} from '@luma.gl/api';
import {Framebuffer, Texture2D} from '@luma.gl/webgl-legacy';
import LayersPass from './layers-pass';
import type {LayersPassRenderOptions} from './layers-pass';
declare type MaskPassRenderOptions = LayersPassRenderOptions & {
  /** The channel to render into, 0:red, 1:green, 2:blue, 3:alpha */
  channel: number;
};
export default class MaskPass extends LayersPass {
  maskMap: Texture2D;
  fbo: Framebuffer;
  constructor(
    device: Device,
    props: {
      id: string;
      mapSize?: number;
    }
  );
  render(options: MaskPassRenderOptions): any;
  shouldDrawLayer(layer: any): boolean;
  delete(): void;
}
export {};
// # sourceMappingURL=mask-pass.d.ts.map
