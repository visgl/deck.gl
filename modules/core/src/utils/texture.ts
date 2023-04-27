import {Texture2D} from '@luma.gl/core';
import GL from '@luma.gl/constants';

const DEFAULT_TEXTURE_PARAMETERS: Record<number, number> = {
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

// Track the textures that are created by us. They need to be released when they are no longer used.
const internalTextures: Record<string, string> = {};

export function createTexture(
  owner: string,
  gl: WebGLRenderingContext,
  image: any,
  parameters: Record<number, number>
): Texture2D | null {
  // image could be one of:
  //  - Texture2D
  //  - Browser object: Image, ImageData, ImageData, HTMLCanvasElement, HTMLVideoElement, ImageBitmap
  //  - Plain object: {width: <number>, height: <number>, data: <Uint8Array>}
  if (image instanceof Texture2D) {
    return image;
  } else if (image.constructor && image.constructor.name !== 'Object') {
    // Browser object
    image = {data: image};
  }

  let specialTextureParameters: Record<number, number> | null = null;
  if (image.compressed) {
    specialTextureParameters = {
      [GL.TEXTURE_MIN_FILTER]: image.data.length > 1 ? GL.LINEAR_MIPMAP_NEAREST : GL.LINEAR
    };
  }

  const texture = new Texture2D(gl, {
    ...image,
    parameters: {
      ...DEFAULT_TEXTURE_PARAMETERS,
      ...specialTextureParameters,
      ...parameters
    }
  });
  // Track this texture
  internalTextures[texture.id] = owner;
  return texture;
}

export function destroyTexture(owner: string, texture: Texture2D) {
  if (!texture || !(texture instanceof Texture2D)) {
    return;
  }
  // Only delete the texture if requested by the same layer that created it
  if (internalTextures[texture.id] === owner) {
    texture.delete();
    delete internalTextures[texture.id];
  }
}
