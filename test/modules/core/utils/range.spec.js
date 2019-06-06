import test from 'tape-catch';
import * as range from '@deck.gl/core/utils/range';

const TEST_CASES = [
  {
    range: [5, 6],
    output: [[5, 6]]
  },
  {
    range: [7, 8],
    output: [[5, 6], [7, 8]]
  },
  {
    range: [1, 2],
    output: [[1, 2], [5, 6], [7, 8]]
  },
  {
    range: [-1, 1],
    output: [[0, 2], [5, 6], [7, 8]]
  },
  {
    range: [7, 9],
    output: [[0, 2], [5, 6], [7, 9]]
  },
  {
    range: [5, 7],
    output: [[0, 2], [5, 9]]
  },
  {
    range: [3, 4],
    output: [[0, 2], [3, 4], [5, 9]]
  },
  {
    range: [6, 7],
    output: [[0, 2], [3, 4], [5, 9]]
  },
  {
    range: [10, 9],
    output: [[0, 2], [3, 4], [5, 9]]
  }
];

test('range utils', t => {
  let rangeCollection = range.EMPTY;

  for (const testCase of TEST_CASES) {
    rangeCollection = range.add(rangeCollection, testCase.range);
    t.deepEqual(rangeCollection, testCase.output, 'Range added');
  }

  t.deepEqual(range.EMPTY, [], 'Empty range');
  t.deepEqual(range.FULL, [[0, Infinity]], 'Full range');

  t.end();
});
