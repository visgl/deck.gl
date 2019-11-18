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
  }
];

test('padArray#tests', t => {
  for (const tc of PAD_ARRAY_TEST_CASES) {
    const result = padArray(tc.arguments);
    t.deepEqual(result, tc.result, `padArray ${tc.title} returned expected result`);
  }
  t.end();
});
