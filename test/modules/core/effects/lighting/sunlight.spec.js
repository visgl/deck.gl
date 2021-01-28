/* eslint-disable */
import test from 'tape-catch';
import {getSolarPosition} from '@deck.gl/core/effects/lighting/suncalc';
import {equals, config} from 'math.gl';
import {WebMercatorViewport, _GlobeViewport as GlobeViewport, PolygonLayer} from 'deck.gl';
import {_SunLight as SunLight} from '@deck.gl/core';

import {angle} from 'gl-matrix/vec3';

const MS_A_HOUR = 3.6e6;

const TIMESTAMP = 1553990400000 + 7 * MS_A_HOUR; // 03/31/2019 @ 12:00am (UTC) + Vancouver(GMT-7) timezone offset
const LATITUDE = 49.253;
const LONGITUDE = -123.13;

// azimuth and altitude values are calculated from
// https://www.wolframalpha.com/input/?i=solar+position+on+20:00+03-31-2019+atlatitude+49.253+and+longitude+-123.13
const TEST_CASES = [
  {
    timestamp: TIMESTAMP,
    azimuth: 336.645,
    altitude: -34.1018
  },
  {
    timestamp: TIMESTAMP + MS_A_HOUR * 5,
    azimuth: 60.2354,
    altitude: -18.1205
  },
  {
    timestamp: TIMESTAMP + MS_A_HOUR * 10,
    azimuth: 120.573,
    altitude: 28.7791
  },
  {
    timestamp: TIMESTAMP + MS_A_HOUR * 15,
    azimuth: 214.564,
    altitude: 39.9957
  },
  {
    timestamp: TIMESTAMP + MS_A_HOUR * 20,
    azimuth: 281.106,
    altitude: -3.70205
  }
];

test('Sunlight#azimuth and altitude', t => {
  const oldEpsilon = config.EPSILON;
  // Because the formula used in `getSolarPosition` are not the same as https://www.wolframalpha.com,
  // use a bigger epsilon here
  config.EPSILON = 0.3;

  TEST_CASES.forEach(testCase => {
    const {azimuth, altitude} = getSolarPosition(testCase.timestamp, LATITUDE, LONGITUDE);
    // azimuth is measured from south to west, azimuth + 180 is converting to north to east
    const azimuthInDegree = 180 + (azimuth * 180) / Math.PI;
    const altitudeInDegree = (altitude * 180) / Math.PI;

    console.log(azimuthInDegree, testCase.azimuth, altitudeInDegree, testCase.altitude);

    t.ok(equals(azimuthInDegree, testCase.azimuth), 'Azimuth angle should match.');
    t.ok(equals(altitudeInDegree, testCase.altitude), 'Altitude angle should match.');
  });

  config.EPSILON = oldEpsilon;
  t.end();
});

test('Sunlight#Constructor', t => {
  const sunLight = new SunLight({
    timestamp: new Date('2019-08-01 15:00:00 Z-7').getTime(),
    color: [255, 255, 255],
    intensity: 1.0
  });
  t.ok(sunLight, 'Sun light is ok');
  t.end();
});

test('Sunlight#getProjectedLight', t => {
  const testCases = [
    {
      title: 'Tropic of Cancer on Summer Solstice at noon',
      timestamp: new Date('2021-06-20 12:00:00Z').getTime(),
      viewport: new WebMercatorViewport({
        longitude: 0,
        latitude: 23.43655,
        zoom: 10
      }),
      // Sun should be pointing straight down
      expected: [0, 0, -1]
    },
    {
      title: 'Tropic of Capricorn on Summer Solstice at midnight',
      timestamp: new Date('2021-06-20 00:00:00Z').getTime(),
      viewport: new WebMercatorViewport({
        longitude: 0,
        latitude: -23.43655,
        zoom: 10
      }),
      // Sun should be pointing straight up
      expected: [0, 0, 1]
    },
    {
      title: 'Sunrise, Seattle',
      timestamp: new Date('2021-01-28 07:47:00Z-8').getTime(),
      viewport: new WebMercatorViewport({
        longitude: -122.3258,
        latitude: 47.6347,
        zoom: 10
      }),
      // Sun should be at horizon from the southeast
      expected: [-0.8871, 0.4616, 0]
    },
    {
      title: 'Sunset, Seattle',
      timestamp: new Date('2021-01-28 17:00:00Z-8').getTime(),
      viewport: new WebMercatorViewport({
        longitude: -122.3258,
        latitude: 47.6347,
        zoom: 10
      }),
      // Sun should be at horizon from the southwest
      expected: [0.8894, 0.457, 0]
    },
    {
      title: 'Equator on Spring Equinox at noon - Globe',
      timestamp: new Date('2021-03-20 12:00:00Z').getTime(),
      viewport: new GlobeViewport({
        longitude: -122.45,
        latitude: 37.78,
        zoom: 10
      }),
      // Sun should be pointing straight down at lon: 0, lat: 0
      expected: [0, 1, 0]
    },
    {
      title: 'Sunrise, London - Globe',
      timestamp: new Date('2021-01-28 07:43:00Z').getTime(),
      viewport: new GlobeViewport({
        longitude: -122.45,
        latitude: 37.78,
        zoom: 10
      }),
      // Sun should be at horizon from the southeast
      expected: [-0.8784, 0.3617, 0.3123]
    },
    {
      title: 'Sunset, London - Globe',
      timestamp: new Date('2021-01-28 16:43:00Z').getTime(),
      viewport: new GlobeViewport({
        longitude: -122.45,
        latitude: 37.78,
        zoom: 10
      }),
      // Sun should be at horizon from the southwest
      expected: [0.8773, 0.3659, 0.3107]
    }
  ];

  const sunLight = new SunLight({
    timestamp: 0,
    color: [255, 255, 255],
    intensity: 1.0
  });

  const layer = new PolygonLayer({});
  layer.context = {};

  for (const testCase of testCases) {
    sunLight.timestamp = testCase.timestamp;
    layer.context.viewport = testCase.viewport;
    const projectedLight = sunLight.getProjectedLight({layer});
    t.comment(projectedLight.direction.join(','));
    t.ok(angle(projectedLight.direction, testCase.expected) < 0.05, testCase.title);
  }

  t.end();
});
