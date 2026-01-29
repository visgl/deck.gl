// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {equals, config} from '@math.gl/core';

const TEST_VIEWPORTS = [
  {
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 12
  },
  {
    width: 800,
    height: 600,
    latitude: 80,
    longitude: 0,
    zoom: 1
  }
];

test('GlobeViewport#constructor', () => {
  expect(
    new GlobeViewport() instanceof GlobeViewport,
    'Created new GlobeViewport with default args'
  ).toBeTruthy();

  const viewport = new GlobeViewport({
    ...TEST_VIEWPORTS[0],
    width: 0,
    height: 0
  });
  expect(
    viewport instanceof GlobeViewport,
    'WebMercatorViewport constructed successfully with 0 width and height'
  ).toBeTruthy();
  expect(viewport.isGeospatial, 'Viewport is geospatial').toBeTruthy();
});

test('GlobeViewport#distanceScale', () => {
  for (const testCase of TEST_VIEWPORTS) {
    const viewport = new GlobeViewport(testCase);

    const {unitsPerMeter, metersPerUnit, unitsPerDegree, degreesPerUnit} =
      viewport.getDistanceScales();
    expect(
      equals(
        [
          unitsPerMeter[0] * metersPerUnit[0],
          unitsPerMeter[1] * metersPerUnit[1],
          unitsPerMeter[2] * metersPerUnit[2]
        ],
        [1, 1, 1]
      ),
      'metersPerUnit x unitsPerMeter'
    ).toBeTruthy();

    expect(
      equals(
        [
          unitsPerDegree[0] * degreesPerUnit[0],
          unitsPerDegree[1] * degreesPerUnit[1],
          unitsPerDegree[2] * degreesPerUnit[2]
        ],
        [1, 1, 1]
      ),
      'degreesPerUnit x unitsPerDegree'
    ).toBeTruthy();
  }
});

test('GlobeViewport#projectPosition, unprojectPosition', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = 1e-9;

  for (const testCase of TEST_VIEWPORTS) {
    const viewport = new GlobeViewport(testCase);

    const testPositions = [
      [viewport.longitude, viewport.latitude],
      [viewport.longitude, viewport.latitude, 1000],
      [viewport.longitude - 0.1, viewport.latitude - 0.1]
    ];

    for (const pos of testPositions) {
      const commonPosition = viewport.projectPosition(pos);
      const pos1 = pos.length === 2 ? pos.concat(0) : pos;
      const pos2 = viewport.unprojectPosition(commonPosition);

      console.log(pos1);
      console.log(pos2);
      expect(
        equals(pos1, pos2),
        'center projectPosition/unprojectPosition round trip'
      ).toBeTruthy();
    }
  }

  config.EPSILON = oldEpsilon;
});

test('GlobeViewport#project, unproject#center', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = 1e-9;

  for (const testCase of TEST_VIEWPORTS) {
    const viewport = new GlobeViewport(testCase);

    let screenCenter = viewport.project([viewport.longitude, viewport.latitude, 0]);
    console.log(screenCenter);
    expect(
      equals(screenCenter.slice(0, 2), [viewport.width / 2, viewport.height / 2]),
      'viewport center is projected to screen center'
    ).toBeTruthy();
    expect(screenCenter[2] > -1 && screenCenter[2] < 1, 'viewport center is visible').toBeTruthy();

    screenCenter = viewport.project([viewport.longitude, viewport.latitude, 1000]);
    console.log(screenCenter);
    expect(
      equals(screenCenter.slice(0, 2), [viewport.width / 2, viewport.height / 2]),
      'point over viewport center is projected to screen center'
    ).toBeTruthy();
    expect(
      screenCenter[2] > -1 && screenCenter[2] < 1,
      'point over viewport center is visible'
    ).toBeTruthy();
  }

  config.EPSILON = oldEpsilon;
});

test('GlobeViewport#project, unproject', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = 1e-7;

  for (const testCase of TEST_VIEWPORTS) {
    const viewport = new GlobeViewport(testCase);

    const testPositions = [
      [viewport.longitude - 0.1, viewport.latitude - 0.1],
      [viewport.longitude - 0.1, viewport.latitude - 0.1, 1000],
      [viewport.longitude + 0.1, viewport.latitude - 0.1],
      [viewport.longitude + 0.1, viewport.latitude - 0.1, 1000]
    ];

    for (const pos of testPositions) {
      const screenPosition = viewport.project(pos);
      let pos2 = viewport.unproject(screenPosition);

      console.log(pos);
      console.log(pos2);
      expect(equals(pos, pos2), 'center project/unproject round trip').toBeTruthy();

      if (pos.length === 3) {
        pos2 = viewport.unproject(screenPosition.slice(0, 2), {targetZ: pos[2]});
        console.log(pos2);
        expect(equals(pos, pos2), 'center project/unproject (targetZ) round trip').toBeTruthy();
      }
    }

    expect(
      viewport.unproject([0, 0]),
      'unprojecting out-of-bounds pixels still returns a valid coordinate'
    ).toBeTruthy();
    expect(
      viewport.unproject([viewport.width, viewport.height]),
      'unprojecting out-of-bounds pixels still returns a valid coordinate'
    ).toBeTruthy();
  }

  config.EPSILON = oldEpsilon;
});

test('GlobeViewport#getBounds', () => {
  for (const testCase of TEST_VIEWPORTS) {
    const bounds = new GlobeViewport(testCase).getBounds();

    expect(bounds[0] < testCase.longitude && bounds[2] > testCase.longitude).toBeTruthy();
  }
});
