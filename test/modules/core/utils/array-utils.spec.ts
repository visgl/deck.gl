// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {padArray} from '@deck.gl/core/utils/array-utils';

const PAD_ARRAY_TEST_CASES = [
  {
    title: 'flat array, sufficient source',
    arguments: {
      target: new Float32Array(4),
      source: new Float32Array([0, 1, 2, 3, 4, 5]),
      size: 2
    },
    result: new Float32Array([0, 1, 2, 3])
  },
  {
    title: 'flat array, insufficient source',
    arguments: {
      target: new Float32Array(10),
      source: new Float32Array([0, 1, 2, 3, 4, 5]),
      size: 2
    },
    result: new Float32Array([0, 1, 2, 3, 4, 5, 0, 0, 0, 0])
  },
  {
    title: 'flat array, insufficient source with callack',
    arguments: {
      target: new Float32Array(10),
      source: new Float32Array([0, 1, 2, 3, 4, 5]),
      size: 2,
      getData: i => [-1, i]
    },
    result: new Float32Array([0, 1, 2, 3, 4, 5, -1, 6, -1, 8])
  },
  {
    title: 'flat array, insufficient source, bad getData',
    arguments: {
      target: new Float32Array(10),
      source: new Float32Array([0, 1, 2, 3, 4, 5]),
      size: 2,
      getData: i => []
    },
    result: new Float32Array([0, 1, 2, 3, 4, 5, 0, 0, 0, 0])
  },
  {
    title: 'compound array, sufficient source',
    arguments: {
      target: new Float32Array(4),
      source: new Float32Array([0, 1, 2, 3, 4, 5]),
      size: 2,
      targetStartIndices: [0, 1, 2],
      sourceStartIndices: [0, 1, 3],
      getData: i => [-1, i]
    },
    result: new Float32Array([0, 1, 2, 3])
  },
  {
    title: 'compound array, insufficient source',
    arguments: {
      target: new Float32Array(10),
      source: new Float32Array([0, 1, 2, 3, 4, 5]),
      size: 2,
      targetStartIndices: [0, 2, 3, 5],
      sourceStartIndices: [0, 1, 3],
      getData: i => [-1, i]
    },
    result: new Float32Array([0, 1, -1, 2, 2, 3, -1, 6, -1, 8])
  },
  {
    title: 'compound array, insufficient source, bad getData',
    arguments: {
      target: new Float32Array(10),
      source: new Float32Array([0, 1, 2, 3, 4, 5]),
      size: 2,
      targetStartIndices: [0, 2, 3, 5],
      sourceStartIndices: [0, 1, 3],
      getData: i => []
    },
    result: new Float32Array([0, 1, 0, 0, 2, 3, 0, 0, 0, 0])
  }
];

test('padArray#tests', t => {
  for (const tc of PAD_ARRAY_TEST_CASES) {
    const result = padArray(tc.arguments);
    t.deepEqual(result, tc.result, `padArray ${tc.title} returned expected result`);
  }
  t.end();
});
