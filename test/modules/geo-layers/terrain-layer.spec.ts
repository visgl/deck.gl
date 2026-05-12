// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {TerrainLayer, TileLayer} from '@deck.gl/geo-layers';
import {_GlobeView as GlobeView} from '@deck.gl/core';
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
