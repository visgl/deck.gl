// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable max-params */
import earcut from 'earcut';
import {modifyPolygonWindingDirection, WINDING} from '@math.gl/polygon';

import type {Position} from '@deck.gl/core';
import type {NumericArray} from '@math.gl/core';

const OUTER_POLYGON_WINDING = WINDING.CLOCKWISE;
const HOLE_POLYGON_WINDING = WINDING.COUNTER_CLOCKWISE;

type WindingOptions = {
  start?: number;
  end?: number;
  size?: number;
  isClosed?: boolean;
};

/** A scratch object for sending winding options */
const windingOptions: WindingOptions = {
  isClosed: true
};

// 4 data formats are supported:

/** Simple Polygon: an array of points */
export type NestedSimplePolygonGeometry = Position[];
/** Complex Polygon: an array of array of points (array of rings)
 * with the first ring representing the outer hull and other rings representing holes
 */
export type NestedComplexPolygonGeometry = Position[][];
/** An array of numbers (flattened "simple polygon") */
export type FlatSimplePolygonGeometry = NumericArray;
/** Flattened "complex polygon" */
export type FlatComplexPolygonGeometry = {positions: NumericArray; holeIndices: NumericArray};

export type PolygonGeometry =
  | NestedSimplePolygonGeometry
  | NestedComplexPolygonGeometry
  | FlatSimplePolygonGeometry
  | FlatComplexPolygonGeometry;

export type NormalizedPolygonGeometry = FlatSimplePolygonGeometry | FlatComplexPolygonGeometry;

/**
 * Ensure a polygon is valid format
 */
function validate(polygon: PolygonGeometry): void {
  polygon = (polygon && (polygon as FlatComplexPolygonGeometry).positions) || polygon;
  if (!Array.isArray(polygon) && !ArrayBuffer.isView(polygon)) {
    throw new Error('invalid polygon');
  }
}

/** Get the positions from a normalized polygon */
export function getPositions(polygon: NormalizedPolygonGeometry): NumericArray {
  return 'positions' in polygon ? polygon.positions : polygon;
}

/** Get the hole indices from a normalized polygon */
export function getHoleIndices(polygon: NormalizedPolygonGeometry): NumericArray | null {
  return 'holeIndices' in polygon ? polygon.holeIndices : null;
}

/**
 * Check if a polygon is nested or flat
 * Returns true if the polygon is a flat polygon (i.e. not an array of polygons)
 */
function isNested(
  polygon: PolygonGeometry
): polygon is NestedSimplePolygonGeometry | NestedComplexPolygonGeometry {
  return Array.isArray(polygon[0]);
}

/**
 * Check if a polygon is simple or complex
 * Returns true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
function isSimple(
  polygon: NestedSimplePolygonGeometry | NestedComplexPolygonGeometry
): polygon is NestedSimplePolygonGeometry {
  return polygon.length >= 1 && polygon[0].length >= 2 && Number.isFinite(polygon[0][0]);
}

/**
 * Check if a simple polygon is a closed ring
 * Returns true if the simple polygon is a closed ring
 */
function isNestedRingClosed(simplePolygon: NestedSimplePolygonGeometry): boolean {
  // check if first and last vertex are the same
  const p0 = simplePolygon[0];
  const p1 = simplePolygon[simplePolygon.length - 1];

  return p0[0] === p1[0] && p0[1] === p1[1] && p0[2] === p1[2];
}

/**
 * Check if a simple flat array is a closed ring
 * Returns true if the simple flat array is a closed ring
 */
function isFlatRingClosed(
  positions: FlatSimplePolygonGeometry,
  /** size of a position, 2 (xy) or 3 (xyz) */
  size: number,
  /** start index of the path in the positions array */
  startIndex: number,
  /** end index of the path in the positions array */
  endIndex: number
): boolean {
  for (let i = 0; i < size; i++) {
    if (positions[startIndex + i] !== positions[endIndex - size + i]) {
      return false;
    }
  }
  return true;
}

/**
 * Copy a simple polygon coordinates into a flat array, closes the ring if needed.
 * Returns the index of the write head in the destination
 */
function copyNestedRing(
  /** destination */
  target: NumericArray,
  /** index in the destination to start copying into */
  targetStartIndex: number,
  /** the source polygon */
  simplePolygon: NestedSimplePolygonGeometry,
  /** size of a position, 2 (xy) or 3 (xyz) */
  size: number,
  /** modify polygon to be of the specified winding direction */
  windingDirection: number
): number {
  let targetIndex = targetStartIndex;
  const len = simplePolygon.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[i][j] || 0;
    }
  }

  if (!isNestedRingClosed(simplePolygon)) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[0][j] || 0;
    }
  }

  windingOptions.start = targetStartIndex;
  windingOptions.end = targetIndex;
  windingOptions.size = size;
  modifyPolygonWindingDirection(target, windingDirection, windingOptions);

  return targetIndex;
}

/**
 * Copy a simple flat array into another flat array, closes the ring if needed.
 * Returns the index of the write head in the destination
 */
function copyFlatRing(
  /** destination */
  target: NumericArray,
  /** index in the destination to start copying into */
  targetStartIndex: number,
  /** the source polygon */
  positions: FlatSimplePolygonGeometry,
  /** size of a position, 2 (xy) or 3 (xyz) */
  size: number,
  /** start index of the path in the positions array */
  srcStartIndex: number = 0,
  /** end index of the path in the positions array */
  srcEndIndex: number,
  windingDirection: number
): number {
  srcEndIndex = srcEndIndex || positions.length;
  const srcLength = srcEndIndex - srcStartIndex;
  if (srcLength <= 0) {
    return targetStartIndex;
  }
  let targetIndex = targetStartIndex;

  for (let i = 0; i < srcLength; i++) {
    target[targetIndex++] = positions[srcStartIndex + i];
  }

  if (!isFlatRingClosed(positions, size, srcStartIndex, srcEndIndex)) {
    for (let i = 0; i < size; i++) {
      target[targetIndex++] = positions[srcStartIndex + i];
    }
  }

  windingOptions.start = targetStartIndex;
  windingOptions.end = targetIndex;
  windingOptions.size = size;
  modifyPolygonWindingDirection(target, windingDirection, windingOptions);

  return targetIndex;
}

/**
 * Normalize any polygon representation into the "complex flat" format
 */
/* eslint-disable max-statements */
export function normalize(
  polygon: PolygonGeometry,
  positionSize: number
): NormalizedPolygonGeometry {
  validate(polygon);

  const positions: number[] = [];
  const holeIndices: number[] = [];

  if ('positions' in polygon) {
    // complex flat
    const {positions: srcPositions, holeIndices: srcHoleIndices} = polygon;

    if (srcHoleIndices) {
      let targetIndex = 0;
      // split the positions array into `holeIndices.length + 1` rings
      // holeIndices[-1] falls back to 0
      // holeIndices[holeIndices.length] falls back to positions.length
      for (let i = 0; i <= srcHoleIndices.length; i++) {
        targetIndex = copyFlatRing(
          positions,
          targetIndex,
          srcPositions,
          positionSize,
          srcHoleIndices[i - 1],
          srcHoleIndices[i],
          i === 0 ? OUTER_POLYGON_WINDING : HOLE_POLYGON_WINDING
        );
        holeIndices.push(targetIndex);
      }
      // The last one is not a starting index of a hole, remove
      holeIndices.pop();

      return {positions, holeIndices};
    }
    polygon = srcPositions;
  }
  if (!isNested(polygon)) {
    // simple flat
    copyFlatRing(positions, 0, polygon, positionSize, 0, positions.length, OUTER_POLYGON_WINDING);
    return positions;
  }
  if (!isSimple(polygon)) {
    // complex polygon
    let targetIndex = 0;

    for (const [polygonIndex, simplePolygon] of polygon.entries()) {
      targetIndex = copyNestedRing(
        positions,
        targetIndex,
        simplePolygon,
        positionSize,
        polygonIndex === 0 ? OUTER_POLYGON_WINDING : HOLE_POLYGON_WINDING
      );
      holeIndices.push(targetIndex);
    }
    // The last one is not a starting index of a hole, remove
    holeIndices.pop();
    // last index points to the end of the array, remove it
    return {positions, holeIndices};
  }
  // simple polygon
  copyNestedRing(positions, 0, polygon, positionSize, OUTER_POLYGON_WINDING);
  return positions;
}
/* eslint-enable max-statements */

/*
 * Get vertex indices for drawing polygon mesh (triangulation)
 */
export function getSurfaceIndices(
  polygon: NormalizedPolygonGeometry,
  positionSize: number,
  preproject?: (xy: number[]) => number[]
): number[] {
  let holeIndices = getHoleIndices(polygon);
  if (holeIndices) {
    holeIndices = holeIndices.map(positionIndex => positionIndex / positionSize);
  }

  let positions = getPositions(polygon);

  if (preproject) {
    // When tesselating lnglat coordinates, project them to the common space for accuracy
    const n = positions.length;
    // Clone the array
    positions = positions.slice();
    const p: number[] = [];
    for (let i = 0; i < n; i += positionSize) {
      p[0] = positions[i];
      p[1] = positions[i + 1];
      const xy = preproject(p);
      positions[i] = xy[0];
      positions[i + 1] = xy[1];
    }
  }

  // Let earcut triangulate the polygon
  return earcut(positions, holeIndices, positionSize);
}
