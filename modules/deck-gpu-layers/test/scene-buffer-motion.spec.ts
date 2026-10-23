// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {SceneBufferEffect} from '@deck.gl-community/gpu-layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {expect, test} from 'vitest';
import {CaptureTestLayer, waitUntil, readCapture} from './scene-buffer-test-utils';

test('motion capture reprojects the camera without full history and resets on cuts', async context => {
  const device = await getWebGPUTestDevice();
  if (!device) {
    context.skip('WebGPU unavailable');
    return;
  }
  const parent = document.createElement('div');
  parent.style.width = '64px';
  parent.style.height = '64px';
  document.body.append(parent);
  // Capture is independent of canvas presentation. A real offscreen target keeps software
  // WebGPU runners from requesting an unsupported compositor swapchain during Deck's draw.
  const framebuffer = device.createFramebuffer({
    width: 64,
    height: 64,
    colorAttachments: ['rgba8unorm'],
    depthStencilAttachment: 'depth24plus'
  });
  let time = 2;
  const effect = new SceneBufferEffect({
    motionVectors: true,
    getTime: () => time,
    getLayerOptions: () => ({mode: 'opaque', surfaceBuffer: true})
  });
  const errors: string[] = [];
  const deck = new Deck({
    parent,
    device,
    width: 64,
    height: 64,
    useDevicePixels: false,
    _framebuffer: framebuffer,
    views: new OrthographicView({id: 'main'}),
    initialViewState: {target: [0, 0], zoom: 0},
    layers: [new CaptureTestLayer({id: 'motion-surface'})],
    effects: [effect],
    onError: error => errors.push(error.message)
  });
  try {
    await waitUntil(
      () => Boolean(effect.getFrame('main')?.historyValid),
      errors,
      () => deck.redraw('initialize motion history')
    );
    deck.setProps({_animate: false});
    await waitUntil(
      () => Boolean(effect.getFrame('main')?.historyValid),
      errors,
      () => deck.redraw('stationary motion')
    );
    const first = effect.getFrame('main')!;
    expect(first.buffer.framebuffer.colorAttachments).toHaveLength(3);
    expect(first.previousBuffer).toBeUndefined();
    expect(first.previousViewProjectionMatrix).toBeDefined();
    const stationary = await readCapture(device, effect, 'main', [32, 32], true);
    expect(stationary[0]).toBeCloseTo(0, 5);
    expect(stationary[1]).toBeCloseTo(0, 5);
    time = 3;
    deck.setProps({initialViewState: {target: [8, 0], zoom: 0}});
    deck.redraw('camera motion');
    const moving = await readCapture(device, effect, 'main', [32, 32], true);
    // The camera moves right by eight pixels: stationary surfaces move left in texture UV.
    expect(moving[0]).toBeCloseTo(-8 / 64, 3);
    expect(moving[1]).toBeCloseTo(0, 5);
    expect(effect.getFrame('main')!.previousTime).toBe(2);
    expect(effect.getFrame('main')!.time).toBe(3);
    effect.resetHistory('main');
    deck.redraw('camera cut');
    expect(effect.getFrame('main')!.historyValid).toBe(false);
    expect(effect.getFrame('main')!.previousViewProjectionMatrix).toBeUndefined();
    const reset = await readCapture(device, effect, 'main', [32, 32], true);
    expect(reset[0]).toBeCloseTo(0, 5);
    const velocityTexture = effect.getFrame('main')!.buffer.velocityTexture;
    framebuffer.resize({width: 80, height: 48});
    deck.setProps({width: 80, height: 48});
    await waitUntil(
      () => effect.getFrame('main')?.buffer.width === 80,
      errors,
      () => deck.redraw('motion resize')
    );
    expect(velocityTexture.destroyed).toBe(true);
    expect(effect.getFrame('main')!.historyValid).toBe(false);
    expect((await readCapture(device, effect, 'main', [40, 24], true))[0]).toBeCloseTo(0, 5);
    const finalVelocityTexture = effect.getFrame('main')!.buffer.velocityTexture;
    deck.finalize();
    expect(finalVelocityTexture.destroyed).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    deck.finalize();
    framebuffer.destroy();
    parent.remove();
  }
});
