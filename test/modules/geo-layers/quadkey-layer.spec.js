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

import test from 'tape-promise/tape';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {QuadkeyLayer} from '@deck.gl/geo-layers';
import {
  quadkeyToWorldBounds,
  getQuadkeyPolygon
} from '@deck.gl/geo-layers/quadkey-layer/quadkey-utils';

const TEST_DATA = [
  {
    quadkey: '0',
    expectedBounds: [
      [0, 512],
      [256, 256]
    ]
  },
  {
    quadkey: '0123',
    expectedBounds: [
      [160, 416],
      [192, 384]
    ]
  },
  {
    quadkey: '333',
    expectedBounds: [
      [448, 64],
      [512, 0]
    ]
  }
];

test('QuadkeyLayer', t => {
  const testCases = generateLayerTests({
    Layer: QuadkeyLayer,
    sampleProps: {
      data: TEST_DATA,
      getQuadkey: d => d.quadkey
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      t.ok(subLayer, 'subLayers rendered');

      if (layer.props.data.length) {
        t.equal(
          subLayer.state.paths.length,
          TEST_DATA.length,
          'should update PolygonLayers state.paths'
        );
      }
    }
  });

  testLayer({Layer: QuadkeyLayer, testCases, onError: t.notOk});

  t.end();
});

test('QuadkeyLayer#quadkeyToWorldBounds', t => {
  for (const {quadkey, expectedBounds} of TEST_DATA) {
    const bounds = quadkeyToWorldBounds(quadkey);
    t.deepEquals(bounds, expectedBounds, 'Quadkey bounds calculated');
  }

  t.end();
});

test('QuadkeyLayer#getQuadkeyPolygon', t => {
  for (const {quadkey} of TEST_DATA) {
    const polygon = getQuadkeyPolygon(quadkey);
    t.ok(polygon instanceof Float64Array, 'polygon is flat array');
    t.is(polygon.length / 2 - 1, 4, 'polygon has 4 sides');
    t.deepEqual(polygon.slice(0, 2), polygon.slice(-2), 'polygon is closed');
  }

  t.end();
});
