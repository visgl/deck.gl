import test from 'tape-promise/tape';
import {injectAccessToken, mergeBoundaryData} from '@deck.gl/carto/layers/utils';
import {Tile as PropertiesTile} from '/carto/layers/schema/carto-properties-tile';
import {Tile as VectorTile} from '@deck.gl/carto/layers/schema/carto-tile';

test('injectAccessToken', async t => {
  let loadOptions = {} as any;
  injectAccessToken(loadOptions, 'ACCESS-XXX');
  t.equal(loadOptions.fetch.headers.Authorization, 'Bearer ACCESS-XXX');

  loadOptions = {fetch: {headers: {Custom: 123}}};
  injectAccessToken(loadOptions, 'ACCESS-XXX');
  t.deepEqual(loadOptions.fetch.headers, {Authorization: 'Bearer ACCESS-XXX', Custom: 123});
  t.end();
});

test('mergeBoundaryData', async t => {
  const geometry: VectorTile = {
    points: {positions: {value: new Float32Array(), size: 2}} as any,
    lines: {positions: {value: new Float32Array(), size: 2}} as any,
    polygons: {
      positions: {
        value: new Float32Array([
          100, 0, 110, 0, 110, 10, 100, 10, 100, 0, 108, 8, 108, 2, 102, 2, 102, 8, 108, 8
        ]),
        size: 2
      },
      polygonIndices: {value: new Uint32Array([0, 10]), size: 1},
      primitivePolygonIndices: {value: new Uint32Array([0, 5, 10]), size: 1},
      properties: [{custom_id: 'a'}, {custom_id: 'b'}],
      numericProps: {},
      featureIds: {value: new Uint32Array([0, 1]), size: 1},
      globalFeatureIds: {value: new Uint32Array([31, 32]), size: 1},
      fields: [],
      triangles: {value: new Uint32Array([0, 1]), size: 1}
    }
  };

  const properties: PropertiesTile = {
    properties: [
      {custom_id: 'b', name: 'B'},
      {custom_id: 'a', name: 'A'}
    ],
    numericProps: {}
  };

  const merged = mergeBoundaryData(geometry, properties, 'custom_id');
  t.deepEqual(merged.polygons.properties, [
    {custom_id: 'a', name: 'A'},
    {custom_id: 'b', name: 'B'}
  ]);
  t.end();
});
