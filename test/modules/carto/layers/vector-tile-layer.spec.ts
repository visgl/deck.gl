// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {vectorTableSource} from '@carto/api-client';
import {VectorTileLayer} from '@deck.gl/carto';
import {geojsonToBinary} from '@loaders.gl/gis';
import {testPickingLayer} from '../../layers/test-picking-layer';
import {WebMercatorViewport} from '@deck.gl/core';
import {withMockFetchMapsV3} from '../mock-fetch';

test(`VectorTileLayer#picking`, async () => {
  await withMockFetchMapsV3(async () => {
    await testPickingLayer({
      // CARTO binary tile coordinates are [lng, lat], not tile-relative like MVT.
      layer: createTestVectorTileLayer([-123, 45], 'binary'),
      viewport: new WebMercatorViewport({
        latitude: 0,
        longitude: 0,
        zoom: 1
      }),
      testCases: [
        {
          pickedColor: new Uint8Array([1, 0, 0, 0]),
          pickedLayerId: 'mvt-0-0-1-points-circle',
          mode: 'hover',
          onAfterUpdate: ({layer, subLayers, info}) => {
            console.log('hover over polygon');
            expect(info.object, 'info.object is populated').toBeTruthy();
            expect(info.object.properties, 'info.object.properties is populated').toBeTruthy();
            expect(info.object.geometry, 'info.object.geometry is populated').toBeTruthy();
            expect(info.object.geometry.coordinates, 'picked coordinates are correct').toEqual([
              -123, 45
            ]);
            expect(
              subLayers.every(l => l.props.highlightedObjectIndex === 0),
              'set sub layers highlightedObjectIndex'
            ).toBeTruthy();
          }
        },
        {
          pickedColor: new Uint8Array([0, 0, 0, 0]),
          pickedLayerId: '',
          mode: 'hover',
          onAfterUpdate: ({layer, subLayers, info}) => {
            console.log('pointer leave');
            expect(info.object, 'info.object is not populated').toBeFalsy();
            expect(
              subLayers.every(l => l.props.highlightedObjectIndex === -1),
              'cleared sub layers highlightedObjectIndex'
            ).toBeTruthy();
          }
        }
      ]
    });
  }).catch(e => {
    throw e;
  });
});

test(`VectorTileLayer#pickingMVT`, async () => {
  await withMockFetchMapsV3(async () => {
    await testPickingLayer({
      // MVT tile coordinates are tile-relative.
      layer: createTestVectorTileLayer([0.2, 0.5], 'mvt'),
      viewport: new WebMercatorViewport({
        latitude: 0,
        longitude: 0,
        zoom: 1
      }),
      testCases: [
        {
          pickedColor: new Uint8Array([1, 0, 0, 0]),
          pickedLayerId: 'mvt-0-0-1-points-circle',
          mode: 'hover',
          onAfterUpdate: ({layer, subLayers, info}) => {
            console.log('hover over polygon');
            expect(info.object, 'info.object is populated').toBeTruthy();
            expect(info.object.properties, 'info.object.properties is populated').toBeTruthy();
            expect(info.object.geometry, 'info.object.geometry is populated').toBeTruthy();
            expect(
              info.object.geometry.coordinates.map(Math.round),
              'picked coordinates are correct'
            ).toEqual([-144, 67]);
            expect(
              subLayers.every(l => l.props.highlightedObjectIndex === 0),
              'set sub layers highlightedObjectIndex'
            ).toBeTruthy();
          }
        },
        {
          pickedColor: new Uint8Array([0, 0, 0, 0]),
          pickedLayerId: '',
          mode: 'hover',
          onAfterUpdate: ({layer, subLayers, info}) => {
            console.log('pointer leave');
            expect(info.object, 'info.object is not populated').toBeFalsy();
            expect(
              subLayers.every(l => l.props.highlightedObjectIndex === -1),
              'cleared sub layers highlightedObjectIndex'
            ).toBeTruthy();
          }
        }
      ]
    });
  }).catch(e => {
    throw e;
  });
});

function createTestVectorTileLayer(
  coordinates: [number, number],
  format: 'binary' | 'mvt'
): VectorTileLayer {
  const geoJSONData = [
    {
      id: 1,
      type: 'Feature',
      geometry: {type: 'Point', coordinates},
      properties: {cartodb_id: 148}
    }
  ];

  const geoJSONBinaryData = geojsonToBinary(JSON.parse(JSON.stringify(geoJSONData)));

  class TestVectorTileLayer extends VectorTileLayer {
    static readonly layerName = 'TestVectorTileLayer';
    async getTileData() {
      return geoJSONBinaryData;
    }
  }

  // Override ?formatTiles to test both MVT and binary tiles.
  const data = vectorTableSource({
    accessToken: 'XXX',
    connectionName: 'carto_dw',
    tableName: 'carto-demo-data.demo_tables.test'
  }).then(({tiles, ...rest}) => ({
    ...rest,
    tiles: tiles.map(url => url.replace(/formatTiles=\w+/, `formatTiles=${format}`))
  }));

  return new TestVectorTileLayer({
    id: 'mvt',
    binary: true,
    data,
    uniqueIdProperty: 'cartodb_id',
    autoHighlight: true
  });
}
