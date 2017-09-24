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

import * as Polygon from 'deck.gl/core-layers/solid-polygon-layer/polygon';
import {PolygonTesselator} from 'deck.gl/core-layers/solid-polygon-layer/polygon-tesselator';
import {PolygonTesselatorExtruded}
  from 'deck.gl/core-layers/solid-polygon-layer/polygon-tesselator-extruded';

import Immutable from 'immutable';

const POLYGONS = [
  [],
  [[1, 1]],
  [[1, 1], [1, 1], [1, 1]],
  [[[1, 1]]],
  [[[1, 1], [1, 1], [1, 1]]]
];

const IMMUTABLE_POLYGONS = Immutable.fromJS(POLYGONS);

test('polygon#imports', t => {
  t.ok(typeof Polygon.normalize === 'function', 'Polygon.normalize imported');
  t.ok(typeof Polygon.getVertexCount === 'function', 'Polygon.getVertexCount imported');
  t.ok(typeof Polygon.getTriangleCount === 'function', 'Polygon.getTriangleCount imported');
  t.ok(typeof Polygon.forEachVertex === 'function', 'Polygon.forEachVertex imported');
  t.end();
});

test('polygon#functions', t => {
  for (const polygon of POLYGONS) {
    t.ok(Array.isArray(Polygon.normalize(polygon)), 'Polygon.normalize');
    t.ok(Number.isFinite(Polygon.getTriangleCount(polygon)), 'Polygon.getTriangleCount');
    t.ok(Number.isFinite(Polygon.getVertexCount(polygon)), 'Polygon.getVertexCount');
  }

  for (const polygon of IMMUTABLE_POLYGONS) {
    t.ok(Polygon.normalize(polygon), 'Polygon.normalize(immutable)');
    t.ok(Number.isFinite(Polygon.getTriangleCount(polygon)), 'Polygon.getTriangleCount(immutable)');
    t.ok(Number.isFinite(Polygon.getVertexCount(polygon)), 'Polygon.getVertexCount(immutable)');
  }
  t.end();
});

test('polygonTesselator#imports', t => {
  t.ok(typeof PolygonTesselator === 'function', 'PolygonTesselator imported');
  t.end();
});

test('PolygonTesselator#methods', t => {
  const tesselator = new PolygonTesselator({polygons: POLYGONS});
  t.ok(tesselator instanceof PolygonTesselator, 'PolygonTesselator created');
  const indices = tesselator.indices();
  t.ok(ArrayBuffer.isView(indices), 'PolygonTesselator.indices');
  const positions = tesselator.positions().positions;
  t.ok(ArrayBuffer.isView(positions), 'PolygonTesselator.positions');
  const colors = tesselator.colors();
  t.ok(ArrayBuffer.isView(colors), 'PolygonTesselator.colors');
  // t.ok(ArrayBuffer.isView(tesselator.normals()), 'PolygonTesselator.normals');
  const tesselator64 = new PolygonTesselator({polygons: POLYGONS, fp64: true});
  const positions64xyLow = tesselator64.positions().positions64xyLow;
  t.ok(ArrayBuffer.isView(positions64xyLow), 'PolygonTesselator.positions64xyLow');
  t.end();
});

test('PolygonTesselatorExtruded#methods', t => {
  const tesselator = new PolygonTesselatorExtruded({polygons: POLYGONS});
  t.ok(tesselator instanceof PolygonTesselatorExtruded, 'PolygonTesselatorExtruded created');
  const indices = tesselator.indices();
  t.ok(ArrayBuffer.isView(indices), 'PolygonTesselatorExtruded.indices');
  const positions = tesselator.positions().positions;
  t.ok(ArrayBuffer.isView(positions), 'PolygonTesselatorExtruded.positions');
  const colors = tesselator.colors();
  t.ok(ArrayBuffer.isView(colors), 'PolygonTesselatorExtruded.colors');
  t.ok(ArrayBuffer.isView(tesselator.normals()), 'PolygonTesselatorExtruded.normals');
  const tesselatorExtruded64 = new PolygonTesselator({polygons: POLYGONS, fp64: true});
  const positionsExtruded64xyLow = tesselatorExtruded64.positions().positions64xyLow;
  t.ok(ArrayBuffer.isView(positionsExtruded64xyLow), 'PolygonTesselatorExtruded.positions64xyLow');

  t.end();
});

test('PolygonTesselator#methods(immutable)', t => {
  const tesselator = new PolygonTesselator({polygons: IMMUTABLE_POLYGONS});
  t.ok(tesselator instanceof PolygonTesselator, 'PolygonTesselator created');
  const indices = tesselator.indices();
  t.ok(ArrayBuffer.isView(indices), 'PolygonTesselator.indices');
  const positions = tesselator.positions().positions;
  t.ok(ArrayBuffer.isView(positions), 'PolygonTesselator.positions');
  const colors = tesselator.colors();
  t.ok(ArrayBuffer.isView(colors), 'PolygonTesselator.colors');
  t.end();
});

test('PolygonTesselatorExtruded#methods(immutable)', t => {
  const tesselator = new PolygonTesselatorExtruded({polygons: IMMUTABLE_POLYGONS});
  t.ok(tesselator instanceof PolygonTesselatorExtruded, 'PolygonTesselatorExtruded created');
  const indices = tesselator.indices();
  t.ok(ArrayBuffer.isView(indices), 'PolygonTesselatorExtruded.indices');
  const positions = tesselator.positions().positions;
  t.ok(ArrayBuffer.isView(positions), 'PolygonTesselatorExtruded.positions');
  const colors = tesselator.colors();
  t.ok(ArrayBuffer.isView(colors), 'PolygonTesselatorExtruded.colors');
  t.ok(ArrayBuffer.isView(tesselator.normals()), 'PolygonTesselatorExtruded.normals');
  t.end();
});
