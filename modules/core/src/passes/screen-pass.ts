// Attribution: This class and the multipass system were inspired by
// the THREE.js EffectComposer and *Pass classes

import type {Device, Framebuffer} from '@luma.gl/core';
import {ClipSpace} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';
import {setGLParameters, withGLParameters, clear} from '@luma.gl/webgl';
import Pass from './pass';

type ScreenPassProps = {
  module: ShaderModule;
  fs: string;
  id: string;
};

type ScreenPassRenderOptions = {
  inputBuffer: Framebuffer;
  outputBuffer: Framebuffer | null;
  moduleSettings: any;
};

/** A base render pass. */
export default class ScreenPass extends Pass {
  model: ClipSpace;

  constructor(device: Device, props: ScreenPassProps) {
    super(device, props);
    const {module, fs, id} = props;
    const parameters = {depthWriteEnabled: false, depthCompare: 'always' as const};
    this.model = new ClipSpace(device, {id, fs, modules: [module], parameters});
  }

  render(params: ScreenPassRenderOptions): void {
    this._renderPass(this.device, params);
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
    const {inputBuffer, outputBuffer} = options;
    const texSize = [inputBuffer.width, inputBuffer.height];
    this.model.shaderInputs.setProps(options.moduleSettings);
    this.model.setBindings({texSrc: inputBuffer.colorAttachments[0]});
    this.model.setUniforms({texSize});
    const renderPass = this.device.beginRenderPass({
      framebuffer: outputBuffer,
      parameters: {viewport: [0, 0, ...texSize]},
      clearColor: [0, 0, 0, 0],
      clearDepth: 1
    });

    this.model.draw(renderPass);
    renderPass.end();
  }
}
