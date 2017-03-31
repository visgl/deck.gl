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
import {testInitializeLayer, toLowPrecision} from '../test-utils';

import {HexagonCellLayer} from 'deck.gl';

const HEXAGONS = [
  {centroid: [37, 122]}, {centroid: [37.1, 122.8]}
];

test('HexagonCellLayer#constructor', t => {

  let layer = new HexagonCellLayer({
    id: 'emptyHexagonCellLayer',
    data: [],
    pickable: true
  });
  t.ok(layer instanceof HexagonCellLayer, 'Empty HexagonCellLayer created');

  layer = new HexagonCellLayer({
    data: HEXAGONS,
    pickable: true
  });
  t.ok(layer instanceof HexagonCellLayer, 'HexagonCellLayer created');

  testInitializeLayer({layer});
  t.ok(layer.state.model, 'HexagonCellLayer has state');

  t.doesNotThrow(
    () => new HexagonCellLayer({
      id: 'nullHexagonLayer',
      data: null,
      pickable: true
    }),
    'Null HexagonCellLayer did not throw exception'
  );

  layer = new HexagonCellLayer({
    data: [],
    pickable: true
  });

  t.equal(layer.props.radius, 1000, 'Use default radius if not specified');
  t.equal(layer.props.angle, 0, 'Use default angel if not specified');

  t.end();
});

test('HexagonCellLayer#updateRadiusAngle', t => {
  const layer = new HexagonCellLayer({
    data: [],
    pickable: true,
    hexagonVertices: [
      [-122.3993347, 37.79178708],
      [-122.4021036, 37.79398118],
      [-122.4060099, 37.79308171],
      [-122.4071472, 37.78998822],
      [-122.4043784, 37.78779417],
      [-122.4004722, 37.78869356]
    ],
    radius: 10,
    angle: 10
  });

  testInitializeLayer({layer});

  layer.updateRadiusAngle();
  t.equal(toLowPrecision(layer.state.model.uniforms.angle, 5), 1.8543,
    'Use hexagonVertices instead of radius and angle if both provided');

  t.end();
});
