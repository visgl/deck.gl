// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// import {type Bounds2D} from '@math.gl/types';
import {type DGGSDecoder} from './dggs-decoder';
import {cellToBoundary, cellToLonLat, hexToBigInt} from 'a5-js';

/**
 * "Standardized" API for working with A5 DGGS tokens.
 * @note Copy of same type in math.gl. They are structurally identical. Will be replaced by an import in the future.
 */
export const A5Decoder = {
  name: 'a5',
  getCellIndexFromToken: (token: string) => hexToBigInt(token),
  getCellLngLat: (geohash: string) => cellToLonLat(hexToBigInt(geohash)),
  getCellBoundaryPolygon: (geohash: string) => cellToBoundary(hexToBigInt(geohash))
} as const satisfies DGGSDecoder;
