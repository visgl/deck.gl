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
import {PolygonTesselator} from '@deck.gl/layers/solid-polygon-layer/polygon-tesselator';

const POLYGONS = [[], [[1, 1]], [[1, 1], [1, 1], [1, 1]], [[[1, 1]]], [[[1, 1], [1, 1], [1, 1]]]];

const TEST_DATA = [
  {
    title: 'Plain array',
    polygons: POLYGONS
  }
];

const TEST_CASES = [
  {
    title: 'Tesselation(flat)',
    params: {}
  },
  {
    title: 'Tesselation(extruded)',
    params: {extruded: true}
  },
  {
    title: 'Tesselation(flat,fp64)',
    params: {fp64: true}
  },
  {
    title: 'Tesselation(extruded,fp64)',
    params: {extruded: true, fp64: true}
  }
];

test('polygon#imports', t => {
  t.ok(typeof Polygon.normalize === 'function', 'Polygon.normalize imported');
  t.ok(typeof Polygon.getVertexCount === 'function', 'Polygon.getVertexCount imported');
  t.ok(typeof Polygon.getTriangleCount === 'function', 'Polygon.getTriangleCount imported');
  t.end();
});

test('polygon#functions', t => {
  for (const polygon of POLYGONS) {
    t.ok(Array.isArray(Polygon.normalize(polygon)), 'Polygon.normalize');
    t.ok(Number.isFinite(Polygon.getTriangleCount(polygon)), 'Polygon.getTriangleCount');
    t.ok(Number.isFinite(Polygon.getVertexCount(polygon)), 'Polygon.getVertexCount');
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
    const tesselator = new PolygonTesselator({polygons: testData.polygons});
    t.ok(tesselator instanceof PolygonTesselator, 'PolygonTesselator created');

    TEST_CASES.forEach(testCase => {
      t.comment(`  ${testCase.title}`);
      tesselator.updatePositions(testCase.params);

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
    const tesselator = new PolygonTesselator({polygons: testData.polygons});

    t.ok(ArrayBuffer.isView(tesselator.indices()), 'PolygonTesselator.indices');
    t.ok(ArrayBuffer.isView(tesselator.elevations()), 'PolygonTesselator.elevations');
    t.ok(ArrayBuffer.isView(tesselator.colors()), 'PolygonTesselator.colors');
    t.ok(ArrayBuffer.isView(tesselator.pickingColors()), 'PolygonTesselator.pickingColors');
  });

  t.end();
});
