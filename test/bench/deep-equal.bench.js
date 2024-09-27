// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {deepEqual} from '@deck.gl/core/utils/deep-equal';

const obj = {a: 123, b: 44, c: 'asd', d: false, e: true};
const array = [1, 2, 3, 4];
const TESTS = [
  {name: 'same object', a: obj, b: obj},
  {name: 'different object', a: obj, b: {...obj}},
  {name: 'same array', a: array, b: array},
  {name: 'different array', a: array, b: [...array]},
  {name: 'nested object', a: {a: {b: {c: 1}}}, b: {a: {b: {c: 1}}}}
];

/* eslint-disable no-console, no-invalid-this */
export default function deepEqualBench(suite) {
  const s = suite.group('DEEP EQUAL COMPARISON');
  for (const {name, a, b} of TESTS) {
    s.add(`deepEqual shallow#${name}`, () => deepEqual(a, b, 0));
    s.add(`deepEqual deep#${name}`, () => deepEqual(a, b, -1));
  }

  return s;
}
