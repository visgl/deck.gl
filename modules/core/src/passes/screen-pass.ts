// Attribution: This class and the multipass system were inspired by
// the THREE.js EffectComposer and *Pass classes

import type {Device} from '@luma.gl/api';
import type {Framebuffer} from '@luma.gl/core';
import {ClipSpace, setParameters, withParameters, clear} from '@luma.gl/core';
import Pass from './pass';

import type {ShaderModule} from '../types/types';

type ScreenPassProps = {
  module: ShaderModule;
  fs?: string;
  id: string;
  moduleSettings: any;
};

type ScreenPassRenderOptions = {
  inputBuffer: Framebuffer;
  outputBuffer: Framebuffer;
};

/** A base render pass. */
export default class ScreenPass extends Pass {
  model: ClipSpace;

  constructor(device: Device, props: ScreenPassProps) {
    super(device, props);
    const {module, fs, id} = props;
    // @ts-expect-error
    const gl = device.gl as WebGLRenderingContext;
    this.model = new ClipSpace(gl, {id, fs, modules: [module]});
  }

  render(params: ScreenPassRenderOptions): void {
    // @ts-expect-error
    const gl = this.device.gl as WebGLRenderingContext;

    setParameters(this.device, {viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]});

    // TODO change to device when luma.gl is fixed
    withParameters(gl, {framebuffer: params.outputBuffer, clearColor: [0, 0, 0, 0]}, () =>
      this._renderPass(this.device, params)
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
    this.model.draw({
      moduleSettings: this.props.moduleSettings,
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
