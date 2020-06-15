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
import {Tesselator} from '@deck.gl/core';
import {cutPolygonByGrid, cutPolygonByMercatorBounds} from '@math.gl/polygon';

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export default class PolygonTesselator extends Tesselator {
  constructor(opts) {
    const {fp64, IndexType = Uint32Array} = opts;
    super({
      ...opts,
      attributes: {
        positions: {size: 3, type: fp64 ? Float64Array : Float32Array},
        vertexValid: {type: Uint8ClampedArray, size: 1},
        indices: {type: IndexType, size: 1}
      }
    });
  }

  /* Getters */
  get(attributeName) {
    const {attributes} = this;
    if (attributeName === 'indices') {
      return attributes.indices && attributes.indices.subarray(0, this.vertexCount);
    }

    return attributes[attributeName];
  }

  /* Implement base Tesselator interface */
  updateGeometry(opts) {
    super.updateGeometry(opts);

    const externalIndices = this.buffers.indices;
    if (externalIndices) {
      this.vertexCount = (externalIndices.value || externalIndices).length;
    }
  }

  normalizeGeometry(polygon) {
    if (this.normalize) {
      polygon = Polygon.normalize(polygon, this.positionSize);
      if (this.opts.resolution) {
        return cutPolygonByGrid(polygon.positions || polygon, polygon.holeIndices, {
          size: this.positionSize,
          gridResolution: this.opts.resolution,
          edgeTypes: true
        });
      }
      if (this.opts.wrapLongitude) {
        return cutPolygonByMercatorBounds(polygon.positions || polygon, polygon.holeIndices, {
          size: this.positionSize,
          maxLatitude: 86,
          edgeTypes: true
        });
      }
    }
    return polygon;
  }

  getGeometrySize(polygon) {
    if (Array.isArray(polygon) && !Number.isFinite(polygon[0])) {
      let size = 0;
      for (const subPolygon of polygon) {
        size += this.getGeometrySize(subPolygon);
      }
      return size;
    }
    return (polygon.positions || polygon).length / this.positionSize;
  }

  getGeometryFromBuffer(buffer) {
    if (this.normalize || !this.buffers.indices) {
      return super.getGeometryFromBuffer(buffer);
    }
    // we don't need to read the positions if no normalization/tesselation
    return () => null;
  }

  updateGeometryAttributes(polygon, context) {
    if (Array.isArray(polygon) && !Number.isFinite(polygon[0])) {
      for (const subPolygon of polygon) {
        const geometrySize = this.getGeometrySize(subPolygon);
        context.geometrySize = geometrySize;
        this.updateGeometryAttributes(subPolygon, context);
        context.vertexStart += geometrySize;
        context.indexStart = this.indexStarts[context.geometryIndex + 1];
      }
    } else {
      this._updateIndices(polygon, context);
      this._updatePositions(polygon, context);
      this._updateVertexValid(polygon, context);
    }
  }

  // Flatten the indices array
  _updateIndices(polygon, {geometryIndex, vertexStart: offset, indexStart}) {
    const {attributes, indexStarts, typedArrayManager} = this;

    let target = attributes.indices;
    if (!target) {
      return;
    }
    let i = indexStart;

    // 1. get triangulated indices for the internal areas
    const indices = Polygon.getSurfaceIndices(polygon, this.positionSize, this.opts.preproject);

    // make sure the buffer is large enough
    target = typedArrayManager.allocate(target, indexStart + indices.length, {
      copy: true
    });

    // 2. offset each index by the number of indices in previous polygons
    for (let j = 0; j < indices.length; j++) {
      target[i++] = indices[j] + offset;
    }

    indexStarts[geometryIndex + 1] = indexStart + indices.length;
    attributes.indices = target;
  }

  // Flatten out all the vertices of all the sub subPolygons
  _updatePositions(polygon, {vertexStart, geometrySize}) {
    const {
      attributes: {positions},
      positionSize
    } = this;
    if (!positions) {
      return;
    }
    const polygonPositions = polygon.positions || polygon;

    for (let i = vertexStart, j = 0; j < geometrySize; i++, j++) {
      const x = polygonPositions[j * positionSize];
      const y = polygonPositions[j * positionSize + 1];
      const z = positionSize > 2 ? polygonPositions[j * positionSize + 2] : 0;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
  }

  _updateVertexValid(polygon, {vertexStart, geometrySize}) {
    const {
      attributes: {vertexValid},
      positionSize
    } = this;
    const holeIndices = polygon && polygon.holeIndices;
    /* We are reusing the some buffer for `nextPositions` by offseting one vertex
     * to the left. As a result,
     * the last vertex of each ring overlaps with the first vertex of the next ring.
     * `vertexValid` is used to mark the end of each ring so we don't draw these
     * segments:
      positions      A0 A1 A2 A3 A4 B0 B1 B2 C0 ...
      nextPositions  A1 A2 A3 A4 B0 B1 B2 C0 C1 ...
      vertexValid    1  1  1  1  0  1  1  0  1 ...
     */
    if (polygon && polygon.edgeTypes) {
      vertexValid.set(polygon.edgeTypes, vertexStart);
    } else {
      vertexValid.fill(1, vertexStart, vertexStart + geometrySize);
    }
    if (holeIndices) {
      for (let j = 0; j < holeIndices.length; j++) {
        vertexValid[vertexStart + holeIndices[j] / positionSize - 1] = 0;
      }
    }
    vertexValid[vertexStart + geometrySize - 1] = 0;
  }
}
