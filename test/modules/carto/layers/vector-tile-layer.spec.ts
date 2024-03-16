import test from 'tape-promise/tape';
import {VectorTileLayer, vectorTableSource} from '@deck.gl/carto';
import {geojsonToBinary} from '@loaders.gl/gis';
import {testPickingLayer} from '../../layers/test-picking-layer';
import {WebMercatorViewport} from '@deck.gl/core';
import {withMockFetchMapsV3} from '../mock-fetch';

const geoJSONData = [
  {
    id: 1,
    type: 'Feature',
    geometry: {
      type: 'Point',
      // Unlike MVT, coordinates are not relative to the tile, but [lng, lat]
      coordinates: [-123, 45]
    },
    properties: {
      cartodb_id: 148
    }
  }
];

const geoJSONBinaryData = geojsonToBinary(JSON.parse(JSON.stringify(geoJSONData)));

test(`VectorTileLayer#picking`, async t => {
  await withMockFetchMapsV3(async () => {
    class TestVectorTileLayer extends VectorTileLayer {
      static readonly layerName = 'TestVectorTileLayer';
      async getTileData() {
        return geoJSONBinaryData;
      }
    }

    await testPickingLayer({
      layer: new TestVectorTileLayer({
        id: 'mvt',
        binary: true,
        data: vectorTableSource({
          accessToken: 'XXX',
          connectionName: 'carto_dw',
          tableName: 'carto-demo-data.demo_tables.test'
        }),
        uniqueIdProperty: 'cartodb_id',
        autoHighlight: true
      }),
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
            t.comment('hover over polygon');
            t.ok(info.object, 'info.object is populated');
            t.ok(info.object.properties, 'info.object.properties is populated');
            t.ok(info.object.geometry, 'info.object.geometry is populated');
            t.deepEqual(
              info.object.geometry.coordinates,
              [-123, 45],
              'picked coordinates are correct'
            );
            t.ok(
              subLayers.every(l => l.props.highlightedObjectIndex === 0),
              'set sub layers highlightedObjectIndex'
            );
          }
        },
        {
          pickedColor: new Uint8Array([0, 0, 0, 0]),
          pickedLayerId: '',
          mode: 'hover',
          onAfterUpdate: ({layer, subLayers, info}) => {
            t.comment('pointer leave');
            t.notOk(info.object, 'info.object is not populated');
            t.ok(
              subLayers.every(l => l.props.highlightedObjectIndex === -1),
              'cleared sub layers highlightedObjectIndex'
            );
          }
        }
      ]
    });
  }).catch(t.fail);

  t.end();
});
