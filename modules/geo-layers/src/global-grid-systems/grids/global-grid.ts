// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Copy of same type in math.gl. They are structurally identical.
 * This type declares a "standardized" API for accessing basic DGGS token decoding
 * DGGS modules export objects that satisfy this "interface",
 * allowing different DGGS systems can be used interchangeably.
 */
export type GlobalGrid = {
  /** The name of the DGGS */
  name: string;

  /** Does this grid have a numeric representation of cells? */
  hasNumericRepresentation: boolean;

  /** Initialization function. Should be idempotent, i.e. it may be called multiple times */
  initialize?: () => void;

  /** Is the argument a valid index in this grid? */
  isValidCell?: (cell: string | bigint) => boolean;

  /** Convert a string token to a binary cell index */
  tokenToCell?: (token: string) => bigint;
  /** Convert a binary cell index to a token */
  cellToToken?: (cell: string | bigint) => string;

  /** Convert a long, lat to a cell */
  lngLatToCell?: (lngLat: [number, number], resolution) => bigint;
  /** Convert a long, lat to a string token (H3 index) */
  lngLatToToken?: (lngLat: [number, number], resolution) => string;

  /** @returns the center of the cell */
  cellToLngLat: (cell: string | bigint) => [number, number];
  /** @returns the boundary of the cell, as an array of coordinate arrays */
  cellToBoundary: (cell: string | bigint) => [number, number][];
  /** @returns the bounds of the cell */
  cellsToBoundaryMultiPolygon?: (cells: string[] | bigint[]) => [number, number][][][];
};
