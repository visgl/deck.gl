import type Layer from './layer';
import type {LayersPassRenderOptions} from '../passes/layers-pass';
import type {Framebuffer} from '@luma.gl/webgl';

export type PreRenderOptions = LayersPassRenderOptions;
export type PostRenderOptions = LayersPassRenderOptions & {
  inputBuffer: Framebuffer;
  swapBuffer: Framebuffer;
};

export interface Effect {
  id: string;
  props: any;
  useInPicking?: boolean;
  order?: number;

  preRender: (gl: WebGLRenderingContext, opts: PreRenderOptions) => unknown;
  postRender?: (gl: WebGLRenderingContext, opts: PostRenderOptions) => Framebuffer;
  getModuleParameters?: (layer: Layer) => any;

  setProps?: (props: any) => void;
  cleanup(): void;
}
