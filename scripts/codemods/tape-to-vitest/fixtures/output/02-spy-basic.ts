// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import memoize from '@deck.gl/core/utils/memoize';

const sampleCompute = ({vector, object, number}) => {
  return `${vector.join(',')}:${object.name}:number`;
};
const sampleVector = [0, 0, 0];
const sampleObject = {name: 'Object'};
const sampleObject2 = {name: 'Object'};

const TEST = {
  FUNC: sampleCompute,
  CASES: [
    {
      parameters: {vector: sampleVector, object: sampleObject, number: 0},
      shouldRecompute: true
    },
    {
      parameters: {vector: sampleVector, object: sampleObject, number: 0},
      shouldRecompute: false
    },
    {
      parameters: {vector: sampleVector.slice(), object: sampleObject, number: 0},
      shouldRecompute: false
    },
    {
      parameters: {vector: sampleVector, object: sampleObject, number: 1},
      shouldRecompute: true
    },
    {
      parameters: {vector: sampleVector, object: {name: 'Object'}, number: 1},
      shouldRecompute: true
    },
    {
      parameters: {vector: sampleVector, object: sampleObject2, number: 1},
      shouldRecompute: true
    }
  ]
};

test('utils#memoize', () => {
  // Create a wrapper function to track calls (vi.spyOn has issues in browser mode)
  let wasCalled = false;
  const trackedCompute = (args: Parameters<typeof sampleCompute>[0]) => {
    wasCalled = true;
    return sampleCompute(args);
  };
  const memoized = memoize(trackedCompute);

  TEST.CASES.forEach(testCase => {
    wasCalled = false;
    const result = memoized(testCase.parameters);
    expect(result, 'returns correct result').toEqual(sampleCompute(testCase.parameters));
    if (testCase.shouldRecompute) {
      expect(wasCalled, 'should recompute').toBe(true);
    } else {
      expect(wasCalled, 'should not recompute').toBe(false);
    }
  });
});
