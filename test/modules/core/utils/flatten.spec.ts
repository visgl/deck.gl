// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {flatten, fillArray} from '@deck.gl/core/utils/flatten';

const FLATTEN_TEST_CASES = [
  {
    title: 'empty array',
    argument: [],
    result: []
  },
  {
    title: 'flat arrays',
    argument: [1, 2, 3],
    result: [1, 2, 3]
  },
  {
    title: 'nested one level',
    argument: [1, 2, [1, 2, 3]],
    result: [1, 2, 1, 2, 3]
  },
  {
    title: 'nested empty',
    argument: [1, [], 3],
    result: [1, 3]
  },
  {
    title: 'nested three levels',
    argument: [1, [[2], 3], [[4, [5]], 6]],
    result: [1, 2, 3, 4, 5, 6]
  },
  {
    title: 'nested three levels with predicate',
    opts: Boolean,
    argument: [1, [[2], null], [[4, [null]], 6]],
    result: [1, 2, 4, 6]
  }
];

const FILL_ARRAY_TEST_CASES = [
  {
    title: 'test array',
    arguments: {target: new Float32Array(10), source: [1, 2], count: 5},
    result: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
  }
];

test('flatten', () => {
  for (const tc of FLATTEN_TEST_CASES) {
    console.log(tc.title + JSON.stringify(tc.opts));
    const result = tc.opts ? flatten(tc.argument, tc.opts) : flatten(tc.argument);
    expect(result, `flatten ${tc.title} returned expected result`).toEqual(tc.result);
  }
});

test('fillArray', () => {
  for (const tc of FILL_ARRAY_TEST_CASES) {
    const result = fillArray(tc.arguments);
    expect(result, `fillArray ${tc.title} returned expected result`).toEqual(tc.result);
  }
});
