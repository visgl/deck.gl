// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {Deck, OrthographicView} from '@deck.gl/core';
import {LineLayer} from '@deck.gl/layers';
import {isRenderTestDeviceEnabled} from './render-test-suite';

const WIDTH = 240;
const HEIGHT = 180;

const LINES = [0, 1, 2, 3].map(index => ({
  sourcePosition: [-110, -70 + index * 42],
  targetPosition: [110, -64 + index * 51]
}));

type Coverage = {solid: number; partial: number; levels: number; minimumPartial: number};

async function measure(antialiasing: boolean): Promise<Coverage> {
  const container = document.createElement('div');
  container.style.cssText = `position:absolute;top:0;left:0;width:${WIDTH}px;height:${HEIGHT}px;`;
  document.body.appendChild(container);

  const device = await luma.createDevice({
    type: 'webgl',
    adapters: [webgl2Adapter],
    webgl: {antialias: false},
    createCanvasContext: {
      container,
      width: WIDTH,
      height: HEIGHT,
      useDevicePixels: false,
      autoResize: true
    }
  });

  const deck = new Deck({
    device,
    container,
    width: WIDTH,
    height: HEIGHT,
    useDevicePixels: false,
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0}
  });

  const coverage = await new Promise<Coverage>(resolve => {
    deck.setProps({
      layers: [
        new LineLayer({
          id: 'line-antialiasing',
          data: LINES,
          getColor: [20, 20, 20],
          getWidth: 2,
          widthUnits: 'pixels',
          antialiasing
        })
      ],
      onAfterRender: () => {
        const gl = (device as any).gl;
        const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
        gl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let solid = 0;
        let partial = 0;
        let minimumPartial = 255;
        const levels = new Set<number>();
        for (let index = 3; index < pixels.length; index += 4) {
          const alpha = pixels[index];
          if (alpha === 255) {
            solid++;
          } else if (alpha > 0) {
            partial++;
            minimumPartial = Math.min(minimumPartial, alpha);
            levels.add(alpha);
          }
        }
        resolve({solid, partial, levels: levels.size, minimumPartial});
      }
    });
  });

  deck.finalize();
  device.destroy();
  container.remove();
  return coverage;
}

describe.skipIf(!isRenderTestDeviceEnabled('webgl'))('LineLayer#antialiasing', () => {
  test('adds analytic coverage where the context provides none', async () => {
    const off = await measure(false);
    const on = await measure(true);

    expect(off.solid, 'lines were drawn').toBeGreaterThan(500);
    expect(off.partial, 'non-MSAA lines have hard edges by default').toBe(0);
    expect(on.partial, 'analytic antialiasing feathers the line edges').toBeGreaterThan(300);
    expect(on.levels, 'coverage is continuous').toBeGreaterThan(40);
    expect(on.minimumPartial, 'the full centered coverage ramp is rasterized').toBeLessThan(96);
  }, 60000);
});
