// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/**
 * Create a float texture to store aggregation result
 */
export function createRenderTarget(device, width, height) {
    return device.createFramebuffer({
        width,
        height,
        colorAttachments: [
            device.createTexture({
                width,
                height,
                format: 'rgba32float',
                sampler: {
                    minFilter: 'nearest',
                    magFilter: 'nearest'
                }
            })
        ]
    });
}
//# sourceMappingURL=utils.js.map