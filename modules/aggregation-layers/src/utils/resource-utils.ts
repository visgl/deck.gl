import {Device, SamplerProps} from '@luma.gl/core';

const DEFAULT_SAMPLER: SamplerProps = {
  minFilter: 'nearest',
  magFilter: 'nearest'
};

type FloatTextureOptions = {
  id: string;
  width?: number;
  height?: number;
  data?: any;
  unpackFlipY?: boolean;
  sampler?: SamplerProps;
};

// TODO - not working
export function getFloatTexture(device: Device, opts: FloatTextureOptions) {
  const {width = 1, height = 1, data = null, sampler = DEFAULT_SAMPLER} = opts;
  const texture = device.createTexture({
    data,
    format: 'rgba32float', // device.info.type === 'webgl2' ? 'rgba32float' : GL.RGBA,
    // type: GL.FLOAT,
    // border: 0,
    mipmaps: false,
    sampler,
    width,
    height
    // ts-expect-error
    // unpackFlipY
  });
  return texture;
}

export function getFramebuffer(device: Device, opts) {
  const {id, width = 1, height = 1, texture} = opts;
  const fb = device.createFramebuffer({
    id,
    width,
    height,
    colorAttachments: [texture]
  });

  return fb;
}

export function getFloatArray(array, size, fillValue = 0) {
  if (!array || array.length < size) {
    return new Float32Array(size).fill(fillValue);
  }
  return array;
}
