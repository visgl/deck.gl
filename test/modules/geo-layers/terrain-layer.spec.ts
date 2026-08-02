// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {TerrainLayer, TileLayer} from '@deck.gl/geo-layers';
import {_GlobeView as GlobeView} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TerrainLoader} from '@loaders.gl/terrain';
import {
  MAX_LATITUDE as MAX_WEB_MERCATOR_LATITUDE,
  lngLatToWorld,
  worldToLngLat
} from '@math.gl/web-mercator';

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
  const sourcePositions = new Float32Array([0, 80, 0, 0.5, 40, 0, 1, 0, 0]);
  const sourceTexCoords = new Float32Array([0, 0, 0.5, 0.5, 1, 1]);
  const sourceTexture = {id: 'source-texture'};
  const tileSize = 512;
  const bbox = {west: 0, south: 0, east: 1, north: 80};
  const yPad = ((bbox.north - bbox.south) / tileSize) * 1;
  const overlappedSouth = bbox.south - yPad;
  const overlappedNorth = bbox.north + yPad;
  const expectedMiddleLatitude = worldToLngLat([
    0,
    (lngLatToMercatorWorldY(overlappedNorth) + lngLatToMercatorWorldY(overlappedSouth)) / 2
  ])[1];

  const sourceMesh = {
    attributes: {
      POSITION: {value: sourcePositions, size: 3},
      TEXCOORD_0: {value: sourceTexCoords, size: 2}
    }
  };
  const layer = new TerrainLayer({
    id: 'terrain-globe-mercator',
    elevationData: 'terrain/{z}/{x}/{y}.png',
    texture: 'texture/{z}/{x}/{y}.png',
    tileSize,
    fetch: (_url, context) =>
      Promise.resolve(context.propName === 'texture' ? sourceTexture : sourceMesh)
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

  const [mesh, texture] = await layer.getTiledTerrainData({
    index: {x: 0, y: 0, z: 1},
    id: '0-0-1',
    bbox,
    zoom: 1
  });
  const positions = mesh!.attributes.POSITION.value;

  expect(positions, 'remap copies the loader positions').not.toBe(sourcePositions);
  expect(mesh!.attributes.TEXCOORD_0.value, 'remap preserves source texture coordinates').toBe(
    sourceTexCoords
  );
  expect(texture, 'terrain surface texture is passed through').toBe(sourceTexture);
  expect(sourcePositions[1], 'source top row is unchanged').toBe(80);
  expect(sourcePositions[4], 'source middle row is unchanged').toBe(40);
  expect(sourcePositions[7], 'source bottom row is unchanged').toBe(0);

  expect(positions[1], 'top row latitude follows the overlapped tile north').toBeCloseTo(
    overlappedNorth,
    5
  );
  expect(positions[4], 'middle row uses Mercator latitude instead of linear latitude').toBeCloseTo(
    expectedMiddleLatitude,
    5
  );
  expect(positions[7], 'bottom row latitude follows the overlapped tile south').toBeCloseTo(
    overlappedSouth,
    5
  );
});

function lngLatToMercatorWorldY(latitude: number): number {
  const clampedLatitude = Math.max(
    -MAX_WEB_MERCATOR_LATITUDE,
    Math.min(MAX_WEB_MERCATOR_LATITUDE, latitude)
  );
  return lngLatToWorld([0, clampedLatitude])[1];
}
