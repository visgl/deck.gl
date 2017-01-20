import test from 'tape-catch';
import {count, map, get, values, isKeyedContainer, keys, entries} from 'deck.gl/lib/utils';
import Immutable from 'immutable';

const GET_TEST_CASES = [
  {
    title: 'simple array, integer key',
    container: [1, 2],
    key: 1,
    result: 2
  },
  {
    title: 'simple array, array key',
    container: [1],
    key: [0],
    result: 1
  },
  {
    title: 'simple object',
    container: {a: 1},
    key: 'a',
    result: 1
  },
  {
    title: 'simple object, array key',
    container: {a: 1},
    key: ['a'],
    result: 1
  },
  {
    title: 'nested object',
    container: {a: {b: {c: 1}}},
    key: 'a.b.c',
    result: 1
  },
  {
    title: 'nested object, same key, different value',
    container: {a: {b: {c: 2}}},
    key: 'a.b.c',
    result: 2
  },
  {
    title: 'nested object, array key',
    container: {a: {b: {c: 2}}},
    key: ['a', 'b', 'c'],
    result: 2
  },
  {
    title: 'ES6 Map',
    container: new Map([['a', 1]]),
    key: 'a',
    result: 1
  },
  {
    title: 'ES6 Map nested',
    container: new Map([['a', new Map([['b', 2]])]]),
    key: 'a.b',
    result: 2
  },
  {
    title: 'ES6 Map/Object nested',
    container: new Map([['a', {b: new Map([['c', 3]])}]]),
    key: 'a.b.c',
    result: 3
  }
];

const ITERATOR_TEST_CASES = [
  {
    title: 'object',
    container: {a: 1, b: 2, c: 3},
    values: [1, 2, 3],
    keys: ['a', 'b', 'c']
  },
  {
    title: 'Array',
    container: [1, 2, 3],
    values: [1, 2, 3]
  },
  // {
  //   title: 'ES6 Map',
  //   container: new Map([['a', 1], ['b', 2], ['c', 3]]),
  //   values: [1, 2, 3],
  //   keys: ['a', 'b', 'c']
  // },
  // {
  //   title: 'ES6 Set',
  //   container: new Set([1, 2, 3]),
  //   values: [1, 2, 3]
  // },
  {
    title: 'Immutable.Map',
    container: new Immutable.Map([['a', 1], ['b', 2], ['c', 3]]),
    values: [1, 2, 3],
    keys: ['a', 'b', 'c']
  },
  {
    title: 'Immutable.List',
    container: new Immutable.List([1, 2, 3]),
    values: [1, 2, 3]
  }
];

test('container#import', t => {
  t.ok(typeof get === 'function', 'get imported OK');
  t.ok(typeof values === 'function', 'values imported OK');
  t.ok(typeof isKeyedContainer === 'function', 'isKeyedContainer imported OK');
  t.ok(typeof keys === 'function', 'keys imported OK');
  t.ok(typeof entries === 'function', 'entries imported OK');
  t.end();
});

test('container#get', t => {
  for (const tc of GET_TEST_CASES) {
    const result = get(tc.container, tc.key);
    t.deepEqual(result, tc.result, `get() on ${tc.title} returned expected result`);
  }
  t.end();
});

test('container#count, values, keys, entries, isKeyedContainer, map', t => {
  for (const tc of ITERATOR_TEST_CASES) {
    // Test that count() works
    const c = count(tc.container);
    t.equal(c, tc.values.length, `count() on ${tc.title} returned expected result`);

    // Test that values() works
    let result = [];
    for (const element of values(tc.container)) {
      result.push(element);
    }
    t.deepEqual(result, tc.values, `values() on ${tc.title} returned expected result`);

    // Test if isKeyed works
    const isKeyed = isKeyedContainer(tc.container);
    t.deepEqual(isKeyed, Boolean(tc.keys), `isKeyedContainer() on ${tc.title} correct`);

    if (isKeyed) {
      // Test that keys() works
      result = [];
      for (const element of keys(tc.container)) {
        result.push(element);
      }
      t.deepEqual(result, tc.keys, `keys() on ${tc.title} returned expected result`);

      // Test that entries() works
      result = [];
      const resultKeys = [];
      for (const element of entries(tc.container)) {
        resultKeys.push(element[0]);
        result.push(element[1]);
      }
      t.deepEqual(resultKeys, tc.keys, `entries() on ${tc.title} returned expected keys`);
      t.deepEqual(result, tc.values, `entries() on ${tc.title} returned expected values`);
    }

    // Test that map() works
    result = map(tc.container, x => x);
    t.deepEqual(result, tc.values, `map() on ${tc.title} returned expected values`);
  }
  t.end();
});

// test('container#map nested', t => {
//   for (const tc of MAP_TEST_CASES) {
//     // Test that map() works
//     result = map(tc.container, x => x);
//     t.deepEqual(result, tc.values, `map() on ${tc.title} returned expected values`);
//   }
// }
