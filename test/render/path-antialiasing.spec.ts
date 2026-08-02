// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Antialiasing cannot be covered by a golden image here: the render canvas is created with the
// browser default `antialias: true`, so MSAA smooths the strokes whether or not the prop is set,
// and the residual difference is far below the golden diff threshold. A golden test passes even
// with the feature completely disabled. These tests read the framebuffer instead and assert on
// the coverage itself.

import {describe, test, expect} from 'vitest';
import {OrthographicView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {createContainer, removeContainer, createTestDevice, createDeck} from './deck-test-utils';

const DIAGONALS = [0, 1, 2, 3, 4].map(i => ({
  // Shallow diagonals at varying slope - the worst case for aliasing. An axis-aligned edge would
  // land on exact pixel boundaries and never produce partial coverage at all.
  path: [
    [-150, -120 + i * 60],
    [150, -120 + i * 60 + 8 + i * 12]
  ]
}));

type Coverage = {solid: number; partial: number; levels: number};

function measure(deck, device, layers): Promise<Coverage> {
  return new Promise(resolve => {
    deck.setProps({
      views: new OrthographicView(),
      viewState: {target: [0, 0, 0], zoom: 0},
      layers,
      onAfterRender: () => {
        const gl = device.gl;
        const [w, h] = device.canvasContext.getDrawingBufferSize();
        const px = new Uint8Array(w * h * 4);
        gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);

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
}

const BASE = {
  data: DIAGONALS,
  getPath: d => d.path,
  getColor: [255, 180, 0] as [number, number, number],
  getWidth: 6,
  widthUnits: 'pixels' as const
};

describe('PathLayer#antialiasing', () => {
  test('produces continuous coverage, and survives PathStyleExtension offset', async () => {
    const container = createContainer();
    const device = await createTestDevice('webgl', container);
    const deck = createDeck(container, device);

    const off = await measure(deck, device, [
      new PathLayer({...BASE, id: 'off', antialiasing: false})
    ]);
    const on = await measure(deck, device, [
      new PathLayer({...BASE, id: 'on', antialiasing: true})
    ]);
    const onOffset = await measure(deck, device, [
      new PathLayer({
        ...BASE,
        id: 'on-offset',
        antialiasing: true,
        getOffset: 1,
        extensions: [new PathStyleExtension({offset: true})]
      })
    ]);

    // Sanity: all three actually drew something
    expect(off.solid, 'antialiasing:false drew strokes').toBeGreaterThan(1000);
    expect(on.solid, 'antialiasing:true drew strokes').toBeGreaterThan(1000);
    expect(onOffset.solid, 'offset stroke drew strokes').toBeGreaterThan(1000);

    // Analytic coverage is continuous; MSAA alone quantizes to its sample count. Observed ~20
    // levels off vs ~200 on, so 3x is a wide margin against driver differences in sample count.
    expect(
      on.levels,
      `antialiasing:true should produce far more distinct alpha levels than MSAA alone ` +
        `(off=${off.levels}, on=${on.levels})`
    ).toBeGreaterThan(off.levels * 3);

    // Regression guard for the varying-based implementation, which scaled the feather by
    // PathStyleExtension's inflated width and collapsed it to 1/offsetWidth of a pixel - measured
    // at 0.33x the normal feather for getOffset: 1. Deriving the scale from screen-space
    // derivatives instead keeps it close to the un-offset case. The extension hard-discards
    // outside the band, clipping the outer half of the ramp, so this does not reach 1.0.
    const featherRatio = onOffset.partial / on.partial;
    expect(
      featherRatio,
      `offset feather should not collapse (partial on=${on.partial}, ` +
        `onOffset=${onOffset.partial}, ratio=${featherRatio.toFixed(3)})`
    ).toBeGreaterThan(0.55);

    deck.finalize();
    removeContainer(container);
  });
});
