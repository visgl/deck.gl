// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {PostRenderOptions} from '@deck.gl/core';
import {ShaderPassEffect} from '@deck.gl-community/gpu-layers';
import {Buffer, Texture} from '@luma.gl/core';
import type {ShaderPass} from '@luma.gl/shadertools';
import {getTestDevice} from '@luma.gl/test-utils';
import {expect, test} from 'vitest';

const invert: ShaderPass = {
  name: 'invertEffectTest',
  source: /* wgsl */ `
fn invertEffectTest_filterColor_ext(color: vec4f, size: vec2f, coordinate: vec2f) -> vec4f {
  return vec4f(vec3f(1.0) - color.rgb, color.a);
}`,
  fs: /* glsl */ `
vec4 invertEffectTest_filterColor_ext(vec4 color, vec2 size, vec2 coordinate) {
  return vec4(vec3(1.0) - color.rgb, color.a);
}`,
  passes: [{filter: true}]
};

test.each(['webgpu', 'webgl'] as const)(
  'ShaderPassEffect %s composes targets, resizes, bypasses and borrows inputs',
  async (backend, context) => {
    const device = await getTestDevice(backend);
    if (!device) return context.skip(`${backend} unavailable`);
    const source = device.createTexture({
      width: 1,
      height: 1,
      format: 'rgba8unorm',
      usage: Texture.SAMPLE | Texture.RENDER | Texture.COPY_SRC | Texture.COPY_DST,
      data: new Uint8Array([255, 0, 0, 255])
    });
    const replacement = device.createTexture({
      width: 2,
      height: 1,
      format: 'rgba8unorm',
      data: new Uint8Array([0, 0, 255, 255, 0, 0, 255, 255])
    });
    const inputBuffer = device.createFramebuffer({width: 1, height: 1, colorAttachments: [source]});
    const swapTexture = device.createTexture({
      width: 1,
      height: 1,
      format: 'rgba8unorm',
      usage: Texture.SAMPLE | Texture.RENDER | Texture.COPY_SRC
    });
    const outputTexture = device.createTexture({
      width: 1,
      height: 1,
      format: 'rgba8unorm',
      usage: Texture.SAMPLE | Texture.RENDER | Texture.COPY_SRC
    });
    const swapBuffer = device.createFramebuffer({
      width: 1,
      height: 1,
      colorAttachments: [swapTexture]
    });
    const outputBuffer = device.createFramebuffer({
      width: 1,
      height: 1,
      colorAttachments: [outputTexture]
    });
    let enabled = true;
    let override: Texture | undefined;
    const first = new ShaderPassEffect({
      id: 'first',
      shaderPasses: [invert],
      colorFormat: 'rgba8unorm',
      getRenderOptions: options =>
        enabled
          ? {sourceTexture: override ?? options.inputBuffer.colorAttachments[0].texture}
          : null
    });
    const second = new ShaderPassEffect({
      id: 'second',
      shaderPasses: [invert],
      colorFormat: 'rgba8unorm'
    });
    const options: PostRenderOptions = {
      pass: 'effect-test',
      layers: [],
      viewports: [],
      effects: [first, second],
      inputBuffer,
      swapBuffer
    };
    const activeTextures = device.statsManager.getStats('Resource Counts').get('Textures Active');
    try {
      first.setup({device});
      second.setup({device});
      expect(first.useInPicking).toBe(false);
      expect(first.postRender(options)).toBe(swapBuffer);
      expect(Array.from(await readPixel(swapBuffer.colorAttachments[0].texture))).toEqual([
        0, 255, 255, 255
      ]);
      expect(
        second.postRender({
          ...options,
          inputBuffer: swapBuffer,
          swapBuffer: inputBuffer,
          target: outputBuffer
        })
      ).toBe(outputBuffer);
      expect(Array.from(await readPixel(outputBuffer.colorAttachments[0].texture))).toEqual([
        255, 0, 0, 255
      ]);
      const warmedTextureCount = activeTextures.count;
      for (let frame = 0; frame < 3; frame++) first.postRender(options);
      expect(activeTextures.count).toBe(warmedTextureCount);
      enabled = false;
      expect(first.postRender(options)).toBe(inputBuffer);
      expect(activeTextures.count).toBe(warmedTextureCount);
      enabled = true;
      override = replacement;
      first.postRender(options);
      expect(Array.from(await readPixel(swapBuffer.colorAttachments[0].texture))).toEqual([
        255, 255, 0, 255
      ]);
      first.setShaderPasses([]);
      first.postRender(options);
      expect(Array.from(await readPixel(swapBuffer.colorAttachments[0].texture))).toEqual([
        0, 0, 255, 255
      ]);
      first.resetHistory();
      first.cleanup();
      first.cleanup();
      second.cleanup();
      expect(source.destroyed).toBe(false);
      expect(replacement.destroyed).toBe(false);
      expect(inputBuffer.destroyed).toBe(false);
      expect(outputBuffer.destroyed).toBe(false);
      expect(activeTextures.count).toBeLessThan(warmedTextureCount);
      // A removed effect can be installed again without retaining its old renderer or size.
      first.setup({device});
      expect(first.postRender({...options, effects: [first], target: outputBuffer})).toBe(
        outputBuffer
      );
      expect(Array.from(await readPixel(outputBuffer.colorAttachments[0].texture))).toEqual([
        0, 0, 255, 255
      ]);
    } finally {
      first.cleanup();
      second.cleanup();
      inputBuffer.destroy();
      swapBuffer.destroy();
      outputBuffer.destroy();
      source.destroy();
      replacement.destroy();
      swapTexture.destroy();
      outputTexture.destroy();
    }
  }
);

async function readPixel(texture: Texture): Promise<Uint8Array> {
  const layout = texture.computeMemoryLayout({width: 1, height: 1});
  const buffer = texture.device.createBuffer({
    byteLength: layout.byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  try {
    texture.readBuffer({width: 1, height: 1}, buffer);
    const values = await buffer.readAsync(0, layout.byteLength);
    return new Uint8Array(values.buffer, values.byteOffset, 4).slice();
  } finally {
    buffer.destroy();
  }
}
