import test from 'tape-catch';
import {deepEqual} from '@deck.gl/core/utils/deep-equal';

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
  }
];

test('utils#deepEqual', t => {
  TEST_CASES.forEach(testCase => {
    const result = deepEqual(testCase.a, testCase.b);
    t.is(result, testCase.output, `Should ${testCase.output ? '' : 'not '}be equal`);
  });

  t.end();
});
