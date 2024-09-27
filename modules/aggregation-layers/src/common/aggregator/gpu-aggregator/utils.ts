// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device, Framebuffer} from '@luma.gl/core';

/**
 * Create a float texture to store aggregation result
 */
export function createRenderTarget(device: Device, width: number, height: number): Framebuffer {
  return device.createFramebuffer({
    width,
    height,
    colorAttachments: [
      device.createTexture({
        width,
        height,
        format: 'rgba32float',
        mipmaps: false,
        sampler: {
          minFilter: 'nearest',
          magFilter: 'nearest'
        }
      })
    ]
  });
}
