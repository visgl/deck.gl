// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {WebMercatorViewport} from '@deck.gl/core';
import {TerrainPickingSurface} from '@deck.gl/extensions/terrain/terrain-picking-surface';
import {createRenderTarget} from '@deck.gl/extensions/terrain/utils';
import {device} from '@deck.gl/test-utils/vitest';

import type {Bounds} from '@deck.gl/extensions/utils/projection-utils';

const webglTest = device.type === 'webgl' ? test : test.skip;

const SIZE = 512;
const CORNERS = [
  [0, 0],
  [SIZE - 1, 0],
  [0, SIZE - 1],
  [SIZE - 1, SIZE - 1]
];
const VIEWS = [
  {longitude: 8, latitude: 46.5, zoom: 12},
  // Where neighboring float32 longitudes lie about 45 pixels apart
  {longitude: -122.4, latitude: 37.8, zoom: 22}
];

/**
 * Draws the surface over the view, showing a red picking cover on a height map of 0 m, and
 * returns the colors of the given pixels
 */
function drawSurface(
  view: (typeof VIEWS)[number],
  {elevationKnown, pixels}: {elevationKnown: boolean; pixels: number[][]}
): number[][] {
  const viewport = new WebMercatorViewport({width: SIZE, height: SIZE, ...view});
  const [x, y] = viewport.center;
  const halfSize = SIZE / 2 / viewport.scale;
  const bounds: Bounds = [x - halfSize, y - halfSize, x + halfSize, y + halfSize];

  const surface = new TerrainPickingSurface(device);
  surface.setBounds(bounds);
  const pickingCover = surface.getPickingCover(SIZE, SIZE);
  device.beginRenderPass({framebuffer: pickingCover, clearColor: [1, 0, 0, 1]}).end();
  const heightMap = createRenderTarget(device, {id: 'height-map', float: true});
  device
    .beginRenderPass({framebuffer: heightMap, clearColor: [0, 0, 0, elevationKnown ? 1 : 0]})
    .end();
  const target = device.createFramebuffer({
    width: SIZE,
    height: SIZE,
    colorAttachments: ['rgba8unorm']
  });

  try {
    const renderPass = device.beginRenderPass({framebuffer: target, clearColor: [0, 0, 0, 0]});
    surface.draw({
      renderPass,
      parameters: {viewport: [0, 0, SIZE, SIZE]},
      project: {viewport, devicePixelRatio: 1},
      heightMap: heightMap.colorAttachments[0].texture
    });
    renderPass.end();

    return pixels.map(([pixelX, pixelY]) =>
      Array.from(
        device.readPixelsToArrayWebGL(target, {
          sourceX: pixelX,
          sourceY: pixelY,
          sourceWidth: 1,
          sourceHeight: 1
        })
      )
    );
  } finally {
    surface.delete();
    heightMap.colorAttachments[0].destroy();
    heightMap.destroy();
    target.destroy();
  }
}

for (const view of VIEWS) {
  webglTest(
    `TerrainPickingSurface#covers its bounds up to the corners at zoom ${view.zoom}`,
    () => {
      const corners = drawSurface(view, {elevationKnown: true, pixels: CORNERS});
      expect(corners, 'Picking colors in every corner').toEqual(
        Array.from({length: 4}, () => [255, 0, 0, 255])
      );
    }
  );
}

webglTest('TerrainPickingSurface#picks nothing where the elevation is unknown', () => {
  const pixels = drawSurface(VIEWS[0], {
    elevationKnown: false,
    pixels: [[SIZE / 2, SIZE / 2], ...CORNERS]
  });
  expect(pixels, 'No picking colors').toEqual(Array.from({length: 5}, () => [0, 0, 0, 0]));
});
