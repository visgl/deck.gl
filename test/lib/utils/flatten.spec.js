import test from 'tape-catch';
import {flatten} from 'deck.gl/lib/utils';

const TEST_CASES = [
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

test('flatten#import', t => {
  t.ok(typeof flatten === 'function', 'flatten imported OK');
  t.end();
});

test('flatten#tests', t => {
  for (const tc of TEST_CASES) {
    const result = flatten(tc.argument);
    t.deepEqual(result, tc.result, `flatten ${tc.title} returned expected result`);
  }
  t.end();
});
