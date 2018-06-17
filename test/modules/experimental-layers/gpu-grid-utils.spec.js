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
import {gl} from '@deck.gl/test-utils';
import GPUGridAggregator from '@deck.gl/experimental-layers/utils/gpu-grid-aggregator';
import * as FIXTURES from 'deck.gl/test/data';
import {
  pointToDensityGridData,
  alignToCellBoundary
} from '@deck.gl/experimental-layers/gpu-grid-layer/gpu-grid-utils';
// import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';
//
// import {GridLayer, GridCellLayer} from 'deck.gl';

// const getColorValue = points => points.length;
// const getElevationValue = points => points.length;
const getPosition = d => d.COORDINATES;
const CELLSIZE = 500;
const gpuGridAggregator = new GPUGridAggregator(gl);

test('GridAggregator#alignToCellBoundary (CPU)', t => {
  t.equal(alignToCellBoundary(-3, 5), -5);
  t.equal(alignToCellBoundary(3, 5), 0);

  t.end();
});

test('GridAggregator#pointToDensityGridData (CPU vs GPU)', t => {
  const opts = {
    data: FIXTURES.points,
    getPosition,
    cellSizeMeters: CELLSIZE,
    gpuGridAggregator
  };
  opts.gpuAggregation = false;
  const cpuResults = pointToDensityGridData(opts);
  opts.gpuAggregation = true;
  opts.fp64 = true; // NOTE this tset fails wihtout FP64 gpu aggregation.
  const gpuResults = pointToDensityGridData(opts);

  const cpuCountsData = cpuResults.countsBuffer.getData();
  const gpuCountsData = gpuResults.countsBuffer.getData();
  t.deepEqual(cpuCountsData, gpuCountsData, 'Aggregated data should match');

  const cpuMaxCountsData = cpuResults.maxCountBuffer.getData();
  const gpuMaxCountData = gpuResults.maxCountBuffer.getData();
  t.deepEqual(cpuMaxCountsData, gpuMaxCountData, 'Aggregated data should match');

  t.end();
});
