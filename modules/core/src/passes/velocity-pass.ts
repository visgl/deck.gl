// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Texture} from '@luma.gl/core';
import type {Device, Framebuffer, TextureFormatDepthStencil} from '@luma.gl/core';
import {Matrix4} from '@math.gl/core';
import {ClipSpace} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shaders';
import type Viewport from '../viewports/viewport';
import type {TemporalFrame} from '../lib/temporal';
import {getReprojectionMatrix, getTemporalViewportRect} from './temporal-utils';

const velocity = {
  name: 'velocity',
  source: /* wgsl */ `
struct VelocityUniforms {
  reprojection: mat4x4<f32>,
  rect: vec4<f32>,
  jitter: vec2<f32>,
  valid: f32,
};
@group(0) @binding(auto) var<uniform> velocity: VelocityUniforms;
@group(0) @binding(auto) var sceneDepth: texture_depth_2d;
`,
  uniformTypes: {
    reprojection: 'mat4x4<f32>',
    rect: 'vec4<f32>',
    jitter: 'vec2<f32>',
    valid: 'f32'
  }
} as const satisfies ShaderModule;

const source = /* wgsl */ `
@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  let depth = textureLoad(sceneDepth, vec2<i32>(inputs.Position.xy), 0);
  if (velocity.valid == 0.0 || depth >= 1.0) {
    return vec4<f32>(0.0);
  }
  let uv = (inputs.Position.xy - velocity.rect.xy - velocity.jitter) / velocity.rect.zw;
  let clip = vec4<f32>(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, depth * 2.0 - 1.0, 1.0);
  let previous = velocity.reprojection * clip;
  if (previous.w <= 0.0) {
    return vec4<f32>(0.0);
  }
  let ndc = previous.xyz / previous.w;
  let displacement = (ndc.xy - clip.xy) * vec2<f32>(0.5, -0.5);
  // Convert viewport-relative displacement to full texture UV displacement.
  let size = vec2<f32>(textureDimensions(sceneDepth));
  // One minus the previous device depth. Most depth values are close to 1, and the half-float
  // target keeps a small number much more exactly than a number close to 1.
  let previousOneMinusDepth = (previous.w - previous.z) / (2.0 * previous.w);
  return vec4<f32>(displacement * velocity.rect.zw / size, previousOneMinusDepth, 1.0);
}
`;

type History = {matrix: Matrix4; width: number; height: number};

/**
 * WebGPU camera-motion velocity for a static scene. Animated objects and changing
 * projection coordinate systems are not tracked. WebGL returns no velocity texture.
 */
export default class VelocityPass {
  private device: Device;
  private model: ClipSpace | null = null;
  private framebuffer: Framebuffer | null = null;
  private history = new Map<string, History>();

  /** Creates resources lazily on the first supported render. */
  constructor(device: Device) {
    this.device = device;
  }

  /** Discards previous viewport transforms, e.g. after a camera cut. */
  reset(): void {
    this.history.clear();
  }

  /** Writes render-size velocity; pixels outside the viewports remain invalid. */
  render(frame: TemporalFrame, viewports: Viewport[], devicePixelRatio: number): Texture | null {
    if (
      this.device.type !== 'webgpu' ||
      !this.device.isTextureFormatRenderable('rgba16float') ||
      !frame.depthTexture
    )
      return null;
    const [width, height] = frame.renderSize;
    if (!this.model) {
      this.model = new ClipSpace(this.device, {
        id: 'velocity-pass',
        source,
        modules: [velocity],
        parameters: {depthWriteEnabled: false, depthCompare: 'always', blend: false}
      });
    }
    if (!this.framebuffer) {
      const texture = this.device.createTexture({
        width,
        height,
        format: 'rgba16float',
        usage: Texture.SAMPLE | Texture.RENDER | Texture.COPY_SRC
      });
      // The luma.gl Model builds its WebGPU pipeline with the preferred depth format, so the
      // target needs a depth attachment of that format. The pass does not read or write it.
      this.framebuffer = this.device.createFramebuffer({
        width,
        height,
        colorAttachments: [texture],
        depthStencilAttachment: this.device.preferredDepthFormat as TextureFormatDepthStencil
      });
      this.framebuffer.attachResource(texture);
    }
    this.framebuffer.resize(frame.renderSize);
    if (frame.reset) this.reset();
    const clearPass = this.device.beginRenderPass({
      framebuffer: this.framebuffer,
      clearColor: [0, 0, 0, 0],
      clearDepth: false,
      clearStencil: false
    });
    clearPass.end();
    this.device.submit();
    const nextHistory = new Map<string, History>();
    for (const viewport of viewports) {
      const rect = getTemporalViewportRect(viewport, devicePixelRatio);
      const previous = this.history.get(viewport.id);
      const valid =
        previous && previous.width === viewport.width && previous.height === viewport.height;
      this.model.shaderInputs.setProps({
        velocity: {
          reprojection: getReprojectionMatrix(
            viewport.viewProjectionMatrix,
            valid ? previous.matrix : viewport.viewProjectionMatrix
          ),
          rect,
          jitter: frame.jitter,
          valid: valid ? 1 : 0
        }
      });
      this.model.setBindings({sceneDepth: frame.depthTexture});
      // Include pixels whose centers fall inside the scene viewport.
      const left = Math.max(0, Math.ceil(rect[0] - 0.5));
      const top = Math.max(0, Math.ceil(rect[1] - 0.5));
      const right = Math.min(width, Math.ceil(rect[0] + rect[2] - 0.5));
      const bottom = Math.min(height, Math.ceil(rect[1] + rect[3] - 0.5));
      if (right > left && bottom > top) {
        const pass = this.device.beginRenderPass({
          framebuffer: this.framebuffer,
          clearColor: false,
          clearDepth: false,
          clearStencil: false,
          parameters: {
            viewport: [0, 0, width, height],
            scissorRect: [left, top, right - left, bottom - top]
          }
        });
        this.model.draw(pass);
        pass.end();
        // Submit before changing the shared uniform buffer for the next viewport.
        this.device.submit();
      }
      nextHistory.set(viewport.id, {
        matrix: new Matrix4(viewport.viewProjectionMatrix),
        width: viewport.width,
        height: viewport.height
      });
    }
    this.history = nextHistory;
    return this.framebuffer.colorAttachments[0].texture;
  }

  /** Destroys all owned GPU resources and history. */
  delete(): void {
    this.model?.destroy();
    this.framebuffer?.destroy();
    this.model = null;
    this.framebuffer = null;
    this.reset();
  }
}
