// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import FlyToInterpolator from '@deck.gl/core/transitions/fly-to-interpolator';
import GlobeViewport, {zoomAdjust} from '@deck.gl/core/viewports/globe-viewport';
import {toLowPrecision} from '@deck.gl/test-utils/vitest';
import {flyToViewport} from '@math.gl/web-mercator';

const START_PROPS = {
  width: 800,
  height: 600,
  longitude: -122.45,
  latitude: 37.78,
  pitch: 0,
  bearing: 0,
  zoom: 12,
  position: [0, 0, 0]
};

const END_PROPS = {
  width: 800,
  height: 600,
  longitude: -74,
  latitude: 40.7,
  pitch: 20,
  bearing: 0,
  zoom: 11,
  position: [4, 40, 400]
};

/* eslint-disable max-len */
const TEST_CASES = [
  {
    title: 'throw for missing prop',
    startProps: {longitude: -122.45, latitude: 37.78, zoom: 12},
    endProps: {longitude: -74, latitude: 40.7, zoom: 11},
    shouldThrow: true
  },
  {
    title: 'transition',
    startProps: START_PROPS,
    endProps: END_PROPS,
    expect: {
      start: {
        width: 800,
        height: 600,
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        position: [0, 0, 0]
      },
      end: {
        width: 800,
        height: 600,
        longitude: -74,
        latitude: 40.7,
        zoom: 11,
        pitch: 20,
        bearing: 0,
        position: [4, 40, 400]
      }
    },
    transition: {
      0.25: {
        bearing: 0,
        pitch: 5,
        longitude: -122.4017,
        latitude: 37.78297,
        zoom: 7.518116,
        position: [1, 10, 100]
      },
      0.5: {
        bearing: 0,
        pitch: 10,
        longitude: -106.3,
        latitude: 38.76683,
        zoom: 3.618313,
        position: [2, 20, 200]
      },
      0.75: {
        bearing: 0,
        pitch: 15,
        longitude: -74.19253,
        latitude: 40.68864,
        zoom: 6.522422,
        position: [3, 30, 300]
      }
    }
  }
];
/* eslint-enable max-len */

const DURATION_TEST_CASES = [
  {
    title: 'fixed duration',
    endProps: {transitionDuration: 100},
    expected: 100
  },
  {
    title: 'auto duration',
    endProps: {transitionDuration: 'auto'},
    expected: 7325.794
  },
  {
    title: 'high speed',
    opts: {speed: 10},
    endProps: {transitionDuration: 'auto'},
    expected: 879.0953
  },
  {
    title: 'high curve',
    opts: {curve: 8},
    endProps: {transitionDuration: 'auto'},
    expected: 2016.924
  }
];

test('ViewportFlyToInterpolator#initializeProps', () => {
  const interpolator = new FlyToInterpolator();

  TEST_CASES.forEach(testCase => {
    const getResult = () => interpolator.initializeProps(testCase.startProps, testCase.endProps);

    if (testCase.shouldThrow) {
      expect(getResult, testCase.title).toThrow();
    } else {
      expect(getResult(), testCase.title).toEqual(testCase.expect);
    }
  });
});

test('ViewportFlyToInterpolator#interpolateProps', () => {
  const interpolator = new FlyToInterpolator();

  TEST_CASES.filter(testCase => testCase.transition).forEach(testCase => {
    Object.keys(testCase.transition).forEach(time => {
      const propsInTransition = interpolator.interpolateProps(
        testCase.expect.start,
        testCase.expect.end,
        Number(time)
      );
      expect(
        toLowPrecision(propsInTransition, 7),
        `${testCase.title} t = ${time} interpolated correctly`
      ).toEqual(testCase.transition[time]);
    });
  });
});

test('ViewportFlyToInterpolator follows great-circle path for GlobeViewport', () => {
  const interpolator = new FlyToInterpolator({
    makeViewport: props => new GlobeViewport(props)
  });
  const midpoint = interpolator.interpolateProps(
    {
      width: 1000,
      height: 800,
      longitude: 179,
      latitude: 0,
      zoom: 4,
      bearing: 0,
      pitch: 0
    },
    {
      width: 1000,
      height: 800,
      longitude: -179,
      latitude: 0,
      zoom: 4,
      bearing: 0,
      pitch: 0
    },
    0.5
  );

  expect(
    Math.abs(Math.abs(midpoint.longitude) - 180),
    'antimeridian flight should not travel back through Greenwich'
  ).toBeLessThan(1e-6);
  expect(midpoint.latitude).toBeCloseTo(0);
});

test('ViewportFlyToInterpolator preserves GlobeViewport scale', () => {
  const interpolator = new FlyToInterpolator({
    makeViewport: props => new GlobeViewport(props)
  });
  const start = {
    width: 1000,
    height: 800,
    longitude: 0,
    latitude: 0,
    zoom: 4,
    bearing: 0,
    pitch: 0
  };
  const end = {
    width: 1000,
    height: 800,
    longitude: 25,
    latitude: 60,
    zoom: 6,
    bearing: 30,
    pitch: 50
  };
  const midpoint = interpolator.interpolateProps(start, end, 0.5);
  const flyTo = flyToViewport(start, end, 0.5, {speed: 1.2, curve: 1.414});
  const expectedScaleZoom = flyTo.zoom - zoomAdjust(flyTo.latitude, true);

  expect(
    midpoint.zoom - zoomAdjust(midpoint.latitude, true),
    'zoom follows the FlyTo curve while staying continuous in globe scale space'
  ).toBeCloseTo(expectedScaleZoom);
  expect(midpoint.bearing).toBeCloseTo(15);
  expect(midpoint.pitch).toBeCloseTo(25);
});

test('ViewportFlyToInterpolator#getDuration', () => {
  DURATION_TEST_CASES.forEach(testCase => {
    const interpolator = new FlyToInterpolator(testCase.opts);
    expect(
      toLowPrecision(
        interpolator.getDuration(START_PROPS, Object.assign({}, END_PROPS, testCase.endProps)),
        7
      ),
      `${testCase.title}: should receive correct duration`
    ).toBe(testCase.expected);
  });
});
