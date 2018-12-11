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
  }
];

const TEST_DATA = [
  {
    title: 'Plain array',
    data: SAMPLE_DATA,
    getPolygon: d => d.polygon
  },
  {
    title: 'Iterable',
    data: new Set(SAMPLE_DATA),
    getPolygon: d => d.polygon
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
  t.ok(typeof Polygon.getTriangleCount === 'function', 'Polygon.getTriangleCount imported');
  t.end();
});

test('polygon#fuctions', t => {
  for (const object of SAMPLE_DATA) {
    t.comment(object.name);

    const complexPolygon = Polygon.normalize(object.polygon);
    t.ok(Array.isArray(complexPolygon), 'Polygon.normalize');
    if (complexPolygon.length) {
      t.ok(
        Array.isArray(complexPolygon[0]) && Array.isArray(complexPolygon[0][0]),
        'Polygon.normalize returns array of rings'
      );
    }

    const vertexCount = Polygon.getVertexCount(object.polygon);
    t.ok(Number.isFinite(vertexCount), 'Polygon.getVertexCount');
    t.is(
      vertexCount,
      Polygon.getVertexCount(complexPolygon),
      'Polygon.getVertexCount returns consistent result'
    );

    const indices = Polygon.getSurfaceIndices(complexPolygon);
    t.ok(Array.isArray(indices), 'Polygon.getSurfaceIndices');

    const indexCount = Polygon.getTriangleCount(complexPolygon) * 3;
    t.ok(indices.length <= indexCount, 'Polygon.getTriangleCount returns sufficient space');
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
    const tesselator = new PolygonTesselator(testData);
    t.ok(tesselator instanceof PolygonTesselator, 'PolygonTesselator created');

    TEST_CASES.forEach(testCase => {
      t.comment(`  ${testCase.title}`);
      tesselator.updatePositions(testCase.params);

      t.is(tesselator.pointCount, 52, 'PolygonTesselator counts points correctly');
      t.ok(Array.isArray(tesselator.bufferLayout), 'PolygonTesselator.bufferLayout');

      t.ok(ArrayBuffer.isView(tesselator.indices()), 'PolygonTesselator.indices');
      t.ok(ArrayBuffer.isView(tesselator.positions()), 'PolygonTesselator.positions');
      t.ok(ArrayBuffer.isView(tesselator.vertexValid()), 'PolygonTesselator.vertexValid');

      if (testCase.params.fp64) {
        t.ok(
          ArrayBuffer.isView(tesselator.positions64xyLow()),
          'PolygonTesselator.positions64xyLow'
        );
      }
    });
  });

  t.end();
});

test('PolygonTesselator#methods', t => {
  TEST_DATA.forEach(testData => {
    t.comment(`Polygon data: ${testData.title}`);
    const tesselator = new PolygonTesselator(testData);

    const elevations = tesselator.elevations({
      target: new Float32Array(tesselator.pointCount),
      getElevation: d => d.height || 0
    });
    t.ok(ArrayBuffer.isView(elevations), 'PolygonTesselator.elevations');
    t.deepEquals(
      elevations.slice(0, 8),
      [1, 2, 2, 2, 2, 0, 0, 0],
      'PolygonTesselator.elevations are filled'
    );

    const colors = tesselator.colors({
      target: new Uint8ClampedArray(tesselator.pointCount * 4),
      getColor: d => [255, 0, 0]
    });
    t.ok(ArrayBuffer.isView(colors), 'PolygonTesselator.colors');
    t.deepEquals(
      colors.slice(0, 8),
      [255, 0, 0, 255, 255, 0, 0, 255],
      'PolygonTesselator.colors are filled'
    );

    const pickingColors = tesselator.pickingColors({
      target: new Uint8ClampedArray(tesselator.pointCount * 3),
      getPickingColor: index => [0, 0, index]
    });
    t.ok(ArrayBuffer.isView(pickingColors), 'PolygonTesselator.pickingColors');
    t.deepEquals(
      pickingColors.slice(0, 6),
      [0, 0, 1, 0, 0, 2],
      'PolygonTesselator.pickingColors are filled'
    );
  });

  t.end();
});
