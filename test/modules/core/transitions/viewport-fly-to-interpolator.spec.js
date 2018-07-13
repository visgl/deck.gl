import test from 'tape-catch';
import FlyToInterpolator from '@deck.gl/core/transitions/viewport-fly-to-interpolator';
import {toLowPrecision} from '@deck.gl/test-utils';

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
    startProps: {
      width: 800,
      height: 600,
      longitude: -122.45,
      latitude: 37.78,
      pitch: 0,
      bearing: 0,
      zoom: 12
    },
    endProps: {
      width: 800,
      height: 600,
      longitude: -74,
      latitude: 40.7,
      pitch: 20,
      bearing: 0,
      zoom: 11
    },
    expect: {
      start: {
        width: 800,
        height: 600,
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        pitch: 0,
        bearing: 0
      },
      end: {
        width: 800,
        height: 600,
        longitude: -74,
        latitude: 40.7,
        zoom: 11,
        pitch: 20,
        bearing: 0
      }
    },
    transition: {
      0.25: {bearing: 0, pitch: 5, longitude: -122.4017, latitude: 37.78297, zoom: 7.518116},
      0.5: {bearing: 0, pitch: 10, longitude: -106.3, latitude: 38.76683, zoom: 3.618313},
      0.75: {bearing: 0, pitch: 15, longitude: -74.19253, latitude: 40.68864, zoom: 6.522422}
    }
  }
];
/* eslint-enable max-len */

test('LinearInterpolator#initializeProps', t => {
  const interpolator = new FlyToInterpolator();

  TEST_CASES.forEach(testCase => {
    const getResult = () => interpolator.initializeProps(testCase.startProps, testCase.endProps);

    if (testCase.shouldThrow) {
      t.throws(getResult, testCase.title);
    } else {
      t.deepEqual(getResult(), testCase.expect, testCase.title);
    }
  });

  t.end();
});

test('LinearInterpolator#interpolateProps', t => {
  const interpolator = new FlyToInterpolator();

  TEST_CASES.filter(testCase => testCase.transition).forEach(testCase => {
    Object.keys(testCase.transition).forEach(time => {
      const propsInTransition = interpolator.interpolateProps(
        testCase.expect.start,
        testCase.expect.end,
        Number(time)
      );
      t.deepEqual(toLowPrecision(propsInTransition, 7), testCase.transition[time], time);
    });
  });

  t.end();
});
