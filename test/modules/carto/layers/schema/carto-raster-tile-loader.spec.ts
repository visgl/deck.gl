// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import CartoRasterTileLoader from '@deck.gl/carto/layers/schema/carto-raster-tile-loader';
import type {LoaderWithParser} from '@loaders.gl/loader-utils';
import {BAND, COMPRESSED_BAND, TEST_DATA} from './carto-raster-tile.spec';

test('CartoRasterTileLoader', () => {
  const loader = CartoRasterTileLoader as LoaderWithParser;

  expect(loader, 'CartoRasterTileLoader should be defined').toBeTruthy();
  expect(loader.name, 'Should have correct name').toBe('CARTO Raster Tile');
  expect(typeof loader.parse, 'Should have parse method').toBe('function');
  expect(typeof loader.parseSync, 'Should have parseSync method').toBe('function');
  expect(CartoRasterTileLoader.worker, 'worker property should be true').toBe(true);

  const result = loader.parseSync!(TEST_DATA, {cartoRasterTile: {metadata: {compression: null}}});
  expect(result.blockSize, 'Should return correct blockSize').toBe(256);
  expect(result.cells, 'Should return cells').toBeTruthy();
  expect(result.cells.numericProps, 'Should return numericProps').toBeTruthy();
  expect(result.cells.numericProps.band1.value, 'Should return compressed band').toEqual(
    COMPRESSED_BAND
  );

  // Repeat with compressed data
  const result2 = loader.parseSync!(TEST_DATA, {
    cartoRasterTile: {metadata: {compression: 'gzip'}}
  });
  expect(result2.blockSize, 'Should return correct blockSize').toBe(256);
  expect(result2.cells, 'Should return cells').toBeTruthy();
  expect(result2.cells.numericProps, 'Should return numericProps').toBeTruthy();
  expect(result2.cells.numericProps.band1.value, 'Should return uncompressed band').toEqual(BAND);
});
