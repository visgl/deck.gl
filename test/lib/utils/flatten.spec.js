import test from 'tape-catch';
import {flatten, flattenVertices, fillArray} from 'deck.gl/lib/utils';

const FLATTEN_TEST_CASES = [
  {
    title: 'empty array',
    argument: [],
    result: []
  }, {
    title: 'flat arrays',
    argument: [1, 2, 3],
    result: [1, 2, 3]
  }, {
    title: 'nested one level',
    argument: [1, 2, [1, 2, 3]],
    result: [1, 2, 1, 2, 3]
  }, {
    title: 'nested empty',
    argument: [1, [], 3],
    result: [1, 3]
  }, {
    title: 'nested three levels',
    argument: [1, [[2], 3], [[4, [5]], 6]],
    result: [1, 2, 3, 4, 5, 6]
  }
];

const FILL_ARRAY_TEST_CASES = [
  {
    title: 'test array',
    arguments: {target: new Float32Array(10), source: [1, 2], count: 5},
    result: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
  }
];

test('flatten#import', t => {
  t.ok(typeof flatten === 'function', 'flatten imported OK');
  t.ok(typeof flattenVertices === 'function', 'flattenVertices imported OK');
  t.ok(typeof fillArray === 'function', 'fillArray imported OK');
  t.end();
});

test('flatten#tests', t => {
  for (const tc of FLATTEN_TEST_CASES) {
    const result = flatten(tc.argument);
    t.deepEqual(result, tc.result, `flatten ${tc.title} returned expected result`);
  }
  t.end();
});

test('fillArray#tests', t => {
  for (const tc of FILL_ARRAY_TEST_CASES) {
    const result = fillArray(tc.arguments);
    t.deepEqual(result, tc.result, `flatten ${tc.title} returned expected result`);
  }
  t.end();
});
