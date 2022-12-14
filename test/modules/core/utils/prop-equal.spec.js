import test from 'tape-promise/tape';
import {propEqual} from '@deck.gl/core/utils/prop-equal';

const obj = {longitude: -70, latitude: 40.7, zoom: 12};
const TEST_CASES = [
  {
    a: obj,
    b: obj,
    output: true
  },
  {
    a: {x: obj},
    b: {x: obj},
    output: true
  },
  {
    a: {x: obj},
    b: {x: {...obj}},
    output: false
  },
  {
    a: {x: obj},
    b: {x: {...obj}},
    depth: 1,
    output: true
  },
  {
    a: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    b: {map: {}},
    depth: 1,
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
  },
  {
    a: {map: {latitude: 37.78, zoom: 8}},
    b: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    depth: -1,
    output: false
  },
  {
    a: {x: {y: {z: 1}}},
    b: {x: {y: {z: 1}}},
    depth: 1,
    output: false
  },
  {
    a: {x: {y: {z: 1}}},
    b: {x: {y: {z: 1}}},
    depth: 2,
    output: true
  },
  {
    a: {x: {y: {z: 1}}},
    b: {x: {y: {z: 2}}},
    depth: 2,
    output: false
  },
  {
    a: [1, 2, 3, 4],
    b: [1, 2, 3, 4],
    output: true
  },
  {
    a: [1, 2, 3, 4],
    b: [1, 2, 3, 5],
    output: false
  },
  {
    a: [1, 2, 3, 4],
    b: [1, 2, 3],
    output: false
  },
  {
    a: [1, 2, 3],
    b: [1, 2, 3, 4],
    output: false
  }
];

test('utils#propEqual', t => {
  TEST_CASES.forEach(({a, b, depth, output}) => {
    const result = propEqual(a, b, depth);
    t.is(result, output, `should ${output ? '' : 'not '}be equal`);
  });

  t.end();
});
