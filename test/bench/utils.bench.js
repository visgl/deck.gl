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

import {Layer, ScatterplotLayer, LineLayer} from 'deck.gl';
import {inheritsFrom} from '@deck.gl/react/utils/inherits-from';

import {fp64} from '@luma.gl/shadertools';
const {fp64ify, fp64LowPart} = fp64;

const POSITION = [-122.4, 37.8, 0];

// add tests

export default function utilsBench(suite) {
  return suite
    .group('UTILS')
    .add('direct access#Array', () => {
      return POSITION[0];
    })
    .add('fp64#fp64ify.lowPart', () => {
      return fp64ify(Math.PI)[1];
    })
    .add('fp64#fp64LowPart', () => {
      return fp64LowPart(Math.PI);
    })
    .add('inheritsFrom(true)', () => inheritsFrom(ScatterplotLayer, Layer))
    .add('inheritsFrom(false)', () => inheritsFrom(ScatterplotLayer, LineLayer));
}
