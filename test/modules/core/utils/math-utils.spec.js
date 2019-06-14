import test from 'tape-catch';
import {getFrustumPlanes} from '@deck.gl/core/utils/math-utils';

const ROOT2 = 0.7071;
const EPSILON = 0.0001;

const EXPECTED_PLANES = {
  near: {
    d: 0,
    n: [0, 0, 1]
  },
  far: {
    d: 9,
    n: [0, 0, -1]
  },
  left: {
    d: ROOT2,
    n: [-ROOT2, 0, ROOT2]
  },
  right: {
    d: ROOT2,
    n: [ROOT2, 0, ROOT2]
  },
  top: {
    d: ROOT2,
    n: [0, ROOT2, ROOT2]
  },
  bottom: {
    d: ROOT2,
    n: [0, -ROOT2, ROOT2]
  }
};

// Test a simple frustum with all planes
// at 45 degree angles
test('getFrustumPlanes#tests', t => {
  const planes = getFrustumPlanes({
    position: [0, 0, 1],
    direction: [0, 0, -1],
    up: [0, 1, 0],
    near: 1,
    far: 10,
    fovy: 90,
    aspect: 1
  });

  for (const plane in planes) {
    const calculated = planes[plane];
    const expected = EXPECTED_PLANES[plane];
    t.ok(floatEquals(calculated.d, expected.d), 'd is equal');
    t.ok(vecEquals(calculated.n, expected.n), 'n is equal');
  }

  t.end();
});

function floatEquals(x, y) {
  return Math.abs(x - y) < EPSILON;
}

function vecEquals(v1, v2) {
  for (let i = 0; i < v1.length; ++i) {
    if (!floatEquals(v1[i], v2[i])) {
      return false;
    }
  }

  return v1.length === v2.length;
}
