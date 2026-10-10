// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Effect, EffectContext, PostRenderOptions, PreRenderOptions} from '@deck.gl/core';
import type {Device, Framebuffer, Texture} from '@luma.gl/core';
import {
  BackgroundTextureModel,
  ShaderPassRenderer,
  type ShaderPassRendererProps,
  type ShaderPassRendererRenderOptions
} from '@luma.gl/engine';

export type ShaderPassEffectRenderOptions = Omit<
  ShaderPassRendererRenderOptions,
  'sourceTexture'
> & {
  /** Borrowed, ready GPU texture; the effect never destroys its inputs. */
  sourceTexture: Texture;
};
export type ShaderPassEffectProps = ShaderPassRendererProps & {
  id?: string;
  /** Defaults to Deck's color input. Return null to leave that frame unchanged. */
  getRenderOptions?: (options: PostRenderOptions) => ShaderPassEffectRenderOptions | null;
};

/** Runs luma.gl shader-pass graphs in Deck's postprocessing chain. */
export class ShaderPassEffect implements Effect {
  readonly id: string;
  readonly props: ShaderPassEffectProps;
  readonly useInPicking = false;
  private device?: Device;
  private renderer?: ShaderPassRenderer;
  private presenter?: BackgroundTextureModel;
  private width = 0;
  private height = 0;

  constructor(props: ShaderPassEffectProps) {
    this.id = props.id ?? 'luma-shader-passes';
    this.props = {...props};
  }

  setup({device}: Pick<EffectContext, 'device'>): void {
    this.device = device;
    this.renderer = new ShaderPassRenderer(device, this.props);
  }

  preRender(_options: PreRenderOptions): void {}

  postRender(options: PostRenderOptions): Framebuffer {
    const inputs = this.props.getRenderOptions
      ? this.props.getRenderOptions(options)
      : {sourceTexture: options.inputBuffer.colorAttachments[0].texture};
    return inputs ? this.render(options, inputs) : options.inputBuffer;
  }

  /** Also usable by an effect that manages its own camera or history inputs. */
  render(options: PostRenderOptions, inputs: ShaderPassEffectRenderOptions): Framebuffer {
    if (!this.device || !this.renderer) return options.inputBuffer;
    const {width, height} = inputs.sourceTexture;
    if (width !== this.width || height !== this.height) {
      this.renderer.resize([width, height]);
      this.renderer.resetHistory();
      this.width = width;
      this.height = height;
    }
    const output = this.renderer.renderToTexture(inputs);
    if (!output) return options.inputBuffer;
    this.presenter ??= new BackgroundTextureModel(this.device, {
      id: `${this.id}-presenter`,
      backgroundTexture: output,
      flipY: this.props.flipY ?? this.device.type === 'webgpu'
    });
    this.presenter.setProps({backgroundTexture: output});
    const lastEffect = options.effects?.filter(effect => effect.postRender).at(-1);
    const target =
      options.target ??
      (!lastEffect || lastEffect.id === this.id
        ? (options.canvasContext || this.device.getCanvasContext()).getCurrentFramebuffer()
        : options.swapBuffer);
    const commandEncoder = this.device.commandEncoder;
    this.presenter.predraw(commandEncoder);
    const pass = commandEncoder.beginRenderPass({
      id: `${this.id}-present`,
      framebuffer: target,
      clearColor: false,
      clearDepth: false,
      parameters: {viewport: [0, 0, target.width, target.height]}
    });
    this.presenter.draw(pass);
    pass.end();
    // The pinned Deck layer pass submits before postRender; present this effect in the same frame.
    this.device.submit();
    return target;
  }

  setShaderPasses(shaderPasses: ShaderPassRendererProps['shaderPasses']): void {
    this.props.shaderPasses = shaderPasses;
    this.renderer?.destroy();
    this.presenter?.destroy();
    this.presenter = undefined;
    this.width = this.height = 0;
    this.renderer = this.device ? new ShaderPassRenderer(this.device, this.props) : undefined;
  }

  resetHistory(): void {
    this.renderer?.resetHistory();
  }

  cleanup(): void {
    this.renderer?.destroy();
    this.presenter?.destroy();
    this.renderer = undefined;
    this.presenter = undefined;
    this.device = undefined;
    this.width = this.height = 0;
  }
}
