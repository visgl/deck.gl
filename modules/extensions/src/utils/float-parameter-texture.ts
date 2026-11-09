// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device, Texture} from '@luma.gl/core';

/**
 * Uploads pairs of float parameters for exact texel loads.
 * In WGSL declare a texture_2d<u32> and bitcast the loaded RG pair to vec2<f32>.
 * GLSL can read the RG pair directly from a floating-point texture.
 */
export function createFloatParameterTexture(
  device: Device,
  {data, width, height}: {data: Float32Array; width: number; height: number}
): Texture {
  // The reflected WGSL f32 texture binding is filterable; integer loads preserve
  // the data without requiring the optional float32-filterable feature.
  const useIntegerTexture = device.type === 'webgpu';
  return device.createTexture({
    data: useIntegerTexture ? new Uint32Array(data.buffer, data.byteOffset, data.length) : data,
    format: useIntegerTexture ? 'rg32uint' : 'rg32float',
    width,
    height,
    sampler: {minFilter: 'nearest', magFilter: 'nearest'}
  });
}
