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
import {experimental} from '@deck.gl/core';
const {Tesselator} = experimental;

const START_CAP = 1;
const END_CAP = 2;
const INVALID = 4;

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export default class PathTesselator extends Tesselator {
  constructor({data, getGeometry, positionFormat, fp64}) {
    super({
      data,
      getGeometry,
      positionFormat,
      attributes: {
        startPositions: {size: 3, padding: 3, type: fp64 ? Float64Array : Float32Array},
        endPositions: {size: 3, padding: 3, type: fp64 ? Float64Array : Float32Array},
        segmentTypes: {size: 1, type: Uint8ClampedArray},
        startPositions64XyLow: {size: 2, padding: 2, fp64Only: true},
        endPositions64XyLow: {size: 2, padding: 2, fp64Only: true}
      }
    });
  }

  /* Getters */
  get(attributeName) {
    return this.attributes[attributeName];
  }

  /* Implement base Tesselator interface */
  getGeometrySize(path) {
    const numPoints = this.getPathLength(path);
    if (numPoints < 2) {
      // invalid path
      return 0;
    }
    if (this.isClosed(path)) {
      // minimum 3 vertices
      return numPoints < 3 ? 0 : numPoints + 1;
    }
    return numPoints - 1;
  }

  /* eslint-disable max-statements, complexity */
  updateGeometryAttributes(path, context) {
    const {
      attributes: {startPositions, endPositions, segmentTypes}
    } = this;

    const {geometrySize} = context;
    if (geometrySize === 0) {
      return;
    }
    const isPathClosed = this.isClosed(path);

    let startPoint;
    let endPoint;

    // startPositions   --  A0  B0 B1 B2 B3 B0 B1
    // endPositions         A1  B1 B2 B3 B0 B1 B2  --
    // segmentTypes         3   4  0  0  0  0  4
    for (let i = context.vertexStart, ptIndex = 0; ptIndex < geometrySize; i++, ptIndex++) {
      startPoint = endPoint || this.getPointOnPath(path, 0);
      endPoint = this.getPointOnPath(path, ptIndex + 1);

      segmentTypes[i] = 0;
      if (ptIndex === 0) {
        if (isPathClosed) {
          segmentTypes[i] += INVALID;
        } else {
          segmentTypes[i] += START_CAP;
        }
      }
      if (ptIndex === geometrySize - 1) {
        if (isPathClosed) {
          segmentTypes[i] += INVALID;
        } else {
          segmentTypes[i] += END_CAP;
        }
      }

      startPositions[i * 3 + 3] = startPoint[0];
      startPositions[i * 3 + 4] = startPoint[1];
      startPositions[i * 3 + 5] = startPoint[2] || 0;

      endPositions[i * 3] = endPoint[0];
      endPositions[i * 3 + 1] = endPoint[1];
      endPositions[i * 3 + 2] = endPoint[2] || 0;
    }
  }
  /* eslint-enable max-statements, complexity */

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
