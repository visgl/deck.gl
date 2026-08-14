// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {Deck, OrthographicView} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {isRenderTestDeviceEnabled} from './render-test-suite';

const WIDTH = 240;
const HEIGHT = 180;
const POINTS = [
  {position: [-75.25, -40.25, 0]},
  {position: [-18.25, 32.5, 0]},
  {position: [42.75, -22.5, 0]},
  {position: [83.5, 47.25, 0]}
];

type Coverage = {solid: number; partial: number; levels: number; tangentAlpha: number};

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
        new PointCloudLayer({
          id: 'point-cloud-antialiasing',
          data: POINTS,
          pointSize: 20,
          getColor: [20, 20, 20],
          antialiasing
        })
      ],
      onAfterRender: () => {
        const gl = (device as any).gl;
        const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
        gl.readPixels(0, 0, WIDTH, HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let solid = 0;
        let partial = 0;
        const levels = new Set<number>();
        for (let index = 3; index < pixels.length; index += 4) {
          const alpha = pixels[index];
          if (alpha === 255) {
            solid++;
          } else if (alpha > 0) {
            partial++;
            levels.add(alpha);
          }
        }
        // The first point is centered at framebuffer (44.75, 130.25). Its enclosing triangle's
        // left edge is tangent to the circle at x=24.75. Pixel (24, 130) is outside that edge and
        // is covered only when the triangle gets its AA envelope.
        const tangentAlpha = pixels[(130 * WIDTH + 24) * 4 + 3];
        resolve({solid, partial, levels: levels.size, tangentAlpha});
      }
    });
  });

  deck.finalize();
  device.destroy();
  container.remove();
  return coverage;
}

describe.skipIf(!isRenderTestDeviceEnabled('webgl'))('PointCloudLayer#antialiasing', () => {
  test('adds analytic coverage where the context provides none', async () => {
    const off = await measure(false);
    const on = await measure(true);

    expect(off.solid, 'points were drawn').toBeGreaterThan(4000);
    expect(off.partial, 'non-MSAA points have hard edges by default').toBe(0);
    expect(on.partial, 'analytic antialiasing feathers circular edges').toBeGreaterThan(300);
    expect(on.levels, 'coverage is continuous').toBeGreaterThan(40);
    expect(on.tangentAlpha, 'coverage extends past the triangle tangent').toBeGreaterThan(0);
    expect(on.tangentAlpha, 'the tangent sample is on the outer half of the ramp').toBeLessThan(
      128
    );
  }, 60000);
});
