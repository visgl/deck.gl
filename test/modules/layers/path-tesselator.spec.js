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

import PathTesselator from '@deck.gl/layers/path-layer/path-tesselator';

const SAMPLE_DATA = [
  {path: [], width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1]], width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1], [1, 1]], width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1], [2, 2], [3, 3]], width: 2, dashArray: [0, 0], color: [255, 0, 0]},
  {path: new Float64Array([1, 1, 2, 2, 3, 3]), width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1], [2, 2], [3, 3], [1, 1]], width: 3, dashArray: [2, 1], color: [0, 0, 255]}
];
const INSTANCE_COUNT = 9;

const TEST_DATA = [
  {
    title: 'Plain array',
    data: SAMPLE_DATA,
    getGeometry: d => d.path,
    positionFormat: 'XY'
  },
  {
    title: 'Iterable',
    data: new Set(SAMPLE_DATA),
    getGeometry: d => d.path,
    positionFormat: 'XY'
  }
];

const TEST_CASES = [
  {
    title: 'Tesselation',
    params: {}
  },
  {
    title: 'Tesselation(fp64)',
    params: {fp64: true}
  }
];

test('PathTesselator#imports', t => {
  t.ok(typeof PathTesselator === 'function', 'PathTesselator imported');
  t.end();
});

test('PathTesselator#constructor', t => {
  TEST_DATA.forEach(testData => {
    t.comment(`Path data: ${testData.title}`);
    const tesselator = new PathTesselator(testData);
    t.ok(tesselator instanceof PathTesselator, 'PathTesselator created');
    t.is(tesselator.instanceCount, INSTANCE_COUNT, 'Coorectly counted instances');
  });

  t.end();
});

test('PathTesselator#constructor', t => {
  TEST_DATA.forEach(testData => {
    t.comment(`Path data: ${testData.title}`);

    TEST_CASES.forEach(testCase => {
      t.comment(`  ${testCase.title}`);
      const tesselator = new PathTesselator(Object.assign({}, testData, testCase.params));

      t.ok(
        ArrayBuffer.isView(tesselator.get('startPositions')),
        'PathTesselator.get startPositions'
      );
      t.deepEquals(
        tesselator.get('startPositions').slice(0, 9),
        [0, 0, 0, 1, 1, 0, 2, 2, 0],
        'startPositions are filled'
      );

      t.ok(ArrayBuffer.isView(tesselator.get('endPositions')), 'PathTesselator.get endPositions');
      t.deepEquals(
        tesselator.get('endPositions').slice(0, 9),
        [2, 2, 0, 3, 3, 0, 2, 2, 0],
        'endPositions are filled'
      );
      t.deepEquals(
        tesselator.get('endPositions').slice(21, 30),
        [2, 2, 0, 3, 3, 0, 0, 0, 0],
        'endPositions is handling loop correctly'
      );
    });
  });

  t.end();
});

/* eslint-disable max-statements */
test('PathTesselator#partial update', t => {
  const accessorCalled = new Set();
  const sampleData = [
    {path: [[1, 1], [2, 2], [3, 3]], id: 'A'},
    {path: [[1, 1], [2, 2], [3, 3], [1, 1]], id: 'B'}
  ];
  const tesselator = new PathTesselator({
    data: sampleData,
    getGeometry: d => {
      accessorCalled.add(d.id);
      return d.path;
    },
    positionFormat: 'XY'
  });

  let startPositions = tesselator.get('startPositions').slice(0, 18);
  t.is(tesselator.instanceCount, 7, 'Initial instance count');
  t.deepEquals(
    startPositions,
    [0, 0, 0, 1, 1, 0, 2, 2, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0],
    'startPositions'
  );
  t.deepEquals(Array.from(accessorCalled), ['A', 'B'], 'Accessor called on all data');

  sampleData[2] = {path: [[4, 4], [5, 5], [6, 6]], id: 'C'};
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 2});
  startPositions = tesselator.get('startPositions').slice(0, 30);
  t.is(tesselator.instanceCount, 9, 'Updated instance count');
  t.deepEquals(
    startPositions,
    [0, 0, 0, 1, 1, 0, 2, 2, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 4, 4, 0, 5, 5, 0],
    'startPositions'
  );
  t.deepEquals(Array.from(accessorCalled), ['C'], 'Accessor called only on partial data');

  sampleData[0] = {path: [[6, 6], [5, 5], [4, 4]], id: 'A'};
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 0, endRow: 1});
  startPositions = tesselator.get('startPositions').slice(0, 30);
  t.is(tesselator.instanceCount, 9, 'Updated instance count');
  t.deepEquals(
    startPositions,
    [0, 0, 0, 6, 6, 0, 5, 5, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 4, 4, 0, 5, 5, 0],
    'startPositions'
  );
  t.deepEquals(Array.from(accessorCalled), ['A'], 'Accessor called only on partial data');

  t.end();
});
