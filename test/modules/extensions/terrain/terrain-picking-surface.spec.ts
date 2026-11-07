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

webglTest('TerrainPickingSurface#covers its bounds up to the corners', () => {
  const size = 512;
  const viewport = new WebMercatorViewport({
    width: size,
    height: size,
    longitude: 8,
    latitude: 46.5,
    zoom: 12
  });
  const [x, y] = viewport.center;
  const halfSize = size / 2 / viewport.scale;
  const bounds: Bounds = [x - halfSize, y - halfSize, x + halfSize, y + halfSize];

  const surface = new TerrainPickingSurface(device);
  surface.setBounds(bounds);
  const pickingCover = surface.getPickingCover(size, size);
  device.beginRenderPass({framebuffer: pickingCover, clearColor: [1, 0, 0, 1]}).end();
  // Known elevation of 0 m everywhere
  const heightMap = createRenderTarget(device, {id: 'height-map', float: true});
  device.beginRenderPass({framebuffer: heightMap, clearColor: [0, 0, 0, 1]}).end();
  const target = device.createFramebuffer({
    width: size,
    height: size,
    colorAttachments: ['rgba8unorm']
  });

  try {
    const renderPass = device.beginRenderPass({framebuffer: target, clearColor: [0, 0, 0, 0]});
    surface.draw({
      renderPass,
      parameters: {viewport: [0, 0, size, size]},
      project: {viewport, devicePixelRatio: 1},
      heightMap: heightMap.colorAttachments[0].texture
    });
    renderPass.end();

    const corners = [
      [0, 0],
      [size - 1, 0],
      [0, size - 1],
      [size - 1, size - 1]
    ].map(([cornerX, cornerY]) =>
      Array.from(
        device.readPixelsToArrayWebGL(target, {
          sourceX: cornerX,
          sourceY: cornerY,
          sourceWidth: 1,
          sourceHeight: 1
        })
      )
    );
    expect(corners, 'Picking colors in every corner').toEqual(
      Array.from({length: 4}, () => [255, 0, 0, 255])
    );
  } finally {
    surface.delete();
    heightMap.colorAttachments[0].destroy();
    heightMap.destroy();
    target.destroy();
  }
});
