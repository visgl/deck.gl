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
import Tesselator from '../path-layer/tesselator';
import {fp64 as fp64Module} from 'luma.gl';
const {fp64LowPart} = fp64Module;

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export default class PolygonTesselator extends Tesselator {
  constructor({data, getGeometry, fp64, IndexType = Uint32Array}) {
    super({
      data,
      getGeometry,
      fp64,
      attributes: {
        positions: {size: 3},
        positions64xyLow: {size: 2},
        vertexValid: {type: Uint8ClampedArray, size: 1},
        indices: {type: IndexType, size: 1}
      }
    });
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
    return this._updateAttribute({
      target,
      size: 1,
      getValue: object => [getElevation(object)]
    });
  }

  colors({target, getColor}) {
    return this._updateAttribute({
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
    return this._updateAttribute({
      target,
      size: 3,
      getValue: (object, index) => getPickingColor(index)
    });
  }

  /* Utils */
  countInstancesInGeometry(polygon) {
    return Polygon.getVertexCount(polygon);
  }

  /* Updaters */
  updateGeometryAttributes() {
    const {attributes, fp64, bufferLayout, typedArrayManager} = this;

    const polygons = [];

    this._forEachGeometry(polygon => {
      polygons.push(Polygon.normalize(polygon));
    });

    updatePositions({attributes, polygons, fp64});

    attributes.indices = calculateIndices({
      polygons,
      target: attributes.indices,
      bufferLayout,
      reallocate: typedArrayManager.reallocate.bind(typedArrayManager)
    });
  }
}

// Flatten the indices array
function calculateIndices({polygons, bufferLayout, target, reallocate}) {
  let currentLength = target.length;
  let i = 0;
  let offset = 0;
  polygons.forEach((polygon, polygonIndex) => {
    // 1. get triangulated indices for the internal areas
    const indices = Polygon.getSurfaceIndices(polygon);

    // make sure the buffer is large enough
    if (currentLength < i + indices.length) {
      currentLength *= 2;
      target = reallocate(target, currentLength, true);
    }

    // 2. offset each index by the number of indices in previous polygons
    for (let j = 0; j < indices.length; j++) {
      target[i++] = indices[j] + offset;
    }
    offset += bufferLayout[polygonIndex];
  });

  return target.subarray(0, i);
}

function updatePositions({attributes: {positions, positions64xyLow, vertexValid}, polygons, fp64}) {
  vertexValid.fill(1);
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
