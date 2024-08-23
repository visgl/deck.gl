import type {Device, Framebuffer} from '@luma.gl/core';

/**
 * Marks GLSL shaders for syntax highlighting: glsl`...`
 * Install https://marketplace.visualstudio.com/items?itemName=boyswan.glsl-literal
 */
export const glsl = (s: TemplateStringsArray) => `${s}`;

/**
 * Create a float texture to store aggregation result
 */
export function createRenderTarget(device: Device, width: number, height: number): Framebuffer {
  return device.createFramebuffer({
    width,
    height,
    colorAttachments: [
      device.createTexture({
        width,
        height,
        format: 'rgba32float',
        mipmaps: false,
        sampler: {
          minFilter: 'nearest',
          magFilter: 'nearest'
        }
      })
    ]
  });
}
