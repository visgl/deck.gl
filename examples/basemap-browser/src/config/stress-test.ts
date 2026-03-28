// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer} from '@deck.gl/layers';
import type {Layer} from '@deck.gl/core';
import type {StressTest, Basemap} from '../types';
import {getInterleavedProps} from './interleaved';

/**
 * Get point count for a stress test level.
 */
function getPointCount(stressTest: StressTest): number {
  switch (stressTest) {
    case 'points-10k':
      return 10_000;
    case 'points-100k':
      return 100_000;
    case 'points-1m':
      return 1_000_000;
    case 'points-5m':
      return 5_000_000;
    case 'points-10m':
      return 10_000_000;
    default:
      return 0;
  }
}

/**
 * Generate random point data for stress testing.
 *
 * Format: Float32Array with [lng, lat, radius, r, g, b] per point
 * Colors are normalized 0-1 for Float32 binary attributes.
 */
function generateStressTestData(count: number): Float32Array {
  // 6 values per point: lng, lat, radius, r, g, b
  const data = new Float32Array(count * 6);

  // Generate random points within a reasonable geographic area
  // Centered roughly on Europe/Atlantic for visibility with default view
  const lngMin = -30;
  const lngMax = 60;
  const latMin = 20;
  const latMax = 70;

  for (let i = 0; i < count; i++) {
    const offset = i * 6;
    // Position
    data[offset] = lngMin + Math.random() * (lngMax - lngMin); // lng
    data[offset + 1] = latMin + Math.random() * (latMax - latMin); // lat
    // Radius (50-500 meters)
    data[offset + 2] = 50 + Math.random() * 450;
    // Color (random RGB, normalized 0-1 for Float32 attributes)
    data[offset + 3] = Math.random(); // r
    data[offset + 4] = Math.random(); // g
    data[offset + 5] = Math.random(); // b
  }

  return data;
}

/**
 * Build stress test layer if enabled.
 */
export function buildStressTestLayer(
  stressTest: StressTest,
  basemap: Basemap,
  interleaved: boolean
): Layer | null {
  if (stressTest === 'none') {
    return null;
  }

  const count = getPointCount(stressTest);
  const data = generateStressTestData(count);

  return new ScatterplotLayer({
    id: 'stress-test',
    // Use binary data format for maximum performance
    data: {
      length: count,
      attributes: {
        getPosition: {value: data, size: 2, offset: 0, stride: 24},
        getRadius: {value: data, size: 1, offset: 8, stride: 24},
        getFillColor: {value: data, size: 3, offset: 12, stride: 24}
      }
    },
    radiusUnits: 'meters',
    radiusMinPixels: 1,
    opacity: 0.6,
    ...getInterleavedProps(basemap, interleaved)
  });
}
