// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {WebMercatorViewport} from '@deck.gl/core';
import {expect, test} from 'vitest';
import {getCloudViewUniforms} from '../src/layers/cloud-layer';

test('cloud rays match view orientation and camera position uses local metres', () => {
  const origin = [-74, 40.7, 0] as const;
  const viewport = new WebMercatorViewport({
    width: 1000,
    height: 800,
    longitude: origin[0],
    latitude: origin[1],
    zoom: 15,
    pitch: 80
  });
  const view = getCloudViewUniforms(viewport, origin);
  expect(view.camera[0]).toBeCloseTo(0, 5);
  expect(view.camera[2]).toBeGreaterThan(0);
  expect(view.upperLeft[2]).toBeGreaterThan(0);
  expect(view.lowerLeft[2]).toBeLessThan(0);
  const center = view.lowerRight.map((value, index) => (value + view.upperLeft[index]) / 2);
  expect(center[0]).toBeCloseTo(0, 5);
  expect(center[1]).toBeGreaterThan(0);
  const rotated = getCloudViewUniforms(
    new WebMercatorViewport({
      width: 1000,
      height: 800,
      longitude: origin[0],
      latitude: origin[1],
      zoom: 15,
      pitch: 80,
      bearing: 90
    }),
    origin
  );
  const rotatedCenter = rotated.lowerRight.map(
    (value, index) => (value + rotated.upperLeft[index]) / 2
  );
  expect(rotatedCenter[0]).toBeGreaterThan(0);
  expect(rotatedCenter[1]).toBeCloseTo(0, 5);
});
