import {deepEqual} from '@deck.gl/core/utils/deep-equal';

const obj = {a: 123};
const array = [1, 2, 3, 4];
const TESTS = [
  {name: 'same object', a: obj, b: obj},
  {name: 'different object', a: obj, b: {...obj}},
  {name: 'same array', a: array, b: array},
  {name: 'different array', a: array, b: [...array]},
  {name: 'nested object', a: {a: {b: {c: 1}}}, b: {a: {b: {c: 1}}}},
  {name: 'nested object recursive', a: {a: {b: {c: 1}}}, b: {a: {b: {c: 1}}}, recursive: true}
];

/* eslint-disable no-console, no-invalid-this */
export default function deepEqualBench(suite) {
  const s = suite.group('DEEP EQUAL COMPARISON');
  for (const {name, a, b, recursive} of TESTS) {
    s.add(`deepEqual#${name}`, () => deepEqual(a, b, recursive));
  }

  return s;
}
