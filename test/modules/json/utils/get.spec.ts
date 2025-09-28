// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {get} from '@deck.gl/json/utils/get';

const GET_TEST_CASES = [
  {
    title: 'simple array, integer key',
    container: [1, 2],
    key: 1,
    result: 2
  },
  {
    title: 'simple array, array key',
    container: [1],
    key: [0],
    result: 1
  },
  {
    title: 'simple object',
    container: {a: 1},
    key: 'a',
    result: 1
  },
  {
    title: 'simple object, array key',
    container: {a: 1},
    key: ['a'],
    result: 1
  },
  {
    title: 'nested object',
    container: {a: {b: {c: 1}}},
    key: 'a.b.c',
    result: 1
  },
  {
    title: 'nested object, same key, different value',
    container: {a: {b: {c: 2}}},
    key: 'a.b.c',
    result: 2
  },
  {
    title: 'nested object, same key, invalid path',
    container: {a: {}},
    key: 'a.b.c',
    result: undefined
  },
  {
    title: 'nested object, array key',
    container: {a: {b: {c: 2}}},
    key: ['a', 'b', 'c'],
    result: 2
  }
];

test('container#get', t => {
  for (const tc of GET_TEST_CASES) {
    const result = get(tc.container, tc.key);
    t.deepEqual(result, tc.result, `get() on ${tc.title} returned expected result`);
  }
  t.end();
});
