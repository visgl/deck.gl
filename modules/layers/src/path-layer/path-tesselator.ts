// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Tesselator} from '@deck.gl/core';
import {normalizePath} from './path';

import type {TypedArray} from '@math.gl/core';
import type {PathGeometry, FlatPathGeometry, NormalizedPathGeometry} from './path';

const START_CAP = 1;
const END_CAP = 2;
const INVALID = 4;

// This class is set up to allow querying one attribute at a time
// the way the AttributeManager expects it
export default class PathTesselator extends Tesselator<
  PathGeometry,
  NormalizedPathGeometry,
  {
    fp64?: boolean;
    resolution?: number;
    wrapLongitude?: boolean;
    loop?: boolean;
  }
> {
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

  /** Get packed attribute by name */
  get(attributeName: string): TypedArray | null {
    return this.attributes[attributeName];
  }

  /* Implement base Tesselator interface */
  protected getGeometryFromBuffer(buffer) {
    if (this.normalize) {
      return super.getGeometryFromBuffer(buffer);
    }
    // we don't need to read the positions if no normalization
    return null;
  }

  /* Implement base Tesselator interface */
  protected normalizeGeometry(path: PathGeometry): number[][] | PathGeometry {
    if (this.normalize) {
      return normalizePath(path, this.positionSize, this.opts.resolution, this.opts.wrapLongitude);
    }
    return path;
  }

  /* Implement base Tesselator interface */
  protected getGeometrySize(path: NormalizedPathGeometry): number {
    if (isCut(path)) {
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

  /* Implement base Tesselator interface */
  protected updateGeometryAttributes(
    path: NormalizedPathGeometry | null,
    context: {
      vertexStart: number;
      geometrySize: number;
    }
  ): void {
    if (context.geometrySize === 0) {
      return;
    }
    if (path && isCut(path)) {
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

  private _updateSegmentTypes(
    path: FlatPathGeometry | null,
    context: {
      vertexStart: number;
      geometrySize: number;
    }
  ) {
    const segmentTypes = this.attributes.segmentTypes as TypedArray;
    const isPathClosed = path ? this.isClosed(path) : false;
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

  private _updatePositions(
    path: FlatPathGeometry | null,
    context: {
      vertexStart: number;
      geometrySize: number;
    }
  ) {
    const {positions} = this.attributes;
    if (!positions || !path) {
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

  // Utilities
  /** Returns the number of points in the path */
  private getPathLength(path: FlatPathGeometry): number {
    return path.length / this.positionSize;
  }

  /** Returns a point on the path at the specified index */
  private getPointOnPath(path: FlatPathGeometry, index: number, target: number[] = []): number[] {
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
  private isClosed(path: FlatPathGeometry): boolean {
    if (!this.normalize) {
      return Boolean(this.opts.loop);
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

function isCut(path: NormalizedPathGeometry): path is FlatPathGeometry[] {
  return Array.isArray(path[0]);
}
