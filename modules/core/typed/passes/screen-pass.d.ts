import type {Device} from '@luma.gl/api';
import type {Framebuffer} from '@luma.gl/webgl-legacy';
import {ClipSpace} from '@luma.gl/webgl-legacy';
import Pass from './pass';
import type {ShaderModule} from '../types/types';
declare type ScreenPassProps = {
  module: ShaderModule;
  fs?: string;
  id: string;
  moduleSettings: any;
};
declare type ScreenPassRenderOptions = {
  inputBuffer: Framebuffer;
  outputBuffer: Framebuffer;
};
/** A base render pass. */
export default class ScreenPass extends Pass {
  model: ClipSpace;
  constructor(device: Device, props: ScreenPassProps);
  render(params: ScreenPassRenderOptions): void;
  delete(): void;
  /**
   * Renders the pass.
   * This is an abstract method that should be overridden.
   * @param inputBuffer - Frame buffer that contains the result of the previous pass
   * @param outputBuffer - Frame buffer that serves as the output render target
   */
  protected _renderPass(device: Device, options: ScreenPassRenderOptions): void;
}
export {};
// # sourceMappingURL=screen-pass.d.ts.map
