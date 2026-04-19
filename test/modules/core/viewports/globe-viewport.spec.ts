// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_GlobeViewport as GlobeViewport, WebMercatorViewport} from '@deck.gl/core';
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
    expect(
      equals(screenCenter.slice(0, 2), [viewport.width / 2, viewport.height / 2]),
      'viewport center is projected to screen center'
    ).toBeTruthy();
    expect(screenCenter[2] > -1 && screenCenter[2] < 1, 'viewport center is visible').toBeTruthy();

    screenCenter = viewport.project([viewport.longitude, viewport.latitude, 1000]);
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

      expect(equals(pos, pos2), 'center project/unproject round trip').toBeTruthy();

      if (pos.length === 3) {
        pos2 = viewport.unproject(screenPosition.slice(0, 2), {targetZ: pos[2]});
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

test('GlobeViewport#bearing', () => {
  // Default bearing is 0
  const viewport0 = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4
  });
  expect(viewport0.bearing).toBe(0);

  // Non-zero bearing
  const viewport45 = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4,
    bearing: 45
  });
  expect(viewport45.bearing).toBe(45);

  // Center projection still works with bearing
  const screenCenter = viewport45.project([viewport45.longitude, viewport45.latitude, 0]);
  expect(
    Math.abs(screenCenter[0] - viewport45.width / 2) < 1,
    'viewport center is projected to screen center x with bearing'
  ).toBeTruthy();
  expect(
    Math.abs(screenCenter[1] - viewport45.height / 2) < 1,
    'viewport center is projected to screen center y with bearing'
  ).toBeTruthy();

  // Negative bearing
  const viewportNeg90 = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4,
    bearing: -90
  });
  expect(viewportNeg90.bearing).toBe(-90);
});

test('GlobeViewport#pitch', () => {
  // Default pitch is 0
  const viewport0 = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4
  });
  expect(viewport0.pitch).toBe(0);

  // Non-zero pitch — target should still project to screen center
  const viewport30 = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4,
    pitch: 30
  });
  expect(viewport30.pitch).toBe(30);

  const screenCenter = viewport30.project([viewport30.longitude, viewport30.latitude, 0]);
  expect(
    Math.abs(screenCenter[0] - viewport30.width / 2) < 1,
    'viewport center is projected to screen center x with pitch'
  ).toBeTruthy();
  expect(
    Math.abs(screenCenter[1] - viewport30.height / 2) < 1,
    'viewport center is projected to screen center y with pitch'
  ).toBeTruthy();
});

test('GlobeViewport#pitch+bearing', () => {
  // Combined pitch and bearing — target should still project to screen center
  const viewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4,
    pitch: 45,
    bearing: 60
  });
  expect(viewport.pitch).toBe(45);
  expect(viewport.bearing).toBe(60);

  const screenCenter = viewport.project([viewport.longitude, viewport.latitude, 0]);
  expect(
    Math.abs(screenCenter[0] - viewport.width / 2) < 1,
    'viewport center is projected to screen center x with pitch+bearing'
  ).toBeTruthy();
  expect(
    Math.abs(screenCenter[1] - viewport.height / 2) < 1,
    'viewport center is projected to screen center y with pitch+bearing'
  ).toBeTruthy();
});

test('GlobeViewport#bearing direction matches WebMercator', () => {
  // At low zoom, Globe and WM projections differ significantly, so we compare
  // relative cardinal point directions rather than exact coordinates.
  // At bearing=90°, East should be at top and North at left — same as WebMercator.
  const viewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 0,
    longitude: 0,
    zoom: 4,
    bearing: 90
  });
  const center = viewport.project([0, 0, 0]);
  const north = viewport.project([0, 0.5, 0]);
  const east = viewport.project([0.5, 0, 0]);

  // North should be to the left of center (smaller x)
  expect(north[0] < center[0], 'bearing=90: north is left of center').toBeTruthy();
  // East should be above center (smaller y in top-left coords)
  expect(east[1] < center[1], 'bearing=90: east is above center').toBeTruthy();

  // Cross-check with WebMercatorViewport
  const wmViewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    latitude: 0,
    longitude: 0,
    zoom: 4,
    bearing: 90
  });
  const wmNorth = wmViewport.project([0, 0.5, 0]);
  const wmEast = wmViewport.project([0.5, 0, 0]);
  const wmCenter = wmViewport.project([0, 0, 0]);

  // Globe and WM should agree on which side North/East end up
  expect(
    Math.sign(north[0] - center[0]) === Math.sign(wmNorth[0] - wmCenter[0]),
    'bearing direction matches WM for north x'
  ).toBeTruthy();
  expect(
    Math.sign(east[1] - center[1]) === Math.sign(wmEast[1] - wmCenter[1]),
    'bearing direction matches WM for east y'
  ).toBeTruthy();
});

test('GlobeViewport#pitch=0,bearing=0 matches default', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = 1e-9;

  // Explicit pitch=0, bearing=0 should produce the same result as omitting them
  const viewportDefault = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4
  });
  const viewportExplicit = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 4,
    pitch: 0,
    bearing: 0
  });

  // Both should project the same point identically
  const pos = [-122, 38, 0];
  const screen1 = viewportDefault.project(pos);
  const screen2 = viewportExplicit.project(pos);
  expect(equals(screen1, screen2), 'pitch=0,bearing=0 matches default projection').toBeTruthy();

  // Nearby point should also match
  const nearPos = [-121.9, 38.1, 0];
  const screenNear1 = viewportDefault.project(nearPos);
  const screenNear2 = viewportExplicit.project(nearPos);
  expect(
    equals(screenNear1, screenNear2),
    'pitch=0,bearing=0 matches default for nearby point'
  ).toBeTruthy();

  config.EPSILON = oldEpsilon;
});
