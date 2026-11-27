// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {parse} from '@loaders.gl/core';
import {decodePolyline} from './polyline';
import {FlightPathArrowLoader} from './flight-path-loader';

// Google's published polyline example, encoded in latitude/longitude order.
const POLYLINE = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

test('encoded polylines decode longitude and latitude with the selected precision', () => {
  expect(decodePolyline(POLYLINE)).toEqual([
    [-120.2, 38.5],
    [-120.95, 40.7],
    [-126.453, 43.252]
  ]);
  expect(decodePolyline('ACCE', 0)).toEqual([
    [2, 1],
    [5, 3]
  ]);
  expect(decodePolyline('')).toEqual([]);
});

test('flight adapter preserves metadata, elevations and independent path boundaries', async () => {
  // Each ?? pair is one (0, 0) point, for both position and altitude streams.
  const table = await parse('flight\tUK\t????\x01????\t????\x01????\r\n', FlightPathArrowLoader);
  expect(table.numRows).toBe(2);
  expect(Array.from(table.getChild('name')!)).toEqual(['flight', 'flight']);
  expect(Array.from(table.getChild('country')!)).toEqual(['UK', 'UK']);
  expect(Array.from(table.getChild('start')!.get(0))).toEqual([0, 0, 0]);
  expect(table.getChild('end')!.type.listSize).toBe(3);
  expect(FlightPathArrowLoader.parseTextSync('').numRows).toBe(0);
});

test('malformed polyline and flight streams fail without partial output', () => {
  for (const text of ['?', '_', '~~', '\x00', '~~~~~~~~?']) {
    expect(() => decodePolyline(text)).toThrow();
  }
  expect(() => decodePolyline('??', -1)).toThrow();
  for (const text of ['flight\tUK', 'f\tUK\t????\t??', 'f\tUK\t??\x01??\t??']) {
    expect(() => FlightPathArrowLoader.parseTextSync(text)).toThrow();
  }
});
