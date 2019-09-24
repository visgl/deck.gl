import GL from '@luma.gl/constants';
import {Framebuffer, Texture2D, isWebGL2} from '@luma.gl/core';

const DEFAULT_PARAMETERS = {
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST
};

export function getFloatTexture(gl, opts = {}) {
  const {
    width = 1,
    height = 1,
    data = null,
    unpackFlipY = true,
    parameters = DEFAULT_PARAMETERS
  } = opts;
  const texture = new Texture2D(gl, {
    data,
    format: isWebGL2(gl) ? GL.RGBA32F : GL.RGBA,
    type: GL.FLOAT,
    border: 0,
    mipmaps: false,
    parameters,
    dataFormat: GL.RGBA,
    width,
    height,
    unpackFlipY
  });
  return texture;
}

export function getFramebuffer(gl, opts) {
  const {id, width = 1, height = 1, texture} = opts;
  const fb = new Framebuffer(gl, {
    id,
    width,
    height,
    attachments: {
      [GL.COLOR_ATTACHMENT0]: texture
    }
  });

  return fb;
}

export function getFloatArray(array, size, fillValue = 0) {
  if (!array || array.length < size) {
    return new Float32Array(size).fill(fillValue);
  }
  return array;
}
