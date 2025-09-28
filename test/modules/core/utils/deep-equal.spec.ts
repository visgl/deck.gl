// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {deepEqual} from '@deck.gl/core/utils/deep-equal';

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
    depth: 0,
    output: false
  },
  {
    a: {x: obj},
    b: {x: obj},
    depth: 1,
    output: true
  },
  {
    a: {x: obj},
    b: {x: {...obj}},
    depth: 1,
    output: false
  },
  {
    a: {x: obj},
    b: {x: {...obj}},
    depth: 2,
    output: true
  },
  {
    a: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    b: {map: {}},
    depth: 2,
    output: false
  },
  {
    a: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    b: {map: {longitude: -122.45, latitude: 37.78, zoom: 8}},
    depth: 2,
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
    depth: 2,
    output: false
  },
  {
    a: {x: {y: {z: 1}}},
    b: {x: {y: {z: 1}}},
    depth: 3,
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
    depth: 1,
    output: true
  },
  {
    a: [1, 2, 3, 4],
    b: [1, 2, 3, 5],
    depth: 1,
    output: false
  },
  {
    a: [1, 2, 3, 4],
    b: [1, 2, 3],
    depth: 1,
    output: false
  },
  {
    a: [1, 2, 3],
    b: [1, 2, 3, 4],
    depth: 1,
    output: false
  },
  {
    a: [
      {threshold: 1, color: [50, 50, 50]},
      {threshold: 2, color: [100, 100, 100]}
    ],
    b: [
      {threshold: 1, color: [50, 50, 50]},
      {threshold: 2, color: [100, 100, 100]}
    ],
    depth: 3,
    output: true
  },
  {
    a: [
      {threshold: 1, color: [50, 50, 50]},
      {threshold: 2, color: [100, 100, 100]}
    ],
    b: [
      {threshold: [1000, 2000], color: [50, 50, 50]},
      {threshold: 2, color: [100, 100, 100]}
    ],
    depth: 3,
    output: false
  }
];

test('utils#deepEqual', t => {
  TEST_CASES.forEach(({a, b, depth, output}) => {
    const result = deepEqual(a, b, depth);
    t.is(result, output, `should ${output ? '' : 'not '}be equal`);
  });

  t.end();
});
