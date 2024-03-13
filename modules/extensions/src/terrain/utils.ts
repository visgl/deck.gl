import type {Device} from '@luma.gl/core';
import {GL} from '@luma.gl/constants';

export function createRenderTarget(
  device: Device,
  opts: {
    id: string;
    float?: boolean;
  }
) {
  return device.createFramebuffer({
    id: opts.id,
    colorAttachments: [
      device.createTexture({
        ...(opts.float && {
          format: 'rgba32float',
          type: GL.FLOAT
        }),
        mipmaps: false,
        sampler: {
          minFilter: 'linear',
          magFilter: 'linear',
          addressModeU: 'clamp-to-edge',
          addressModeV: 'clamp-to-edge'
        }
      })
    ]
  });
}
