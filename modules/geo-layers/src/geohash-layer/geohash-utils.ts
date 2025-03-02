// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const BASE32_CODES = '0123456789bcdefghjkmnpqrstuvwxyz';
const BASE32_CODES_DICT = {};
for (let i = 0; i < BASE32_CODES.length; i++) {
  BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}

const MIN_LAT = -90;
const MAX_LAT = 90;
const MIN_LON = -180;
const MAX_LON = 180;

// Adapted from ngeohash decode_bbox
export function getGeohashBounds(geohash: string): number[] {
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

  return [minLat, minLon, maxLat, maxLon];
}

export function getGeohashPolygon(geohash: string): number[] {
  const [s, w, n, e] = getGeohashBounds(geohash);

  return [e, n, e, s, w, s, w, n, e, n];
}
