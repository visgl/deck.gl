// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// WebGPU blends premultiplied - `WEBGPU_DEFAULT_DRAW_PARAMETERS` uses `one` /
// `one-minus-src-alpha` - so the WGSL layers premultiply as their last step. Analytic coverage must
// therefore be folded into alpha *before* `deckgl_premultiplied_alpha`, giving (rgb*a*c, a*c).
// Applying it after would leave (rgb*a, a*c): RGB too bright for its alpha, a light halo along every
// feathered edge. The goldens cannot see this - the WebGPU canvas does not present under the
// headless software renderer - so this test reads back an offscreen framebuffer instead.

import {describe, test, expect} from 'vitest';
import {luma, Texture, Buffer} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {Deck, OrthographicView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';

const W = 240;
const H = 180;

// Shallow diagonals at varying slope, as in path-antialiasing.spec.ts - an axis-aligned edge would
// land on exact pixel boundaries and never produce partial coverage at all.
const DIAGONALS = [0, 1, 2, 3].map(i => ({
  path: [
    [-110, -70 + i * 42],
    [110, -70 + i * 42 + 6 + i * 9]
  ]
}));

// Saturated red so any RGB overshoot at the edges is unambiguous
const STROKE_COLOR: [number, number, number] = [255, 0, 0];

type EdgeStats = {partial: number; worstOvershoot: number};

/** Render a feathered PathLayer on WebGPU and measure premultiplication at partial-coverage pixels */
async function measureEdges(): Promise<EdgeStats> {
  const container = document.createElement('div');
  container.style.cssText = `position:absolute;top:0;left:0;width:${W}px;height:${H}px;`;
  document.body.appendChild(container);

  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    createCanvasContext: {container, width: W, height: H, useDevicePixels: false},
    alphaMode: 'premultiplied'
  });

  // Render offscreen rather than to the canvas: the swapchain has no COPY_SRC, and the canvas does
  // not present under the software renderer. Framebuffer dimensions are not derived from
  // attachments, so pass them explicitly.
  const texture = device.createTexture({
    format: 'rgba8unorm',
    width: W,
    height: H,
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({
    width: W,
    height: H,
    colorAttachments: [texture],
    depthStencilAttachment: 'depth24plus'
  });

  const deck = new Deck({
    device,
    container,
    width: W,
    height: H,
    useDevicePixels: false,
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    _framebuffer: framebuffer,
    layers: [
      new PathLayer({
        id: 'webgpu-antialiasing',
        data: DIAGONALS,
        getPath: d => d.path,
        getColor: STROKE_COLOR,
        getWidth: 2,
        widthUnits: 'pixels',
        antialiasing: true
      })
    ]
  });

  await new Promise<void>(resolve => {
    deck.setProps({onAfterRender: () => resolve()});
  });

  const layout = texture.computeMemoryLayout();
  const readback = device.createBuffer({
    byteLength: layout.byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  texture.readBuffer({}, readback);
  const px = await readback.readAsync();

  let partial = 0;
  let worstOvershoot = 0;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3];
    // Only the feathered edges carry partial coverage; interiors and background say nothing here
    if (a === 0 || a === 255) {
      continue;
    }
    partial++;
    // Premultiplied red at coverage c is (255*c, 0, 0, 255*c), so red should track alpha. Straight
    // (un-premultiplied) output would hold red near 255 while alpha falls off.
    worstOvershoot = Math.max(worstOvershoot, px[i] - a);
  }

  deck.finalize();
  device.destroy();
  container.remove();
  return {partial, worstOvershoot};
}

describe('PathLayer#antialiasing on WebGPU', () => {
  test('coverage is applied before premultiplication', async () => {
    const {partial, worstOvershoot} = await measureEdges();

    expect(partial, `strokes should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
      300
    );

    // Allow a little slack for 8-bit rounding. Applying coverage after premultiplication pins red
    // near 255 regardless of alpha, so the overshoot runs into the hundreds.
    expect(
      worstOvershoot,
      `premultiplied red should track alpha at feathered edges (worst red-alpha ` +
        `overshoot ${worstOvershoot} across ${partial} partial pixels)`
    ).toBeLessThanOrEqual(2);
  }, 60000);
});
