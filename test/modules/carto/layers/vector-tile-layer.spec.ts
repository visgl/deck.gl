// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {vectorTableSource} from '@carto/api-client';
import {VectorTileLayer} from '@deck.gl/carto';
import {geojsonToBinary} from '@loaders.gl/gis';
import {testPickingLayer} from '../../layers/test-picking-layer';
import {WebMercatorViewport, _GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';
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

test('VectorTileLayer#MVT coordinates', async () => {
  // A polygon in tile (1, 0) at zoom 1, in [lng, lat] as MVTLoader returns it for 'wgs84'
  const polygon = geojsonToBinary([
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [10, 10],
            [20, 10],
            [20, 20],
            [10, 20],
            [10, 10]
          ]
        ]
      },
      properties: {cartodb_id: 1}
    }
  ]);

  for (const [viewport, coordinates] of [
    [new WebMercatorViewport({longitude: 0, latitude: 0, zoom: 1}), 'local'],
    [new GlobeViewport({longitude: 0, latitude: 0, zoom: 1}), 'wgs84']
  ] as const) {
    const mvtOptions: any[] = [];
    await withMockFetchMapsV3(async () => {
      const {tiles, ...tilejson} = await vectorTableSource({
        accessToken: 'XXX',
        connectionName: 'carto_dw',
        tableName: 'carto-demo-data.demo_tables.test'
      });
      const data = {
        ...tilejson,
        tiles: tiles.map(url => url.replace(/formatTiles=\w+/, 'formatTiles=mvt'))
      };
      await testLayerAsync({
        Layer: VectorTileLayer,
        viewport,
        testCases: [
          {
            props: {
              data,
              fetch: (url, {loadOptions}) => {
                mvtOptions.push(loadOptions.mvt);
                return polygon;
              }
            },
            onAfterUpdate: ({layer}) => {
              if (!layer.isLoaded) return;
              // autoLabels directly: the text layer does not load headless
              const tile = layer.state.tileset.selectedTiles.find(
                t => t.index.x === 1 && t.index.y === 0
              );
              const [, labels] = layer.renderSubLayers({
                ...layer.props,
                id: 'labels-test',
                autoLabels: true,
                data: polygon,
                tile
              });
              const labelCount = labels.props.data.points.positions.value.length;
              if (coordinates === 'wgs84') {
                expect(labelCount, 'a label for the WGS84 polygon').toBeGreaterThan(0);
              }
            }
          }
        ],
        onError: err => expect(err).toBeFalsy()
      });
    });

    expect(mvtOptions.length, 'tiles fetched').toBeGreaterThan(0);
    for (const options of mvtOptions) {
      expect(options.coordinates, 'mvt.coordinates').toBe(coordinates);
      expect(options.tileIndex, 'mvt.tileIndex').toBeTruthy();
    }
  }
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
