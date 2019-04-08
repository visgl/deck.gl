/* eslint-disable */
import test from 'tape-catch';
import {getSolarPosition} from '@deck.gl/core/effects/lighting/sunlight';

const MS_A_HOUR = 3.6e6;

function almostEqual(v1, v2, epsilon = 0.3) {
  return Math.abs(v1 - v2) < epsilon;
}

test('Sunlight#azimuth and altitude', t => {
  const latitude = 49.253;
  const longitude = -123.13;

  let timestamp = 1553990400000; // 03/31/2019 @ 12:00am (UTC)
  timestamp += 7 * MS_A_HOUR; // Vancouver GMT-7

  // azimuth and altitude values are calculated from
  // https://www.wolframalpha.com/input/?i=solar+position+on+20:00+03-31-2019+at+Vancouver
  const testCases = [
    {
      timestamp,
      azimuth: 336.645,
      altitude: -34.1018
    },
    {
      timestamp: timestamp + MS_A_HOUR * 5,
      azimuth: 60.2354,
      altitude: -18.1205
    },
    {
      timestamp: timestamp + MS_A_HOUR * 10,
      azimuth: 120.573,
      altitude: 28.7791
    },
    {
      timestamp: timestamp + MS_A_HOUR * 15,
      azimuth: 214.564,
      altitude: 39.9957
    },
    {
      timestamp: timestamp + MS_A_HOUR * 20,
      azimuth: 281.106,
      altitude: -3.70205
    }
  ];

  testCases.forEach((testCase, i) => {
    const {azimuth, altitude} = getSolarPosition(testCase.timestamp, latitude, longitude);
    // azimuth is measured from south to west, azimuth + 180 is converting to north to east
    const azimuthInDegree = 180 + (azimuth * 180) / Math.PI;
    const altitudeInDegree = (altitude * 180) / Math.PI;

    t.ok(almostEqual(azimuthInDegree, testCase.azimuth), 'Azimuth angle should match.');
    t.ok(almostEqual(altitudeInDegree, testCase.altitude), 'Altitude angle should match.');
  });

  t.end();
});
