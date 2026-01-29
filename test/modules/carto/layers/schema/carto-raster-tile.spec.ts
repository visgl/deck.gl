// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {TileReader} from '@deck.gl/carto/layers/schema/carto-raster-tile';
import Pbf from 'pbf';

// GZIP compressed data for [1, 2, 3, 4]
export const BAND = [1, 2, 3, 4];
export const COMPRESSED_BAND = [
  31, 139, 8, 0, 0, 0, 0, 0, 0, 3, 99, 100, 98, 102, 1, 0, 205, 251, 60, 182, 4, 0, 0, 0
];
const buffer = new Pbf();
buffer.writeVarintField(1, 256); // blockSize
buffer.writeMessage(2, (_, pbf) => {
  // bands
  pbf.writeStringField(1, 'band1');
  pbf.writeStringField(2, 'uint8');
  pbf.writeBytesField(3, new Uint8Array(COMPRESSED_BAND));
});
export const TEST_DATA = buffer.finish();

/**
 * syntax = "proto3";
 * package carto;
 *
 * message Band {
 *   string name = 1;
 *   string type = 2;
 *   bytes data = 3;
 * }
 *
 * message Tile {
 *   uint32 blockSize = 1;
 *   repeated Band bands = 2;
 * }
 */
test('TileReader', () => {
  const tile = TileReader.read(new Pbf(TEST_DATA), TEST_DATA.byteLength);
  expect(tile.blockSize, 'Should read blockSize correctly').toBe(256);
  expect(tile.bands.length, 'Should have one band').toBe(1);
  expect(tile.bands[0].name, 'Band should have correct name').toBe('band1');
  expect(tile.bands[0].data.value, 'Band should have compressed data').toEqual(COMPRESSED_BAND);

  // Repeat with compressed data
  TileReader.compression = 'gzip';
  const tile2 = TileReader.read(new Pbf(TEST_DATA), TEST_DATA.byteLength);
  expect(tile.blockSize, 'Should read blockSize correctly').toBe(256);
  expect(tile.bands.length, 'Should have one band').toBe(1);
  expect(tile.bands[0].name, 'Band should have correct name').toBe('band1');
  expect(tile2.bands[0].data.value, 'Band should have decompressed data').toEqual(BAND);
});
