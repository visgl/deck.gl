// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {OrbitViewport} from '@deck.gl/core';

test('OrbitViewport#panByPosition', () => {
  const testViewport = new OrbitViewport({
    width: 800,
    height: 600,
    zoom: 1,
    target: [0, 0, 0],
    orbitAxis: 'Y',
    rotationOrbit: 115,
    rotationX: -36
  });

  const testCases = [
    {coords: [100, 100, 0], pixel: [400, 500]},
    {coords: [-50, 150, 50], pixel: [300, 600]},
    {coords: [50, 50, -100], pixel: [400, 300]}
  ];

  for (const {coords, pixel} of testCases) {
    const {target} = testViewport.panByPosition(coords, pixel);
    const newViewport = new OrbitViewport({...testViewport, target});
    const [x, y] = newViewport.project(coords);
    const errorX = Math.abs(pixel[0] - x);
    const errorY = Math.abs(pixel[1] - y);
    // 0.1 screen pixel is indistinguishable to user eyes
    expect(
      errorX < 0.1 && errorY < 0.1,
      `New viewport projects coords at desired pixel: ${x},${y}`
    ).toBeTruthy();
  }
});
