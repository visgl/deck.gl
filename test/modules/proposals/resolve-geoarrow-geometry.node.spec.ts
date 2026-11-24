// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {query} from '@loaders.gl/core/query';
import {Field, Null, Schema, Table, tableFromArrays} from 'apache-arrow';
import {expect, test} from 'vitest';
import {resolveGeoArrowGeometry} from '../../../modules/proposals/src/layers/resolve-geoarrow-geometry';

/** Builds a field with optional geometry metadata to exercise schema-only resolution. */
function field(name: string, extension?: string, key = 'ARROW:extension:name') {
  return new Field(name, new Null(), true, extension && new Map([[key, extension]]));
}

test('resolves geometry metadata on an empty table and honors explicit selection', () => {
  const data = new Table(
    new Schema([
      field('id'),
      field('points', 'geoarrow.point'),
      field('areas', 'geoarrow.multipolygon', 'ARROW:extension_name')
    ])
  );

  expect(data.numRows).toBe(0);
  expect(resolveGeoArrowGeometry(data)).toEqual({
    columnName: 'points',
    geometryType: 'geoarrow.point'
  });
  expect(resolveGeoArrowGeometry(data, 'areas')).toEqual({
    columnName: 'areas',
    geometryType: 'geoarrow.multipolygon'
  });
  expect(resolveGeoArrowGeometry(data, 'areas', 'geoarrow.polygon')).toEqual({
    columnName: 'areas',
    geometryType: 'geoarrow.polygon'
  });
});

test('resolves a geometry field consistently across record batches', () => {
  const first = tableFromArrays({geometry: [null]});
  const second = tableFromArrays({geometry: [null, null]});
  const data = first.concat(second);
  expect(data.batches).toHaveLength(2);
  for (const source of [data, ...data.batches]) {
    expect(resolveGeoArrowGeometry(source, 'geometry', 'geoarrow.linestring')).toEqual({
      columnName: 'geometry',
      geometryType: 'geoarrow.linestring'
    });
  }
});

test('reports missing fields and unsupported encodings', () => {
  const data = new Table(new Schema([field('geometry', 'geoarrow.box'), field('id')]));
  expect(() => resolveGeoArrowGeometry(data, 'missing')).toThrow('geometry column "missing"');
  expect(() => resolveGeoArrowGeometry(data)).toThrow('geoarrow.box');
  expect(() => resolveGeoArrowGeometry(data, 'id')).toThrow('untyped');
  expect(() => resolveGeoArrowGeometry(new Table())).toThrow('could not find');
});

test('resolves a geometry column after query projection and aliasing', async () => {
  const data = new Table(
    new Schema([field('centroid', 'geoarrow.point'), field('footprint', 'geoarrow.polygon')])
  );
  const projected = await query({select: [{column: 'footprint', as: 'boundary'}]}, {source: data});
  expect(resolveGeoArrowGeometry(projected)).toEqual({
    columnName: 'boundary',
    geometryType: 'geoarrow.polygon'
  });
});

test('prefers the declared GeoParquet primary geometry unless a column is selected', () => {
  const metadata = new Map([['geo', JSON.stringify({primary_column: 'footprint'})]]);
  const data = new Table(
    new Schema(
      [field('centroid', 'geoarrow.point'), field('footprint', 'geoarrow.polygon')],
      metadata
    )
  );
  expect(resolveGeoArrowGeometry(data).columnName).toBe('footprint');
  expect(resolveGeoArrowGeometry(data, 'centroid').columnName).toBe('centroid');
});
