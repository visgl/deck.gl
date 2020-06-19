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
import {Tesselator} from '@deck.gl/core';
import {normalizePath} from './path';

const START_CAP = 1;
const END_CAP = 2;
const INVALID = 4;

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export default class PathTesselator extends Tesselator {
  constructor(opts) {
    super({
      ...opts,
      attributes: {
        // Padding covers shaderAttributes for last segment in largest case fp64
        // additional vertex + hi & low parts, 3 * 6
        positions: {
          size: 3,
          padding: 18,
          initialize: true,
          type: opts.fp64 ? Float64Array : Float32Array
        },
        segmentTypes: {size: 1, type: Uint8ClampedArray}
      }
    });
  }

  getGeometryFromBuffer(buffer) {
    if (this.normalize) {
      return super.getGeometryFromBuffer(buffer);
    }
    // we don't need to read the positions if no normalization
    return () => null;
  }

  normalizeGeometry(path) {
    if (this.normalize) {
      return normalizePath(path, this.positionSize, this.opts.resolution, this.opts.wrapLongitude);
    }
    return path;
  }

  /* Getters */
  get(attributeName) {
    return this.attributes[attributeName];
  }

  /* Implement base Tesselator interface */
  getGeometrySize(path) {
    if (Array.isArray(path[0])) {
      let size = 0;
      for (const subPath of path) {
        size += this.getGeometrySize(subPath);
      }
      return size;
    }
    const numPoints = this.getPathLength(path);
    if (numPoints < 2) {
      // invalid path
      return 0;
    }
    if (this.isClosed(path)) {
      // minimum 3 vertices
      return numPoints < 3 ? 0 : numPoints + 2;
    }
    return numPoints;
  }

  updateGeometryAttributes(path, context) {
    if (context.geometrySize === 0) {
      return;
    }
    if (path && Array.isArray(path[0])) {
      for (const subPath of path) {
        const geometrySize = this.getGeometrySize(subPath);
        context.geometrySize = geometrySize;
        this.updateGeometryAttributes(subPath, context);
        context.vertexStart += geometrySize;
      }
    } else {
      this._updateSegmentTypes(path, context);
      this._updatePositions(path, context);
    }
  }

  _updateSegmentTypes(path, context) {
    const {segmentTypes} = this.attributes;
    const isPathClosed = this.isClosed(path);
    const {vertexStart, geometrySize} = context;

    // positions   --  A0 A1 B0 B1 B2 B3 B0 B1 B2 --
    // segmentTypes     3  4  4  0  0  0  0  4  4
    segmentTypes.fill(0, vertexStart, vertexStart + geometrySize);
    if (isPathClosed) {
      segmentTypes[vertexStart] = INVALID;
      segmentTypes[vertexStart + geometrySize - 2] = INVALID;
    } else {
      segmentTypes[vertexStart] += START_CAP;
      segmentTypes[vertexStart + geometrySize - 2] += END_CAP;
    }
    segmentTypes[vertexStart + geometrySize - 1] = INVALID;
  }

  _updatePositions(path, context) {
    const {positions} = this.attributes;
    if (!positions) {
      return;
    }
    const {vertexStart, geometrySize} = context;
    const p = new Array(3);

    // positions   --  A0 A1 B0 B1 B2 B3 B0 B1 B2 --
    // segmentTypes     3  4  4  0  0  0  0  4  4
    for (let i = vertexStart, ptIndex = 0; ptIndex < geometrySize; i++, ptIndex++) {
      this.getPointOnPath(path, ptIndex, p);
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1];
      positions[i * 3 + 2] = p[2];
    }
  }

  /* Utilities */
  // Returns the number of points in the path
  getPathLength(path) {
    return path.length / this.positionSize;
  }

  // Returns a point on the path at the specified index
  getPointOnPath(path, index, target = []) {
    const {positionSize} = this;
    if (index * positionSize >= path.length) {
      // loop
      index += 1 - path.length / positionSize;
    }
    const i = index * positionSize;
    target[0] = path[i];
    target[1] = path[i + 1];
    target[2] = (positionSize === 3 && path[i + 2]) || 0;
    return target;
  }

  // Returns true if the first and last points are identical
  isClosed(path) {
    if (!this.normalize) {
      return this.opts.loop;
    }
    const {positionSize} = this;
    const lastPointIndex = path.length - positionSize;
    return (
      path[0] === path[lastPointIndex] &&
      path[1] === path[lastPointIndex + 1] &&
      (positionSize === 2 || path[2] === path[lastPointIndex + 2])
    );
  }
}
