// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// import {type Bounds2D} from '@math.gl/types';
import {type DGGSDecoder} from './dggs-decoder';
import {
  type CoordPair,
  type H3IndexInput, // Either string or SplitLong
  type SplitLong,
  cellToBoundary,
  cellToLatLng,
  h3IndexToSplitLong,
  cellsToMultiPolygon
} from 'h3-js';
import {lerp} from '@math.gl/core';

/**
 * "Standardized" API for working with A5 DGGS tokens.
 * @note Copy of same type in math.gl. They are structurally identical. Will be replaced by an import in the future.
 */
export const H3Decoder = {
  name: 'h3',
  // See `main/bundle.ts`, installs a check for the H3 library.
  initialize: () => {},
  getCellIndexFromToken: (token: string) => {
    const splitLong = h3IndexToSplitLong(token);
    return splitLongToBigInt(splitLong);
  },
  getCellLngLat: (cellIndex: bigint) => {
    const latLng = cellToLatLng(bigIntToSplitLong(cellIndex));
    return inPlaceReverseLatLng(latLng);
  },
  getCellBoundaryPolygon: (cellIndex: bigint) => cellToBoundary(bigIntToSplitLong(cellIndex)),
  getMultiCellBoundaryAsMultiPolygon: (cellIndexes: bigint[]) =>
    cellsToMultiPolygon(cellIndexes.map(bigIntToSplitLong), true)
} as const satisfies DGGSDecoder;

/** Reverse the latitude and longitude in place to avoid minting new arrays. */
function inPlaceReverseLatLng(latLng: [number, number]): [number, number] {
  const temp = latLng[0];
  latLng[0] = latLng[1];
  latLng[1] = temp;
  return latLng;
}

/**
 * Splits a bigint into a 2-element array of 32-bit numbers.
 * @param value - The bigint to split.
 * @returns A 2-element array containing the high and low 32-bit numbers.
 */
function bigIntToSplitLong(value: bigint): SplitLong {
  // Mask lower 32 bits
  const low = Number(value & 0xffffffffn); // BigInt & BigInt ⇒ BigInt :contentReference[oaicite:2]{index=2}
  // Shift right to get upper 32 bits
  const high = Number((value >> 32n) & 0xffffffffn); // BigInt >> BigInt ⇒ BigInt :contentReference[oaicite:3]{index=3}
  return [low, high];
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

// TODO

// normalize longitudes w.r.t center (refLng), when not provided first vertex
export function normalizeLongitudes(vertices: CoordPair[], refLng?: number): void {
  refLng = refLng === undefined ? vertices[0][0] : refLng;
  for (const pt of vertices) {
    const deltaLng = pt[0] - refLng;
    if (deltaLng > 180) {
      pt[0] -= 360;
    } else if (deltaLng < -180) {
      pt[0] += 360;
    }
  }
}

// scale polygon vertices w.r.t center (hexId)
export function scalePolygon(hexId: H3IndexInput, vertices: CoordPair[], factor: number): void {
  const [lat, lng] = cellToLatLng(hexId);
  const actualCount = vertices.length;

  // normalize with respect to center
  normalizeLongitudes(vertices, lng);

  // `cellToBoundary` returns same array object for first and last vertex (closed polygon),
  // if so skip scaling the last vertex
  const vertexCount = vertices[0] === vertices[actualCount - 1] ? actualCount - 1 : actualCount;
  for (let i = 0; i < vertexCount; i++) {
    vertices[i][0] = lerp(lng, vertices[i][0], factor);
    vertices[i][1] = lerp(lat, vertices[i][1], factor);
  }
}

// gets hexagon centroid
export function getHexagonCentroid(getHexagon, object, objectInfo) {
  const hexagonId = getHexagon(object, objectInfo);
  const [lat, lng] = cellToLatLng(hexagonId);
  return [lng, lat];
}

export function h3ToPolygon(hexId: H3IndexInput, coverage: number = 1): number[][] {
  const vertices = cellToBoundary(hexId, true);

  if (coverage !== 1) {
    // scale and normalize vertices w.r.t to center
    scalePolygon(hexId, vertices, coverage);
  } else {
    // normalize w.r.t to start vertex
    normalizeLongitudes(vertices);
  }

  return vertices;
}
