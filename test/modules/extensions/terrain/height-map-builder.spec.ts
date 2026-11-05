// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {HeightMapBuilder} from '@deck.gl/extensions/terrain/height-map-builder';
import {WebMercatorViewport, _GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {LifecycleTester} from '../utils';
import type {Device} from '@luma.gl/core';
import type {Layer} from '@deck.gl/core';

test('HeightMapBuilder projects preprojected bounds without reapplying transforms', () => {
  const viewport = new WebMercatorViewport({
    width: 400,
    height: 300,
    longitude: 0,
    latitude: 0,
    zoom: 0
  });
  const packedCrs = {id: 'packed'};
  const projectPosition = vi.fn((position: number[], _options: unknown) => position);
  const layer = {
    getBounds: () => [
      [-1, -1, -2],
      [1, 1, 3]
    ],
    state: {preproject: true, packedCrs},
    props: {},
    projectPosition
  } as unknown as Layer;
  const builder = new HeightMapBuilder({type: 'webgpu'} as Device);
  builder.shouldUpdate({layers: [layer], viewport});
  expect(projectPosition).toHaveBeenCalledTimes(10);
  for (const [, options] of projectPosition.mock.calls) {
    expect(options).toMatchObject({
      sourceCrs: packedCrs,
      modelMatrix: null,
      coordinateOrigin: [0, 0, 0]
    });
  }
  expect(builder.heightRange[0]).toBeLessThan(-2);
  expect(builder.heightRange[1]).toBeGreaterThan(3);
});

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

test('HeightMapBuilder#diffing#globe', async () => {
  const lifecycle = new LifecycleTester();
  const viewport = new GlobeViewport({
    width: 400,
    height: 300,
    longitude: -50,
    latitude: 0,
    zoom: 0
  });
  const terrainLayer = new ScatterplotLayer({
    data: [
      [-90, -40.97989806962013],
      [0, 0]
    ],
    getPosition: d => d
  });

  await lifecycle.update({viewport, layers: [terrainLayer]});

  const heightMap = new HeightMapBuilder(terrainLayer.context.device);
  expect(
    heightMap.shouldUpdate({layers: [terrainLayer], viewport}),
    'Height map needs update'
  ).toBeTruthy();
  expect(heightMap.bounds, 'Mercator bounds').toEqual([128, 192, 256, 256]);
  expect(heightMap.renderViewport instanceof WebMercatorViewport, 'Render viewport').toBeTruthy();

  heightMap.delete();
  lifecycle.finalize();
});
