// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_LayersPass} from '@deck.gl/core';
import type {
  Effect,
  EffectContext,
  Layer,
  PostRenderOptions,
  PreRenderOptions
} from '@deck.gl/core';
import type {Device, Framebuffer} from '@luma.gl/core';
import {ClipSpace} from '@luma.gl/engine';
import PointCloudLayer from './point-cloud-layer';

const ACCUMULATION_FORMAT = 'rgba16float';

const RESOLVE_SHADER = `\
#version 300 es
precision highp float;

uniform sampler2D sceneTexture;
uniform sampler2D splatTexture;
in vec2 coordinate;
out vec4 fragColor;

void main() {
  vec4 scene = texture(sceneTexture, coordinate);
  vec4 sum = texture(splatTexture, coordinate);
  float coverage = smoothstep(0.0, 0.05, sum.a);
  vec3 color = sum.rgb / max(sum.a, 0.00001);
  fragColor = vec4(color * coverage, coverage) + scene * (1.0 - coverage);
}
`;

function isWeightedPointCloud(layer: Layer): boolean {
  return layer instanceof PointCloudLayer && Boolean(layer.props._weightedSplatting);
}

class SplatPass extends _LayersPass {
  constructor(
    device: Device,
    private readonly accumulate: boolean
  ) {
    super(device);
  }

  shouldDrawLayer(layer: Layer): boolean {
    return isWeightedPointCloud(layer);
  }

  protected getLayerParameters(layer: Layer) {
    return {
      ...layer.props.parameters,
      depthCompare: 'less-equal' as const,
      depthWriteEnabled: !this.accumulate,
      blend: this.accumulate,
      blendColorSrcFactor: 'one' as const,
      blendColorDstFactor: 'one' as const,
      blendAlphaSrcFactor: 'one' as const,
      blendAlphaDstFactor: 'one' as const,
      blendColorOperation: 'add' as const,
      blendAlphaOperation: 'add' as const
    };
  }
}

/** Experimental weighted circular splats for a single WebGL viewport. */
export class _PointCloudSplatEffect implements Effect {
  readonly id = 'point-cloud-splat';
  readonly props = {};
  postRender?: (opts: PostRenderOptions) => Framebuffer | null;

  private framebuffer?: Framebuffer;
  private resolvePass?: (opts: PostRenderOptions) => Framebuffer | null;
  private depthPass?: SplatPass;
  private accumulationPass?: SplatPass;
  private resolveModel?: ClipSpace;
  private active = false;

  setup({device}: EffectContext): void {
    if (device.type !== 'webgl' || !device.isTextureFormatRenderable(ACCUMULATION_FORMAT)) {
      return;
    }

    this.framebuffer = device.createFramebuffer({
      colorAttachments: [ACCUMULATION_FORMAT],
      depthStencilAttachment: 'depth24plus'
    });
    this.depthPass = new SplatPass(device, false);
    this.accumulationPass = new SplatPass(device, true);
    this.resolveModel = new ClipSpace(device, {
      fs: RESOLVE_SHADER,
      parameters: {depthWriteEnabled: false, depthCompare: 'always', blend: false}
    });
    this.resolvePass = opts => this.resolve(device, opts);
  }

  preRender(opts: PreRenderOptions): void {
    const framebuffer = this.framebuffer;
    if (!framebuffer) return;

    this.active =
      opts.pass === 'screen' &&
      opts.viewports.length === 1 &&
      opts.clearCanvas !== false &&
      opts.layers.some(isWeightedPointCloud);
    this.postRender = this.active ? this.resolvePass : undefined;
    if (!this.active) return;

    const canvasContext = opts.canvasContext ?? this.depthPass!.device.canvasContext!;
    framebuffer.resize(canvasContext.getDrawingBufferSize());
    const clearPass = this.depthPass!.device.beginRenderPass({
      framebuffer,
      clearColor: [0, 0, 0, 0],
      clearDepth: 1,
      clearStencil: false
    });
    clearPass.end();

    const passOptions = {
      ...opts,
      target: framebuffer,
      views: undefined,
      onLayerEligible: undefined,
      clearCanvas: false,
      clearColor: undefined
    };
    this.depthPass!.render({
      ...passOptions,
      colorMask: 0,
      shaderModuleProps: {...opts.shaderModuleProps, pointCloud: {splatPass: 1}}
    });
    this.accumulationPass!.render({
      ...passOptions,
      shaderModuleProps: {...opts.shaderModuleProps, pointCloud: {splatPass: 2}}
    });
  }

  getShaderModuleProps(layer: Layer): Record<string, unknown> | undefined {
    if (this.active && isWeightedPointCloud(layer)) {
      return {pointCloud: {splatPass: 3}};
    }
    return undefined;
  }

  cleanup(): void {
    this.framebuffer?.destroy();
    this.resolveModel?.destroy();
    this.framebuffer = undefined;
    this.depthPass = undefined;
    this.accumulationPass = undefined;
    this.resolveModel = undefined;
    this.resolvePass = undefined;
    this.postRender = undefined;
    this.active = false;
  }

  private resolve(device: Device, opts: PostRenderOptions): Framebuffer | null {
    const output = opts.target === undefined ? opts.swapBuffer : opts.target;
    const resolveModel = this.resolveModel!;
    resolveModel.setBindings({
      sceneTexture: opts.inputBuffer.colorAttachments[0],
      splatTexture: this.framebuffer!.colorAttachments[0]
    });
    const pass = device.beginRenderPass({
      framebuffer: output,
      parameters: {viewport: [0, 0, opts.inputBuffer.width, opts.inputBuffer.height]},
      clearColor: opts.clearCanvas === false ? false : [0, 0, 0, 0],
      clearDepth: false
    });
    resolveModel.draw(pass);
    pass.end();
    device.submit();
    return output;
  }
}
