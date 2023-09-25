// Attribution: This class and the multipass system were inspired by
// the THREE.js EffectComposer and *Pass classes

import type {Device} from '@luma.gl/core';
import type {Framebuffer} from '@luma.gl/core';
import {ClipSpace} from '@luma.gl/engine';
import {setGLParameters, withGLParameters, clear} from '@luma.gl/webgl';
import Pass from './pass';

import type {ShaderModule} from '../types/types';

type ScreenPassProps = {
  module: ShaderModule;
  fs?: string;
  id: string;
};

type ScreenPassRenderOptions = {
  inputBuffer: Framebuffer;
  outputBuffer: Framebuffer;
  moduleSettings: any;
};

/** A base render pass. */
export default class ScreenPass extends Pass {
  model: ClipSpace;

  constructor(device: Device, props: ScreenPassProps) {
    super(device, props);
    const {module, fs, id} = props;
    // @ts-expect-error ClipSpace prototype
    this.model = new ClipSpace(device, {id, fs, modules: [module]});
  }

  render(params: ScreenPassRenderOptions): void {
    const [drawingBufferWidth, drawingBufferHeight] =
      this.device.canvasContext.getDrawingBufferSize();
    setGLParameters(this.device, {viewport: [0, 0, drawingBufferWidth, drawingBufferHeight]});

    // TODO change to device when luma.gl is fixed
    withGLParameters(
      this.device,
      {framebuffer: params.outputBuffer, clearColor: [0, 0, 0, 0]},
      () => this._renderPass(this.device, params)
    );
  }

  delete() {
    this.model.destroy();
    this.model = null!;
  }

  // Private methods

  /**
   * Renders the pass.
   * This is an abstract method that should be overridden.
   * @param inputBuffer - Frame buffer that contains the result of the previous pass
   * @param outputBuffer - Frame buffer that serves as the output render target
   */
  protected _renderPass(device: Device, options: ScreenPassRenderOptions) {
    const {inputBuffer} = options;
    clear(this.device, {color: true});
    this.model.setShaderModuleProps(options.moduleSettings);
    this.model.setBindings({
      texture: inputBuffer.colorAttachments[0]
    });
    this.model.setUniforms({
      texSize: [inputBuffer.width, inputBuffer.height]
    });
    this.model.setParameters({
      depthWriteEnabled: false,
      // depthWrite: false,
      depthCompare: 'always'
    });
    this.model.draw(this.device.getDefaultRenderPass());
  }
}
