// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Viewport} from '@deck.gl/core';
import DeckRenderer from '@deck.gl/core/lib/deck-renderer';
import {device} from '@deck.gl/test-utils/vitest';
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
