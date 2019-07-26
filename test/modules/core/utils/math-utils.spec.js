import test from 'tape-catch';
import {floatEquals, vecEquals} from '../../../utils/utils';
import {getFrustumPlanes} from '@deck.gl/core/utils/math-utils';

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
    normal: [0, -ROOT2, ROOT2]
  },
  bottom: {
    distance: ROOT2,
    normal: [0, ROOT2, ROOT2]
  }
};

// Test a simple frustum with all planes
// at 45 degree angles
test('getFrustumPlanes#tests', t => {
  const planes = getFrustumPlanes({
    position: [0, 0, 1],
    direction: [0, 0, -1],
    up: [0, -1, 0],
    right: [1, 0, 0],
    near: 1,
    far: 10,
    fovyRadians: Math.PI / 2,
    height: 1,
    aspect: 1
  });

  for (const plane in planes) {
    const calculated = planes[plane];
    const expected = EXPECTED_PLANES[plane];
    t.ok(floatEquals(calculated.distance, expected.distance), 'distance is equal');
    t.ok(vecEquals(calculated.normal, expected.normal), 'normal is equal');
  }

  t.end();
});
