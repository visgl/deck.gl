// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {_GlobeViewport} from '@deck.gl/core';
import {expect, test} from 'vitest';
import {getGlobeCloudViewUniforms} from '../src/layers/globe-cloud-layer';

test.each([
  [0, 0],
  [20, 20],
  [179.9, 35],
  [-179.9, 35],
  [0, 89],
  [0, -89]
])('globe cloud camera and rays align with the surface at %s, %s', (longitude, latitude) => {
  const viewport = new _GlobeViewport({width: 1000, height: 720, longitude, latitude, zoom: 1.4});
  const view = getGlobeCloudViewUniforms(viewport);
  const radius = Math.hypot(...viewport.projectPosition([0, 0, 0]));
  const surface = viewport.projectPosition([longitude, latitude, 0]).map(value => value / radius);
  const cameraLength = Math.hypot(...view.camera);
  expect(cameraLength).toBeGreaterThan(1);
  surface.forEach((value, index) =>
    expect(view.camera[index] / cameraLength).toBeCloseTo(value, 5)
  );
  const ray = view.lowerRight.map((value, index) => (value + view.upperLeft[index]) / 2);
  const rayLength = Math.hypot(...ray);
  surface.forEach((value, index) => expect(ray[index] / rayLength).toBeCloseTo(-value, 5));
  const clip = view.viewProjectionMatrix.transform([...surface, 1]);
  expect(clip[0] / clip[3]).toBeCloseTo(0, 5);
  expect(clip[1] / clip[3]).toBeCloseTo(0, 5);
  expect(clip[2] / clip[3]).toBeGreaterThan(-1);
  expect(clip[2] / clip[3]).toBeLessThan(1);
});
