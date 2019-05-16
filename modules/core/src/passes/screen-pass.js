//
// A base render pass.
//
// Attribution: This class and the multipass system were inspired by
// the THREE.js EffectComposer and *Pass classes

import {Framebuffer, withParameters} from '@luma.gl/core';
import Pass from './pass';

export default class ScreenPass extends Pass {
  render(params) {
    const gl = this.gl;

    const {outputBuffer = Framebuffer.getDefaultFramebuffer(gl)} = params;

    withParameters(gl, {framebuffer: outputBuffer}, () => this._renderPass(gl, params));
  }

  /**
   * Renders the pass.
   * This is an abstract method that should be overridden.
   * @param {Framebuffer} inputBuffer - Frame buffer that contains the result of the previous pass
   * @param {Framebuffer} outputBuffer - Frame buffer that serves as the output render target
   */
  _renderPass(gl, {inputBuffer, outputBuffer}) {
    this.props.model.draw({
      uniforms: {
        texture: inputBuffer,
        texSize: [inputBuffer.width, inputBuffer.height]
      },
      parameters: {
        depthWrite: false,
        depthTest: false
      }
    });
  }
}
