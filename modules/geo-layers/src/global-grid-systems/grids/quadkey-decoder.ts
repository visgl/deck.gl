// math.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Bounds2D} from '@math.gl/types';
import {type GlobalGrid} from './global-grid';

const TILE_SIZE = 512;

/** Decoder for the quadkey DGGS */
export const QuadkeyDecoder = {
  name: 'quadkey',
  hasNumericRepresentation: true,

  // cellToToken: (cell: bigint): string => quadkeyCellToToken(cell),
  // tokenToCell: (cell: string): bigint => quadKeyToBigint(cell),

  cellToLngLat: (cell: string | bigint): [number, number] => quadkeyCellToLngLat(getString(cell)),
  cellToBoundary: (cell: string | bigint): [number, number][] =>
    quadkeyCellToBoundary(getString(cell))

  // cellToBoundaryPolygonFlat: (cell: string | bigint): number[] => getQuadkeyBoundaryFlat(cell),
  // cellToBounds: (cell: string | bigint): Bounds2D => getQuadkeyBounds(cell)
} as const satisfies GlobalGrid;

/** Quadkey only supports strings */
const getString = (cell: string | bigint): string => {
  if (typeof cell !== 'string') {
    throw new Error('geohash must be a string');
  }
  return cell;
};

function quadkeyCellToLngLat(quadkey: string): [number, number] {
  const [topLeft, bottomRight] = quadkeyToWorldBounds(quadkey);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [(e + w) / 2, (s + n) / 2];
}

function quadkeyCellToBoundary(quadkey: string): [number, number][] {
  const [topLeft, bottomRight] = quadkeyToWorldBounds(quadkey);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [
    [e, n],
    [e, s],
    [w, s],
    [w, n],
    [e, n]
  ];
}

export function quadkeyCellToBoundaryFlat(quadkey: string): number[] {
  const [topLeft, bottomRight] = quadkeyToWorldBounds(quadkey);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [e, n, e, s, w, s, w, n, e, n];
}

export function quadkeyCellToBounds(quadkey: string): Bounds2D {
  const [topLeft, bottomRight] = quadkeyToWorldBounds(quadkey);
  const [w, n] = worldToLngLat(topLeft);
  const [e, s] = worldToLngLat(bottomRight);
  return [
    [w, s],
    [e, n]
  ];
}

export function quadkeyToWorldBounds(quadkey: string): [[number, number], [number, number]] {
  let x = 0;
  let y = 0;
  let mask = 1 << quadkey.length;
  const scale = mask / TILE_SIZE;

  for (let i = 0; i < quadkey.length; i++) {
    mask >>= 1;
    const q = parseInt(quadkey[i], 10);
    if (q % 2) x |= mask;
    if (q > 1) y |= mask;
  }
  return [
    [x / scale, TILE_SIZE - y / scale],
    [(x + 0.99) / scale, TILE_SIZE - (y + 0.99) / scale]
  ];
}

// CONSTANTS
const PI = Math.PI;
const PI_4 = PI / 4;
const RADIANS_TO_DEGREES = 180 / PI;

/**
 * Unproject world point [x,y] on map onto {lat, lon} on sphere
 *
 * @param xy - array with [x,y] members
 *  representing point on projected map plane
 * @return - array with [x,y] of point on sphere.
 *   Has toArray method if you need a GeoJSON Array.
 *   Per cartographic tradition, lat and lon are specified as degrees.
 */
function worldToLngLat(xy: number[]): [number, number] {
  const [x, y] = xy;
  const lambda2 = (x / TILE_SIZE) * (2 * PI) - PI;
  const phi2 = 2 * (Math.atan(Math.exp((y / TILE_SIZE) * (2 * PI) - PI)) - PI_4);
  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
}

// EXPERIMENTAL BIGINT ENCODING FOR QUADKEYS

/**
 * Encodes a QuadKey string into a bigint.
 * @param quadkey - The QuadKey string.
 * @returns The bigint representation of the QuadKey.
 */
export function quadKeyToBigint(quadkey: string): bigint {
  let result = 0n;
  for (const digit of quadkey) {
    const value = BigInt(parseInt(digit, 4));
    result = (result << 2n) | value;
  }
  const zoom = quadkey.length;
  // Shift the result to align with the most significant bits
  const shift = 64 - 5 - zoom * 2; // Reserve 5 bits for zoom level
  result = result << BigInt(shift);
  // Append the zoom level in the least significant 5 bits
  return result | BigInt(zoom);
}

/**
 * Decodes a bigint-encoded QuadKey back into its string representation.
 * @param encoded - The bigint representation of the QuadKey with embedded zoom level.
 * @returns The decoded QuadKey string.
 */
export function bigintToQuadKey(encoded: bigint): string {
  const zoom = Number(encoded & 0b11111n); // Extract the last 5 bits for zoom level
  const shift = BigInt(64 - 5 - zoom * 2); // Calculate the shift to align the QuadKey bits
  const quadkeyBits = (encoded >> shift) & ((1n << BigInt(zoom * 2)) - 1n); // Extract QuadKey bits
  let quadkey = '';
  for (let i = zoom - 1; i >= 0; i--) {
    const digit = Number((quadkeyBits >> BigInt(i * 2)) & 0b11n);
    quadkey += digit.toString();
  }
  return quadkey;
}

/**
 * Checks if the child QuadKey is contained within the parent QuadKey.
 * @param parent - The bigint representation of the parent QuadKey.
 * @param child - The bigint representation of the child QuadKey.
 * @returns True if the child is contained within the parent; otherwise, false.
 */
export function isContained(parent: bigint, child: bigint): boolean {
  const parentZoom = Number(parent & 0b11111n); // Extract zoom level from parent
  const childZoom = Number(child & 0b11111n); // Extract zoom level from child

  if (parentZoom >= childZoom) return false;

  const parentShift = BigInt(64 - 5 - parentZoom * 2);
  const childShift = BigInt(64 - 5 - childZoom * 2);

  const parentPrefix = (parent >> parentShift) & ((1n << BigInt(parentZoom * 2)) - 1n);
  const childPrefix = (child >> childShift) & ((1n << BigInt(parentZoom * 2)) - 1n);

  return parentPrefix === childPrefix;
}

/**
 * Decodes a bigint-encoded QuadKey into tile X, tile Y, and zoom level.
 * @param encoded - The bigint representation of the QuadKey with embedded zoom level.
 * @returns An object containing tileX, tileY, and zoom.
 */
export function decodeBigintQuadKey(encoded: bigint): {tileX: number; tileY: number; zoom: number} {
  const zoom = Number(encoded & 0b11111n); // Extract the last 5 bits for zoom level
  const quadKeyBits = encoded >> 5n; // Remove the zoom level bits

  let tileX = 0;
  let tileY = 0;

  for (let i = 0; i < zoom; i++) {
    const shift = BigInt((zoom - i - 1) * 2);
    const digit = Number((quadKeyBits >> shift) & 0b11n);
    const mask = 1 << (zoom - i - 1);
    if (digit & 1) tileX |= mask;
    if (digit & 2) tileY |= mask;
  }

  return {tileX, tileY, zoom};
}
