import test from 'tape';
import {_CoordinatesGeocoder as CoordinatesGeocoder} from '@deck.gl/widgets';

test('CoordinatesGeocoder.geocode - Parses decimal coordinates correctly', async t => {
  const cases = [
    {input: '34.0522, -118.2437', expected: {latitude: 34.0522, longitude: -118.2437}},
    {input: '-118.2437, 34.0522', expected: {longitude: -118.2437, latitude: 34.0522}},
    {input: '40.7128; -74.0060', expected: {latitude: 40.7128, longitude: -74.006}}
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    t.deepEqual(result, expected, `geocode(${input})`);
  }

  t.end();
});

test('CoordinatesGeocoder.geocode - Handles DMS format correctly', async t => {
  const cases = [
    {
      input: '37°48\'00\"N, 122°25\'42\"W',
      expected: {latitude: 37.8, longitude: -122.42833333333333}
    },
    {
      input: '122°25\'42\"W; 37°48\'00\"N',
      expected: {longitude: -122.42833333333333, latitude: 37.8}
    }
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    t.deepEqual(result, expected, `geocode(${input})`);
  }

  t.end();
});

test('CoordinatesGeocoder.geocode - Returns null for invalid inputs', async t => {
  const cases = [
    {input: 'not a coordinate', expected: null},
    {input: '1000, 1000', expected: null}, // Invalid values
    {input: 'onlyonevalue', expected: null}
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    t.equal(result, expected, `geocode(${input}) should be null`);
  }

  t.end();
});

test('CoordinatesGeocoder.geocode - Parses mixed formats and boundary conditions', async t => {
  const cases = [
    {input: '85°, -180°', expected: {latitude: 85, longitude: -180}},
    {input: '85°0\'0\"N 180°0\'0\"E', expected: {latitude: 85, longitude: 180}},
    {input: '90°0\'0\"S, 135°0\'0\"E', expected: {latitude: -90, longitude: 135}}
  ];

  for (const {input, expected} of cases) {
    const result = await CoordinatesGeocoder.geocode(input);
    t.deepEqual(result, expected, `geocode(${input})`);
  }

  t.end();
});
