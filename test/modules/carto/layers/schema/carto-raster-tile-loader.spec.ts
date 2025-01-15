// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import CartoRasterTileLoader from '@deck.gl/carto/layers/schema/carto-raster-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';
import {BAND, COMPRESSED_BAND, TEST_DATA} from './carto-raster-tile.spec';

test('CartoRasterTileLoader', t => {
  const loader = CartoRasterTileLoader as LoaderWithParser;

  t.ok(loader, 'CartoRasterTileLoader should be defined');
  t.equals(loader.name, 'CARTO Raster Tile', 'Should have correct name');
  t.equals(typeof loader.parse, 'function', 'Should have parse method');
  t.equals(typeof loader.parseSync, 'function', 'Should have parseSync method');
  t.equals(CartoRasterTileLoader.worker, true, 'worker property should be true');

  const result = loader.parseSync!(TEST_DATA, {cartoRasterTile: {metadata: {compression: null}}});
  t.equals(result.blockSize, 256, 'Should return correct blockSize');
  t.ok(result.cells, 'Should return cells');
  t.ok(result.cells.numericProps, 'Should return numericProps');
  t.deepEqual(
    result.cells.numericProps.band1.value,
    COMPRESSED_BAND,
    'Should return compressed band'
  );

  // Repeat with compressed data
  const result2 = loader.parseSync!(TEST_DATA, {
    cartoRasterTile: {metadata: {compression: 'gzip'}}
  });
  t.equals(result2.blockSize, 256, 'Should return correct blockSize');
  t.ok(result2.cells, 'Should return cells');
  t.ok(result2.cells.numericProps, 'Should return numericProps');
  t.deepEqual(result2.cells.numericProps.band1.value, BAND, 'Should return uncompressed band');

  t.end();
});
