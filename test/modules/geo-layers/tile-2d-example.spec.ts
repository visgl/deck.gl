// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createElement} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import App, {type TileDemoStats} from '../../../examples/website/shared-tile-2d-layer/app';

/** Exercises the actual demo with deterministic raster content instead of a public tile server. */
test('shared tileset demo renders both styles and minimap, compares caches, and remounts', async () => {
  const parent = document.createElement('div');
  parent.style.cssText = 'position:relative;width:720px;height:420px';
  document.body.append(parent);
  const image = document.createElement('canvas');
  image.width = image.height = 16;
  image.getContext('2d')!.fillStyle = '#f0d9ba';
  image.getContext('2d')!.fillRect(0, 0, 16, 16);
  const blob = await new Promise<Blob>(resolve => image.toBlob(value => resolve(value!)));
  const originalFetch = globalThis.fetch;
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation((url, options) =>
      String(url).startsWith('https://tile.openstreetmap.org/')
        ? Promise.resolve(new Response(blob))
        : originalFetch(url, options)
    );
  let root = createRoot(parent);
  let latest: TileDemoStats | undefined;
  const onStatsChange = (stats: TileDemoStats) => {
    latest = stats;
  };
  const loaded = async (caches: number) =>
    vi.waitFor(
      () => {
        expect(latest?.caches).toBe(caches);
        expect(latest?.consumers).toBe(3);
        expect(
          latest?.requests,
          JSON.stringify({
            stats: latest,
            canvas: parent.querySelector('canvas')?.getBoundingClientRect().toJSON(),
            panel: parent.textContent
          })
        ).toBeGreaterThan(0);
        expect(latest?.loading).toBe(0);
      },
      // Software WebGL initialization may block the request timer on busy hosts.
      {timeout: 60000}
    );
  const pixels = () => {
    const canvas = parent.querySelector('canvas')!;
    const copy = document.createElement('canvas');
    copy.width = 720;
    copy.height = 420;
    const context = copy.getContext('2d')!;
    context.drawImage(canvas, 0, 0, 720, 420);
    return [
      context.getImageData(180, 210, 1, 1).data,
      context.getImageData(540, 210, 1, 1).data,
      context.getImageData(604, 352, 1, 1).data
    ];
  };
  try {
    root.render(createElement(App, {onStatsChange}));
    await loaded(1);
    const sharedRequests = latest!.requests;
    await vi.waitFor(
      () => {
        const [left, right, minimap] = pixels();
        expect(left[0]).toBeGreaterThan(right[0] + 30);
        expect(Math.abs(minimap[0] - right[0])).toBeLessThan(4);
        expect(minimap[3]).toBe(255);
      },
      {timeout: 60000}
    );

    parent.querySelector<HTMLInputElement>('input[type=checkbox]')!.click();
    await loaded(2);
    expect(latest!.requests).toBeGreaterThan(sharedRequests);
    expect(latest!.cached).toBe(latest!.requests);

    parent.style.width = '340px';
    await vi.waitFor(() =>
      expect(parent.querySelector('canvas')!.getBoundingClientRect().width).toBe(340)
    );
    expect(parent.querySelector('[role=alert]')).toBeNull();
    root.unmount();
    expect(parent.querySelector('canvas')).toBeNull();
    latest = undefined;
    root = createRoot(parent);
    root.render(createElement(App, {onStatsChange}));
    await loaded(1);
    expect(parent.querySelector<HTMLInputElement>('input')!.checked).toBe(true);
  } finally {
    root.unmount();
    fetch.mockRestore();
    parent.remove();
  }
}, 180000);
