import test from 'tape-promise/tape';

import CartoVectoTileLoader from '@deck.gl/carto/layers/schema/carto-vector-tile-loader';

// See test/modules/carto/responseToJson for details for creating test data
import binaryVectorTileData from '../data/binaryTilePolygon.json';
const BINARY_VECTOR_TILE = new Uint8Array(binaryVectorTileData).buffer;

test('Parse Carto Vector Tile', async t => {
  const {polygons} = CartoVectoTileLoader.parseSync(BINARY_VECTOR_TILE);
  t.deepEqual(polygons.positions.value.length, 2 * 151, 'Positions correctly decoded');
  t.deepEqual(polygons.globalFeatureIds.value.length, 151, 'globalFeatureIds correctly decoded');
  t.deepEqual(polygons.properties, [{DO_LABEL: 'Puerto Rico'}], 'Properites correctly decoded');
  t.deepEqual(polygons.fields, [{id: 31}], 'Fields correctly decoded');
  t.end();
});
