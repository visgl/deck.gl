// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {convertGeoArrowGeometry} from '@loaders.gl/core/geoarrow';
import {Field, Schema, Table, tableFromArrays} from 'apache-arrow';
import {expect, test} from 'vitest';
import {
  makeGeoArrowFeatures,
  makeGeoArrowFeatureAccessor
} from '../../../modules/proposals/src/layers/geoarrow-feature-data';
import {resolveGeoArrowGeometry} from '../../../modules/proposals/src/layers/resolve-geoarrow-geometry';

/** Builds mixed geometry with a skipped row and styles spanning two record batches. */
function makeTable() {
  /** Geometry and style columns before tagging. */
  const rows = tableFromArrays({
    geometry: ['POINT (1 2)', null, 'MULTILINESTRING ((0 0, 1 1), (2 2, 3 3))'],
    width: [1, 2, 7]
  });
  /** The schema declares the source geometry encoding. */
  const schema = new Schema(
    rows.schema.fields.map(field =>
      field.name === 'geometry'
        ? new Field(
            field.name,
            field.type,
            true,
            new Map([['ARROW:extension:name', 'geoarrow.wkt']])
          )
        : field
    )
  );
  /** The original table with geometry metadata attached. */
  const table = new Table(schema, rows.batches);
  return table.slice(0, 2).concat(table.slice(2));
}

test.each(['geoarrow.wkt', 'geoarrow.wkb', 'geoarrow.geometry'] as const)(
  'preserves feature indices and styles when decoding %s',
  encoding => {
    const source = makeTable();
    const data = encoding === 'geoarrow.wkt' ? source : convertGeoArrowGeometry(source, encoding);
    const selected = resolveGeoArrowGeometry(data);
    expect(selected.geometryType).toBe(encoding);
    const features = makeGeoArrowFeatures(data, selected.columnName, selected.geometryType);
    expect(features.map(feature => feature.geometry.type)).toEqual(['Point', 'MultiLineString']);
    expect(features.map(feature => feature.properties.rowIndex)).toEqual([0, 2]);
    const width = makeGeoArrowFeatureAccessor(data, 'width', 1);
    expect(features.map(width)).toEqual([1, 7]);
    expect(data.get(features[1].properties.rowIndex)?.width).toBe(7);
  }
);

test('GeoArrowLayer picking returns the original row from decoded features', async () => {
  const {GeoArrowLayer} = await import('../../../modules/proposals/src/layers/geoarrow-layer');
  const data = makeTable();
  const features = makeGeoArrowFeatures(data, 'geometry', 'geoarrow.wkt');
  const layer = new GeoArrowLayer({id: 'test', data});
  layer.state = {features};
  const info = layer.getPickingInfo({
    info: {index: 1, object: features[1]} as Parameters<typeof layer.getPickingInfo>[0]['info'],
    mode: 'query',
    sourceLayer: layer
  });
  expect(info.index).toBe(2);
  expect(info.object.width).toBe(7);
});
