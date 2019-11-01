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

import * as Polygon from '@deck.gl/layers/solid-polygon-layer/polygon';
import PolygonTesselator from '@deck.gl/layers/solid-polygon-layer/polygon-tesselator';

const SAMPLE_DATA = [
  {polygon: [], name: 'empty array'},
  {polygon: [[1, 1]], name: 'too few points', height: 1, color: [255, 0, 0]},
  {polygon: [[1, 1], [2, 2], [3, 0]], name: 'open path', height: 2},
  {polygon: [[1, 1], [2, 2], [3, 0], [1, 1]], name: 'closed loop'},
  {
    polygon: [[[0, 0], [2, 0], [2, 2], [0, 2]], [[0.5, 0.5], [1, 0.5], [0.5, 1]]],
    name: 'with 1 hole'
  },
  {
    polygon: [[[0, 0], [2, 0], [2, 2], [0, 2]], [[0.5, 0.5], [1, 1], [0.5, 1]]],
    name: 'with 1 hole'
  },
  {
    polygon: [
      [[0, 0], [2, 0], [2, 2], [0, 2]],
      [[0.5, 0.5], [1, 0.5], [0.5, 1]],
      [[1, 1], [1.5, 1.5], [1.5, 1]]
    ],
    name: 'with 2 holes'
  },
  {
    polygon: [[[0, 0], [2, 0], [2, 2], [0, 2]], [[0.5, 0.5], [1, 0.5], [0.5, 1]], [[1, 1], [2, 2]]],
    name: 'with invalid hole'
  },
  {
    polygon: new Float64Array([1, 1, 2, 2, 3, 0]),
    name: 'flat array - open path'
  },
  {
    polygon: new Float64Array([1, 1, 2, 2, 3, 0, 1, 1]),
    name: 'flat array - closed loop'
  },
  {
    polygon: {
      positions: new Float64Array([1, 1, 2, 2, 3, 0, 1, 1])
    },
    name: 'object - single loop'
  },
  {
    polygon: {
      positions: new Float64Array([0, 0, 2, 0, 2, 2, 0, 2, 0.5, 0.5, 1, 0.5, 0.5, 1]),
      holeIndices: [8]
    },
    name: 'object - with holes'
  }
];

const TEST_DATA = [
  {
    title: 'Plain array',
    data: SAMPLE_DATA,
    getGeometry: d => d.polygon,
    positionFormat: 'XY'
  },
  {
    title: 'Iterable',
    data: new Set(SAMPLE_DATA),
    getGeometry: d => d.polygon,
    positionFormat: 'XY'
  }
];

const TEST_CASES = [
  {
    title: 'Tesselation(flat)',
    params: {}
  },
  {
    title: 'Tesselation(fp64)',
    params: {fp64: true}
  }
];

test('polygon#imports', t => {
  t.ok(typeof Polygon.normalize === 'function', 'Polygon.normalize imported');
  t.ok(typeof Polygon.getVertexCount === 'function', 'Polygon.getVertexCount imported');
  t.ok(typeof Polygon.getSurfaceIndices === 'function', 'Polygon.getSurfaceIndices imported');
  t.end();
});

test('polygon#fuctions', t => {
  for (const object of SAMPLE_DATA) {
    t.comment(object.name);

    const complexPolygon = Polygon.normalize(object.polygon, 2);
    t.ok(ArrayBuffer.isView(complexPolygon.positions), 'Polygon.normalize flattens positions');
    if (complexPolygon.holeIndices) {
      t.ok(
        Array.isArray(complexPolygon.holeIndices),
        'Polygon.normalize returns starting indices of rings'
      );
    }

    const vertexCount = Polygon.getVertexCount(object.polygon, 2);
    t.ok(Number.isFinite(vertexCount), 'Polygon.getVertexCount');
    t.is(
      vertexCount,
      Polygon.getVertexCount(complexPolygon, 2),
      'Polygon.getVertexCount returns consistent result'
    );

    const indices = Polygon.getSurfaceIndices(complexPolygon, 2);
    t.ok(Array.isArray(indices), 'Polygon.getSurfaceIndices');
  }

  t.end();
});

test('polygonTesselator#imports', t => {
  t.ok(typeof PolygonTesselator === 'function', 'PolygonTesselator imported');
  t.end();
});

test('PolygonTesselator#constructor', t => {
  TEST_DATA.forEach(testData => {
    t.comment(`Polygon data: ${testData.title}`);

    TEST_CASES.forEach(testCase => {
      t.comment(`  ${testCase.title}`);

      const tesselator = new PolygonTesselator(Object.assign({}, testData, testCase.params));
      t.ok(tesselator instanceof PolygonTesselator, 'PolygonTesselator created');
      t.is(tesselator.positionSize, 2, 'PolygonTesselator populates positionSize');

      t.is(tesselator.instanceCount, 73, 'PolygonTesselator counts points correctly');
      t.is(tesselator.vertexCount, 135, 'PolygonTesselator counts indices correctly');
      t.ok(Array.isArray(tesselator.bufferLayout), 'PolygonTesselator.bufferLayout');

      t.ok(ArrayBuffer.isView(tesselator.get('indices')), 'PolygonTesselator.get indices');
      t.ok(ArrayBuffer.isView(tesselator.get('positions')), 'PolygonTesselator.get positions');
      t.ok(ArrayBuffer.isView(tesselator.get('vertexValid')), 'PolygonTesselator.get vertexValid');
    });
  });

  t.end();
});

test('PolygonTesselator#tesselation', t => {
  const tesselator = new PolygonTesselator({
    data: [
      {
        polygon: [[1, 1], [2, 2], [3, 0], [1, 1]],
        name: 'simple loop'
      },
      {
        polygon: [[[0, 0], [2, 0], [2, 2], [0, 2]], [[0.5, 0.5], [1, 0.5], [0.5, 1]]],
        name: 'with 1 hole'
      }
    ],
    getGeometry: d => d.polygon,
    positionFormat: 'XY'
  });

  t.deepEquals(
    tesselator.get('indices').slice(0, 24),
    [1, 3, 2, 4, 12, 11, 10, 12, 4, 5, 6, 7, 7, 4, 11, 10, 4, 5, 5, 7, 11, 11, 10, 5],
    'returned correct indices'
  );
  t.deepEquals(
    tesselator.get('vertexValid').slice(0, 13),
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    'returned correct vertexValid'
  );

  t.end();
});

/* eslint-disable max-statements */
test('PolygonTesselator#partial update', t => {
  const accessorCalled = new Set();
  const sampleData = [
    {polygon: [[1, 1], [2, 2], [3, 0]], id: 'A'},
    {polygon: [[[0, 0], [2, 0], [2, 2], [0, 2]]], id: 'B'}
  ];
  const tesselator = new PolygonTesselator({
    data: sampleData,
    getGeometry: d => {
      accessorCalled.add(d.id);
      return d.polygon;
    },
    positionFormat: 'XY'
  });

  let positions = tesselator.get('positions').slice(0, 27);
  let indices = tesselator.get('indices').slice(0, tesselator.vertexCount);
  t.is(tesselator.instanceCount, 9, 'Initial instance count');
  t.is(tesselator.vertexCount, 9, 'Initial vertex count');
  // prettier-ignore
  t.deepEquals(positions, [
    1, 1, 0, 2, 2, 0, 3, 0, 0, 1, 1, 0,
    0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0
  ], 'positions');
  t.deepEquals(indices, [1, 3, 2, 7, 4, 5, 5, 6, 7], 'incides');
  t.deepEquals(Array.from(accessorCalled), ['A', 'B'], 'Accessor called on all data');

  sampleData[2] = {polygon: [[4, 4], [5, 5], [6, 4]], id: 'C'};
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 2});
  positions = tesselator.get('positions').slice(0, 39);
  indices = tesselator.get('indices').slice(0, tesselator.vertexCount);
  t.is(tesselator.instanceCount, 13, 'Updated instance count');
  t.is(tesselator.vertexCount, 12, 'Updated vertex count');
  // prettier-ignore
  t.deepEquals(positions, [
    1, 1, 0, 2, 2, 0, 3, 0, 0, 1, 1, 0,
    0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0,
    4, 4, 0, 5, 5, 0, 6, 4, 0, 4, 4, 0
  ], 'positions');
  t.deepEquals(indices, [1, 3, 2, 7, 4, 5, 5, 6, 7, 10, 12, 11], 'incides');
  t.deepEquals(Array.from(accessorCalled), ['C'], 'Accessor called only on partial data');

  sampleData[0] = {polygon: [[2, 2], [3, 0], [1, 1]], id: 'A'};
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 0, endRow: 1});
  positions = tesselator.get('positions').slice(0, 39);
  indices = tesselator.get('indices').slice(0, tesselator.vertexCount);
  t.is(tesselator.instanceCount, 13, 'Updated instance count');
  t.is(tesselator.vertexCount, 12, 'Updated vertex count');
  // prettier-ignore
  t.deepEquals(positions, [
    2, 2, 0, 3, 0, 0, 1, 1, 0, 2, 2, 0,
    0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 0,
    4, 4, 0, 5, 5, 0, 6, 4, 0, 4, 4, 0
  ], 'positions');
  t.deepEquals(indices, [1, 3, 2, 7, 4, 5, 5, 6, 7, 10, 12, 11], 'incides');
  t.deepEquals(Array.from(accessorCalled), ['A'], 'Accessor called only on partial data');

  t.end();
});
