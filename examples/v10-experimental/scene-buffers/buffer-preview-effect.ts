// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import type {Effect, EffectContext, PostRenderOptions, PreRenderOptions} from '@deck.gl/core';
import type {Framebuffer} from '@luma.gl/core';
import {
  createBloomCompositeShaderPass,
  createOutlineCompositeShaderPass,
  selectionOutline,
  toneMapping
} from '@luma.gl/effects';
import {ShaderPassEffect, type SceneBufferEffect} from '@deck.gl-community/gpu-layers';
import type {ShaderPass} from '@luma.gl/shadertools';

export type BufferPreviewMode = 'scene' | 'normals' | 'depth' | 'selection' | 'previous';
/** Example-owned final composite. The fixture explicitly includes all its scene layers in capture. */
export class BufferPreviewEffect implements Effect {
  readonly id = 'buffer-preview';
  readonly props = {};
  readonly useInPicking = false;
  mode: BufferPreviewMode = 'scene';
  bloom = true;
  edges = false;
  selection = true;
  strength = 0.5;
  private renderer?: ShaderPassEffect;
  private debugRenderer?: ShaderPassEffect;
  constructor(readonly capture: SceneBufferEffect) {}
  setup(context: EffectContext): void {
    this.renderer = new ShaderPassEffect({
      id: this.id,
      colorFormat: 'rgba16float',
      flipY: true,
      shaderPasses: [
        createBloomCompositeShaderPass({
          quality: 'medium',
          radius: 6,
          threshold: 1.1,
          intensity: 0.5,
          downsample: 'render'
        }),
        createOutlineCompositeShaderPass({normalSource: 'normal-texture'}),
        selectionOutline,
        toneMapping
      ]
    });
    this.debugRenderer = new ShaderPassEffect({
      id: this.id,
      colorFormat: 'rgba16float',
      flipY: true,
      shaderPasses: [bufferPreview]
    });
    this.renderer.setup(context);
    this.debugRenderer.setup(context);
  }
  preRender(_options: PreRenderOptions): void {}
  postRender(options: PostRenderOptions): Framebuffer {
    const frame = this.capture.getFrame('main');
    if (!frame || !this.renderer || !this.debugRenderer) return options.inputBuffer;
    const buffer = this.mode === 'previous' ? frame.previousBuffer || frame.buffer : frame.buffer;
    const sourceTexture = buffer.colorTexture;
    const renderer =
      this.mode === 'scene' || this.mode === 'previous' ? this.renderer : this.debugRenderer;
    return renderer.render(options, {
      sourceTexture,
      bindings: {
        depthTexture: buffer.depthTexture,
        normalTexture: buffer.normalRoughnessTexture,
        selectionTexture: buffer.getExtraColorTexture('selection')
      },
      uniforms: {
        bloomComposite: {intensity: this.bloom ? this.strength : 0},
        screenSpaceOutline: {
          color: [0.02, 0.04, 0.08, this.edges ? 0.8 : 0],
          thickness: 1.4,
          depthThreshold: 0.003,
          normalThreshold: 0.18
        },
        selectionOutline: {thickness: this.selection ? 2 : 0},
        toneMapping: {exposure: 1.25},
        bufferPreview: {mode: this.mode === 'normals' ? 1 : this.mode === 'depth' ? 2 : 3}
      }
    });
  }
  cleanup(): void {
    this.renderer?.cleanup();
    this.debugRenderer?.cleanup();
    this.renderer = undefined;
    this.debugRenderer = undefined;
  }
}
const bufferPreview = {
  name: 'bufferPreview',
  source: /* wgsl */ `
struct bufferPreviewUniforms { mode: i32, };
@group(0) @binding(auto) var<uniform> bufferPreview: bufferPreviewUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var selectionTexture: texture_2d<f32>;
fn bufferPreview_sampleColor(sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler,
  sourceSize: vec2<f32>, texCoord: vec2<f32>) -> vec4<f32> {
  let dimensions = vec2<i32>(textureDimensions(depthTexture));
  let coordinate = clamp(vec2<i32>(texCoord * vec2<f32>(dimensions)), vec2<i32>(0), dimensions - vec2<i32>(1));
  let depth = textureLoad(depthTexture, coordinate, 0);
  if (bufferPreview.mode == 1) {
    if (depth >= 1.0) { return vec4<f32>(0.02, 0.04, 0.06, 1.0); }
    return vec4<f32>(textureLoad(normalTexture, coordinate, 0).rgb, 1.0);
  }
  if (bufferPreview.mode == 2) { return vec4<f32>(vec3<f32>(1.0 - pow(depth, 30.0)), 1.0); }
  return vec4<f32>(vec3<f32>(textureLoad(selectionTexture, coordinate, 0).r), 1.0);
}
`,
  bindingLayout: [
    {name: 'depthTexture', group: 0},
    {name: 'normalTexture', group: 0},
    {name: 'selectionTexture', group: 0}
  ],
  uniformTypes: {mode: 'i32'},
  defaultUniforms: {mode: 1},
  passes: [{sampler: true}]
} as const satisfies ShaderPass;
