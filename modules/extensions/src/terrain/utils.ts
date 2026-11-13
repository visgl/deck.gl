// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {GL} from '@luma.gl/core/webgl-constants';

export function createRenderTarget(
  device: Device,
  opts: {
    id: string;
    float?: boolean;
    interpolate?: boolean;
  }
) {
  const framebuffer = device.createFramebuffer({
    id: opts.id,
    colorAttachments: [
      device.createTexture({
        id: opts.id,
        ...(opts.float && {
          format: 'rgba32float',
          type: GL.FLOAT
        }),
        dimension: '2d',
        width: 1,
        height: 1,
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
  // The framebuffer owns its texture so that resize() and destroy() release it
  framebuffer.attachResource(framebuffer.colorAttachments[0].texture);
  return framebuffer;
}
