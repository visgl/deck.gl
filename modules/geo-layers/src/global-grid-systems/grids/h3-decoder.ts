// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type GlobalGrid} from './global-grid';
import {
  latLngToCell,
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
  name: 'H3',
  hasNumericRepresentation: true,

  // See `main/bundle.ts`, installs a check for the H3 library.
  initialize: () => {},

  tokenToCell: (token: string) => h3IndexToBigInt(token),

  lngLatToToken: (lngLat: [number, number], resolution: number) =>
    latLngToCell(lngLat[1], lngLat[0], resolution),
  lngLatToCell: (lngLat: [number, number], resolution: number) =>
    h3IndexToBigInt(latLngToCell(lngLat[1], lngLat[0], resolution)),

  cellToLngLat: (cell: string | bigint) => reverseLatLngInPlace(cellToLatLng(cell)),
  cellToBoundary: (cell: string | bigint) => cellToBoundary(cell),
  cellsToBoundaryMultiPolygon: (cells: string[] | bigint[]) => cellsToMultiPolygon(cells, true)
} as const satisfies GlobalGrid;

// HELPERS

/** Reverse the latitude and longitude in place to avoid minting new arrays. */
function reverseLatLngInPlace(latLng: [number, number]): [number, number] {
  const temp = latLng[0];
  latLng[0] = latLng[1];
  latLng[1] = temp;
  return latLng;
}
