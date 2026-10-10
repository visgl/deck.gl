// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {_GlobeViewport, type Viewport} from '@deck.gl/core';

/** Converts common-space positions to Deck's local east/north/up metre-offset frame.
 * Matches the globe tangent frame and the map shader's second-order distance scales.
 * Intended for neighborhood-scale scenes, without an additional layer model matrix.
 */
export function getMeterOffsetPosition(
  viewport: Viewport,
  coordinateOrigin: readonly number[],
  commonPosition: readonly number[]
): [number, number, number] {
  const origin = viewport.projectPosition([
    coordinateOrigin[0],
    coordinateOrigin[1],
    coordinateOrigin[2] || 0
  ]);
  const relative = commonPosition.map((value, index) => value - origin[index]);
  const scales = viewport.getDistanceScales([...coordinateOrigin]);
  if (viewport instanceof _GlobeViewport) {
    const radius = Math.hypot(...origin);
    const up = origin.map(value => value / radius);
    const horizontalLength = Math.hypot(up[0], up[1]);
    // Match project_get_orientation_matrix, including its pole convention.
    const west =
      Math.abs(up[2]) === 1 ? [1, 0, 0] : [up[1] / horizontalLength, -up[0] / horizontalLength, 0];
    const south = [
      up[1] * west[2] - up[2] * west[1],
      up[2] * west[0] - up[0] * west[2],
      up[0] * west[1] - up[1] * west[0]
    ];
    const dot = (axis: number[]) =>
      axis.reduce((sum, value, index) => sum + value * relative[index], 0);
    return [
      -dot(west) / scales.unitsPerMeter[0],
      -dot(south) / scales.unitsPerMeter[1],
      dot(up) / scales.unitsPerMeter[2]
    ];
  }
  const linear = scales.unitsPerMeter;
  // Deck's base Viewport type omits the high-precision terms returned by map viewports.
  const {unitsPerMeter2: quadratic = [0, 0, 0]} = scales as typeof scales & {
    unitsPerMeter2?: readonly [number, number, number];
  };
  // Stable inverse of commonY = north * (linearY + quadraticY * north).
  const discriminant = Math.max(0, linear[1] ** 2 + 4 * quadratic[1] * relative[1]);
  const north = (2 * relative[1]) / (linear[1] + Math.sqrt(discriminant));
  return [
    relative[0] / (linear[0] + quadratic[0] * north),
    north,
    relative[2] / (linear[2] + quadratic[2] * north)
  ];
}
