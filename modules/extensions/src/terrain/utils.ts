// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {GL} from '@luma.gl/constants';

export function createRenderTarget(
  device: Device,
  opts: {
    id: string;
    float?: boolean;
    interpolate?: boolean;
  }
) {
  return device.createFramebuffer({
    id: opts.id,
    colorAttachments: [
      device.createTexture({
        id: opts.id,
        ...(opts.float && {
          format: 'rgba32float',
          type: GL.FLOAT
        }),
        mipmaps: false,
        sampler:
          opts.interpolate === false
            ? {
                minFilter: 'nearest',
                magFilter: 'nearest'
              }
            : {
                minFilter: 'linear',
                magFilter: 'linear'
              }
      })
    ]
  });
}
