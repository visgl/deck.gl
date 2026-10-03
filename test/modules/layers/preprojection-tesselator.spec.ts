// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import PathTesselator from '@deck.gl/layers/path-layer/path-tesselator';
import PolygonTesselator from '@deck.gl/layers/solid-polygon-layer/polygon-tesselator';

function release(tesselator) {
  for (const value of Object.values(tesselator.attributes)) {
    tesselator.typedArrayManager.release(value);
  }
}

test('tessellator subdivides in input space and transforms each generated point once', () => {
  const path = [
    [0, 0],
    [10, 0]
  ];
  const seen: number[][] = [];
  const tesselator = new PathTesselator({
    data: [path],
    getGeometry: p => p,
    positionFormat: 'XY',
    resolution: 5,
    fp64: true,
    transform: p => {
      seen.push(p);
      return [p[0] * p[0], p[1], 7];
    }
  });
  try {
    expect(seen).toEqual([
      [0, 0, 0],
      [5, 0, 0],
      [10, 0, 0]
    ]);
    expect(Array.from(tesselator.get('positions')!.slice(0, 9))).toEqual([
      0, 0, 7, 25, 0, 7, 100, 0, 7
    ]);
    expect(path).toEqual([
      [0, 0],
      [10, 0]
    ]);
    tesselator.updateGeometry({transform: p => [p[0] + 1, p[1], 0]});
    expect(Array.from(tesselator.get('positions')!.slice(0, 9))).toEqual([
      1, 0, 0, 6, 0, 0, 11, 0, 0
    ]);
  } finally {
    release(tesselator);
  }
});

test('path closure is evaluated in transformed space', () => {
  const tesselator = new PathTesselator({
    data: [
      [
        [0, 0],
        [1, 1],
        [2, 0]
      ]
    ],
    getGeometry: p => p,
    positionFormat: 'XY',
    transform: p => [p[0] === 2 ? 0 : p[0], p[1], 0]
  });
  try {
    // Projection identifies the two endpoints; the closed path needs its neighbor padding.
    expect(tesselator.instanceCount).toBe(5);
    expect(tesselator.get('segmentTypes')![0]).toBe(4);
  } finally {
    release(tesselator);
  }
});

test('projected polygon winding preserves cut edges and triangulated area', () => {
  const polygon = [
    [0, 0],
    [8, 0],
    [8, 8],
    [0, 8]
  ];
  const tesselator = new PolygonTesselator({
    data: [polygon],
    getGeometry: p => p,
    positionFormat: 'XY',
    resolution: 4,
    fp64: true,
    transform: p => [-2 * p[0], p[1], 3]
  });
  try {
    const positions = tesselator.get('positions')!;
    const indices = tesselator.get('indices')!;
    const valid = tesselator.get('vertexValid')!;
    let area = 0;
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * 3,
        b = indices[i + 1] * 3,
        c = indices[i + 2] * 3;
      area +=
        Math.abs(
          (positions[b] - positions[a]) * (positions[c + 1] - positions[a + 1]) -
            (positions[c] - positions[a]) * (positions[b + 1] - positions[a + 1])
        ) / 2;
    }
    let perimeter = 0;
    for (let i = 0; i < tesselator.instanceCount; i++) {
      expect(positions[i * 3 + 2]).toBe(3);
      if (valid[i])
        perimeter += Math.hypot(
          positions[(i + 1) * 3] - positions[i * 3],
          positions[(i + 1) * 3 + 1] - positions[i * 3 + 1]
        );
    }
    expect(area).toBeCloseTo(128);
    expect(perimeter).toBeCloseTo(48);
    expect(polygon).toEqual([
      [0, 0],
      [8, 0],
      [8, 8],
      [0, 8]
    ]);
  } finally {
    release(tesselator);
  }
});
