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
import ScreenGridAggregator from 'deck.gl/core/experimental/utils/screen-grid-aggregator';
import {gl} from '@deck.gl/test-utils';
import {ScreenGridAggregatorData} from 'deck.gl/test/data';

const {fixture2} = ScreenGridAggregatorData;
const sa = new ScreenGridAggregator(gl);

export default function screenGridAggregatorBench(suite) {
  return suite
    .group('AGGREGATION')
    .add('AGGREGATION#CPU', () => {
      return sa.run(Object.assign({}, fixture2, {useGPU: false}));
    })
    .add('AGGREGATION#GPU', () => {
      return sa.run(Object.assign({}, fixture2, {useGPU: true, readData: true}));
    });
}
