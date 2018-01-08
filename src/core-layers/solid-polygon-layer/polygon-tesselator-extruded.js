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

import * as Polygon from './polygon';
import {experimental} from '../../core';
const {fp64LowPart, fillArray} = experimental;
import earcut from 'earcut';

function getPickingColor(index) {
  return [(index + 1) & 255, ((index + 1) >> 8) & 255, (((index + 1) >> 8) >> 8) & 255];
}

function arrayPush(array, values) {
  const length = values.length;
  let offset = array.length;

  for (let index = 0; index < length; index++) {
    array[offset++] = values[index];
  }
  return array;
}

function flatten(values, level, result = []) {
  if (level > 1) {
    values.forEach(v => flatten(v, level - 1, result));
  } else {
    arrayPush(result, values);
  }
  return result;
}

const DEFAULT_COLOR = [0, 0, 0, 255]; // Black

export class PolygonTesselatorExtruded {
  constructor({
    polygons,
    getHeight = x => 1000,
    getColor = x => DEFAULT_COLOR,
    wireframe = false,
    fp64 = false
  }) {
    this.fp64 = fp64;

    // Expensive operation, convert all polygons to arrays
    polygons = polygons.map((complexPolygon, polygonIndex) => {
      const height = getHeight(polygonIndex) || 0;
      return Polygon.normalize(complexPolygon).map(polygon =>
        polygon.map(coord => [coord[0], coord[1], height])
      );
    });

    const groupedVertices = polygons;
    this.groupedVertices = polygons;
    const pointCount = getPointCount(polygons);
    this.pointCount = pointCount;
    this.wireframe = wireframe;

    this.attributes = {};

    const positionsJS = calculatePositionsJS({groupedVertices, pointCount, wireframe});
    Object.assign(this.attributes, {
      positions: calculatePositions(positionsJS, this.fp64),
      indices: calculateIndices({groupedVertices, wireframe}),
      normals: calculateNormals({groupedVertices, pointCount, wireframe}),
      // colors: calculateColors({groupedVertices, wireframe, getColor}),
      pickingColors: calculatePickingColors({groupedVertices, pointCount, wireframe})
    });
  }

  indices() {
    return this.attributes.indices;
  }

  positions() {
    return this.attributes.positions;
  }

  normals() {
    return this.attributes.normals;
  }

  colors({getColor = x => DEFAULT_COLOR} = {}) {
    const {groupedVertices, pointCount, wireframe} = this;
    return calculateColors({groupedVertices, pointCount, wireframe, getColor});
  }

  pickingColors() {
    return this.attributes.pickingColors;
  }

  // updateTriggers: {
  //   positions: ['getHeight'],
  //   colors: ['getColors']
  //   pickingColors: 'none'
  // }
}

// Count number of points in a list of complex polygons
function getPointCount(polygons) {
  return polygons.reduce((points, polygon) => points + Polygon.getVertexCount(polygon), 0);
}

function calculateIndices({groupedVertices, wireframe = false}) {
  // adjust index offset for multiple polygons
  const multiplier = wireframe ? 2 : 5;
  const offsets = [];
  groupedVertices.reduce((vertexIndex, vertices) => {
    offsets.push(vertexIndex);
    return vertexIndex + Polygon.getVertexCount(vertices) * multiplier;
  }, 0);

  const indices = groupedVertices.map(
    (vertices, polygonIndex) =>
      wireframe
        ? // 1. get sequentially ordered indices of each polygons wireframe
          // 2. offset them by the number of indices in previous polygons
          calculateContourIndices(vertices, offsets[polygonIndex])
        : // 1. get triangulated indices for the internal areas
          // 2. offset them by the number of indices in previous polygons
          calculateSurfaceIndices(vertices, offsets[polygonIndex])
  );

  return new Uint32Array(flatten(indices, 2));
}

// Calculate a flat position array in JS - can be mapped to 32 or 64 bit typed arrays
// Remarks:
// * each top vertex is on 3 surfaces
// * each bottom vertex is on 2 surfaces
function calculatePositionsJS({groupedVertices, pointCount, wireframe = false}) {
  const multiplier = wireframe ? 2 : 5;
  const positions = new Float32Array(pointCount * 3 * multiplier);
  let vertexIndex = 0;

  groupedVertices.forEach(vertices => {
    const topVertices = flatten(vertices, 3);

    const baseVertices = topVertices.slice(0);
    let i = topVertices.length - 1;
    while (i > 0) {
      baseVertices[i] = 0;
      i -= 3;
    }
    const len = topVertices.length;

    if (wireframe) {
      fillArray({target: positions, source: topVertices, start: vertexIndex});
      fillArray({target: positions, source: baseVertices, start: vertexIndex + len});
    } else {
      fillArray({target: positions, source: topVertices, start: vertexIndex, count: 3});
      fillArray({
        target: positions,
        source: baseVertices,
        start: vertexIndex + len * 3,
        count: 2
      });
    }
    vertexIndex += len * multiplier;
  });

  return positions;
}

function calculatePositions(positionsJS, fp64) {
  let positionLow;
  if (fp64) {
    // We only need x, y component
    const vertexCount = positionsJS.length / 3;
    positionLow = new Float32Array(vertexCount * 2);
    for (let i = 0; i < vertexCount; i++) {
      positionLow[i * 2 + 0] = fp64LowPart(positionsJS[i * 3 + 0]);
      positionLow[i * 2 + 1] = fp64LowPart(positionsJS[i * 3 + 1]);
    }
  }
  return {positions: positionsJS, positions64xyLow: positionLow};
}

function calculateNormals({groupedVertices, pointCount, wireframe}) {
  const up = [0, 0, 1];
  const multiplier = wireframe ? 2 : 5;

  const normals = new Float32Array(pointCount * 3 * multiplier);
  let vertexIndex = 0;

  if (wireframe) {
    return fillArray({target: normals, source: up, count: pointCount * multiplier});
  }

  groupedVertices.map((vertices, polygonIndex) => {
    const vertexCount = Polygon.getVertexCount(vertices);

    fillArray({target: normals, source: up, start: vertexIndex, count: vertexCount});
    vertexIndex += vertexCount * 3;

    const sideNormalsForward = [];
    const sideNormalsBackward = [];

    vertices.forEach(polygon => {
      const sideNormals = calculateSideNormals(polygon);
      const firstNormal = sideNormals.slice(0, 3);

      arrayPush(sideNormalsForward, sideNormals);
      arrayPush(sideNormalsForward, firstNormal);

      arrayPush(sideNormalsBackward, firstNormal);
      arrayPush(sideNormalsBackward, sideNormals);
    });

    fillArray({
      target: normals,
      start: vertexIndex,
      count: 2,
      source: sideNormalsForward.concat(sideNormalsBackward)
    });
    vertexIndex += vertexCount * 3 * 4;
  });

  return normals;
}

function calculateSideNormals(vertices) {
  const normals = [];

  let lastVertice = null;
  for (const vertice of vertices) {
    if (lastVertice) {
      // vertex[i-1], vertex[i]
      const n = getNormal(lastVertice, vertice);
      arrayPush(normals, n);
    }
    lastVertice = vertice;
  }

  return normals;
}

function calculateColors({groupedVertices, pointCount, getColor, wireframe = false}) {
  const multiplier = wireframe ? 2 : 5;
  const colors = new Uint8ClampedArray(pointCount * 4 * multiplier);
  let vertexIndex = 0;

  groupedVertices.forEach((complexPolygon, polygonIndex) => {
    const color = getColor(polygonIndex);
    color[3] = Number.isFinite(color[3]) ? color[3] : 255;

    const numVertices = Polygon.getVertexCount(complexPolygon);

    fillArray({target: colors, source: color, start: vertexIndex, count: numVertices * multiplier});
    vertexIndex += color.length * numVertices * multiplier;
  });

  return colors;
}

function calculatePickingColors({groupedVertices, pointCount, wireframe = false}) {
  const multiplier = wireframe ? 2 : 5;
  const colors = new Uint8ClampedArray(pointCount * 3 * multiplier);
  let vertexIndex = 0;

  groupedVertices.forEach((vertices, polygonIndex) => {
    const numVertices = Polygon.getVertexCount(vertices);
    const color = getPickingColor(polygonIndex);

    fillArray({target: colors, source: color, start: vertexIndex, count: numVertices * multiplier});
    vertexIndex += color.length * numVertices * multiplier;
  });
  return colors;
}

function calculateContourIndices(vertices, offset) {
  const stride = Polygon.getVertexCount(vertices);
  const indices = [];

  vertices.forEach(polygon => {
    indices.push(offset);
    const numVertices = polygon.length;

    // polygon top
    // use vertex pairs for GL.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    for (let i = 1; i < numVertices - 1; i++) {
      indices.push(i + offset, i + offset);
    }
    indices.push(offset);

    // polygon sides
    for (let i = 0; i < numVertices - 1; i++) {
      indices.push(i + offset, i + stride + offset);
    }

    offset += numVertices;
  });

  return indices;
}

function drawSurfaceRectangle(targetArray, offset, stride) {
  targetArray.push(
    offset + stride,
    offset + stride * 3,
    offset + stride * 2 + 1,
    offset + stride * 2 + 1,
    offset + stride * 3,
    offset + stride * 4 + 1
  );
}

function calculateSurfaceIndices(vertices, offset) {
  const stride = Polygon.getVertexCount(vertices);

  let holes = null;
  const holeCount = vertices.length - 1;

  if (holeCount) {
    holes = [];
    let vertexIndex = 0;
    for (let i = 0; i < holeCount; i++) {
      vertexIndex += vertices[i].length;
      holes[i] = vertexIndex;
    }
  }

  const indices = earcut(flatten(vertices, 3), holes, 3).map(index => index + offset);

  vertices.forEach(polygon => {
    const numVertices = polygon.length;

    // polygon sides
    for (let i = 0; i < numVertices - 1; i++) {
      drawSurfaceRectangle(indices, offset + i, stride);
    }

    offset += numVertices;
  });

  return indices;
}

// helpers

// get normal vector of line segment
function getNormal(p1, p2) {
  return [p1[1] - p2[1], p2[0] - p1[0], 0];
}
