import {Framebuffer, Texture2D, isWebGL2} from '@luma.gl/core';
import GL from '@luma.gl/constants';

export function createRenderTarget(
  gl: WebGLRenderingContext,
  opts: {
    id: string;
    float?: boolean;
  }
) {
  return new Framebuffer(gl, {
    id: opts.id,
    attachments: {
      [gl.COLOR_ATTACHMENT0]: new Texture2D(gl, {
        ...(opts.float && {
          format: isWebGL2(gl) ? GL.RGBA32F : GL.RGBA,
          type: GL.FLOAT
        }),
        mipmaps: false,
        parameters: {
          [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
          [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
          [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
          [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
        }
      })
    }
  });
}
