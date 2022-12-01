import type {Device} from '@luma.gl/api';
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
          format: device.info.type === 'webgl2' ? 'rgba32float' : 'rgba8unorm',
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
