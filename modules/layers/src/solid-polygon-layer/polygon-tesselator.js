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

// Handles tesselation of polygons with holes
// - 2D surfaces
// - 2D outlines
// - 3D surfaces (top and sides only)
// - 3D wireframes (not yet)
import * as Polygon from './polygon';
import {experimental} from '@deck.gl/core';
const {fillArray} = experimental;
import {fp64 as fp64Module} from 'luma.gl';
const {fp64LowPart} = fp64Module;

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export default class PolygonTesselator {
  constructor({data, getPolygon, IndexType = Uint32Array}) {
    const bufferLayout = [];
    // Count all polygon vertices
    let pointCount = 0;

    for (const object of data) {
      const polygon = getPolygon(object);
      const vertexCount = Polygon.getVertexCount(polygon);
      bufferLayout.push(vertexCount);
      pointCount += vertexCount;
    }

    // TODO: dynamically decide IndexType in tesselator?
    // Check if the vertex count excedes index type limit
    if (IndexType === Uint16Array && this.pointCount > 65535) {
      throw new Error("Vertex count exceeds browser's limit");
    }

    this.data = data;
    this.getPolygon = getPolygon;
    this.IndexType = IndexType;
    this.bufferLayout = bufferLayout;
    this.pointCount = pointCount;
    this.attributes = {};
  }

  /* Getters */
  indices() {
    return this.attributes.indices;
  }

  positions() {
    return this.attributes.positions;
  }
  positions64xyLow() {
    return this.attributes.positions64xyLow;
  }

  vertexValid() {
    return this.attributes.vertexValid;
  }

  elevations({target, getElevation}) {
    return this.updateValues({
      target,
      size: 1,
      getValue: object => [getElevation(object)]
    });
  }

  colors({target, getColor}) {
    return this.updateValues({
      target,
      size: 4,
      getValue: object => {
        const color = getColor(object);
        if (isNaN(color[3])) {
          color[3] = 255;
        }
        return color;
      }
    });
  }

  pickingColors({target, getPickingColor}) {
    return this.updateValues({
      target,
      size: 3,
      getValue: (object, index) => getPickingColor(index)
    });
  }

  /* Updaters */
  updatePositions({fp64}) {
    const {attributes, data, getPolygon, pointCount, bufferLayout, IndexType} = this;

    attributes.positions = attributes.positions || new Float32Array(pointCount * 3);
    attributes.vertexValid = attributes.vertexValid || new Uint8ClampedArray(pointCount).fill(1);

    if (fp64) {
      // We only need x, y component
      attributes.positions64xyLow = attributes.positions64xyLow || new Float32Array(pointCount * 2);
    }

    const polygons = [];

    for (const object of data) {
      const polygon = Polygon.normalize(getPolygon(object));
      polygons.push(polygon);
    }

    updatePositions({cache: attributes, polygons, fp64});

    attributes.indices = calculateIndices({polygons, bufferLayout, IndexType});
  }

  updateValues({target, size, getValue}) {
    const {data, bufferLayout} = this;
    let i = 0;
    let dataIndex = 0;
    for (const object of data) {
      const value = getValue(object, dataIndex);
      const numVertices = bufferLayout[dataIndex++];
      fillArray({target, source: value, start: i, count: numVertices});
      i += numVertices * size;
    }
    return target;
  }
}

function getTriangleCount(polygons) {
  return polygons.reduce((triangles, polygon) => triangles + Polygon.getTriangleCount(polygon), 0);
}

// Flatten the indices array
function calculateIndices({polygons, bufferLayout, IndexType}) {
  // Calculate length of index array (3 * number of triangles)
  const estimatedIndexCount = 3 * getTriangleCount(polygons);
  // Allocate the indices array
  const attribute = new IndexType(estimatedIndexCount);

  // 1. get triangulated indices for the internal areas
  // 2. offset them by the number of indices in previous polygons
  let i = 0;
  let offset = 0;
  polygons.forEach((polygon, polygonIndex) => {
    const indices = Polygon.getSurfaceIndices(polygon);
    for (let j = 0; j < indices.length; j++) {
      attribute[i++] = indices[j] + offset;
    }
    offset += bufferLayout[polygonIndex];
  });

  return attribute.subarray(0, i);
}

function updatePositions({cache: {positions, positions64xyLow, vertexValid}, polygons, fp64}) {
  // Flatten out all the vertices of all the sub subPolygons
  let i = 0;
  polygons.forEach((polygon, polygonIndex) => {
    polygon.forEach(loop => {
      loop.forEach((vertex, vertexIndex) => {
        // eslint-disable-line
        const x = vertex[0];
        const y = vertex[1];
        const z = vertex[2] || 0;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        if (fp64) {
          positions64xyLow[i * 2] = fp64LowPart(x);
          positions64xyLow[i * 2 + 1] = fp64LowPart(y);
        }
        i++;
      });
      /* We are reusing the some buffer for `nextPositions` by offsetting one vertex
       * to the left. As a result,
       * the last vertex of each loop overlaps with the first vertex of the next loop.
       * `vertexValid` is used to mark the end of each loop so we don't draw these
       * segments:
        positions      A0 A1 A2 A3 A4 B0 B1 B2 C0 ...
        nextPositions  A1 A2 A3 A4 B0 B1 B2 C0 C1 ...
        vertexValid    1  1  1  1  0  1  1  0  1 ...
       */
      vertexValid[i - 1] = 0;
    });
  });
}
