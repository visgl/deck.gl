// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Device, Texture, Framebuffer} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';

const cameraMotion = {
  name: 'cameraMotion',
  source: `struct CameraMotionUniforms {
    currentClipToPreviousClip: mat4x4f,
    viewportBounds: vec4f,
    textureSize: vec2f,
  };
  @group(3) @binding(auto) var<uniform> cameraMotion: CameraMotionUniforms;`,
  uniformTypes: {
    currentClipToPreviousClip: 'mat4x4<f32>',
    viewportBounds: 'vec4<f32>',
    textureSize: 'vec2<f32>'
  },
  defaultUniforms: {
    currentClipToPreviousClip: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    viewportBounds: [0, 0, 1, 1],
    textureSize: [1, 1]
  }
} as const satisfies ShaderModule;

/** One reusable fullscreen draw reconstructs stationary-surface motion from captured depth. */
export class SceneVelocityModel {
  private model: Model;
  constructor(private device: Device) {
    this.model = new Model(device, {
      id: 'scene-camera-velocity',
      source: SOURCE,
      modules: [cameraMotion],
      vertexCount: 3,
      parameters: {depthWriteEnabled: false, depthCompare: 'always', blend: false}
    });
  }
  render(
    target: Framebuffer,
    depthTexture: Texture,
    matrix: readonly number[],
    viewportBounds: readonly [number, number, number, number]
  ): void {
    this.model.setBindings({depthTexture});
    this.model.shaderInputs.setProps({
      cameraMotion: {
        currentClipToPreviousClip: matrix,
        viewportBounds,
        textureSize: [target.width, target.height]
      }
    });
    const pass = this.device.beginRenderPass({
      framebuffer: target,
      clearColor: [0, 0, 0, 0],
      clearDepth: false,
      depthReadOnly: true
    });
    this.model.draw(pass);
    pass.end();
    pass.destroy();
  }
  destroy(): void {
    this.model.destroy();
  }
}
const SOURCE = `
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(positions[index], 0.0, 1.0);
}
@fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let bounds = cameraMotion.viewportBounds;
  if (any(position.xy < bounds.xy) || any(position.xy >= bounds.xy + bounds.zw)) { return vec4f(0.0); }
  let depth = textureLoad(depthTexture, vec2i(position.xy), 0);
  if (depth >= 0.99999) { return vec4f(0.0); }
  let currentCoordinate = (position.xy - bounds.xy) / bounds.zw;
  let clip = vec4f(currentCoordinate * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), depth, 1.0);
  let previousClip = cameraMotion.currentClipToPreviousClip * clip;
  if (previousClip.w <= 0.00001) { return vec4f(0.0); }
  let previousCoordinate = previousClip.xy / previousClip.w * vec2f(0.5, -0.5) + vec2f(0.5);
  return vec4f((currentCoordinate - previousCoordinate) * bounds.zw / cameraMotion.textureSize, 0.0, 1.0);
}`;
