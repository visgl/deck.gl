import test from 'tape-catch';
import {equals} from 'math.gl';

import ColumnGeometry from '@deck.gl/layers/column-layer/column-geometry';

const TEST_VERTICES = [[-1, -1, 0], [-1, 1, 0], [1, 1, 0], [1, -1, 0]];

test('ColumnGeometry#constructor', t => {
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 6});
  let attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.indices.value), 'indices generated');
  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'normals generated');

  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  t.ok(ArrayBuffer.isView(attributes.indices.value), 'indices generated');
  t.ok(ArrayBuffer.isView(attributes.POSITION.value), 'positions generated');
  t.ok(ArrayBuffer.isView(attributes.NORMAL.value), 'normals generated');

  t.throws(
    () => new ColumnGeometry({radius: 1, height: 1, nradial: 6, vertices: TEST_VERTICES}),
    'throws if not enough vertices are provided'
  );

  t.end();
});

test('ColumnGeometry#tesselation', t => {
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4});
  let attributes = geometry.getAttributes();

  // prettier-ignore
  t.ok(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, 0, 0.5, 1, 0, -0.5, 0, 1, 0.5, 0, 1, -0.5,
    -1, 0, 0.5, -1, 0, -0.5, 0, -1, 0.5, 0, -1, -0.5
  ]), 'positions generated');

  // prettier-ignore
  t.ok(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0,
    -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0
  ]), 'normals generated');

  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  // prettier-ignore
  t.ok(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    -1, -1, 0.5, -1, -1, -0.5, -1, 1, 0.5, -1, 1, -0.5,
    1, 1, 0.5, 1, 1, -0.5, 1, -1, 0.5, 1, -1, -0.5
  ]), 'positions generated');

  // prettier-ignore
  t.ok(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    0, 2, 0, 0, 2, 0, 2, 0, 0, 2, 0, 0,
    0, -2, 0, 0, -2, 0, -2, 0, 0, -2, 0, 0
  ]), 'normals generated');

  t.end();
});
