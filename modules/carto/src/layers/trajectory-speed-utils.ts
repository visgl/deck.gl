// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ProcessedGeometry} from './trajectory-utils';

// Helper functions for speed calculation
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function distanceBetweenPoints([lon1, lat1, lon2, lat2]: number[]): number {
  const R = 6371000; // Radius of the earth in m
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate speeds and write to numericProps attribute for trajectory geometry
 */
export function autocomputeSpeed(geometry: ProcessedGeometry): void {
  const {positions, attributes} = geometry;
  const n = positions.value.length / positions.size;
  geometry.numericProps.speed = {value: new Float32Array(n), size: 1};

  // Calculate speed and write to numericProps
  let previousSpeed = 0;

  for (let i = 0; i < n; i++) {
    let speed = 0;

    if (i < n - 1) {
      const start = i === n - 1 ? i - 1 : i;
      const step = positions.value.subarray(
        positions.size * start,
        positions.size * start + 2 * positions.size
      );
      let lat1: number = 0;
      let lat2: number = 0;
      let lon1: number = 0;
      let lon2: number = 0;

      if (positions.size === 2) {
        [lon1, lat1, lon2, lat2] = step;
      } else if (positions.size === 3) {
        [lon1, lat1, , lon2, lat2] = step; // skip altitude values
      }

      const deltaP = distanceBetweenPoints([lon1, lat1, lon2, lat2]);
      const [t1, t2] = attributes.getTimestamps.value.subarray(start, start + 2);
      const deltaT = t2 - t1;
      speed = deltaT > 0 ? deltaP / deltaT : previousSpeed;

      if (deltaT === 0) {
        speed = previousSpeed;
      }

      previousSpeed = speed;
    }

    if (speed === 0) {
      speed = 100; // fallback speed
    }

    // Write speed to numericProps
    geometry.numericProps.speed.value[i] = speed;
  }
}
