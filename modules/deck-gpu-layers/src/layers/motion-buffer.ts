// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import type {NumberArray16} from '@math.gl/core';

/** Object motion adapters supply both positions projected with the current camera.
 * The capture transforms the previous position into the preceding camera's clip space.
 * Velocity is current-minus-previous UV, with a top-left texture origin.
 */
export const motionBuffer = {
  name: 'motionBuffer',
  source: `struct MotionBufferUniforms {
    enabled: i32,
    currentClipToPreviousClip: mat4x4f,
    previousTime: f32,
    viewportScale: vec2f,
  };
  @group(3) @binding(auto) var<uniform> motionBuffer: MotionBufferUniforms;
  fn motionBuffer_getVelocity(currentClip: vec4f, previousPositionClip: vec4f) -> vec2f {
    let previousClip = motionBuffer.currentClipToPreviousClip * previousPositionClip;
    if (currentClip.w <= 0.00001 || previousClip.w <= 0.00001) { return vec2f(0.0); }
    return (currentClip.xy / currentClip.w - previousClip.xy / previousClip.w) * vec2f(0.5, -0.5) * motionBuffer.viewportScale;
  }`,
  vs: `layout(std140) uniform motionBufferUniforms {
    highp int enabled;
    mat4 currentClipToPreviousClip;
    float previousTime;
    vec2 viewportScale;
  } motionBuffer;
  vec2 motionBuffer_getVelocity(vec4 currentClip, vec4 previousPositionClip) {
    vec4 previousClip = motionBuffer.currentClipToPreviousClip * previousPositionClip;
    if (currentClip.w <= 0.00001 || previousClip.w <= 0.00001) return vec2(0.0);
    return (currentClip.xy / currentClip.w - previousClip.xy / previousClip.w) * vec2(0.5, -0.5) * motionBuffer.viewportScale;
  }`,
  fs: `layout(std140) uniform motionBufferUniforms {
    highp int enabled;
    mat4 currentClipToPreviousClip;
    float previousTime;
    vec2 viewportScale;
  } motionBuffer;`,
  uniformTypes: {
    enabled: 'i32',
    currentClipToPreviousClip: 'mat4x4<f32>',
    previousTime: 'f32',
    viewportScale: 'vec2<f32>'
  },
  defaultUniforms: {
    enabled: 0,
    currentClipToPreviousClip: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    previousTime: 0,
    viewportScale: [1, 1]
  }
} as const satisfies ShaderModule<
  {},
  {
    enabled: number;
    currentClipToPreviousClip: Readonly<NumberArray16>;
    previousTime: number;
    viewportScale: readonly [number, number];
  }
>;
