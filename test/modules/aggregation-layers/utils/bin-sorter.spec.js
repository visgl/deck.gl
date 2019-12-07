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
import BinSorter from '@deck.gl/aggregation-layers/utils/bin-sorter';

const mockBins = [
  {points: [{a: null}]},
  {points: [{a: 7}, {a: 8}, {a: 2}]},
  {points: [{a: 1}, {a: 4}]}
];

test('BinSorter.init', t => {
  let sortedBins;

  t.doesNotThrow(() => {
    sortedBins = new BinSorter([]);
  }, 'create sortedBins with empty array should not fail');

  sortedBins = new BinSorter(mockBins);

  const expectedSortedBins = [
    {i: 0, value: 1, counts: 1},
    {i: 1, value: 3, counts: 3},
    {i: 2, value: 2, counts: 2}
  ];

  const expectedResult = {
    aggregatedBins: expectedSortedBins,
    maxCount: 3,
    minValue: 1,
    maxValue: 3,
    totalCount: 6,
    binMap: {
      0: expectedSortedBins[0],
      1: expectedSortedBins[1],
      2: expectedSortedBins[2]
    }
  };

  t.deepEqual(sortedBins, expectedResult, 'should create correct sorted bins');
  t.end();
});

test('BinSorter', t => {
  let sortedBins;
  // calculate sum
  const getValue = points =>
    points.reduce((accu, p) => (Number.isFinite(p.a) ? accu + p.a : accu), 0);

  t.doesNotThrow(() => {
    sortedBins = new BinSorter([], {getValue});
  }, 'create sortedBins with empyt bin and getValue should not fail');

  sortedBins = new BinSorter(mockBins, {getValue});

  const expectedBins = [
    {i: 0, value: 0, counts: 1},
    {i: 1, value: 17, counts: 3},
    {i: 2, value: 5, counts: 2}
  ];

  t.deepEqual(sortedBins.aggregatedBins, expectedBins, 'should create correct sorted bins');

  const {aggregatedBins, binMap} = new BinSorter(mockBins, {getValue: () => null});
  t.deepEqual(
    {aggregatedBins, binMap},
    {aggregatedBins: [], binMap: {}},
    'should empty bins if getValue return null'
  );

  t.end();
});

test('BinSorter.getValueDomain', t => {
  let sortedBins = new BinSorter([]);
  const domainEmpty = sortedBins.getValueDomainByScale('quantize');
  t.deepEqual(domainEmpty, [], 'should create correct domain if bins are empty');

  sortedBins = new BinSorter([{points: []}]);
  const domainOne = sortedBins.getValueDomainByScale('quantize');
  t.deepEqual(domainOne, [], 'should create correct domain if there is only 1 bin');

  sortedBins = new BinSorter(mockBins);

  const quantizeDomain = sortedBins.getValueDomainByScale('quantize');
  t.deepEqual(quantizeDomain, [1, 3], 'should create correct quantizeDomain');

  const linearDomain = sortedBins.getValueDomainByScale('linear');
  t.deepEqual(linearDomain, [1, 3], 'should create correct linearDomain');

  const quantileDomain = sortedBins.getValueDomainByScale('quantile');
  t.deepEqual(quantileDomain, [1, 2, 3], 'should create correct quantileDomain');

  sortedBins = new BinSorter(mockBins, {getValue: points => 'a'});

  const ordinalDomain = sortedBins.getValueDomainByScale('ordinal');
  t.deepEqual(ordinalDomain, ['a'], 'should create correct ordinalDomain');

  t.end();
});

test('BinSorter.getValueDomain.Percentile', t => {
  const sortedBins = new BinSorter(mockBins);
  const quantizeDomain = sortedBins.getValueDomainByScale('quantize', [0, 20]);
  t.deepEqual(quantizeDomain, [1, 1], 'should create correct quantizeDomain');

  t.end();
});
