// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  convertGeoArrowGeometry,
  convertGeoArrowVectorCellToGeoJSON
} from '@loaders.gl/core/geoarrow';
import {POSTGIS_SPATIAL_FUNCTIONS} from '@math.gl/geospatial/st-functions';
import {Field, Schema, Table, Utf8, tableFromArrays, vectorFromArray} from 'apache-arrow';
import {expect, test} from 'vitest';
import {evaluateAccessorQueries} from '../../../modules/core/src/arrow/accessor-queries';

test('spatial SQL accessors preserve source row order and geometry field metadata', () => {
  const rows = tableFromArrays({
    footprint: vectorFromArray(['POLYGON ((0 0, 8 0, 8 4, 0 4, 0 0))', null], new Utf8())
  });
  const field = new Field(
    'footprint',
    rows.schema.fields[0].type,
    true,
    new Map([
      ['ARROW:extension:name', 'geoarrow.wkt'],
      ['ARROW:extension:metadata', JSON.stringify({crs: 'EPSG:4326'})]
    ])
  );
  const source = convertGeoArrowGeometry(
    new Table(new Schema([field]), rows.batches),
    'geoarrow.wkb'
  );
  const {table} = evaluateAccessorQueries(
    source,
    {
      centroid: 'ST_Centroid(footprint)',
      anchor: 'ST_PointOnSurface(footprint)',
      bounds: 'ST_Envelope(footprint)'
    },
    undefined,
    undefined,
    POSTGIS_SPATIAL_FUNCTIONS
  );

  expect(table.numRows).toBe(2);
  for (const resultField of table.schema.fields) {
    expect(resultField.metadata.get('ARROW:extension:name')).toBe('geoarrow.wkb');
    expect(JSON.parse(resultField.metadata.get('ARROW:extension:metadata')!).crs).toBe('EPSG:4326');
    expect(table.getChild(resultField.name)?.get(1)).toBeNull();
  }
  expect(
    convertGeoArrowVectorCellToGeoJSON(table.getChild('centroid')!, 0, 'geoarrow.wkb')
  ).toEqual({
    type: 'Point',
    coordinates: [4, 2]
  });
  expect(
    convertGeoArrowVectorCellToGeoJSON(table.getChild('anchor')!, 0, 'geoarrow.wkb')
  ).toMatchObject({
    type: 'Point'
  });
  expect(
    convertGeoArrowVectorCellToGeoJSON(table.getChild('bounds')!, 0, 'geoarrow.wkb')
  ).toMatchObject({
    type: 'Polygon'
  });
});
