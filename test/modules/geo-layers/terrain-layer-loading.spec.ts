// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {COORDINATE_SYSTEM, MapView, _GlobeView as GlobeView, type Viewport} from '@deck.gl/core';
import {
  TerrainLayer,
  _SharedTile2DLayer as SharedTile2DLayer,
  _SharedTileset2D as SharedTileset2D,
  _TerrainSource as TerrainSource,
  sharedTile2DDeckAdapter
} from '@deck.gl/geo-layers';
import type {_TerrainTileData as TerrainTileData} from '@deck.gl/geo-layers';
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

const TEST_GLOBE_VIEWPORT = new GlobeView().makeViewport({
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

function createNormalizedTestTerrainMesh() {
  return {
    header: {
      vertexCount: 3,
      boundingBox: [
        [0, 0, 0],
        [1, 1, 2]
      ]
    },
    mode: 4,
    indices: {value: new Uint32Array([0, 1, 2]), size: 1},
    attributes: {
      POSITION: {value: new Float32Array([0, 0, 0, 1, 0, 1, 0, 1, 2]), size: 3},
      TEXCOORD_0: {value: new Float32Array([0, 0, 1, 0, 0, 1]), size: 2}
    }
  };
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

test('TerrainLayer renders tiled Martini meshes in lng/lat coordinates on GlobeView', async () => {
  const layer = new TerrainLayer({
    id: 'terrain-tiled-globe',
    elevationData: 'https://example.com/elevation/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 0,
    fetch: () => Promise.resolve(createTestMesh())
  });

  const handle = await testInitializeLayerAsync({
    layer,
    viewport: TEST_GLOBE_VIEWPORT,
    finalize: false
  });

  const tileLayer = layer.getSubLayers()[0];
  const meshLayer = tileLayer.getSubLayers()[0];
  expect(meshLayer.props.coordinateSystem, 'Globe terrain mesh uses lng/lat').toBe(
    COORDINATE_SYSTEM.LNGLAT
  );
  handle?.finalize();
});

test('TerrainLayer shares terrain source payloads and projection meshes through _SharedTileset2D', async () => {
  const fetchCalls: string[] = [];
  let sourceTerrainBounds: number[] | undefined;
  const source = new TerrainSource({
    elevationData: 'https://example.com/elevation/{z}/{x}/{y}.png',
    fetch: (_url, {loadOptions, propName}) => {
      fetchCalls.push(propName);
      sourceTerrainBounds = loadOptions?.terrain?.bounds;
      return Promise.resolve(createNormalizedTestTerrainMesh());
    }
  });
  const terrainTileset = SharedTileset2D.fromTileSource<TerrainTileData, Viewport>(source, {
    adapter: sharedTile2DDeckAdapter,
    minZoom: 0,
    maxZoom: 0
  });
  const handles: Array<{finalize: () => void} | undefined> = [];

  try {
    const mapLayer = new TerrainLayer({
      id: 'shared-terrain-map-a',
      _terrainTileset: terrainTileset,
      color: [255, 0, 0]
    });
    handles.push(
      await testInitializeLayerAsync({
        layer: mapLayer,
        viewport: TEST_VIEWPORT,
        finalize: false
      })
    );

    const mapTileLayer = mapLayer.getSubLayers()[0];
    expect(mapTileLayer).toBeInstanceOf(SharedTile2DLayer);
    const mapMeshLayer = mapTileLayer.getSubLayers()[0];
    const tileData = terrainTileset.tiles[0].content!;
    const mapMesh = mapMeshLayer.props.mesh;

    expect(fetchCalls).toEqual(['elevationData']);
    expect(sourceTerrainBounds).toEqual([0, 0, 1, 1]);
    expect(tileData.renderMeshes.size).toBe(1);
    expect(terrainTileset.cacheByteSize).toBe(tileData.byteLength);

    const secondMapLayer = new TerrainLayer({
      id: 'shared-terrain-map-b',
      _terrainTileset: terrainTileset,
      color: [0, 255, 0]
    });
    handles.push(
      await testInitializeLayerAsync({
        layer: secondMapLayer,
        viewport: TEST_VIEWPORT,
        finalize: false
      })
    );

    const secondMapMeshLayer = secondMapLayer.getSubLayers()[0].getSubLayers()[0];
    expect(fetchCalls).toEqual(['elevationData']);
    expect(secondMapMeshLayer.props.mesh).toBe(mapMesh);
    expect(secondMapMeshLayer.props.getColor).toEqual([0, 255, 0]);

    const globeLayer = new TerrainLayer({
      id: 'shared-terrain-globe',
      _terrainTileset: terrainTileset
    });
    handles.push(
      await testInitializeLayerAsync({
        layer: globeLayer,
        viewport: TEST_GLOBE_VIEWPORT,
        finalize: false
      })
    );

    const globeMeshLayer = globeLayer.getSubLayers()[0].getSubLayers()[0];
    expect(fetchCalls).toEqual(['elevationData']);
    expect(globeMeshLayer.props.mesh).not.toBe(mapMesh);
    expect(globeMeshLayer.props.coordinateSystem).toBe(COORDINATE_SYSTEM.LNGLAT);
    expect(tileData.renderMeshes.size).toBe(2);
    expect(terrainTileset.cacheByteSize).toBe(tileData.byteLength);
  } finally {
    for (const handle of handles) {
      handle?.finalize();
    }
    terrainTileset.finalize();
  }
});
