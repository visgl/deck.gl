// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {parse} from '@loaders.gl/core';
import {PolylineArrowLoader} from './polyline-arrow-loader';
import {FlightPathArrowLoader} from './flight-path-loader';

// Google's published polyline example, encoded in latitude/longitude order.
const POLYLINE = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

test('encoded polyline loader returns longitude/latitude Arrow segments', async () => {
  const table = await parse(POLYLINE, PolylineArrowLoader);
  expect(table.numRows).toBe(2);
  expect(Array.from(table.getChild('start')!.get(0))).toEqual([-120.2, 38.5]);
  expect(Array.from(table.getChild('end')!.get(1))).toEqual([-126.453, 43.252]);
  expect(table.getChild('start')!.type.listSize).toBe(2);
  const integer = PolylineArrowLoader.parseTextSync('ACCE', {polyline: {precision: 0}});
  expect(Array.from(integer.getChild('end')!.get(0))).toEqual([5, 3]);
  expect(PolylineArrowLoader.parseTextSync('').numRows).toBe(0);
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
    expect(() => PolylineArrowLoader.parseTextSync(text)).toThrow();
  }
  expect(() => PolylineArrowLoader.parseTextSync('??', {polyline: {precision: -1}})).toThrow();
  for (const text of ['flight\tUK', 'f\tUK\t????\t??', 'f\tUK\t??\x01??\t??']) {
    expect(() => FlightPathArrowLoader.parseTextSync(text)).toThrow();
  }
});
