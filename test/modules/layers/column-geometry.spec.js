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
  t.comment('Regular geometry with height');
  let geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4});
  let attributes = geometry.getAttributes();

  t.is(attributes.POSITION.value.length, 5 * 3 * 3, 'POSITION has correct size');
  t.is(attributes.NORMAL.value.length, 5 * 3 * 3, 'NORMAL has correct size');
  t.is(attributes.indices.value.length, 4 * 3 * 2, 'indices has correct size');

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

  t.comment('Custom geometry with height');
  geometry = new ColumnGeometry({radius: 1, height: 1, nradial: 4, vertices: TEST_VERTICES});
  attributes = geometry.getAttributes();

  // prettier-ignore
  t.ok(equals(attributes.POSITION.value.slice(0, 3 * 8), [
    1, -1, 0.5, 1, -1, -0.5,
    1, 1, 0.5, 1, 1, -0.5,
    -1, 1, 0.5, -1, 1, -0.5,
    -1, -1, 0.5, -1, -1, -0.5
  ]), 'positions generated');

  // prettier-ignore
  t.ok(equals(attributes.NORMAL.value.slice(0, 3 * 8), [
    1, -1, 0, 1, -1, -0,
    1, 1, 0, 1, 1, -0,
    -1, 1, 0, -1, 1, -0,
    -1, -1, 0, -1, -1, -0
  ]), 'normals generated');

  t.comment('Regular geometry without height');
  geometry = new ColumnGeometry({radius: 1, height: 0, nradial: 4});
  attributes = geometry.getAttributes();

  t.is(attributes.POSITION.value.length, 4 * 3, 'POSITION has correct size');
  t.is(attributes.NORMAL.value.length, 4 * 3, 'NORMAL has correct size');
  t.is(attributes.indices.value.length, 0, 'indices has correct size');

  // prettier-ignore
  t.ok(equals(attributes.POSITION.value, [
    1, 0, 0,
    0, -1, 0,
    0, 1, 0,
    -1, 0, 0
  ]), 'positions generated');

  t.end();
});
