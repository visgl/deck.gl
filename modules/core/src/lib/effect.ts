import type Layer from './layer';
import type {LayersPassRenderOptions} from '../passes/layers-pass';
import type {Device} from '@luma.gl/api';
import type {Framebuffer} from '@luma.gl/webgl-legacy';

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

  preRender: (device: Device, opts: PreRenderOptions) => void;
  postRender?: (device: Device, opts: PostRenderOptions) => Framebuffer;
  getModuleParameters?: (layer: Layer) => any;

  setProps?: (props: any) => void;
  cleanup(): void;
}
