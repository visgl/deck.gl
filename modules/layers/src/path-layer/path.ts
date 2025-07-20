// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {cutPolylineByGrid, cutPolylineByMercatorBounds} from '@math.gl/polygon';

import type {NumericArray} from '@math.gl/core';
import type {Position} from '@deck.gl/core';

export type NestedPathGeometry = Position[];
export type FlatPathGeometry = NumericArray;
export type PathGeometry = NestedPathGeometry | FlatPathGeometry;
export type NormalizedPathGeometry = FlatPathGeometry[] | FlatPathGeometry;

/**
 * Flattens a nested path object
 * Cut the feature if needed (globe projection, wrap longitude, etc.)
 * Returns a flat array of path positions, or a list of flat arrays representing multiple paths
 */
export function normalizePath(
  path: PathGeometry,
  size: number,
  gridResolution?: number,
  wrapLongitude?: boolean
): number[][] | NumericArray {
  let flatPath: NumericArray;
  if (Array.isArray(path[0])) {
    const length = path.length * size;
    flatPath = new Array(length);
    for (let i = 0; i < path.length; i++) {
      for (let j = 0; j < size; j++) {
        flatPath[i * size + j] = path[i][j] || 0;
      }
    }
  } else {
    flatPath = path as NumericArray;
  }
  if (gridResolution) {
    return cutPolylineByGrid(flatPath, {size, gridResolution});
  }
  if (wrapLongitude) {
    return cutPolylineByMercatorBounds(flatPath, {size});
  }
  return flatPath;
}
