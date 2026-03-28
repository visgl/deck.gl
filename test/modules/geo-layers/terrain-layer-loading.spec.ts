// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {MapView} from '@deck.gl/core';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {testInitializeLayerAsync} from '@deck.gl/test-utils/vitest';
import {TruncatedConeGeometry} from '@luma.gl/engine';

function createDeferred() {
  let resolve;
  const promise = new Promise(r => {
    resolve = r;
  });
  return {promise, resolve};
}

function sleep(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

const TEST_VIEWPORT = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: 0, latitude: 0, zoom: 0}
});

function createTestMesh() {
  const mesh = new TruncatedConeGeometry({
    topRadius: 1,
    bottomRadius: 1,
    topCap: true,
    bottomCap: true,
    height: 5,
    nradial: 4,
    nvertical: 1
  });
  (mesh as any).header = {
    boundingBox: [
      [0, 0, 0],
      [1, 1, 1]
    ]
  };
  return mesh;
}

function createTestTexture() {
  return new ImageData(1, 1);
}

test('TerrainLayer#isLoaded waits for elevation and texture in single-terrain mode', async () => {
  const elevation = createDeferred();
  const texture = createDeferred();
  const fetchCalls: string[] = [];

  const layer = new TerrainLayer({
    id: 'terrain-single-loading',
    bounds: [-180, -85, 180, 85],
    elevationData: 'https://example.com/elevation.png',
    texture: 'https://example.com/texture.png',
    fetch: (_url, {propName}) => {
      fetchCalls.push(propName);
      return propName === 'texture' ? texture.promise : elevation.promise;
    }
  });

  const initPromise = testInitializeLayerAsync({
    layer,
    viewport: TEST_VIEWPORT,
    finalize: false
  });

  await sleep();
  expect(fetchCalls, 'started both single-terrain requests').toEqual(
    expect.arrayContaining(['elevationData', 'texture'])
  );
  expect(layer.isLoaded, 'single-terrain layer is pending initially').toBe(false);

  elevation.resolve(createTestMesh());
  await sleep();
  expect(layer.isLoaded, 'single-terrain layer waits for texture').toBe(false);

  texture.resolve(createTestTexture());
  const handle = await initPromise;
  expect(layer.isLoaded, 'single-terrain layer is loaded after both resources resolve').toBe(true);
  handle?.finalize();
});

test('TerrainLayer#isLoaded waits for elevation and texture in tiled mode', async () => {
  const elevation = createDeferred();
  const texture = createDeferred();
  const fetchCalls: string[] = [];

  const layer = new TerrainLayer({
    id: 'terrain-tiled-loading',
    elevationData: 'https://example.com/elevation/{z}/{x}/{y}.png',
    texture: 'https://example.com/texture/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 0,
    fetch: (_url, {propName}) => {
      fetchCalls.push(propName);
      return propName === 'texture' ? texture.promise : elevation.promise;
    }
  });

  const initPromise = testInitializeLayerAsync({
    layer,
    viewport: TEST_VIEWPORT,
    finalize: false
  });

  await sleep();
  expect(fetchCalls, 'started both tiled-terrain requests').toEqual(
    expect.arrayContaining(['elevationData', 'texture'])
  );
  expect(layer.isLoaded, 'tiled terrain layer is pending initially').toBe(false);

  elevation.resolve(createTestMesh());
  await sleep();
  expect(layer.isLoaded, 'tiled terrain layer waits for texture').toBe(false);

  texture.resolve(createTestTexture());
  const handle = await initPromise;
  expect(layer.isLoaded, 'tiled terrain layer is loaded after both resources resolve').toBe(true);
  handle?.finalize();
});
