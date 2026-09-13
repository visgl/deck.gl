// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import CartoVectoTileLoader from '@deck.gl/carto/layers/schema/carto-vector-tile-loader';

// See test/modules/carto/responseToJson for details for creating test data
import binaryVectorTileData from '../../data/binaryTilePolygon.json';
import binaryNoTrianglesTileData from '../../data/binaryTilePolygonNoTri.json';
const BINARY_VECTOR_TILE = new Uint8Array(binaryVectorTileData).buffer;
const BINARY_VECTOR_TILE_NOTRI = new Uint8Array(binaryNoTrianglesTileData).buffer;

test('Parse Carto Vector Tile', async () => {
  const {polygons} = CartoVectoTileLoader.parseSync(BINARY_VECTOR_TILE);
  expect(polygons.positions.value.length, 'Positions correctly decoded').toBe(2 * 151);
  expect(polygons.globalFeatureIds.value.length, 'globalFeatureIds correctly decoded').toBe(151);
  expect(polygons.properties, 'Properties correctly decoded').toEqual([{DO_LABEL: 'Puerto Rico'}]);
  expect(polygons.fields, 'Fields correctly decoded').toEqual([{id: 31}]);
});

test('Carto Vector Tile triangulation', async () => {
  const {polygons} = CartoVectoTileLoader.parseSync(BINARY_VECTOR_TILE_NOTRI);
  expect(polygons.positions.value.length, 'Positions correctly decoded').toBe(2 * 52);
  expect(polygons.globalFeatureIds.value.length, 'globalFeatureIds correctly decoded').toBe(52);
  expect(
    polygons.numericProps.grossFloorAreaM2.value.length,
    'Numeric Properties correctly decoded'
  ).toBe(52);
  expect(polygons.triangles, 'triangles array added').toBeTruthy();
  expect(polygons.triangles.value.length, 'Polygons triangulated correctly').toBe(141);
});
