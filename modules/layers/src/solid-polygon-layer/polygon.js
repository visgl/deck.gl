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

// Basic polygon support
//
// Handles simple and complex polygons
// Simple polygons are arrays of vertices, implicitly "closed"
// Complex polygons are arrays of simple polygons, with the first polygon
// representing the outer hull and other polygons representing holes

/**
 * Check if a nested polygon contains holes
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
function isSimple(polygon) {
  return polygon.length >= 1 && polygon[0].length >= 2 && Number.isFinite(polygon[0][0]);
}

function isNestedPathClosed(simplePolygon) {
  // check if first and last vertex are the same
  const p0 = simplePolygon[0];
  const p1 = simplePolygon[simplePolygon.length - 1];

  return p0[0] === p1[0] && p0[1] === p1[1] && p0[2] === p1[2];
}

function isFlatPathClosed(positions, size, startIndex, endIndex) {
  for (let i = 0; i < size; i++) {
    if (positions[startIndex + i] !== positions[endIndex - size + i]) {
      return false;
    }
  }
  return true;
}

/**
 * Copy nested polygon coordinates into a flat array.
 * Ensure that all simple polygons have the same start and end vertex
 */
function copyAsNestedLoop(target, targetStartIndex, simplePolygon, size) {
  let targetIndex = targetStartIndex;
  const len = simplePolygon.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[i][j] || 0;
    }
  }

  if (!isNestedPathClosed(simplePolygon)) {
    for (let j = 0; j < size; j++) {
      target[targetIndex++] = simplePolygon[0][j] || 0;
    }
  }
  return targetIndex;
}

/**
 * Copy flat polygon coordinates into a flat array.
 * Ensure that all simple polygons have the same start and end vertex
 */
function copyAsFlatLoop(target, targetStartIndex, positions, size, srcStartIndex = 0, srcEndIndex) {
  srcEndIndex = srcEndIndex || positions.length;
  const srcLength = srcEndIndex - srcStartIndex;
  if (srcLength <= 0) {
    return targetStartIndex;
  }
  let targetIndex = targetStartIndex;

  for (let i = 0; i < srcLength; i++) {
    target[targetIndex++] = positions[srcStartIndex + i];
  }

  if (!isFlatPathClosed(positions, size, srcStartIndex, srcEndIndex)) {
    for (let i = 0; i < size; i++) {
      target[targetIndex++] = positions[srcStartIndex + i];
    }
  }
  return targetIndex;
}

function getNestedVertexCount(simplePolygon) {
  return (isNestedPathClosed(simplePolygon) ? 0 : 1) + simplePolygon.length;
}

function getFlatVertexCount(positions, size, startIndex = 0, endIndex) {
  endIndex = endIndex || positions.length;
  if (startIndex >= endIndex) {
    return 0;
  }
  return (
    (isFlatPathClosed(positions, size, startIndex, endIndex) ? 0 : 1) +
    (endIndex - startIndex) / size
  );
}

/**
 * Check if this is a non-nested polygon (i.e. the first element of the first element is a number)
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
export function getVertexCount(polygon, positionSize) {
  if (polygon.positions) {
    // object form
    const {positions, loopStartIndices} = polygon;

    if (loopStartIndices) {
      let vertexCount = 0;
      for (let i = 0; i < loopStartIndices.length; i++) {
        vertexCount += getFlatVertexCount(
          polygon.positions,
          positionSize,
          loopStartIndices[i],
          loopStartIndices[i + 1]
        );
      }
      return vertexCount;
    }
    polygon = positions;
  }
  if (Number.isFinite(polygon[0])) {
    // flat array form
    return getFlatVertexCount(polygon, positionSize);
  }
  if (!isSimple(polygon)) {
    let vertexCount = 0;
    for (const simplePolygon of polygon) {
      vertexCount += getNestedVertexCount(simplePolygon);
    }
    return vertexCount;
  }
  return getNestedVertexCount(polygon);
}

/**
 * Normalize to ensure that all polygons in a list are complex - simplifies processing
 * @param {Array} polygon - either a complex or a simple polygon
 * @param {Number} positionSize - 2 (xy) or 3 (xyz)
 * @return {Array} - returns an array of flat rings
 */
export function normalize(polygon, positionSize, vertexCount) {
  vertexCount = vertexCount || getVertexCount(polygon, positionSize);

  const positions = new Float64Array(vertexCount * positionSize);
  const loopStartIndices = [];

  if (polygon.positions) {
    // object form
    const {positions: srcPositions, loopStartIndices: srcLoopStartIndices} = polygon;

    if (srcLoopStartIndices) {
      let targetIndex = 0;

      for (let i = 0; i < srcLoopStartIndices.length; i++) {
        loopStartIndices.push(targetIndex);
        targetIndex = copyAsFlatLoop(
          positions,
          targetIndex,
          srcPositions,
          positionSize,
          srcLoopStartIndices[i],
          srcLoopStartIndices[i + 1]
        );
      }
      return {positions, loopStartIndices};
    }
    polygon = srcPositions;
  }
  if (Number.isFinite(polygon[0])) {
    // flat array form
    copyAsFlatLoop(positions, 0, polygon, positionSize);
    return {positions, loopStartIndices: null};
  }
  if (!isSimple(polygon)) {
    let targetIndex = 0;

    for (const simplePolygon of polygon) {
      loopStartIndices.push(targetIndex);
      targetIndex = copyAsNestedLoop(positions, targetIndex, simplePolygon, positionSize);
    }
    // last index points to the end of the array, remove it
    return {positions, loopStartIndices};
  }
  copyAsNestedLoop(positions, 0, polygon, positionSize);
  return {positions, loopStartIndices: null};
}

/*
 * Get vertex indices for drawing complexPolygon mesh
 * @private
 * @param {[Number,Number,Number][][]} complexPolygon
 * @returns {[Number]} indices
 */
export function getSurfaceIndices(normalizedPolygon, positionSize) {
  let holeIndices = null;

  if (normalizedPolygon.loopStartIndices) {
    holeIndices = normalizedPolygon.loopStartIndices
      .slice(1)
      .map(positionIndex => positionIndex / positionSize);
  }
  // Let earcut triangulate the polygon
  return earcut(normalizedPolygon.positions, holeIndices, positionSize);
}
