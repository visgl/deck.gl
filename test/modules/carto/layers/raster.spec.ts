import test from 'tape-promise/tape';

import CartoRasterTileLoader from '@deck.gl/carto/layers/schema/carto-raster-tile-loader';

// See test/modules/carto/responseToJson for details for creating test data.
// raster: cartobq.public_account.temperature_raster_int8_new
// tile: 487624ffffffffff
import binaryRasterTileData from '../data/binaryRasterTile.json';
const BINARY_RASTER_TILE = new Uint8Array(binaryRasterTileData).buffer;

test('Parse Carto Raster Tile', async t => {
  const converted = CartoRasterTileLoader.parseSync(BINARY_RASTER_TILE, {});
  const {numericProps} = converted.cells;

  const {band_1} = numericProps;
  t.ok(band_1, 'band_1 found in data');
  t.ok(band_1.value instanceof Uint8Array, 'band has correct type');
  t.equal(band_1.value.length, 65536, 'band has correct length');
  t.deepEqual(
    band_1.value.slice(123, 127),
    new Uint8Array([35, 36, 36, 36]),
    'band correctly decoded'
  );
  t.end();
});
