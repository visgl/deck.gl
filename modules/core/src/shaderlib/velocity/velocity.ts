// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shaders';
import {Matrix4} from '@math.gl/core';

/** Packs viewport UV motion into two unorm8 pairs; x == 0 is reserved for the clear value. */
export function packObjectVelocity(value: readonly number[]): [number, number, number, number] {
  const encode = (v: number) => Math.max(1, Math.min(65535, Math.round((v / 0.5) * 32767) + 32768));
  const x = encode(value[0]);
  const y = encode(value[1]);
  return [x >> 8, x & 255, y >> 8, y & 255];
}

/** Decodes logical RGBA bytes, independent of the texture's physical channel order. */
export function unpackObjectVelocity(value: readonly number[]): [number, number] {
  return [
    ((value[0] * 256 + value[1] - 32768) / 32767) * 0.5,
    ((value[2] * 256 + value[3] - 32768) / 32767) * 0.5
  ];
}

/** WebGPU-only opt-in object motion module. Matrices consume current-frame relative common space. */
export const velocity = {
  name: 'velocity',
  source: /* wgsl */ `
struct ObjectVelocityUniforms {
  isActive: f32,
  previousClipFromCommon: mat4x4<f32>,
  currentClipFromCommon: mat4x4<f32>,
};
@group(0) @binding(auto) var<uniform> velocity: ObjectVelocityUniforms;

fn velocity_pack(displacement: vec2<f32>) -> vec4<f32> {
  // floor(x + 0.5) matches JavaScript Math.round, including negative ties.
  let encoded = vec2<u32>(clamp(floor(displacement / 0.5 * 32767.0 + 0.5) + 32768.0,
                               vec2<f32>(1.0), vec2<f32>(65535.0)));
  return vec4<f32>(f32(encoded.x >> 8u), f32(encoded.x & 255u),
                   f32(encoded.y >> 8u), f32(encoded.y & 255u)) / 255.0;
}
fn velocity_color(previous: vec4<f32>, current: vec4<f32>) -> vec4<f32> {
  if (previous.w <= 0.0 || current.w <= 0.0) { return vec4<f32>(0.0); }
  return velocity_pack((previous.xy / previous.w - current.xy / current.w) * vec2<f32>(0.5, -0.5));
}
`,
  uniformTypes: {
    isActive: 'f32',
    previousClipFromCommon: 'mat4x4<f32>',
    currentClipFromCommon: 'mat4x4<f32>'
  },
  defaultUniforms: {
    isActive: 0,
    previousClipFromCommon: new Matrix4(),
    currentClipFromCommon: new Matrix4()
  }
} as const satisfies ShaderModule;
