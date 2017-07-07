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
import vec3_normalize from 'gl-vec3/normalize';
import {fp64ify} from '../../../lib/utils/fp64';
import {get, count} from '../../../lib/utils';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';

function getPickingColor(index) {
  return [
    (index + 1) & 255,
    ((index + 1) >> 8) & 255,
    (((index + 1) >> 8) >> 8) & 255
  ];
}

function parseColor(color) {
  if (!Array.isArray(color)) {
    color = [get(color, 0), get(color, 1), get(color, 2), get(color, 3)];
  }
  color[3] = Number.isFinite(color[3]) ? color[3] : 255;
  return color;
}

const DEFAULT_COLOR = [0, 0, 0, 255]; // Black

export class PolygonTesselatorExtruded {

  constructor({
    polygons,
    getHeight = x => 1000,
    getColor = x => [0, 0, 0, 255],
    wireframe = false,
    fp64 = false
  }) {
    this.fp64 = fp64;

    // Expensive operation, convert all polygons to arrays
    polygons = polygons.map((complexPolygon, polygonIndex) => {
      const height = getHeight(polygonIndex) || 0;
      return Polygon.normalize(complexPolygon).map(
        polygon => polygon.map(coord => [get(coord, 0), get(coord, 1), height])
      );
    });

    const groupedVertices = polygons;
    this.groupedVertices = polygons;
    this.wireframe = wireframe;

    this.attributes = {};

    const positionsJS = calculatePositionsJS({groupedVertices, wireframe});
    Object.assign(this.attributes, {
      positions: calculatePositions(positionsJS, this.fp64),
      indices: calculateIndices({groupedVertices, wireframe}),
      normals: calculateNormals({groupedVertices, wireframe}),
      // colors: calculateColors({groupedVertices, wireframe, getColor}),
      pickingColors: calculatePickingColors({groupedVertices, wireframe})
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
    const {groupedVertices, wireframe} = this;
    return calculateColors({groupedVertices, wireframe, getColor});
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

function countVertices(vertices) {
  return vertices.reduce((vertexCount, polygon) => vertexCount + count(polygon), 0);
}

function calculateIndices({groupedVertices, wireframe = false}) {
  // adjust index offset for multiple polygons
  const multiplier = wireframe ? 2 : 5;
  const offsets = groupedVertices.reduce(
    (acc, vertices) =>
      acc.concat(acc[acc.length - 1] + countVertices(vertices) * multiplier),
    [0]
  );

  const indices = groupedVertices.map((vertices, polygonIndex) =>
    wireframe ?
      // 1. get sequentially ordered indices of each polygons wireframe
      // 2. offset them by the number of indices in previous polygons
      calculateContourIndices(vertices, offsets[polygonIndex]) :
      // 1. get triangulated indices for the internal areas
      // 2. offset them by the number of indices in previous polygons
      calculateSurfaceIndices(vertices, offsets[polygonIndex])
  );

  return new Uint32Array(flattenDeep(indices));
}

// Calculate a flat position array in JS - can be mapped to 32 or 64 bit typed arrays
// Remarks:
// * each top vertex is on 3 surfaces
// * each bottom vertex is on 2 surfaces
function calculatePositionsJS({groupedVertices, wireframe = false}) {
  const positions = groupedVertices.map(
    vertices => {
      const topVertices = Array.prototype.concat.apply([], vertices);
      const baseVertices = topVertices.map(v => [get(v, 0), get(v, 1), 0]);
      return wireframe ? [topVertices, baseVertices] :
        [topVertices, topVertices, topVertices, baseVertices, baseVertices];
    }
  );

  return flattenDeep(positions);
}

function calculatePositions(positionsJS, fp64) {
  let positionLow;
  if (fp64) {
    // We only need x, y component
    positionLow = new Float32Array(positionsJS.length / 3 * 2);
    for (let i = 0; i < positionsJS.length / 3; i++) {
      positionLow[i * 2 + 0] = fp64ify(positionsJS[i * 3 + 0])[1];
      positionLow[i * 2 + 1] = fp64ify(positionsJS[i * 3 + 1])[1];
    }

  }
  return {positions: new Float32Array(positionsJS), positions64xyLow: positionLow};
}

function calculateNormals({groupedVertices, wireframe}) {
  const up = [0, 1, 0];

  const normals = groupedVertices.map((vertices, polygonIndex) => {
    const topNormals = new Array(countVertices(vertices)).fill(up);
    const sideNormals = vertices.map(polygon => calculateSideNormals(polygon));
    const sideNormalsForward = sideNormals.map(n => n[0]);
    const sideNormalsBackward = sideNormals.map(n => n[1]);

    return wireframe ?
    [topNormals, topNormals] :
    [topNormals, sideNormalsForward, sideNormalsBackward, sideNormalsForward, sideNormalsBackward];
  });

  return new Float32Array(flattenDeep(normals));
}

function calculateSideNormals(vertices) {
  const normals = [];

  let lastVertice = null;
  for (const vertice of vertices) {
    if (lastVertice) {
      // vertex[i-1], vertex[i]
      const n = getNormal(lastVertice, vertice);
      normals.push(n);
    }
    lastVertice = vertice;
  }

  return [[normals.concat(normals[0])], [[normals[0]].concat(normals)]];
}

function calculateColors({groupedVertices, getColor, wireframe = false}) {
  const colors = groupedVertices.map((complexPolygon, polygonIndex) => {
    let color = getColor(polygonIndex);
    color = parseColor(color);

    const numVertices = countVertices(complexPolygon);
    const topColors = new Array(numVertices).fill(color);
    const baseColors = new Array(numVertices).fill(color);
    return wireframe ?
      [topColors, baseColors] :
      [topColors, topColors, topColors, baseColors, baseColors];
  });
  return new Uint8ClampedArray(flattenDeep(colors));
}

function calculatePickingColors({groupedVertices, wireframe = false}) {
  const colors = groupedVertices.map((vertices, polygonIndex) => {
    const numVertices = countVertices(vertices);
    const color = getPickingColor(polygonIndex);
    const topColors = new Array(numVertices).fill(color);
    const baseColors = new Array(numVertices).fill(color);
    return wireframe ?
      [topColors, baseColors] :
      [topColors, topColors, topColors, baseColors, baseColors];
  });
  return new Uint8ClampedArray(flattenDeep(colors));
}

function calculateContourIndices(vertices, offset) {
  const stride = countVertices(vertices);

  return vertices.map(polygon => {
    const indices = [offset];
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
    return indices;
  });
}

function calculateSurfaceIndices(vertices, offset) {
  const stride = countVertices(vertices);
  const quad = [
    [0, 1], [0, 3], [1, 2],
    [1, 2], [0, 3], [1, 4]
  ];

  function drawRectangle(i) {
    return quad.map(v => i + v[0] + stride * v[1] + offset);
  }

  let holes = null;

  if (vertices.length > 1) {
    holes = vertices.reduce(
      (acc, polygon) => acc.concat(acc[acc.length - 1] + polygon.length),
      [0]
    ).slice(1, vertices.length);
  }

  const topIndices = earcut(flattenDeep(vertices), holes, 3).map(index => index + offset);

  const sideIndices = vertices.map(polygon => {
    const numVertices = polygon.length;
    // polygon top
    let indices = [];

    // polygon sides
    for (let i = 0; i < numVertices - 1; i++) {
      indices = indices.concat(drawRectangle(i));
    }

    offset += numVertices;
    return indices;
  });

  return [topIndices, sideIndices];
}

// helpers

// get normal vector of line segment
function getNormal(p1, p2) {
  const p1x = get(p1, 0);
  const p1y = get(p1, 1);
  const p2x = get(p2, 0);
  const p2y = get(p2, 1);

  if (p1x === p2x && p1y === p2y) {
    return [1, 0, 0];
  }

  const degrees2radians = Math.PI / 180;
  const lon1 = degrees2radians * p1x;
  const lon2 = degrees2radians * p2x;
  const lat1 = degrees2radians * p1y;
  const lat2 = degrees2radians * p2y;
  const a = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const b = Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  return vec3_normalize([], [b, 0, -a]);
}
