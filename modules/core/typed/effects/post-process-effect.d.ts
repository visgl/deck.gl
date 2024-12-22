import type {Device} from '@luma.gl/api';
import type {Framebuffer} from '@luma.gl/webgl-legacy';
import ScreenPass from '../passes/screen-pass';
import type {Effect, PostRenderOptions} from '../lib/effect';
import type {ShaderModule} from '../types/types';
export default class PostProcessEffect implements Effect {
  id: string;
  props: any;
  module: ShaderModule;
  passes?: ScreenPass[];
  constructor(module: ShaderModule, props?: any);
  preRender(): void;
  postRender(device: Device, params: PostRenderOptions): Framebuffer;
  cleanup(): void;
}
// # sourceMappingURL=post-process-effect.d.ts.map
