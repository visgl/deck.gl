// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
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
    opts: {
      filter: Boolean
    },
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

test('flatten', t => {
  for (const tc of FLATTEN_TEST_CASES) {
    t.comment(tc.title + JSON.stringify(tc.opts));
    const result = tc.opts ? flatten(tc.argument, tc.opts) : flatten(tc.argument);
    t.deepEqual(result, tc.result, `flatten ${tc.title} returned expected result`);
  }
  t.end();
});

test('fillArray', t => {
  for (const tc of FILL_ARRAY_TEST_CASES) {
    const result = fillArray(tc.arguments);
    t.deepEqual(result, tc.result, `fillArray ${tc.title} returned expected result`);
  }
  t.end();
});
