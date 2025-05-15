// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// import {type Bounds2D} from '@math.gl/types';
import {type DGGSDecoder} from './dggs-decoder';
import {
  type CoordPair,
  type H3IndexInput,
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
    const [high, low] = h3IndexToSplitLong(token);
    return joinBitInt(high, low);
  },
  getCellLngLat: (cellIndex: bigint) => {
    const [lat, lng] = cellToLatLng(splitBigInt(cellIndex));
    return [lng, lat];
  },
  getCellBoundaryPolygon: (cellIndex: bigint) => cellToBoundary(splitBigInt(cellIndex)),
  getMultiCellBoundaryAsMultiPolygon: (cellIndexes: bigint[]) =>
    cellsToMultiPolygon(cellIndexes.map(splitBigInt), true)
} as const satisfies DGGSDecoder;

/**
 * Splits a bigint into a 2-element array of 32-bit numbers.
 * @param value - The bigint to split.
 * @returns A 2-element array containing the high and low 32-bit numbers.
 * @todo - Maybe H3 provides this function?
 */
export function splitBigInt(value: bigint): [number, number] {
  const low = Number(value & BigInt(0xffffffff)); // Extract the lower 32 bits
  const high = Number((value >> BigInt(32)) & BigInt(0xffffffff)); // Extract the upper 32 bits
  return [high, low];
}

/**
 * Joins two 32-bit numbers into a bigint.
 * @param high - The high 32-bit number.
 * @param low - The low 32-bit number.
 * @returns The combined bigint.
 * @todo - Maybe H3 provides this function?
 */
export function joinBitInt(high: number, low: number): bigint {
  return (BigInt(high) << BigInt(32)) | BigInt(low);
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
