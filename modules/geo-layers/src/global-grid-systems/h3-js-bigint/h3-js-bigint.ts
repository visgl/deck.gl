// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// A thin wrapper around h3-js that support BigInts
// Note: incurs some overhead as we need to convert between BigInt and SplitLong

import {
  type CoordPair,
  type SplitLong,
  latLngToCell,
  cellToBoundary as _cellToBoundary,
  cellToLatLng as _cellToLatLng,
  cellsToMultiPolygon as _cellsToMultiPolygon,
  h3IndexToSplitLong as _h3IndexToSplitLong,
  splitLongToH3Index as _splitLongToH3Index
} from 'h3-js';

export {type CoordPair, type SplitLong, latLngToCell};

export type H3IndexInput = bigint | string | SplitLong;

const scratchSplitLong: SplitLong = [0, 0];

export function h3IndexToSplitLong(h3Index: H3IndexInput, target?: SplitLong): SplitLong {
  if (typeof h3Index === 'bigint') {
    return bigIntToSplitLong(h3Index, target ?? [0, 0]);
  }
  return _h3IndexToSplitLong(h3Index);
}

export function h3IndexToBigInt(h3Index: H3IndexInput): bigint {
  if (typeof h3Index === 'bigint') {
    return h3Index;
  }
  const splitLong = h3IndexToSplitLong(h3Index, scratchSplitLong);
  return splitLongToBigInt(splitLong);
}

export function cellToLatLng(h3Index: H3IndexInput): [number, number] {
  const splitLong = h3IndexToSplitLong(h3Index, scratchSplitLong);
  const latLng = _cellToLatLng(splitLong);
  return latLng;
}

export function cellToBoundary(h3Index: H3IndexInput, formatAsGeoJson?: boolean): CoordPair[] {
  const splitLong = h3IndexToSplitLong(h3Index, scratchSplitLong);
  const vertices = _cellToBoundary(splitLong, formatAsGeoJson);
  return vertices;
}

export function cellsToMultiPolygon(
  h3Indexes: H3IndexInput[],
  formatAsGeoJson?: boolean
): CoordPair[][][] {
  const splitLongs = h3Indexes.map(h3Index => h3IndexToSplitLong(h3Index));
  const polygons = _cellsToMultiPolygon(splitLongs, formatAsGeoJson);
  return polygons;
}

// HELPERS

/**
 * Splits a bigint into a 2-element array of 32-bit numbers.
 * @param value - The bigint to split.
 * @returns A 2-element array containing the high and low 32-bit numbers.
 */
function bigIntToSplitLong(value: bigint, target: SplitLong = [0, 0]): SplitLong {
  // Mask lower 32 bits
  target[0] = Number(value & 0xffffffffn); // BigInt & BigInt ⇒ BigInt :contentReference[oaicite:2]{index=2}
  // Shift right to get upper 32 bits
  target[1] = Number((value >> 32n) & 0xffffffffn); // BigInt >> BigInt ⇒ BigInt :contentReference[oaicite:3]{index=3}
  return target;
}

/**
 * Joins two 32-bit numbers into a bigint.
 * @param high - The high 32-bit number.
 * @param low - The low 32-bit number.
 * @returns The combined bigint.
 */
function splitLongToBigInt([low, high]: SplitLong): bigint {
  // Shift high half back and OR with low half
  return (BigInt(high) << 32n) | BigInt(low); // BigInt << BigInt ⇒ BigInt; BigInt | BigInt ⇒ BigInt :contentReference[oaicite:4]{index=4}
}
