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

import test from 'tape-promise/tape';

import {
  getValueFunc,
  wrapGetValueFunc
} from '@deck.gl/aggregation-layers/utils/aggregation-operation-utils';

const data = [
  {source: 10, index: 0},
  {source: 'a', index: 1},
  {source: null, index: 2},
  {source: 14, index: 3},
  {source: -3, index: 4},
  {source: 16, index: 5},
  {source: 0.2, index: 6}
];
const nonFiniteData = [
  {source: 'a', index: 0},
  {source: null, index: 1},
  {source: {a: 'a'}, index: 2}
];
const TEST_CASES = [
  {
    name: 'Min Function',
    op: 'MIN',
    data,
    accessor: x => x,
    expected: -3
  },
  {
    name: 'Max Function',
    op: 'MAX',
    data,
    accessor: x => x,
    expected: 16
  },
  {
    name: 'Sum Function',
    op: 'SUM',
    data,
    accessor: x => x,
    expected: 37.2
  },
  {
    name: 'Mean Function',
    op: 'MEAN',
    data,
    accessor: x => x,
    expected: 37.2 / 5
  },
  {
    name: 'Invalid(should default to SUM)',
    op: 'Invalid',
    data,
    accessor: x => x,
    expected: 37.2
  },
  {
    name: 'Constant accessor/SUM',
    op: 'SUM',
    data,
    accessor: 1,
    expected: data.length
  },
  {
    name: 'Constant accessor/MEAN',
    op: 'MEAN',
    data,
    accessor: 1,
    expected: 1
  },
  {
    name: 'Constant accessor/MAX',
    op: 'MAX',
    data,
    accessor: 1,
    expected: 1
  },
  {
    name: 'Constant accessor/MIN',
    op: 'MIN',
    data,
    accessor: 1,
    expected: 1
  }
];

test('GridAggregationOperationUtils#getValueFunc', t => {
  TEST_CASES.forEach(tc => {
    const func = getValueFunc(tc.op, tc.accessor);
    t.is(func(data), tc.expected, `${tc.name} should return expected result`);

    const altData = typeof accessor === 'function' ? nonFiniteData : [];
    t.is(func(altData), null, `${tc.name} should return expected result on non-finite data`);
  });
  t.end();
});

test('GridAggregationOperationUtils#wrapGetValueFunc', t => {
  const func = wrapGetValueFunc((values, {indices}) => {
    t.deepEqual(indices, [0, 1, 2, 3, 4, 5, 6], 'indices are populated');
    return Math.max.apply(null, values.filter(Number.isFinite));
  });

  t.is(func(data), 16, 'returns expected result');

  t.end();
});
