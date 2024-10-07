// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Attribution: This class and the multipass system were inspired by
// the THREE.js EffectComposer and *Pass classes

import type {Device, Framebuffer} from '@luma.gl/core';
import {ClipSpace} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';
import Pass from './pass';
import {ScreenProps, screenUniforms} from './screen-pass-uniforms';

type ScreenPassProps = {
  module: ShaderModule;
  fs: string;
  id: string;
};

type ScreenPassRenderOptions = {
  clearCanvas?: boolean;
  inputBuffer: Framebuffer;
  outputBuffer: Framebuffer | null;
  moduleProps: ShaderModule['props'];
};

/** A base render pass. */
export default class ScreenPass extends Pass {
  model: ClipSpace;

  constructor(device: Device, props: ScreenPassProps) {
    super(device, props);
    const {module, fs, id} = props;
    const parameters = {depthWriteEnabled: false, depthCompare: 'always' as const};
    this.model = new ClipSpace(device, {id, fs, modules: [module, screenUniforms], parameters});
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
    const {clearCanvas, inputBuffer, outputBuffer} = options;
    const texSize: [number, number] = [inputBuffer.width, inputBuffer.height];
    const screenProps: ScreenProps = {
      texSrc: inputBuffer.colorAttachments[0],
      texSize
    };
    this.model.shaderInputs.setProps({
      screen: screenProps,
      ...options.moduleProps
    });
    const renderPass = this.device.beginRenderPass({
      framebuffer: outputBuffer,
      parameters: {viewport: [0, 0, ...texSize]},
      clearColor: clearCanvas ? [0, 0, 0, 0] : false,
      clearDepth: 1
    });

    this.model.draw(renderPass);
    renderPass.end();
  }
}
