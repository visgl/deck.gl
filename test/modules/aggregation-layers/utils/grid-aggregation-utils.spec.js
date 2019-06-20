// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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

import {alignToCell} from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/grid-aggregation-utils';

import GPUGridAggregator from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/gpu-grid-aggregator';
import {pointToDensityGridData} from '@deck.gl/aggregation-layers/utils/gpu-grid-aggregation/grid-aggregation-utils';

import {gl} from '@deck.gl/test-utils';
import * as FIXTURES from 'deck.gl-test/data';

const getPosition = d => d.COORDINATES;
const gpuGridAggregator = new GPUGridAggregator(gl);

test('GridAggregationUtils#alignToCell (CPU)', t => {
  t.equal(alignToCell(-3, 5), -5);
  t.equal(alignToCell(3, 5), 0);

  t.end();
});

test('GridAggregationUtils#pointToDensityGridData (CPU vs GPU)', t => {
  const opts = {
    data: FIXTURES.points,
    getPosition,
    weightParams: {weight: {needMax: 1, needMin: 1, getWeight: x => 1}},
    gpuGridAggregator,
    aggregationFlags: {dataChanged: true},
    fp64: true // NOTE this test fails wihtout FP64 gpu aggregation.
  };
  const CELLSIZES = [25, 50, 100, 200, 500, 1000, 5000];
  for (const cellSizeMeters of CELLSIZES) {
    opts.cellSizeMeters = cellSizeMeters;
    opts.gpuAggregation = false;
    const cpuResults = pointToDensityGridData(opts);
    opts.gpuAggregation = true;
    const gpuResults = pointToDensityGridData(opts);

    const cpuCountsData = cpuResults.weights.weight.aggregationBuffer.getData();
    const gpuCountsData = gpuResults.weights.weight.aggregationBuffer.getData();

    t.deepEqual(
      cpuCountsData,
      gpuCountsData,
      `Cell aggregation data should match for cellSizeMeters:${cellSizeMeters}`
    );

    const cpuMaxCountsData = cpuResults.weights.weight.maxBuffer.getData();
    const gpuMaxCountData = gpuResults.weights.weight.maxBuffer.getData();
    t.deepEqual(
      cpuMaxCountsData[0],
      gpuMaxCountData[0],
      `Max data should match for cellSizeMeters:${cellSizeMeters}`
    );

    const cpuMinCountsData = cpuResults.weights.weight.maxBuffer.getData();
    const gpuMinCountData = gpuResults.weights.weight.maxBuffer.getData();
    t.deepEqual(
      cpuMinCountsData[0],
      gpuMinCountData[0],
      `Max data should match for cellSizeMeters:${cellSizeMeters}`
    );

    // TODO - This is failing in headless browser test. Might be related to
    // https://github.com/uber/deck.gl/issues/3156
    // t.deepEqual(
    //   cpuMaxCountsData[3],
    //   gpuMaxCountData[3],
    //   `Total count should match for cellSizeMeters:${cellSizeMeters}`
    // );
  }

  t.end();
});
