//
// A base render pass.
//
// Attribution: This class and the multipass system were inspired by
// the THREE.js EffectComposer and *Pass classes

import type {Framebuffer} from '@luma.gl/core';
import {ClipSpace, setParameters, withParameters, clear} from '@luma.gl/core';
import Pass from './pass';

import type {ShaderModule} from '../types/types';

type ScreenPassProps = {
  module: ShaderModule;
  fs: string | null;
  id: string;
};

type ScreenPassRenderOptions = {
  inputBuffer: Framebuffer;
  outputBuffer: Framebuffer;
  moduleSettings: any;
};

export default class ScreenPass extends Pass {
  model: ClipSpace;

  constructor(gl: WebGLRenderingContext, props: ScreenPassProps) {
    super(gl, props);
    const {module, fs, id} = props;
    this.model = new ClipSpace(gl, {id, fs, modules: [module]});
  }

  render(params: ScreenPassRenderOptions): void {
    const gl = this.gl;

    setParameters(gl, {viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]});

    withParameters(gl, {framebuffer: params.outputBuffer, clearColor: [0, 0, 0, 0]}, () =>
      this._renderPass(gl, params)
    );
  }

  delete() {
    this.model.delete();
    this.model = null;
  }

  // Private methods

  /**
   * Renders the pass.
   * This is an abstract method that should be overridden.
   * @param inputBuffer - Frame buffer that contains the result of the previous pass
   * @param outputBuffer - Frame buffer that serves as the output render target
   */
  protected _renderPass(gl: WebGLRenderingContext, options: ScreenPassRenderOptions) {
    const {inputBuffer} = options;
    clear(gl, {color: true});
    this.model.draw({
      moduleSettings: options.moduleSettings,
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
