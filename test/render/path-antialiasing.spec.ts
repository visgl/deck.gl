// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// `antialiasing` exists for contexts created without multisampling - notably interleaved rendering
// into a base map, since MapLibre and Mapbox create their WebGL context with `antialias: false`.
// These tests therefore create their own device with MSAA disabled, rather than using the shared
// render-test device, which takes the browser default of `antialias: true`.
//
// This cannot be covered by a golden image: with MSAA on, the strokes are smoothed whether or not
// the prop is set and the residual difference falls below the diff threshold - a golden test was
// tried and passed with the feature completely disabled. These tests read the framebuffer and
// assert on the coverage itself.

import {describe, test, expect} from 'vitest';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {Deck, OrthographicView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

const W = 240;
const H = 180;

// Shallow diagonals at varying slope - the worst case for aliasing. An axis-aligned edge would
// land on exact pixel boundaries and never produce partial coverage at all.
const DIAGONALS = [0, 1, 2, 3].map(i => ({
  path: [
    [-110, -70 + i * 42],
    [110, -70 + i * 42 + 6 + i * 9]
  ]
}));

type Coverage = {solid: number; partial: number; levels: number};

function createContainer(): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `position:absolute;top:0;left:0;width:${W}px;height:${H}px;`;
  document.body.appendChild(el);
  return el;
}

/** Render one PathLayer into a context without MSAA and measure the resulting coverage. */
async function measure(layerProps: Record<string, unknown>): Promise<Coverage> {
  const container = createContainer();
  const device = await luma.createDevice({
    type: 'webgl',
    adapters: [webgl2Adapter],
    // The condition under test: no multisampling, as base maps create their context
    webgl: {antialias: false},
    createCanvasContext: {container, width: W, height: H, useDevicePixels: false, autoResize: true}
  });

  const deck = new Deck({
    device,
    container,
    width: W,
    height: H,
    useDevicePixels: false,
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0}
  });

  const coverage = await new Promise<Coverage>(resolve => {
    deck.setProps({
      layers: [
        new PathLayer({
          id: 'path-antialiasing',
          data: DIAGONALS,
          getPath: d => d.path,
          getColor: [20, 20, 20],
          getWidth: 2,
          widthUnits: 'pixels',
          ...layerProps
        })
      ],
      onAfterRender: () => {
        const gl = (device as any).gl;
        const px = new Uint8Array(W * H * 4);
        gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
        let solid = 0;
        let partial = 0;
        const levels = new Set<number>();
        for (let i = 3; i < px.length; i += 4) {
          const a = px[i];
          if (a === 255) {
            solid++;
          } else if (a > 0) {
            partial++;
            levels.add(a);
          }
        }
        resolve({solid, partial, levels: levels.size});
      }
    });
  });

  deck.finalize();
  device.destroy();
  container.remove();
  return coverage;
}

describe('PathLayer#antialiasing', () => {
  test('adds analytic coverage where the context provides none', async () => {
    const off = await measure({antialiasing: false});
    const on = await measure({antialiasing: true});

    expect(off.solid, 'strokes were drawn').toBeGreaterThan(500);
    expect(on.solid, 'strokes were drawn').toBeGreaterThan(200);

    // Without MSAA and without the prop there is no antialiasing from any source: every covered
    // pixel is fully opaque and the edges are a hard staircase.
    expect(
      off.partial,
      `antialiasing:false in a non-MSAA context should produce no partial coverage ` +
        `(got ${off.partial} partial pixels)`
    ).toBe(0);

    // With the prop, edges are feathered over roughly one device pixel with continuous coverage
    expect(
      on.partial,
      `antialiasing:true should feather the edges (got ${on.partial} partial pixels)`
    ).toBeGreaterThan(300);
    expect(
      on.levels,
      `coverage should be continuous, not quantized (got ${on.levels} distinct alpha levels)`
    ).toBeGreaterThan(40);
  }, 60000);

  test('feather survives PathStyleExtension offset', async () => {
    const on = await measure({antialiasing: true});
    const onOffset = await measure({
      antialiasing: true,
      getOffset: 1,
      extensions: [new PathStyleExtension({offset: true})]
    });

    expect(onOffset.solid, 'offset strokes were drawn').toBeGreaterThan(200);

    // Regression guard. An earlier implementation passed the stroke half-width to the fragment
    // shader as a varying read after DECKGL_FILTER_SIZE. PathStyleExtension's `offset` inflates
    // that width and separately rescales vPathPosition, so the feather collapsed to
    // 1/offsetWidth of a pixel - measured at 0.33x for getOffset: 1. Deriving the pixel scale
    // from screen-space derivatives instead keeps it close to the un-offset case. The extension
    // hard-discards outside the band, clipping the outer half of the ramp, so this stays below 1.
    const ratio = onOffset.partial / on.partial;
    expect(
      ratio,
      `offset feather should not collapse (on=${on.partial}, offset=${onOffset.partial}, ` +
        `ratio=${ratio.toFixed(3)})`
    ).toBeGreaterThan(0.55);
  }, 60000);
});
