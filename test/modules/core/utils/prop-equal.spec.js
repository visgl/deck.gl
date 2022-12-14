import test from 'tape-promise/tape';
import {propEqual} from '@deck.gl/core/utils/prop-equal';

const TEST_CASES = [
  {
    a: {longitude: -70, latitude: 40.7, zoom: 12},
    b: {longitude: -70, latitude: 40.7, zoom: 12},
    output: true
  },
  {
    a: {longitude: -70, latitude: 40.7, zoom: 12, position: [0, 0, 0]},
    b: {longitude: -70, latitude: 40.7, zoom: 12, position: [0, 0, 0]},
    output: true
  },
  {
    a: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    b: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    output: false
  },
  {
    a: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    b: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    depth: 1,
    output: true
  },
  {
    a: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    b: {map: {latitude: 37.78, zoom: 8}},
    depth: -1,
    output: false
  }
];

test('utils#propEqual', t => {
  TEST_CASES.forEach(testCase => {
    const result = propEqual(testCase.a, testCase.b, testCase.depth);
    t.is(result, testCase.output, `Should ${testCase.output ? '' : 'not '}be equal`);
  });

  t.end();
});
