// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {TerrainLayer, TileLayer} from '@deck.gl/geo-layers';
import {WebMercatorViewport, _GlobeView as GlobeView} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TerrainLoader} from '@loaders.gl/terrain';

test('TerrainLayer', async () => {
  const testCases = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      texture: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw',
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof TileLayer, 'rendered TileLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({Layer: TerrainLayer, testCases, onError: err => expect(err).toBeFalsy()});

  const testCasesNonTiled = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/1/0/0.png',
      bounds: [-180, 85, 0, 0],
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof SimpleMeshLayer, 'rendered SimpleMeshLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({
    Layer: TerrainLayer,
    testCases: testCasesNonTiled,
    onError: err => expect(err).toBeFalsy()
  });
});

test('TerrainLayer#separate elevation and texture zooms', async () => {
  const urls: string[] = [];
  const layer = new TerrainLayer({
    id: 'terrain',
    elevationData: 'terrain/{z}/{x}/{y}.png',
    texture: 'texture/{z}/{x}/{y}.png',
    maxZoom: 12,
    meshMaxZoom: 11,
    fetch: url => {
      urls.push(url);
      return Promise.resolve(null);
    }
  });
  layer.context = {
    viewport: new WebMercatorViewport({
      width: 512,
      height: 512,
      longitude: 0,
      latitude: 0,
      zoom: 12
    })
  };

  layer.state = {isTiled: true};
  const tileLayer = layer.renderLayers() as TileLayer;
  expect(tileLayer.props.maxZoom, 'TileLayer maxZoom uses meshMaxZoom').toBe(11);

  await layer.getTiledTerrainData({
    index: {x: 1, y: 2, z: 11},
    id: '1-2-11',
    bbox: {west: 0, south: 0, east: 1, north: 1},
    zoom: 11
  });

  expect(urls, 'loads elevation at mesh zoom and texture at maxZoom by default').toEqual([
    'terrain/11/1/2.png',
    'texture/12/2/4.png',
    'texture/12/3/4.png',
    'texture/12/2/5.png',
    'texture/12/3/5.png'
  ]);
});

test('TerrainLayer#limits stitched texture tile fanout', async () => {
  const urls: string[] = [];
  const layer = new TerrainLayer({
    id: 'terrain',
    elevationData: 'terrain/{z}/{x}/{y}.png',
    texture: 'texture/{z}/{x}/{y}.png',
    meshMaxZoom: 13,
    textureMaxZoom: 21,
    fetch: url => {
      urls.push(url);
      return Promise.resolve(null);
    }
  });
  layer.context = {
    viewport: new WebMercatorViewport({
      width: 512,
      height: 512,
      longitude: 0,
      latitude: 0,
      zoom: 21
    })
  };
  layer.state = {isTiled: true};

  await layer.getTiledTerrainData({
    index: {x: 1, y: 2, z: 13},
    id: '1-2-13',
    bbox: {west: 0, south: 0, east: 1, north: 1},
    zoom: 13
  });

  expect(urls[0], 'loads elevation at mesh zoom').toBe('terrain/13/1/2.png');
  expect(urls.slice(1), 'limits texture stitching to 4x4 children').toHaveLength(16);
  expect(urls[1], 'texture child zoom is capped relative to mesh zoom').toBe('texture/15/4/8.png');
});

test('TerrainLayer#globe remaps WebMercator tile rows to lng/lat mesh positions', async () => {
  const sourceMesh = {
    attributes: {
      POSITION: {value: new Float32Array([0, 80, 0, 0.5, 40, 0, 1, 0, 0]), size: 3},
      TEXCOORD_0: {value: new Float32Array([0, 0, 0.5, 0.5, 1, 1]), size: 2}
    }
  };
  const layer = new TerrainLayer({
    id: 'terrain-globe-mercator',
    elevationData: 'terrain/{z}/{x}/{y}.png',
    fetch: () => Promise.resolve(sourceMesh)
  });
  layer.context = {
    viewport: new GlobeView().makeViewport({
      width: 512,
      height: 512,
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      }
    })
  };
  layer.state = {isTiled: true};

  const [mesh] = await layer.getTiledTerrainData({
    index: {x: 0, y: 0, z: 1},
    id: '0-0-1',
    bbox: {west: 0, south: 0, east: 1, north: 80},
    zoom: 1
  });
  const positions = mesh.attributes.POSITION.value;

  expect(positions[1], 'top row latitude is preserved').toBeGreaterThan(80);
  expect(
    positions[4],
    'middle row uses Mercator latitude instead of linear latitude'
  ).toBeGreaterThan(40);
  expect(positions[7], 'bottom row latitude is preserved').toBeLessThan(0);
});
