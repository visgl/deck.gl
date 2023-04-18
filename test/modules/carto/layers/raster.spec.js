import test from 'tape-promise/tape';

import CartoRasterTileLoader from '@deck.gl/carto/layers/schema/carto-raster-tile-loader';

// See test/modules/carto/responseToJson for details for creating test data
import binaryRasterTileData from '../data/binaryRasterTile.json'; // tile 487624ffffffffff
const BINARY_RASTER_TILE = new Uint8Array(binaryRasterTileData).buffer;

test('Parse Carto Raster Tile', async t => {
  const converted = CartoRasterTileLoader.parseSync(BINARY_RASTER_TILE, {});
  const {numericProps} = converted.cells;

  const {band_1} = numericProps;
  t.ok(band_1, 'band_1 found in data');
  t.ok(band_1.value instanceof Int16Array, 'band has correct type');
  t.equal(band_1.value.length, 65536, 'band has correct length');
  t.deepEqual(band_1.value.slice(123, 127), [180, 180, 181, 181], 'band correctly decoded');
  t.end();
});
