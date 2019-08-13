/* eslint-disable */
import test from 'tape-catch';
import {getSolarPosition} from '@deck.gl/core/effects/lighting/suncalc';
import {equals, config} from 'math.gl';
import {MapView, PolygonLayer} from 'deck.gl';
import {_SunLight as SunLight} from '@deck.gl/core';
import * as FIXTURES from 'deck.gl-test/data';

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
  const sunLight = new SunLight({
    timestamp: new Date('2019-08-01 15:00:00 Z-7').getTime(),
    color: [255, 255, 255],
    intensity: 1.0
  });

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: -122, latitude: 37, zoom: 13}
  });

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport};

  const projectedLight = sunLight.getProjectedLight({layer});
  t.deepEqual(
    projectedLight.direction,
    [0.8448592259153318, -0.5349886806145961, -0.8670767876117542],
    'Sun light is ok'
  );
  t.end();
});
