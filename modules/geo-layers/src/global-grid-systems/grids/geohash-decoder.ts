// math.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Bounds2D} from '@math.gl/types';
import {type GlobalGrid} from './global-grid';

/** Decoder for the geohash global grid system */
export const GeohashDecoder = {
  name: 'geohash',
  hasNumericRepresentation: false,

  cellToLngLat: (geohash: string | bigint): [number, number] =>
    getGeohashLngLat(getString(geohash)),
  cellToBoundary: (geohash: string | bigint): [number, number][] =>
    getGeohashBoundary(getString(geohash))
  // cellToBoundaryPolygonFlat: (geohash: bigint): number[] => getGeohashBoundaryFlat(geohash),
  // cellToBounds: (geohash: bigint): Bounds2D => getGeohashBounds(geohash)
} as const satisfies GlobalGrid;

const getString = (geohash: string | bigint): string => {
  if (typeof geohash !== 'string') {
    throw new Error('geohash must be a string');
  }
  return geohash;
};

const BASE32_CODES = '0123456789bcdefghjkmnpqrstuvwxyz';
const BASE32_CODES_DICT: Record<string, number> = {};
for (let i = 0; i < BASE32_CODES.length; i++) {
  BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}

const MIN_LAT = -90;
const MAX_LAT = 90;
const MIN_LON = -180;
const MAX_LON = 180;

/** Return center lng,lat of geohash cell */
function getGeohashLngLat(geohash: string): [number, number] {
  const [[s, w], [n, e]] = getGeohashBounds(geohash);
  return [(e + w) / 2, (n + s) / 2];
}

/** Return boundary polygon of geohash cell as lng,lat array */
function getGeohashBoundary(geohash: string): [number, number][] {
  const [[s, w], [n, e]] = getGeohashBounds(geohash);
  return [
    [e, n],
    [e, s],
    [w, s],
    [w, n],
    [e, n]
  ];
}

/** Return boundary polygon of geohash cell as flat array */
export function getGeohashBoundaryFlat(geohash: string): number[] {
  const [[s, w], [n, e]] = getGeohashBounds(geohash);
  return [e, n, e, s, w, s, w, n, e, n];
}

/**
 * @note Adapted from ngeohash decode_bbox
 */
/* eslint-disable max-depth */
export function getGeohashBounds(geohash: string): Bounds2D {
  let isLon = true;
  let maxLat = MAX_LAT;
  let minLat = MIN_LAT;
  let maxLon = MAX_LON;
  let minLon = MIN_LON;
  let mid: number;

  let hashValue = 0;
  for (let i = 0, l = geohash.length; i < l; i++) {
    const code = geohash[i].toLowerCase();
    hashValue = BASE32_CODES_DICT[code];

    for (let bits = 4; bits >= 0; bits--) {
      const bit = (hashValue >> bits) & 1;
      if (isLon) {
        mid = (maxLon + minLon) / 2;
        if (bit === 1) {
          minLon = mid;
        } else {
          maxLon = mid;
        }
      } else {
        mid = (maxLat + minLat) / 2;
        if (bit === 1) {
          minLat = mid;
        } else {
          maxLat = mid;
        }
      }
      isLon = !isLon;
    }
  }

  return [
    [minLat, minLon],
    [maxLat, maxLon]
  ];
}
