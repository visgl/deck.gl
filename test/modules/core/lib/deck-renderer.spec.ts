// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {MapView, Viewport} from '@deck.gl/core';
import DeckRenderer from '@deck.gl/core/lib/deck-renderer';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import type {CanvasContext, Framebuffer} from '@luma.gl/core';
import type {Effect, PostRenderOptions} from '@deck.gl/core/lib/effect';

test('DeckRenderer#post processing renders to the supplied canvas framebuffer', () => {
  const framebuffer = device.createFramebuffer({
    width: 60,
    height: 40,
    colorAttachments: ['rgba8unorm']
  });
  const canvasContext = {
    getCurrentFramebuffer: () => framebuffer,
    getDrawingBufferSize: () => [60, 40],
    cssToDeviceRatio: () => 1
  } as CanvasContext;
  const postRenderTargets: (Framebuffer | null | undefined)[] = [];
  const createEffect = (id: string): Effect => ({
    id,
    props: {},
    setup() {},
    cleanup() {},
    preRender() {},
    postRender({target, swapBuffer}: PostRenderOptions) {
      postRenderTargets.push(target);
      return target || swapBuffer;
    }
  });
  const deckRenderer = new DeckRenderer(device);

  deckRenderer.renderLayers({
    pass: 'screen',
    layers: [],
    viewports: [new Viewport({id: 'canvas-context-view', width: 60, height: 40})],
    views: {},
    onViewportActive: () => {},
    effects: [createEffect('first-effect'), createEffect('last-effect')],
    target: null,
    canvasContext
  });

  expect(postRenderTargets).toEqual([undefined, framebuffer]);

  deckRenderer.finalize();
  framebuffer.destroy();
});

test('DeckRenderer#schedules repeated WebGPU worlds within one effect lifecycle', async ({
  skip
}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
  }

  const width = 1152;
  const height = 128;
  const view = new MapView({repeat: true});
  const viewport = view.makeViewport({
    width,
    height,
    viewState: {longitude: 0, latitude: 0, zoom: 0}
  });
  const framebuffer = webgpuDevice.createFramebuffer({
    width,
    height,
    colorAttachments: ['rgba8unorm'],
    depthStencilAttachment: 'depth24plus'
  });
  const canvasContext = {
    getCurrentFramebuffer: () => framebuffer,
    getDrawingBufferSize: () => [width, height],
    cssToDeviceRatio: () => 1
  } as CanvasContext;
  const deckRenderer = new DeckRenderer(webgpuDevice);
  const renderLayersPass = vi.spyOn(deckRenderer.drawLayersPass, 'render');
  const onViewportActive = vi.fn();
  const preRender = vi.fn();
  const postRender = vi.fn(({target}: PostRenderOptions) => target || null);
  const effect: Effect = {
    id: 'repeated-world-effect',
    props: {},
    setup() {},
    cleanup() {},
    preRender,
    postRender
  };

  try {
    deckRenderer.renderLayers({
      pass: 'screen',
      layers: [],
      viewports: [viewport],
      views: {[view.id]: view},
      onViewportActive,
      effects: [effect],
      target: framebuffer,
      canvasContext
    });

    expect(renderLayersPass).toHaveBeenCalledTimes(3);
    expect(renderLayersPass.mock.calls.map(([options]) => options.subViewport)).toEqual(
      viewport.subViewports
    );
    expect(onViewportActive).toHaveBeenCalledExactlyOnceWith(viewport);
    expect(preRender).toHaveBeenCalledOnce();
    expect(postRender).toHaveBeenCalledOnce();
    expect(postRender.mock.calls[0][0].target).toBe(framebuffer);
  } finally {
    renderLayersPass.mockRestore();
    deckRenderer.finalize();
    framebuffer.destroy();
  }
});
