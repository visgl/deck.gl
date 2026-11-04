// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {_GlobeViewport as GlobeViewport} from '@deck.gl/core';
import type {Texture} from '@luma.gl/core';
import {terrainModule} from '@deck.gl/extensions/terrain/shader-module';

test('terrain height-map bounds stay in absolute Mercator space for globe meter offsets', () => {
  const viewport = new GlobeViewport({
    width: 256,
    height: 256,
    longitude: 0,
    latitude: 60,
    zoom: 6
  });
  const texture = {} as Texture;
  const bounds: [number, number, number, number] = [250, 350, 252, 353];
  const uniforms = terrainModule.getUniforms({
    project: {viewport, coordinateSystem: 'meter-offsets', coordinateOrigin: [0, 60, 0]},
    dummyHeightMap: texture,
    heightMap: texture,
    heightMapBounds: bounds,
    drawToTerrainHeightMap: false,
    useTerrainHeightMap: true
  });
  expect(uniforms.bounds).toEqual([250, 350, 2, 3]);
});
