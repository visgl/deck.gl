import test from 'tape-catch';

import * as Polygon from 'deck.gl/layers/core/polygon-layer/polygon';
import {PolygonTesselator} from 'deck.gl/layers/core/polygon-layer/polygon-tesselator';
import {PolygonTesselatorExtruded}
  from 'deck.gl/layers/core/polygon-layer/polygon-tesselator-extruded';

import Immutable from 'immutable';

const POLYGONS = [
  [],
  [[1, 1]],
  [[1, 1], [1, 1], [1, 1]],
  [[]],
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
  const positions = tesselator.positions();
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
  const positions = tesselator.positions();
  t.ok(ArrayBuffer.isView(positions), 'PolygonTesselatorExtruded.positions');
  const colors = tesselator.colors();
  t.ok(ArrayBuffer.isView(colors), 'PolygonTesselatorExtruded.colors');
  t.ok(ArrayBuffer.isView(tesselator.normals()), 'PolygonTesselatorExtruded.normals');
  t.end();
});
