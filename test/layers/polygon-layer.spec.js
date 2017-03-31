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
import * as data from '../data';
import {testInitializeLayer} from '../test-utils';

import {PolygonLayer} from 'deck.gl';

const POLYGONS = [
  [],
  [[1, 1]],
  [[1, 1], [1, 1], [1, 1]],
  [[]],
  [[[1, 1]]],
  [[[1, 1], [1, 1], [1, 1]]]
];

test('PolygonLayer#constructor', t => {

  let layer = new PolygonLayer({
    id: 'emptyPolygonLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof PolygonLayer, 'Empty PolygonLayer created');

  layer = new PolygonLayer({
    data: POLYGONS,
    getPolygon: x => x
  });
  t.ok(layer instanceof PolygonLayer, 'PolygonLayer created');

  layer = new PolygonLayer({
    data: data.choropleths
  });
  t.ok(layer instanceof PolygonLayer, 'PolygonLayer created');

  testInitializeLayer({layer});
  // t.ok(layer.state.model, 'PolygonLayer has state');

  t.doesNotThrow(
    () => new PolygonLayer({
      id: 'nullPolygonLayer',
      data: null
    }),
    'Null PolygonLayer did not throw exception'
  );

  t.end();
});
