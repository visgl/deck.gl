import type Layer from './layer';
import type {LayersPassRenderOptions} from '../passes/layers-pass';
import type {Device} from '@luma.gl/api';
import type {Framebuffer} from '@luma.gl/webgl-legacy';
export declare type PreRenderOptions = LayersPassRenderOptions;
export declare type PostRenderOptions = LayersPassRenderOptions & {
  inputBuffer: Framebuffer;
  swapBuffer: Framebuffer;
};
export interface Effect {
  id: string;
  props: any;
  useInPicking?: boolean;
  preRender: (device: Device, opts: PreRenderOptions) => void;
  postRender?: (device: Device, opts: PostRenderOptions) => Framebuffer;
  getModuleParameters?: (layer: Layer) => any;
  cleanup(): void;
}
// # sourceMappingURL=effect.d.ts.map
