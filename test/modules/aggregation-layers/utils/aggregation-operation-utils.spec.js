// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

import {getValueFunc} from '@deck.gl/aggregation-layers/utils/aggregation-operation-utils';

const data = [10, 'a', null, 14, -3, 16, 0.2];
const nonFiniteData = ['a', null, {a: 'a'}];
const accessor = x => x;
const TEST_CASES = [
  {
    name: 'Min Function',
    op: 'min',
    data,
    expected: -3
  },
  {
    name: 'Max Function',
    op: 'Max',
    data,
    expected: 16
  },
  {
    name: 'Sum Function',
    op: 'sUM',
    data,
    expected: 37.2
  },
  {
    name: 'Mean Function',
    op: 'MEAN',
    data,
    expected: 37.2 / 5
  },
  {
    name: 'Invalid(should default to SUM)',
    op: 'Invalid',
    data,
    expected: 37.2
  }
];

test('GridAggregationOperationUtils#getValueFunc', t => {
  TEST_CASES.forEach(tc => {
    const func = getValueFunc(tc.op, accessor);
    t.ok(func(data) === tc.expected, `${tc.name} should return expected result`);
    t.ok(
      func(nonFiniteData) === null,
      `${tc.name} should return expected result on non-finite data`
    );
  });
  t.end();
});
