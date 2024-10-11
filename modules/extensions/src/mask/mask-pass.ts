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
      colorAttachments: [this.maskMap]
    });
  }

  render(options: MaskPassRenderOptions) {
    const colorMask = 2 ** options.channel;
    const clearColor = [255, 255, 255, 255];
    super.render({...options, clearColor, colorMask, target: this.fbo, pass: 'mask'});
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
    this.fbo.delete();
    this.maskMap.delete();
  }
}
