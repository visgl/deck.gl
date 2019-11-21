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
const INSTANCE_COUNT = 12;

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

      t.ok(ArrayBuffer.isView(tesselator.get('positions')), 'PathTesselator.get positions');
      t.deepEquals(
        tesselator.get('positions').slice(0, 9),
        [1, 1, 0, 2, 2, 0, 3, 3, 0],
        'positions are filled'
      );

      t.deepEquals(
        tesselator.get('positions').slice(21, 30),
        [2, 2, 0, 3, 3, 0, 1, 1, 0],
        'positions is handling loop correctly'
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

  let positions = tesselator.get('positions').slice(0, 21);
  t.is(tesselator.instanceCount, 9, 'Initial instance count');
  t.deepEquals(
    positions.slice(0, 18),
    [1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0],
    'positions'
  );
  t.deepEquals(Array.from(accessorCalled), ['A', 'B'], 'Accessor called on all data');

  sampleData[2] = {path: [[4, 4], [5, 5], [6, 6]], id: 'C'};
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 2});
  positions = tesselator.get('positions').slice(0, 36);
  t.is(tesselator.instanceCount, 12, 'Updated instance count');
  t.deepEquals(
    positions,
    [
      1,
      1,
      0,
      2,
      2,
      0,
      3,
      3,
      0,
      1,
      1,
      0,
      2,
      2,
      0,
      3,
      3,
      0,
      1,
      1,
      0,
      2,
      2,
      0,
      3,
      3,
      0,
      4,
      4,
      0,
      5,
      5,
      0,
      6,
      6,
      0
    ],
    'positions'
  );
  t.deepEquals(Array.from(accessorCalled), ['C'], 'Accessor called only on partial data');

  sampleData[0] = {path: [[6, 6], [5, 5], [4, 4]], id: 'A'};
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 0, endRow: 1});
  positions = tesselator.get('positions').slice(0, 27);
  t.is(tesselator.instanceCount, 12, 'Updated instance count');
  t.deepEquals(
    positions,
    [6, 6, 0, 5, 5, 0, 4, 4, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0],
    'positions'
  );
  t.deepEquals(Array.from(accessorCalled), ['A'], 'Accessor called only on partial data');

  t.end();
});

test('PathTesselator#normalize', t => {
  const sampleData = [
    {path: [1, 1, 2, 2, 3, 3], id: 'A'},
    {path: [1, 1, 2, 2, 3, 3, 1, 1], id: 'B'}
  ];
  const tesselator = new PathTesselator({
    data: sampleData,
    loop: false,
    normalize: false,
    getGeometry: d => d.path,
    positionFormat: 'XY'
  });

  t.is(tesselator.instanceCount, 7, 'Updated instanceCount as open paths');

  tesselator.updateGeometry({
    loop: true,
    normalize: false
  });

  t.is(tesselator.instanceCount, 11, 'Updated instanceCount as closed loops');

  tesselator.updateGeometry({
    normalize: true
  });

  t.is(tesselator.instanceCount, 9, 'Updated instanceCount with normalization');

  t.end();
});

test('PathTesselator#geometryBuffer', t => {
  const sampleData = {
    length: 2,
    startIndices: [0, 2],
    attributes: {
      getPath: new Float64Array([1, 1, 2, 2, 1, 1, 2, 2, 3, 3, 1, 1])
    }
  };
  const tesselator = new PathTesselator({
    data: sampleData,
    buffers: sampleData.attributes,
    geometryBuffer: sampleData.attributes.getPath,
    positionFormat: 'XY'
  });

  t.is(tesselator.instanceCount, 8, 'Updated instanceCount from geometryBuffer');
  t.deepEquals(
    tesselator.get('positions').slice(0, 24),
    [1, 1, 0, 2, 2, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0],
    'positions are populated'
  );
  t.deepEquals(
    tesselator.get('segmentTypes').slice(0, 8),
    [3, 4, 4, 0, 0, 0, 4, 4],
    'segmentTypes are populated'
  );

  tesselator.updateGeometry({
    normalize: false
  });

  t.is(tesselator.instanceCount, 6, 'Updated instanceCount from geometryBuffer');
  t.is(tesselator.vertexStarts, sampleData.startIndices, 'Used external startIndices');
  t.notOk(tesselator.get('positions'), 'skipped packing positions');
  t.deepEquals(
    tesselator.get('segmentTypes').slice(0, 6),
    [3, 4, 1, 0, 2, 4],
    'segmentTypes are populated'
  );

  t.throws(
    () =>
      tesselator.updateGeometry({
        data: {length: 2}
      }),
    'throws if missing startIndices'
  );

  t.end();
});
