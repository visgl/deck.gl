import type {Device} from '@luma.gl/api';
import {GL, Framebuffer, Texture2D, isWebGL2} from '@luma.gl/webgl-legacy';

export function createRenderTarget(
  device: Device,
  opts: {
    id: string;
    float?: boolean;
  }
) {
  return new Framebuffer(device, {
    id: opts.id,
    attachments: {
      [GL.COLOR_ATTACHMENT0]: new Texture2D(device, {
        ...(opts.float && {
          format: device.info.type === 'webgl2' ? GL.RGBA32F : GL.RGBA,
          type: GL.FLOAT
        }),
        mipmaps: false,
        parameters: {
          [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
          [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
        }
      })
    }
  });
}
