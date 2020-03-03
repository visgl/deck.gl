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
        positions: {size: 3, padding: 18, type: opts.fp64 ? Float64Array : Float32Array},
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

  /* Getters */
  get(attributeName) {
    return this.attributes[attributeName];
  }

  /* Implement base Tesselator interface */
  getGeometrySize(path) {
    if (!this.normalize) {
      const numPoints = path.length / this.positionSize;
      return this.opts.loop ? numPoints + 2 : numPoints;
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
    this._updateSegmentTypes(path, context);
    this._updatePositions(path, context);
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

    // positions   --  A0 A1 B0 B1 B2 B3 B0 B1 B2 --
    // segmentTypes     3  4  4  0  0  0  0  4  4
    for (let i = vertexStart, ptIndex = 0; ptIndex < geometrySize; i++, ptIndex++) {
      const p = this.getPointOnPath(path, ptIndex);
      positions[i * 3] = p[0];
      positions[i * 3 + 1] = p[1];
      positions[i * 3 + 2] = p[2] || 0;
    }
  }

  /* Utilities */
  getPathLength(path) {
    if (Number.isFinite(path[0])) {
      // flat format
      return path.length / this.positionSize;
    }
    return path.length;
  }

  getPointOnPath(path, index) {
    if (Number.isFinite(path[0])) {
      // flat format
      const {positionSize} = this;
      if (index * positionSize >= path.length) {
        // loop
        index += 1 - path.length / positionSize;
      }
      // TODO - avoid creating new arrays when using binary
      return [
        path[index * positionSize],
        path[index * positionSize + 1],
        positionSize === 3 ? path[index * positionSize + 2] : 0
      ];
    }
    if (index >= path.length) {
      // loop
      index += 1 - path.length;
    }
    return path[index];
  }

  isClosed(path) {
    if (!this.normalize) {
      return this.opts.loop;
    }
    const numPoints = this.getPathLength(path);
    const firstPoint = this.getPointOnPath(path, 0);
    const lastPoint = this.getPointOnPath(path, numPoints - 1);
    return (
      firstPoint[0] === lastPoint[0] &&
      firstPoint[1] === lastPoint[1] &&
      firstPoint[2] === lastPoint[2]
    );
  }
}
