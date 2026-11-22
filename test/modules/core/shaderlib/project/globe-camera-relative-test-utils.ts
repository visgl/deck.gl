// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Shared helpers of the camera-relative GlobeView render tests

import {expect} from 'vitest';
import {
  Deck,
  GlobeView,
  GlobeViewport,
  type DeckProps,
  type GlobeViewState,
  type Layer
} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import type {Framebuffer} from '@luma.gl/core';
import {webgl2Adapter, type WebGLDevice} from '@luma.gl/core/webgl';

export const WIDTH = 400;
export const HEIGHT = 300;
export const VIEW_STATE = {
  longitude: -122.4194155,
  latitude: 37.7749295,
  zoom: 19,
  pitch: 0,
  bearing: 0
};
/** Largest error, in pixels, between a rendered feature centre and its float64 projection. */
export const TOLERANCE = 0.25;

export type Vec3 = [number, number, number];
export type Pixel = [number, number];

/** GlobeView that keeps the globe viewport at every zoom, with the master projection path. */
export class AbsoluteGlobeView extends GlobeView {
  getViewportType() {
    return GlobeViewport;
  }
}

export function renderFrame(
  deck: Deck<GlobeView>,
  props: DeckProps<GlobeView> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    deck.setProps({...props, onAfterRender: () => resolve(), onError: reject});
  });
}

/** Runs `run` on a Deck of WIDTH x HEIGHT. */
export async function withDeck(
  views: GlobeView,
  run: (deck: Deck<GlobeView>, read: () => Uint8Array, viewport: GlobeViewport) => Promise<void>,
  viewState: GlobeViewState = VIEW_STATE
) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let device: WebGLDevice | undefined;
  let deck: Deck<GlobeView> | undefined;
  let framebuffer: Framebuffer | undefined;
  try {
    device = await webgl2Adapter.create({
      createCanvasContext: {container, width: WIDTH, height: HEIGHT, useDevicePixels: false}
    });
    framebuffer = device.createFramebuffer({
      width: WIDTH,
      height: HEIGHT,
      colorAttachments: ['rgba8unorm'],
      depthStencilAttachment: 'depth24plus'
    });
    deck = new Deck({
      device,
      parent: container,
      width: WIDTH,
      height: HEIGHT,
      useDevicePixels: false,
      _framebuffer: framebuffer,
      views,
      viewState,
      layers: []
    });
    await renderFrame(deck);
    console.log('Renderer', device.info.renderer);
    const viewport = deck.getViewports()[0] as GlobeViewport;
    expect(viewport).toBeInstanceOf(GlobeViewport);
    const fbo = framebuffer;
    const gpu = device;
    await run(deck, () => gpu.readPixelsToArrayWebGL(fbo) as Uint8Array, viewport);
  } finally {
    deck?.finalize();
    framebuffer?.destroy();
    device?.gl.getExtension('WEBGL_lose_context')?.loseContext();
    device?.destroy();
    container.remove();
  }
}

/** Intensity-weighted centre, in top-left screen pixels, of the bright pixels near `around`. */
export function centroid(pixels: Uint8Array, around: Pixel, radius: number): Pixel | null {
  let sum = 0;
  let sx = 0;
  let sy = 0;
  const x0 = Math.max(0, Math.floor(around[0] - radius));
  const x1 = Math.min(WIDTH - 1, Math.ceil(around[0] + radius));
  // Rows are bottom-up
  for (let row = 0; row < HEIGHT; row++) {
    const y = HEIGHT - row - 0.5;
    if (Math.abs(y - around[1]) > radius) continue;
    for (let x = x0; x <= x1; x++) {
      const w = pixels[(row * WIDTH + x) * 4 + 1];
      sum += w;
      sx += w * (x + 0.5);
      sy += w * y;
    }
  }
  return sum > 0 ? [sx / sum, sy / sum] : null;
}

/** Positions on a 3 x 3 grid around the screen centre, with altitudes. */
export function samplePositions(viewport: GlobeViewport): Vec3[] {
  const positions: Vec3[] = [];
  for (const dx of [-130, 0, 125]) {
    for (const dy of [-95, 0, 90]) {
      const [lng, lat] = viewport.unproject([WIDTH / 2 + dx + 0.3, HEIGHT / 2 + dy + 0.6]);
      positions.push([lng, lat, positions.length % 2]);
    }
  }
  return positions;
}

/** Distances between the rendered feature centres and their float64 projections. */
export function measureErrors(
  pixels: Uint8Array,
  viewport: GlobeViewport,
  positions: Vec3[]
): number[] {
  return positions.map(p => {
    const expected = viewport.project(p) as Pixel;
    const found = centroid(pixels, expected, 30);
    return found ? Math.hypot(found[0] - expected[0], found[1] - expected[1]) : Infinity;
  });
}

export function scatterplot(positions: Vec3[], props: Record<string, unknown> = {}): Layer {
  return new ScatterplotLayer<Vec3>({
    id: 'points',
    data: positions,
    getPosition: d => d,
    getRadius: 3,
    radiusUnits: 'pixels',
    getFillColor: [255, 255, 255],
    ...props
  });
}
