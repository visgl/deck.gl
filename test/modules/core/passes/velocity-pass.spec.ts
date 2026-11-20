// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {luma, Buffer} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {Viewport} from '@deck.gl/core';
import type {TemporalFrame} from '@deck.gl/core';
import VelocityPass from '@deck.gl/core/passes/velocity-pass';
import type {Device, Texture} from '@luma.gl/core';

// Read one rgba16float texel as raw half-float bits; all expectations below are exactly representable.
async function readPixel(
  device: Device,
  texture: Texture,
  x: number,
  y: number
): Promise<number[]> {
  // One rgba16float texel has 8 bytes. A WebGPU copy row is a multiple of 256 bytes.
  const destination = device.createBuffer({
    byteLength: 256,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  device.submit();
  const buffer = texture.readBuffer({x, y, width: 1, height: 1}, destination);
  try {
    const bytes = await buffer.readAsync();
    return Array.from(new Uint16Array(bytes.buffer, bytes.byteOffset, 4));
  } finally {
    buffer.destroy();
  }
}

// The shared test device is a WebGL device, so this test makes its own WebGPU device. Without
// WebGPU in the browser, the test is reported as skipped. It does not pass silently.
const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

test.skipIf(!hasWebGPU)(
  'VelocityPass WebGPU validity, static motion, previous depth and viewport coverage',
  async () => {
    const device = await luma.createDevice({
      type: 'webgpu',
      adapters: [webgpuAdapter],
      createCanvasContext: {width: 8, height: 8}
    });
    expect(device.type).toBe('webgpu');
    try {
      await runVelocityPassTest(device);
    } finally {
      device.destroy();
    }
  }
);

async function runVelocityPassTest(device: Device): Promise<void> {
  const scene = device.createFramebuffer({
    width: 8,
    height: 8,
    colorAttachments: ['rgba8unorm'],
    depthStencilAttachment: 'depth32float'
  });
  const pass = device.beginRenderPass({
    framebuffer: scene,
    clearColor: [0, 0, 0, 0],
    clearDepth: 0.25
  });
  pass.end();
  device.submit();
  const velocityPass = new VelocityPass(device);
  const frame: TemporalFrame = {
    frameIndex: 0,
    renderScale: 1,
    renderSize: [8, 8],
    outputSize: [8, 8],
    jitter: [0.25, -0.125],
    jitterClip: [0.0625, 0.03125],
    phaseCount: 8,
    depthTexture: scene.depthStencilAttachment!.texture,
    velocityTexture: null,
    reset: true
  };
  const viewports = [new Viewport({id: 'main', x: 2, y: 2, width: 4, height: 4})];
  try {
    let texture = velocityPass.render(frame, viewports, 1)!;
    expect(texture.format).toBe('rgba16float');
    expect(await readPixel(device, texture, 3, 3)).toEqual([0, 0, 0, 0]);
    frame.reset = false;
    frame.frameIndex++;
    texture = velocityPass.render(frame, viewports, 1)!;
    // Half-float bits for zero velocity, 1 - 0.25 depth and validity 1.
    const stationary = await readPixel(device, texture, 3, 3);
    expect(stationary.slice(0, 2).map(value => value & 0x7fff)).toEqual([0, 0]);
    expect(stationary.slice(2)).toEqual([0x3a00, 0x3c00]);
    expect(await readPixel(device, texture, 0, 0)).toEqual([0, 0, 0, 0]);
    frame.reset = true;
    texture = velocityPass.render(frame, viewports, 1)!;
    expect(await readPixel(device, texture, 3, 3)).toEqual([0, 0, 0, 0]);
  } finally {
    velocityPass.delete();
    scene.destroy();
  }
}
