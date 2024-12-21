import type {Device} from '@luma.gl/api';
import {Framebuffer, Texture2D, Renderbuffer} from '@luma.gl/webgl-legacy';
import {default as LayersPass} from './layers-pass';
export default class ShadowPass extends LayersPass {
  shadowMap: Texture2D;
  depthBuffer: Renderbuffer;
  fbo: Framebuffer;
  constructor(
    device: Device,
    props?: {
      id: any;
    }
  );
  render(params: any): void;
  shouldDrawLayer(layer: any): boolean;
  getModuleParameters(): {
    drawToShadowMap: boolean;
  };
  delete(): void;
}
// # sourceMappingURL=shadow-pass.d.ts.map
