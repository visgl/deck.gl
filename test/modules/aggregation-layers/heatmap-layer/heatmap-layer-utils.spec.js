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
import {
  scaleTextureCoordiantes,
  boundsContain,
  getTriangleVertices,
  parseData
} from '@deck.gl/aggregation-layers/heatmap-layer/heatmap-layer-utils';
test('HeatmapLayerUtils#parseData', t => {
  const TESTS_CASE = {
    data: [
      {
        p: [0, 0],
        w: [0]
      },
      {
        p: [1, 1, 1],
        w: [1]
      },
      {
        p: [2, 2],
        w: [20]
      }
    ],
    getPosition: x => x.p,
    getWeight: x => x.w,
    positions: [0, 0, 0, 1, 1, 1, 2, 2, 0],
    weights: [0, 1, 20]
  };

  const actual = parseData(TESTS_CASE.data, TESTS_CASE.getPosition, TESTS_CASE.getWeight);
  t.deepEqual(actual.positions, TESTS_CASE.positions, 'should return correct positions array');
  t.deepEqual(actual.weights, TESTS_CASE.weights, 'should return correct weights array');
  t.end();
});

test('HeatmapLayerUtils#boundsContain', t => {
  const TESTS = [
    {
      name: 'all corners inside',
      currentBounds: [[0, 0], [100, 100]],
      targetBounds: [[20, 0], [100, 80]],
      expected: true
    },
    {
      name: 'xMin out of bounds',
      currentBounds: [[0, 0], [100, 100]],
      targetBounds: [[-1, 20], [80, 80]],
      expected: false
    },
    {
      name: 'xMax out of bounds',
      currentBounds: [[0, 0], [100, 100]],
      targetBounds: [[20, 20], [110, 80]],
      expected: false
    },
    {
      name: 'yMin out of bounds',
      currentBounds: [[0, 0], [100, 100]],
      targetBounds: [[20, -0.1], [80, 80]],
      expected: false
    },
    {
      name: 'yMax out of bounds',
      currentBounds: [[0, 0], [100, 100]],
      targetBounds: [[20, 20], [80, 100.1]],
      expected: false
    },
    {
      name: 'bounds are same',
      currentBounds: [[20, 20], [80, 80]],
      targetBounds: [[20, 20], [80, 80]],
      expected: true
    }
  ];

  TESTS.forEach(tc => {
    const actual = boundsContain(tc.currentBounds, tc.targetBounds);
    t.deepEqual(actual, tc.expected, `should return correct value when ${tc.name}`);
  });
  t.end();
});

test('HeatmapLayerUtils#getTriangleVertices', t => {
  const TESTS = [
    {
      name: 'default',
      expected: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]
    },
    {
      name: 'custom',
      opts: {xMin: 10, xMax: 100, yMin: 11, yMax: 111, addZ: true},
      expected: [10, 11, 0, 100, 11, 0, 100, 111, 0, 10, 11, 0, 100, 111, 0, 10, 111, 0]
    }
  ];

  TESTS.forEach(tc => {
    const actual = getTriangleVertices(tc.opts);
    t.deepEqual(tc.expected, actual, `should return correct vertices for ${tc.name}`);
  });
  t.end();
});

test('HeatmapLayerUtils#scaleTextureCoordiantes', t => {
  const TESTS = [
    {
      originalRect: [[0, 0], [100, 100]],
      subRect: [[20, 20], [80, 80]],
      expected: [[0.2, 0.2], [0.8, 0.8]]
    },
    {
      originalRect: [[10, 10], [60, 60]],
      subRect: [[15, 20], [45, 35]],
      expected: [[0.1, 0.2], [0.7, 0.5]]
    },
    {
      originalRect: [[10, 10], [60, 60]],
      subRect: [[10, 10], [60, 60]],
      expected: [[0, 0], [1, 1]]
    }
  ];

  TESTS.forEach(tc => {
    const actual = scaleTextureCoordiantes(tc.originalRect, tc.subRect);
    t.deepEqual(actual, tc.expected, 'should return correct coordiantes');
  });
  t.end();
});
