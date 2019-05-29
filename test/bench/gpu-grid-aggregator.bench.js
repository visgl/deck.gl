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

/* eslint-disable no-console, no-invalid-this */
// TODO: remove hard path once @deck.gl/experimental-layers published with GPUScreenGridLayer
import {_GPUGridAggregator as GPUGridAggregator} from '@deck.gl/aggregation-layers';
import {gl} from '@deck.gl/test-utils';
import {GridAggregationData} from 'deck.gl-test/data';
import {isWebGL2} from '@luma.gl/core';

const {fixture, generateRandomGridPoints} = GridAggregationData;
const aggregator = new GPUGridAggregator(gl);
const changeFlags = {cellSizeChanged: true};
const points25K = generateRandomGridPoints(25000);
const points100K = generateRandomGridPoints(100000);
const points1M = generateRandomGridPoints(1000000);

export default function gridAggregatorBench(suite) {
  if (!isWebGL2(gl)) {
    return suite;
  }
  return suite
    .group('GRID AGGREGATION')
    .add('CPU 25K', () => {
      runAggregation(Object.assign({}, {useGPU: false}, points25K));
    })
    .add('GPU 25K', () => {
      runAggregation(Object.assign({}, {useGPU: true}, points25K));
    })
    .add('CPU 25K with projection', () => {
      runAggregation(Object.assign({}, {useGPU: false, projectPoints: true}, points25K));
    })
    .add('GPU 25K with projection', () => {
      runAggregation(Object.assign({}, {useGPU: true, projectPoints: true}, points25K));
    })
    .add('CPU 100K', () => {
      runAggregation(Object.assign({}, {useGPU: false}, points100K));
    })
    .add('GPU 100K', () => {
      runAggregation(Object.assign({}, {useGPU: true}, points100K));
    })
    .add('CPU 100K with projection', () => {
      runAggregation(Object.assign({}, {useGPU: false, projectPoints: true}, points100K));
    })
    .add('GPU 100K with projection', () => {
      runAggregation(Object.assign({}, {useGPU: true, projectPoints: true}, points100K));
    })
    .add('CPU 1M', () => {
      runAggregation(Object.assign({}, {useGPU: false}, points1M));
    })
    .add('GPU 1M', () => {
      runAggregation(Object.assign({}, {useGPU: true}, points1M));
    })
    .add('CPU 1M with projection', () => {
      runAggregation(Object.assign({}, {useGPU: false, projectPoints: true}, points1M));
    })
    .add('GPU 1M with projection', () => {
      runAggregation(Object.assign({}, {useGPU: true, projectPoints: true}, points1M));
    });
}

function runAggregation(opts) {
  const results = aggregator.run(Object.assign({}, fixture, {changeFlags}, opts));
  if (opts.useGPU) {
    // Call getData to sync GPU and CPU.
    results.weight1.aggregationBuffer.getData();
    results.weight1.minBuffer.getData();
    results.weight1.maxBuffer.getData();
  }
}
