// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {floatEquals, vecEquals} from '../../../utils/utils';
import {getFrustumPlanes, toDoublePrecisionArrayCPU} from '@deck.gl/core/utils/math-utils';
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
test('getFrustumPlanes#tests', () => {
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
    expect(floatEquals(calculated.distance, expected.distance), 'distance is equal').toBeTruthy();
    expect(vecEquals(calculated.normal, expected.normal), 'normal is equal').toBeTruthy();
  }
});

function fromDoublePrecisionArray(array: Float32Array, size: number): number[] {
  const result: number[] = [];
  let index = 0;
  while (index < array.length) {
    result.push(array[index] + array[index + size]);
    index++;
    if (index % size === 0) {
      index += size;
    }
  }
  return result;
}

test('toDoublePrecisionArrayCPU', () => {
  const source = Float64Array.from({length: 10}, (value, index) => index + Math.PI);
  let result = toDoublePrecisionArrayCPU(source, {size: 2});
  expect(result.length).toBe(20);
  expect(equals(fromDoublePrecisionArray(result, 2), source)).toBeTruthy();

  result = toDoublePrecisionArrayCPU(source, {size: 2, startIndex: 4, endIndex: 8});
  expect(result.length).toBe(8);
  expect(equals(fromDoublePrecisionArray(result, 2), source.slice(4, 8))).toBeTruthy();
});
