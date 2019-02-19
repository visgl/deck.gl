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

/* eslint-disable no-console, no-invalid-this */
import * as data from 'deck.gl/test/data';

import {ScatterplotLayer} from 'deck.gl';

// import {testInitializeLayer} from '@deck.gl/test-utils';

let testIdx = 0;
const testLayer = new ScatterplotLayer({data: data.points});

// add tests

export default function layerBench(suite) {
  return suite
    .group('LAYER UTILS')
    .add('encoding picking color', () => {
      testIdx++;
      if ((testIdx + 1) >> 24) {
        testIdx = 0;
      }
      testLayer.encodePickingColor(testIdx);
    })
    .add('calculate instance picking colors', () => {
      const numInstances = 1e6;
      const target = new Uint8ClampedArray(numInstances * 3);
      testLayer.calculateInstancePickingColors({value: target, size: 3}, {numInstances});
    });
}
