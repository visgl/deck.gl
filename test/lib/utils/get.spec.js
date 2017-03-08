import test from 'tape-catch';
import {get} from 'deck.gl/lib/utils';
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
  },
  {
    title: 'Immutable.Map',
    container: new Immutable.Map([['a', 1]]),
    key: 'a',
    result: 1
  }
];

test('get#import', t => {
  t.ok(typeof get === 'function', 'get imported OK');
  t.end();
});

test('container#get', t => {
  for (const tc of GET_TEST_CASES) {
    const result = get(tc.container, tc.key);
    t.deepEqual(result, tc.result, `get() on ${tc.title} returned expected result`);
  }
  t.end();
});
