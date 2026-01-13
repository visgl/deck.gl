// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {projectPosition} from '../shaderlib/project/project-functions';
import {makeOrientedBoundingBoxFromPoints, OrientedBoundingBox} from '@math.gl/culling';

import type Viewport from '../viewports/viewport';
import type {CoordinateSystem} from './constants';
import type {NumericArray} from '../types/types';

export type WorldBoundsTransformOptions = {
  bounds: [number[], number[]];
  viewport: Viewport;
  coordinateSystem: CoordinateSystem;
  coordinateOrigin: [number, number, number];
  modelMatrix?: NumericArray | null;
  /** Additional props that affect bounds transformation and caching */
  worldBoundsCacheKey?: unknown;
};

export function transformBoundsToWorld(options: WorldBoundsTransformOptions): OrientedBoundingBox {
  const {bounds, viewport, coordinateOrigin, coordinateSystem, modelMatrix} = options;
  const corners = getBoundingBoxCorners(bounds);

  const worldPositions = corners.map(position =>
    projectPosition(position, {
      viewport,
      coordinateSystem,
      coordinateOrigin,
      modelMatrix
    })
  );

  return makeOrientedBoundingBoxFromPoints(worldPositions);
}

function getBoundingBoxCorners(bounds: [number[], number[]]): number[][] {
  const [min, max] = bounds;
  const dimension = Math.max(min.length, max.length, 3);
  const corners: number[][] = [];

  for (let i = 0; i < 8; i++) {
    const corner: number[] = [];
    for (let axis = 0; axis < 3; axis++) {
      const minValue = axis < dimension ? (min[axis] ?? 0) : 0;
      const maxValue = axis < dimension ? (max[axis] ?? minValue) : minValue;
      corner[axis] = i & (1 << axis) ? maxValue : minValue;
    }
    corners.push(corner);
  }

  return corners;
}
