// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

import CartoRasterTileLoader from '@deck.gl/carto/layers/schema/carto-raster-tile-loader';

// See test/modules/carto/responseToJson for details for creating test data.
// raster: cartobq.public_account.temperature_raster_int8_new
// tile: 487624ffffffffff
import binaryRasterTileData from '../data/binaryRasterTile.json';
const BINARY_RASTER_TILE = new Uint8Array(binaryRasterTileData).buffer;

test('Parse Carto Raster Tile', async () => {
  const converted = CartoRasterTileLoader.parseSync(BINARY_RASTER_TILE, {
    cartoRasterTile: {metadata: {}}
  });
  const {numericProps} = converted.cells;

  const {band_1} = numericProps;
  expect(band_1, 'band_1 found in data').toBeTruthy();
  expect(band_1.value instanceof Uint8Array, 'band has correct type').toBeTruthy();
  expect(band_1.value.length, 'band has correct length').toBe(65536);
  expect(band_1.value.slice(123, 127), 'band correctly decoded').toEqual(
    new Uint8Array([35, 36, 36, 36])
  );
});
