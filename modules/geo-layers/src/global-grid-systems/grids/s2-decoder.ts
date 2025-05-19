// math.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Bounds2D} from '@math.gl/types';
import {type GlobalGrid} from './global-grid';

import {getS2IndexFromToken, getS2TokenFromIndex} from '../s2-geometry/s2-token';
import {getS2GeoBounds} from '../s2-geometry/s2-to-boundary';
import {getS2Cell, IJToST, STToUV, FaceUVToXYZ, XYZToLngLat} from '../s2-geometry/s2-geometry';

/** Decoder for the S2 DGGS */
export const S2Decoder = {
  name: 'S2',
  hasNumericRepresentation: true,

  tokenToCell: (cell: string): bigint => getS2IndexFromToken(cell),
  cellToToken: (cell: string | bigint): string => getS2TokenFromIndex(getBigInt(cell)),
  cellToLngLat: (cell: string | bigint): [number, number] => getS2LngLat(getBigInt(cell)),
  cellToBoundary: (cell: string | bigint): [number, number][] => getS2Boundary(getBigInt(cell))

  // cellToBoundaryPolygonFlat: (cell: bigint): number[] => getS2BoundaryFlat(cell),
  // cellToBounds: (cell: bigint): Bounds2D => getS2Bounds(cell)
} as const satisfies GlobalGrid;

/** S2 functions operate on bigints */
const getBigInt = (value: string | bigint): bigint => {
  return typeof value === 'string' ? getS2IndexFromToken(value) : value;
};

/**
 * Retrieve S2 geometry center
 */
export function getS2LngLat(cell: bigint): [number, number] {
  const s2Cell = getS2Cell(cell);

  const st = IJToST(s2Cell.ij, s2Cell.level, [0.5, 0.5]);
  const uv = STToUV(st);
  const xyz = FaceUVToXYZ(s2Cell.face, uv);
  const lngLat = XYZToLngLat(xyz);

  return lngLat;
}

/**
 * Get a polygon with corner coordinates for an s2 cell
 * @param - This can be an S2 key or token
 * @return {Float64Array} - a simple polygon in flat array format: [lng0, lat0, lng1, lat1, ...]
 *   - the polygon is closed, i.e. last coordinate is a copy of the first coordinate
 */
function getS2BoundaryFlat(cell: bigint): number[] {
  const float64Array = getS2GeoBounds(cell);
  // TODO - inefficient
  return Array.from(float64Array);
}

function getS2Boundary(cell: bigint): [number, number][] {
  const flatBoundary = getS2BoundaryFlat(cell);
  const boundary: [number, number][] = [];
  for (let i = 0; i < flatBoundary.length; i += 2) {
    boundary.push([flatBoundary[i], flatBoundary[i + 1]]);
  }
  return boundary;
}

export function getS2Bounds(cell: bigint): Bounds2D {
  const flatBoundary = getS2Boundary(cell);

  // We know that we have at least one point, no Infinity will be returned.
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;

  for (const [x, y] of flatBoundary) {
    if (x < xmin) xmin = x;
    if (x > xmax) xmax = x;
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;
  }

  return [
    [xmin, ymin],
    [xmax, ymax]
  ];
}
