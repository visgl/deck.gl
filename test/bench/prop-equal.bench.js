import {propEqual} from '@deck.gl/core/utils/prop-equal';

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
export default function propEqualBench(suite) {
  const s = suite.group('DEEP EQUAL COMPARISON');
  for (const {name, a, b, recursive} of TESTS) {
    s.add(`propEqual shallow#${name}`, () => propEqual(a, b, 0));
    s.add(`propEqual deep#${name}`, () => propEqual(a, b, -1));
  }

  return s;
}
