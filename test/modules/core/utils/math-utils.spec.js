import test from 'tape-promise/tape';
import {floatEquals, vecEquals} from '../../../utils/utils';
import {getFrustumPlanes, toDoublePrecisionArray} from '@deck.gl/core/utils/math-utils';
import {equals, Matrix4} from '@math.gl/core';

const ROOT2 = 0.7071;

const EXPECTED_PLANES = {
  near: {
    distance: 0,
    normal: [0, 0, 1]
  },
  far: {
    distance: 9,
    normal: [0, 0, -1]
  },
  left: {
    distance: ROOT2,
    normal: [-ROOT2, 0, ROOT2]
  },
  right: {
    distance: ROOT2,
    normal: [ROOT2, 0, ROOT2]
  },
  top: {
    distance: ROOT2,
    normal: [0, ROOT2, ROOT2]
  },
  bottom: {
    distance: ROOT2,
    normal: [0, -ROOT2, ROOT2]
  }
};

// Test a simple frustum with all planes
// at 45 degree angles
test('getFrustumPlanes#tests', t => {
  const viewMatrix = new Matrix4().lookAt({eye: [0, 0, 1], center: [0, 0, 0], up: [0, 1, 0]});
  const viewProjMatrix = new Matrix4()
    .perspective({
      fovy: Math.PI / 2,
      aspect: 1,
      near: 1,
      far: 10
    })
    .multiplyRight(viewMatrix);
  const planes = getFrustumPlanes(viewProjMatrix);

  for (const plane in planes) {
    const calculated = planes[plane];
    const expected = EXPECTED_PLANES[plane];
    t.ok(floatEquals(calculated.distance, expected.distance), 'distance is equal');
    t.ok(vecEquals(calculated.normal, expected.normal), 'normal is equal');
  }

  t.end();
});

function fromDoublePrecisionArray(array, size) {
  const result = [];
  let i = 0;
  while (i < array.length) {
    result.push(array[i] + array[i + size]);
    i++;
    if (i % size === 0) {
      i += size;
    }
  }
  return result;
}

test('toDoublePrecisionArray', t => {
  const array = Array.from({length: 10}, (d, i) => i + Math.PI);
  let array64 = toDoublePrecisionArray(array, {size: 2});
  t.ok(array64 instanceof Float32Array, 'returns correct type');
  t.is(array64.length, 20, 'returns correct length');
  t.ok(equals(fromDoublePrecisionArray(array64, 2), array), 'array reconstructs ok');

  array64 = toDoublePrecisionArray(array, {size: 2, startIndex: 4, endIndex: 8});
  t.ok(array64 instanceof Float32Array, 'returns correct type');
  t.is(array64.length, 8, 'returns correct length');
  t.ok(equals(fromDoublePrecisionArray(array64, 2), array.slice(4, 8)), 'array reconstructs ok');

  t.end();
});
