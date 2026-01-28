// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {HeightMapBuilder} from '@deck.gl/extensions/terrain/height-map-builder';
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {LifecycleTester} from '../utils';

test('HeightMapBuilder#diffing', async () => {
  const lifecycle = new LifecycleTester();
  let viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 0
  });
  let terrainLayer = new ScatterplotLayer();

  await lifecycle.update({viewport, layers: [terrainLayer]});

  const heightMap = new HeightMapBuilder(terrainLayer.context.device);

  expect(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map should not require update'
  ).toBeFalsy();
  expect(heightMap.renderViewport, 'renderViewport is disabled').toBeFalsy();

  terrainLayer = new ScatterplotLayer({
    data: [
      [-90, -40.97989806962013],
      [0, 0]
    ],
    getPosition: d => d
  });
  await lifecycle.update({viewport, layers: [terrainLayer]});

  expect(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map needs update (bounds changed)'
  ).toBeTruthy();
  expect(heightMap.bounds, 'Cartesian bounds').toEqual([128, 192, 256, 256]);
  expect(heightMap.renderViewport, 'renderViewport is populated').toBeTruthy();

  expect(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map should not require update'
  ).toBeFalsy();

  viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 1
  });
  expect(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map needs update (viewport changed)'
  ).toBeTruthy();

  heightMap.delete();
  lifecycle.finalize();
});
