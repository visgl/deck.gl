import {Device} from '@luma.gl/api';
import {GL, Framebuffer, Texture2D} from '@luma.gl/webgl-legacy';

const DEFAULT_PARAMETERS = {
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST
};

type FloatTextureOptions = {
  id: string;
  width?: number;
  height?: number;
  data?: any;
  unpackFlipY?: boolean;
  parameters?: Record<GL, GL>;
};

export function getFloatTexture(device: Device, opts: FloatTextureOptions) {
  const {
    width = 1,
    height = 1,
    data = null,
    unpackFlipY = true,
    parameters = DEFAULT_PARAMETERS
  } = opts;
  const texture = new Texture2D(device, {
    data,
    format: device.info.type === 'webgl2' ? GL.RGBA32F : GL.RGBA,
    type: GL.FLOAT,
    border: 0,
    mipmaps: false,
    parameters,
    dataFormat: GL.RGBA,
    width,
    height,
    // @ts-expect-error
    unpackFlipY
  });
  return texture;
}

export function getFramebuffer(device: Device, opts) {
  const {id, width = 1, height = 1, texture} = opts;
  const fb = new Framebuffer(device, {
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
