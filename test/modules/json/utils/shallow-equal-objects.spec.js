import test from 'tape-catch';
import {shallowEqualObjects} from '@deck.gl/json/utils/shallow-equal-objects';

const TEST_CASES = [
  {
    a: 10,
    b: 10,
    output: true
  },
  {
    a: {longitude: -70, latitude: 40.7, zoom: 12},
    b: {longitude: -70, latitude: 40.7, zoom: 12},
    output: true
  },
  {
    a: {longitude: -70, latitude: 40.7, zoom: 12},
    b: null,
    output: false
  },
  {
    a: {longitude: -70, latitude: 40.7, zoom: 12, position: [0, 0, 0]},
    b: {longitude: -70, latitude: 40.7, zoom: 12},
    output: false
  },
  {
    a: {longitude: -70, latitude: 40.7, zoom: 12, position: [0, 0, 0]},
    b: {longitude: -70, latitude: 40.7, zoom: 12, position: [0, 0, 0]},
    output: false
  },
  {
    a: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    b: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    output: false
  }
];

test('utils#shallowEqualObjects', t => {
  TEST_CASES.forEach(testCase => {
    const result = shallowEqualObjects(testCase.a, testCase.b);
    t.is(result, testCase.output, `Should ${testCase.output ? '' : 'not '}be equal`);
  });

  t.end();
});
