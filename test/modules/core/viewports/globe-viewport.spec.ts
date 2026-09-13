// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import GlobeViewport from '@deck.gl/core/viewports/globe-viewport';
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

test('GlobeViewport#panByPosition anchors near the globe limb', () => {
  const viewport = new GlobeViewport({
    width: 1280,
    height: 720,
    latitude: 20,
    longitude: 30,
    zoom: 0
  });
  const pixelNearLimb = [725, 360];

  const anchor = viewport.unproject(pixelNearLimb);
  const zoomedViewport = new GlobeViewport({
    width: 1280,
    height: 720,
    latitude: 20,
    longitude: 30,
    zoom: 1
  });
  const anchoredProps = zoomedViewport.panByPosition(anchor, pixelNearLimb);
  expect(anchoredProps.longitude, 'near-limb anchor adjusts longitude').not.toBeCloseTo(
    zoomedViewport.longitude
  );
});

test('GlobeViewport#panByPosition keeps an on-globe anchor stable', () => {
  const pixel = [500, 250];
  const startViewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 20,
    longitude: 30,
    zoom: 1
  });
  const anchor = startViewport.unproject(pixel);
  const zoomedViewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 20,
    longitude: 30,
    zoom: 2
  });
  const anchoredProps = zoomedViewport.panByPosition(anchor, pixel);
  const anchoredViewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: anchoredProps.latitude,
    longitude: anchoredProps.longitude,
    zoom: 2
  });
  const projectedAnchor = anchoredViewport.project(anchor);

  expect(Math.abs(projectedAnchor[0] - pixel[0]), 'anchor x remains stable').toBeLessThan(4);
  expect(Math.abs(projectedAnchor[1] - pixel[1]), 'anchor y remains stable').toBeLessThan(4);
});

test('GlobeViewport#panByPosition ignores anchors far outside the globe', () => {
  const viewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 0,
    longitude: 0,
    zoom: 1
  });
  const anchoredProps = viewport.panByPosition(viewport.unproject([0, 0]), [0, 0]);

  expect(anchoredProps.longitude, 'off-globe anchor preserves longitude').toBe(viewport.longitude);
  expect(anchoredProps.latitude, 'off-globe anchor preserves latitude').toBe(viewport.latitude);
});

test('GlobeViewport#panByPosition uses the shortest wrapped longitude delta', () => {
  const pixel = [500, 300];
  const startViewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 10,
    longitude: 170,
    zoom: 1
  });
  const anchor = startViewport.unproject(pixel);
  const zoomedViewport = new GlobeViewport({
    width: 800,
    height: 600,
    latitude: 10,
    longitude: 170,
    zoom: 2
  });

  const anchoredProps = zoomedViewport.panByPosition(anchor, pixel);
  const wrappedAnchorProps = zoomedViewport.panByPosition([anchor[0] + 360, anchor[1]], pixel);

  expect(wrappedAnchorProps.longitude, 'equivalent longitudes produce the same camera').toBeCloseTo(
    anchoredProps.longitude
  );
  expect(
    Math.abs((anchoredProps.longitude as number) - zoomedViewport.longitude),
    'camera follows the short path across the antimeridian'
  ).toBeLessThan(180);
});

test('GlobeViewport#getBounds', () => {
  for (const testCase of TEST_VIEWPORTS) {
    const bounds = new GlobeViewport(testCase).getBounds();

    expect(bounds[0] < testCase.longitude && bounds[2] > testCase.longitude).toBeTruthy();
  }
});
