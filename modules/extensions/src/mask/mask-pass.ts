// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {
  Device,
  Framebuffer,
  Parameters,
  RenderPipelineParameters,
  Texture
} from '@luma.gl/core';
import {Layer, _LayersPass as LayersPass, LayersPassRenderOptions, Viewport} from '@deck.gl/core';

import {MaskedColorClear} from '../utils/masked-color-clear';

type MaskPassRenderOptions = LayersPassRenderOptions & {
  /** The channel to render into, 0:red, 1:green, 2:blue, 3:alpha */
  channel: 0 | 1 | 2 | 3;
};

const MASK_BLENDING: RenderPipelineParameters = {
  blendColorOperation: 'subtract',
  blendColorSrcFactor: 'zero',
  blendColorDstFactor: 'one',
  blendAlphaOperation: 'subtract',
  blendAlphaSrcFactor: 'zero',
  blendAlphaDstFactor: 'one'
};

export default class MaskPass extends LayersPass {
  maskMap: Texture;
  fbo: Framebuffer;
  private channelClear?: MaskedColorClear;

  constructor(device: Device, props: {id: string; mapSize?: number}) {
    super(device, props);

    const {mapSize = 2048} = props;

    this.maskMap = device.createTexture({
      format: 'rgba8unorm',
      width: mapSize,
      height: mapSize,
      sampler: {
        minFilter: 'linear',
        magFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge'
      }
    });

    this.fbo = device.createFramebuffer({
      id: 'maskmap',
      width: mapSize,
      height: mapSize,
      colorAttachments: [this.maskMap],
      // WebGPU mask pipelines include a depth attachment even though they do not depth-test.
      ...(device.type === 'webgpu' ? {depthStencilAttachment: 'depth24plus' as const} : {})
    });
  }

  render(options: MaskPassRenderOptions) {
    const colorMask = 2 ** options.channel;
    if (this.device.type === 'webgpu') {
      this.clearChannel(colorMask);
      super.render({
        ...options,
        clearCanvas: false,
        clearColor: undefined,
        colorMask,
        target: this.fbo,
        pass: 'mask'
      });
      return;
    }
    const clearColor = [255, 255, 255, 255];
    super.render({...options, clearColor, colorMask, target: this.fbo, pass: 'mask'});
  }

  /** Attachment clears affect every channel; use a draw to reset only the selected channel. */
  private clearChannel(colorMask: number): void {
    const channelClear = (this.channelClear ??= new MaskedColorClear(this.device, [1, 1, 1, 1]));
    const pass = this.device.beginRenderPass({
      framebuffer: this.fbo,
      clearColor: false,
      clearDepth: false,
      clearStencil: false
    });
    try {
      channelClear.draw(pass, colorMask);
    } finally {
      pass.end();
    }
    this.device.submit();
  }

  protected getLayerParameters(
    layer: Layer<{}>,
    layerIndex: number,
    viewport: Viewport
  ): Parameters {
    return {
      ...layer.props.parameters,
      blend: true,
      depthCompare: 'always',
      ...MASK_BLENDING
    };
  }

  shouldDrawLayer(layer) {
    return layer.props.operation.includes('mask');
  }

  delete() {
    this.channelClear?.destroy();
    this.fbo.delete();
    this.maskMap.delete();
  }
}
