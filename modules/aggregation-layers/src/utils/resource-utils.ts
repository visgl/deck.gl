import {Device, SamplerProps} from '@luma.gl/core';

const DEFAULT_PARAMETERS: SamplerProps = {
  minFilter: 'nearest',
  magFilter: 'nearest'
};

type FloatTextureOptions = {
  id: string;
  width?: number;
  height?: number;
  data?: any;
  unpackFlipY?: boolean;
  parameters?: SamplerProps;
};

// TODO - not working
export function getFloatTexture(device: Device, opts: FloatTextureOptions) {
  const {width = 1, height = 1, data = null, parameters = DEFAULT_PARAMETERS} = opts;
  const texture = device.createTexture({
    data,
    format: 'rgba32float', // device.info.type === 'webgl2' ? 'rgba32float' : GL.RGBA,
    // type: GL.FLOAT,
    // border: 0,
    mipmaps: false,
    sampler: parameters,
    // dataFormat: GL.RGBA,
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
