import test from 'tape-catch';

import * as Polygon from 'deck.gl/layers/core/polygon-layer/polygon';
import {PolygonTesselator} from 'deck.gl/layers/core/polygon-layer/polygon-tesselator';
import {PolygonTesselatorExtruded}
  from 'deck.gl/layers/core/polygon-layer/polygon-tesselator-extruded';

const POLYGONS = [
  [],
  [[1, 1]],
  [[1, 1], [1, 1], [1, 1]],
  [[]],
  [[[1, 1]]],
  [[[1, 1], [1, 1], [1, 1]]]
];

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
  const positions = tesselator.positions();
  t.ok(ArrayBuffer.isView(positions), 'PolygonTesselator.positions');
  const colors = tesselator.colors();
  t.ok(ArrayBuffer.isView(colors), 'PolygonTesselator.colors');
  // t.ok(ArrayBuffer.isView(tesselator.normals()), 'PolygonTesselator.normals');
  t.end();
});

test('PolygonTesselatorExtruded#methods', t => {
  const tesselator = new PolygonTesselatorExtruded({polygons: POLYGONS});
  t.ok(tesselator instanceof PolygonTesselatorExtruded, 'PolygonTesselatorExtruded created');
  const indices = tesselator.indices();
  t.ok(ArrayBuffer.isView(indices), 'PolygonTesselatorExtruded.indices');
  const positions = tesselator.positions();
  t.ok(ArrayBuffer.isView(positions), 'PolygonTesselatorExtruded.positions');
  const colors = tesselator.colors();
  t.ok(ArrayBuffer.isView(colors), 'PolygonTesselatorExtruded.colors');
  t.ok(ArrayBuffer.isView(tesselator.normals()), 'PolygonTesselatorExtruded.normals');
  t.end();
});
