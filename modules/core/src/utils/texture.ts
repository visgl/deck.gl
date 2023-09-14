import {Device, Texture, SamplerProps} from '@luma.gl/core';

const DEFAULT_TEXTURE_PARAMETERS: SamplerProps = {
  minFilter: 'linear',
  mipmapFilter: 'linear',
  magFilter: 'linear',
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge'
};

// Track the textures that are created by us. They need to be released when they are no longer used.
const internalTextures: Record<string, string> = {};

/**
 *
 * @param owner
 * @param device
 * @param image could be one of:
 *   - Texture
 *   - Browser object: Image, ImageData, ImageData, HTMLCanvasElement, HTMLVideoElement, ImageBitmap
 *   - Plain object: {width: <number>, height: <number>, data: <Uint8Array>}
 * @param parameters
 * @returns
 */
export function createTexture(
  owner: string,
  device: Device,
  image: any,
  sampler: SamplerProps
): Texture | null {
  if (image instanceof Texture) {
    // @ts-expect-error This type error seems like it shouldn't happen...
    return image;
  } else if (image.constructor && image.constructor.name !== 'Object') {
    // Browser object
    image = {data: image};
  }

  let samplerParameters: SamplerProps | null = null;
  if (image.compressed) {
    samplerParameters = {
      minFilter: 'linear',
      mipmapFilter: image.data.length > 1 ? 'nearest' : 'linear'
    };
  }

  const texture = device.createTexture({
    ...image,
    sampler: {
      ...DEFAULT_TEXTURE_PARAMETERS,
      ...samplerParameters,
      ...sampler
    }
  });
  // Track this texture
  internalTextures[texture.id] = owner;
  return texture;
}

export function destroyTexture(owner: string, texture: Texture) {
  if (!texture || !(texture instanceof Texture)) {
    return;
  }
  // Only delete the texture if requested by the same layer that created it
  if (internalTextures[texture.id] === owner) {
    texture.delete();
    delete internalTextures[texture.id];
  }
}
