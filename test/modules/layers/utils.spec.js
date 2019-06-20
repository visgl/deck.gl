import test from 'tape-catch';
import {replaceInRange} from '@deck.gl/layers/utils';

const TEST_DATA = ['A0', 'A1', 'A2', 'B0', 'B1', 'C0', 'D0', 'D1', 'D2', 'D3'];
const getIndex = d => d.charCodeAt(0) - 65;
const TEST_CASES = [
  {
    title: 'Replace all',
    dataRange: {},
    replace: ['a0', 'a1'],
    result: ['a0', 'a1'],
    returns: {startRow: 0, endRow: 2}
  },
  {
    title: 'Replace equal length',
    dataRange: {startRow: 1, endRow: 3},
    replace: ['b0', 'c0', 'c1'],
    result: ['A0', 'A1', 'A2', 'b0', 'c0', 'c1', 'D0', 'D1', 'D2', 'D3'],
    returns: {startRow: 3, endRow: 6}
  },
  {
    title: 'Replace smaller length',
    dataRange: {startRow: 1, endRow: 3},
    replace: ['b0', 'b1', 'c0', 'c1', 'c2'],
    result: ['A0', 'A1', 'A2', 'b0', 'b1', 'c0', 'c1', 'c2', 'D0', 'D1', 'D2', 'D3'],
    returns: {startRow: 3, endRow: 8}
  },
  {
    title: 'Replace bigger length',
    dataRange: {startRow: 1, endRow: 3},
    replace: ['b0', 'c0'],
    result: ['A0', 'A1', 'A2', 'b0', 'c0', 'D0', 'D1', 'D2', 'D3'],
    returns: {startRow: 3, endRow: 5}
  },
  {
    title: 'Insert at start',
    dataRange: {startRow: 0, endRow: 0},
    replace: ['a0', 'a1'],
    result: ['a0', 'a1', 'A0', 'A1', 'A2', 'B0', 'B1', 'C0', 'D0', 'D1', 'D2', 'D3'],
    returns: {startRow: 0, endRow: 2}
  },
  {
    title: 'Append at end',
    dataRange: {startRow: 6, endRow: 7},
    replace: ['a0', 'a1'],
    result: ['A0', 'A1', 'A2', 'B0', 'B1', 'C0', 'D0', 'D1', 'D2', 'D3', 'a0', 'a1'],
    returns: {startRow: 10, endRow: 12}
  }
];

test('replaceInRange', t => {
  for (const testCase of TEST_CASES) {
    const data = TEST_DATA.slice();
    const outDataRange = replaceInRange({
      data,
      getIndex,
      dataRange: testCase.dataRange,
      replace: testCase.replace
    });
    t.deepEquals(data, testCase.result, `${testCase.title} replaces sub data`);
    t.deepEquals(outDataRange, testCase.returns, `${testCase.title} returns correct reult`);
  }
  t.end();
});
