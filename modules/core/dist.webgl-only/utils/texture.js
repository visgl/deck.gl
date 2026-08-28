// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { Texture } from '@luma.gl/core';
const DEFAULT_TEXTURE_PARAMETERS = {
    minFilter: 'linear',
    mipmapFilter: 'linear',
    magFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
};
// Track the textures that are created by us. They need to be released when they are no longer used.
const internalTextures = {};
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
export function createTexture(owner, device, image, sampler) {
    if (image instanceof Texture) {
        return image;
    }
    else if (image.constructor && image.constructor.name !== 'Object') {
        // Browser object
        image = { data: image };
    }
    let samplerParameters = null;
    if (image.compressed) {
        samplerParameters = {
            minFilter: 'linear',
            mipmapFilter: image.data.length > 1 ? 'nearest' : 'linear'
        };
    }
    const { width, height } = image.data;
    const texture = device.createTexture({
        ...image,
        sampler: {
            ...DEFAULT_TEXTURE_PARAMETERS,
            ...samplerParameters,
            ...sampler
        },
        mipLevels: device.getMipLevelCount(width, height)
    });
    if (device.type === 'webgl') {
        texture.generateMipmapsWebGL();
    }
    else if (false) {
        device.generateMipmapsWebGPU(texture);
    }
    // Track this texture
    internalTextures[texture.id] = owner;
    return texture;
}
export function destroyTexture(owner, texture) {
    if (!texture || !(texture instanceof Texture)) {
        return;
    }
    // Only delete the texture if requested by the same layer that created it
    if (internalTextures[texture.id] === owner) {
        texture.delete();
        delete internalTextures[texture.id];
    }
}
//# sourceMappingURL=texture.js.map