import type Layer from './layer';
import type {LayersPassRenderOptions} from '../passes/layers-pass';
import type {Framebuffer} from '@luma.gl/webgl';

export type PreRenderOptions = LayersPassRenderOptions & {
  preRenderStats: Record<string, any>;
};
export type PostRenderOptions = LayersPassRenderOptions & {
  inputBuffer: Framebuffer;
  swapBuffer: Framebuffer;
};

export interface Effect {
  id: string;
  props: any;
  useInPicking?: boolean;

  preRender: (gl: WebGLRenderingContext, opts: PreRenderOptions) => any;
  postRender?: (gl: WebGLRenderingContext, opts: PostRenderOptions) => Framebuffer;
  getModuleParameters?: (layer: Layer) => any;

  setProps?: (props: any) => void;
  cleanup(): void;
}
