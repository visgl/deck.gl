// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// import {type Bounds2D} from '@math.gl/types';
import {type GlobalGrid} from './global-grid';
import {cellToBoundary, cellToLonLat, lonLatToCell, hexToBigInt} from 'a5-js';

// TODO - internal types in a5-js
type Degrees = number & {
  __brand: 'Degrees';
};
type LonLat = [longitude: Degrees, latitude: Degrees] & {
  __brand: 'LonLat';
};

/**
 * "Standardized" API for working with A5 DGGS tokens.
 * @note Copy of same type in math.gl. They are structurally identical. Will be replaced by an import in the future.
 */
export const A5Decoder = {
  name: 'A5',
  hasNumericRepresentation: true,

  tokenToCell: (token: string) => hexToBigInt(token),
  lngLatToCell: (lngLat: [number, number], resolution: number) =>
    lonLatToCell(lngLat as LonLat, resolution),

  cellToToken: (cell: string | bigint) => (typeof cell === 'string' ? cell : cell.toString(16)),
  cellToLngLat: (cell: string | bigint) => cellToLonLat(getBigInt(cell)),
  cellToBoundary: (cell: string | bigint) => cellToBoundary(getBigInt(cell))
} as const satisfies GlobalGrid;

/** Helper function to convert cells to bigints */
const getBigInt = (value: string | bigint): bigint => {
  return typeof value === 'string' ? hexToBigInt(value) : value;
};
