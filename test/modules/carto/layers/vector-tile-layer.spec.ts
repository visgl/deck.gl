// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {vectorTableSource} from '@carto/api-client';
import {VectorTileLayer} from '@deck.gl/carto';
import {PathLayer, SolidPolygonLayer} from '@deck.gl/layers';
import type {Feature} from 'geojson';
import {geojsonToBinary} from '@loaders.gl/gis';
import {testPickingLayer} from '../../layers/test-picking-layer';
import {WebMercatorViewport} from '@deck.gl/core';
import {withMockFetchMapsV3} from '../mock-fetch';

test('VectorTileLayer preserves binary geometry and picking when the viewport requests subdivision', async () => {
  class SubdividingViewport extends WebMercatorViewport {
    getSubdivisionStep(): number {
      return 1;
    }
  }
  await withMockFetchMapsV3(async () => {
    await testPickingLayer({
      layer: createTestVectorTileLayer([-123, 45], 'binary', [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [-120, 40],
              [-100, 40]
            ]
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-120, 40],
                [-100, 40],
                [-100, 60],
                [-120, 60],
                [-120, 40]
              ]
            ]
          }
        }
      ]),
      viewport: new SubdividingViewport({longitude: 0, latitude: 0, zoom: 1}),
      testCases: [
        {
          pickedColor: new Uint8Array([1, 0, 0, 0]),
          pickedLayerId: 'mvt-0-0-1-points-circle',
          mode: 'hover',
          onAfterUpdate: ({layer, info}) => {
            expect(layer.getSubdivisionStep()).toBe(1);
            const children = layer.context.layerManager.layers;
            const paths = children.filter(child => child instanceof PathLayer);
            const polygons = children.filter(child => child instanceof SolidPolygonLayer);
            expect(paths.length).toBeGreaterThan(0);
            expect(polygons.length).toBeGreaterThan(0);
            for (const path of paths) {
              expect(path.getSubdivisionStep()).toBe(1);
              expect(path.props._pathType).toBe('open');
              const positions = path.props.data.attributes.getPath;
              expect(path.state.pathTesselator.instanceCount).toBe(
                positions.value.length / positions.size
              );
            }
            for (const polygon of polygons) {
              expect(polygon.getSubdivisionStep()).toBe(1);
              expect(polygon.props._normalize).toBe(false);
              const {getPolygon, indices} = polygon.props.data.attributes;
              expect(polygon.state.polygonTesselator.instanceCount).toBe(
                getPolygon.value.length / getPolygon.size
              );
              expect(polygon.getAttributeManager()!.attributes.indices.value).toEqual(indices);
            }
            expect(layer.state.binary).toBe(true);
            expect(info.object.geometry.coordinates).toEqual([-123, 45]);
          }
        }
      ]
    });
  });
});

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
  format: 'binary' | 'mvt',
  additionalFeatures: Feature[] = []
): VectorTileLayer {
  const geoJSONData = [
    {
      id: 1,
      type: 'Feature',
      geometry: {type: 'Point', coordinates},
      properties: {cartodb_id: 148}
    }
  ];

  const geoJSONBinaryData = geojsonToBinary(
    JSON.parse(JSON.stringify([...geoJSONData, ...additionalFeatures]))
  );

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
