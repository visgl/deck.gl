// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {FirstPersonViewport, Viewport, WebMercatorViewport} from '@deck.gl/core';
import {getDistanceScales, lngLatToWorld} from '@math.gl/web-mercator';
import {getProjectionParameters} from '@deck.gl/core/utils/math-utils';

test('FirstPersonViewport inherits projection and retains its camera defaults', () => {
  const viewport = new FirstPersonViewport({longitude: 12, latitude: 60, position: [0, 0, 100]});
  expect(Object.getPrototypeOf(FirstPersonViewport.prototype)).toBe(Viewport.prototype);
  expect(viewport).not.toBeInstanceOf(WebMercatorViewport);
  expect(viewport.crs?.signature).toBe('OSMTile512');
  expect('preproject' in viewport).toBe(false);
  expect('postUnproject' in viewport).toBe(false);
  for (const method of [
    'projectPosition',
    'unprojectPosition',
    'projectFlat',
    'unprojectFlat',
    'getDistanceScales'
  ]) {
    expect(Object.prototype.hasOwnProperty.call(FirstPersonViewport.prototype, method)).toBe(false);
  }
  const scales = getDistanceScales({longitude: 12, latitude: 60});
  expect(viewport.projectPosition([12, 45, 100])[2]).toBe(100 * scales.unitsPerMeter[2]);
  const projection = getProjectionParameters(viewport.projectionMatrix);
  expect(projection.near).toBeCloseTo(0.1, 10);
  expect(projection.far).toBeCloseTo(1000, 6);
  expect((2 * Math.atan(1 / viewport.projectionMatrix[5]) * 180) / Math.PI).toBeCloseTo(75, 10);
  const point = [12, 45, 100];
  const common = viewport.projectPosition(point);
  viewport
    .unprojectPosition(common)
    .forEach((value, axis) => expect(value).toBeCloseTo(point[axis], 10));
  expect(common.slice(0, 2)).toEqual(lngLatToWorld(point));
  const localScales = viewport.getDistanceScales([12, 45]);
  const expectedScales = getDistanceScales({longitude: 12, latitude: 45, highPrecision: true});
  expect(localScales.unitsPerWorldUnit).toEqual(expectedScales.unitsPerDegree);
  expect(localScales.unitsPerMeter2).toEqual(expectedScales.unitsPerMeter2);
});

test.each([{}, {longitude: 12}, {latitude: 60}])(
  'FirstPersonViewport retains local coordinates without both geographic anchors: %j',
  options => {
    const viewport = new FirstPersonViewport({
      ...options,
      width: 800,
      height: 600,
      position: [10, 20, 30]
    });
    expect(viewport.crs).toBeUndefined();
    expect(viewport.isGeospatial).toBe(false);
    expect(viewport.projectPosition([4, 5, 6])).toEqual([4, 5, 6]);
    expect(viewport.unprojectPosition([4, 5, 6])).toEqual([4, 5, 6]);
    expect(viewport.center).toEqual([10, 20, 30]);
    expect(viewport.subViewports).toBeNull();
  }
);
