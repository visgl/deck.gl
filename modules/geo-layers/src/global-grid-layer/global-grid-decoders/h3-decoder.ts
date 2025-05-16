// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {lerp} from '@math.gl/core';
import {type GlobalGridDecoder} from './global-grid-decoder';
import {
  type CoordPair,
  type H3IndexInput, // Either string or SplitLong
  cellToBoundary,
  cellToLatLng,
  cellsToMultiPolygon,
  h3IndexToBigInt
} from '../h3-js-bigint/h3-js-bigint';

/**
 * "Standardized" API for working with H3 DGGS tokens.
 * @note Inspired by similar work in math.gl. May replace by an import in the future.
 */
export const H3Decoder = {
  name: 'h3',
  // See `main/bundle.ts`, installs a check for the H3 library.
  initialize: () => {},
  tokenToBigInt: (token: string) => h3IndexToBigInt(token),
  cellToLngLat: (cellIndex: bigint) => inPlaceReverseLatLng(cellToLatLng(cellIndex)),
  cellToBoundary: (cellIndex: bigint) => cellToBoundary(cellIndex),
  cellsToBoundaryMultiPolygon: (cellIndexes: bigint[]) => cellsToMultiPolygon(cellIndexes, true)
} as const satisfies GlobalGridDecoder;

// HELPERS

/** Reverse the latitude and longitude in place to avoid minting new arrays. */
function inPlaceReverseLatLng(latLng: [number, number]): [number, number] {
  const temp = latLng[0];
  latLng[0] = latLng[1];
  latLng[1] = temp;
  return latLng;
}
