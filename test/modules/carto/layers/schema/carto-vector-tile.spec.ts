// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import CartoVectoTileLoader from '@deck.gl/carto/layers/schema/carto-vector-tile-loader';

// See test/modules/carto/responseToJson for details for creating test data
import binaryVectorTileData from '../../data/binaryTilePolygon.json';
import binaryNoTrianglesTileData from '../../data/binaryTilePolygonNoTri.json';
const BINARY_VECTOR_TILE = new Uint8Array(binaryVectorTileData).buffer;
const BINARY_VECTOR_TILE_NOTRI = new Uint8Array(binaryNoTrianglesTileData).buffer;

test('Parse Carto Vector Tile', async t => {
  const {polygons} = CartoVectoTileLoader.parseSync(BINARY_VECTOR_TILE);
  t.equal(polygons.positions.value.length, 2 * 151, 'Positions correctly decoded');
  t.equal(polygons.globalFeatureIds.value.length, 151, 'globalFeatureIds correctly decoded');
  t.deepEqual(polygons.properties, [{DO_LABEL: 'Puerto Rico'}], 'Properties correctly decoded');
  t.deepEqual(polygons.fields, [{id: 31}], 'Fields correctly decoded');
  t.end();
});

test('Carto Vector Tile triangulation', async t => {
  const {polygons} = CartoVectoTileLoader.parseSync(BINARY_VECTOR_TILE_NOTRI);
  t.equal(polygons.positions.value.length, 2 * 52, 'Positions correctly decoded');
  t.equal(polygons.globalFeatureIds.value.length, 52, 'globalFeatureIds correctly decoded');
  t.equal(
    polygons.numericProps.grossFloorAreaM2.value.length,
    52,
    'Numeric Properties correctly decoded'
  );
  t.ok(polygons.triangles, 'triangles array added');
  t.equal(polygons.triangles.value.length, 141, 'Polygons triangulated correctly');
  t.end();
});
