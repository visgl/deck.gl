// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import LinearInterpolator from '@deck.gl/core/transitions/linear-interpolator';
import GlobeViewport from '@deck.gl/core/viewports/globe-viewport';
import WebMercatorViewport from '@deck.gl/core/viewports/web-mercator-viewport';

const TEST_CASES = [
  {
    title: 'extract transition props',
    transitionProps: ['longitude', 'latitude', 'zoom'],
    startProps: {longitude: -122.45, latitude: 37.78, zoom: 12, pitch: 0, bearing: 0},
    endProps: {longitude: -74, latitude: 40.7, zoom: 11, pitch: 0, bearing: 0},
    expect: {
      start: {longitude: -122.45, latitude: 37.78, zoom: 12},
      end: {longitude: -74, latitude: 40.7, zoom: 11}
    },
    transition: {
      0.5: {longitude: -98.225, latitude: 39.24, zoom: 11.5}
    }
  },
  {
    title: 'throw for missing prop',
    startProps: {longitude: -122.45, latitude: 37.78},
    endProps: {longitude: -74, latitude: 40.7},
    shouldThrow: true
  },
  {
    title: 'fallback on missing props',
    startProps: {longitude: -122.45, latitude: 37.78, zoom: 12, pitch: 0},
    endProps: {longitude: -74, latitude: 40.7, zoom: 11, bearing: 10},
    expect: {
      start: {longitude: -122.45, latitude: 37.78, zoom: 12, pitch: 0, bearing: undefined},
      end: {longitude: -74, latitude: 40.7, zoom: 11, pitch: undefined, bearing: 10}
    },
    transition: {
      0.5: {longitude: -98.225, latitude: 39.24, zoom: 11.5, pitch: 0, bearing: 5}
    }
  },
  {
    title: 'array prop',
    transitionProps: ['position'],
    startProps: {position: [0, 0, 0]},
    endProps: {position: [1, 1, 1]},
    expect: {
      start: {position: [0, 0, 0]},
      end: {position: [1, 1, 1]}
    },
    transition: {
      0.5: {position: [0.5, 0.5, 0.5]}
    }
  }
];

test('LinearInterpolator#constructor', () => {
  const interpolator = new LinearInterpolator(['width', 'height']);
  expect(interpolator, 'constructor does not throw error').toBeTruthy();
  expect(interpolator._propsToCompare, '_propsToCompare is set').toEqual(['width', 'height']);
  expect(interpolator._propsToExtract, '_propsToExtract is set').toEqual(['width', 'height']);
  expect(interpolator._requiredProps, '_requiredProps is set').toEqual(['width', 'height']);
});

test('LinearInterpolator#initializeProps', () => {
  TEST_CASES.forEach(testCase => {
    const interpolator = new LinearInterpolator(testCase.transitionProps);
    const getResult = () => interpolator.initializeProps(testCase.startProps, testCase.endProps);

    if (testCase.shouldThrow) {
      expect(getResult, testCase.title).toThrow();
    } else {
      expect(getResult(), testCase.title).toEqual(testCase.expect);
    }
  });
});

test('LinearInterpolator#interpolateProps', () => {
  TEST_CASES.filter(testCase => testCase.transition).forEach(testCase => {
    const interpolator = new LinearInterpolator(testCase.transitionProps);
    Object.keys(testCase.transition).forEach(time => {
      const propsInTransition = interpolator.interpolateProps(
        testCase.expect.start,
        testCase.expect.end,
        Number(time)
      );
      expect(propsInTransition, time).toEqual(testCase.transition[time]);
    });
  });
});

test('LinearInterpolator anchors transitions on GlobeViewport', () => {
  const makeViewport = (props: Record<string, any>) => new GlobeViewport(props);
  const startProps = {width: 800, height: 600, longitude: 0, latitude: 0, zoom: 2};
  const endProps = {width: 800, height: 600, longitude: 0, latitude: 0, zoom: 3};
  // Pick a screen point offset from center so anchoring measurably shifts lng/lat.
  const around: [number, number] = [500, 250];

  const interpolator = new LinearInterpolator({
    transitionProps: {compare: ['longitude', 'latitude', 'zoom'], required: ['zoom']},
    around,
    makeViewport
  });

  const {start, end} = interpolator.initializeProps(startProps, endProps);

  expect(end.aroundLngLat, 'unprojects the anchor to a lng/lat on the globe').toBeDefined();
  expect(end.aroundPosition, 'does not fall back to the planar anchor path').toBeUndefined();
  expect(start.around, 'records the start anchor screen point').toEqual(around);
  expect(end.around, 'records the anchor screen point in the end viewport').toBeDefined();

  const propsAtHalf = interpolator.interpolateProps(start, end, 0.5);
  expect(
    propsAtHalf.longitude,
    'longitude shifts during the transition to keep the anchor pinned'
  ).not.toBeCloseTo(0);

  const propsAtEnd = interpolator.interpolateProps(start, end, 1);
  expect(propsAtEnd.longitude, 'transition ends at the requested longitude').toBeCloseTo(
    endProps.longitude
  );
  expect(propsAtEnd.latitude, 'transition ends at the requested latitude').toBeCloseTo(
    endProps.latitude
  );
});

test('LinearInterpolator keeps globe anchor when transition crosses to WebMercatorViewport', () => {
  const makeViewport = (props: Record<string, any>) =>
    props.zoom > 12 ? new WebMercatorViewport(props) : new GlobeViewport(props);
  const startProps = {width: 800, height: 600, longitude: 0, latitude: 0, zoom: 11.9};
  const endProps = {width: 800, height: 600, longitude: 0, latitude: 0, zoom: 12.5};
  const around: [number, number] = [500, 250];

  const interpolator = new LinearInterpolator({
    transitionProps: {compare: ['longitude', 'latitude', 'zoom'], required: ['zoom']},
    around,
    makeViewport
  });

  const {start, end} = interpolator.initializeProps(startProps, endProps);

  expect(end.aroundLngLat, 'records the spherical anchor from the globe start').toBeDefined();
  expect(end.aroundPosition, 'does not switch to a separate planar anchor').toBeUndefined();

  const propsAtHalf = interpolator.interpolateProps(start, end, 0.5);
  expect(
    Math.abs(propsAtHalf.longitude),
    'WebMercator fallback keeps adjusting longitude around the anchor'
  ).toBeGreaterThan(1e-5);

  const propsAtEnd = interpolator.interpolateProps(start, end, 1);
  expect(propsAtEnd.longitude, 'transition still ends at requested longitude').toBeCloseTo(
    endProps.longitude
  );
  expect(propsAtEnd.latitude, 'transition still ends at requested latitude').toBeCloseTo(
    endProps.latitude
  );
});

test('LinearInterpolator falls back to a plain LERP when the GlobeView anchor is off-globe', () => {
  const makeViewport = (props: Record<string, any>) => new GlobeViewport(props);
  const startProps = {width: 800, height: 600, longitude: 0, latitude: 0, zoom: 1};
  const endProps = {width: 800, height: 600, longitude: 0, latitude: 0, zoom: 3};
  // Corner of the canvas misses the globe at zoom 1 with these dimensions.
  const around: [number, number] = [0, 0];

  const interpolator = new LinearInterpolator({
    transitionProps: {compare: ['longitude', 'latitude', 'zoom'], required: ['zoom']},
    around,
    makeViewport
  });

  const {start, end} = interpolator.initializeProps(startProps, endProps);
  expect(end.aroundLngLat, 'no anchor when the screen point misses the globe').toBeUndefined();
  expect(start.around, 'no anchor recorded on the start frame either').toBeUndefined();
});
