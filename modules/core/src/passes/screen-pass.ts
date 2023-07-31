// Attribution: This class and the multipass system were inspired by
// the THREE.js EffectComposer and *Pass classes

import type {Device} from '@luma.gl/api';
import type {Framebuffer} from '@luma.gl/webgl-legacy';
import {ClipSpace, setParameters, withParameters, clear} from '@luma.gl/webgl-legacy';
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
    this.model = new ClipSpace(device, {id, fs, modules: [module]});
  }

  render(params: ScreenPassRenderOptions): void {
    const [drawingBufferWidth, drawingBufferHeight] =
      this.device.canvasContext.getDrawingBufferSize();
    setParameters(this.device, {viewport: [0, 0, drawingBufferWidth, drawingBufferHeight]});

    // TODO change to device when luma.gl is fixed
    withParameters(this.device, {framebuffer: params.outputBuffer, clearColor: [0, 0, 0, 0]}, () =>
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
