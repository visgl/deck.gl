import test from 'tape-catch';
import {createIterable, getAccessorFromBuffer} from '@deck.gl/core/utils/iterable-utils';

test('createIterable', t => {
  const TEST_CASES = [
    {
      title: 'empty data',
      input: {
        data: null
      },
      count: 0
    },
    {
      title: 'array data',
      input: {
        data: [1, 2, 3]
      },
      count: 3,
      firstObject: 1,
      firstIndex: 0
    },
    {
      title: 'iterable data',
      input: {
        data: new Map([['x', 1], ['y', 2], ['z', 3]])
      },
      count: 3,
      firstObject: ['x', 1],
      firstIndex: 0
    },
    {
      title: 'non-iterable data',
      input: {
        data: {length: 3}
      },
      count: 3,
      firstObject: undefined,
      firstIndex: 0
    },
    {
      title: 'array data with range',
      input: {
        data: [1, 2, 3],
        startIndex: 0,
        endIndex: 1
      },
      count: 1,
      firstObject: 1,
      firstIndex: 0
    },
    {
      title: 'array data with range',
      input: {
        data: [1, 2, 3],
        startIndex: 1
      },
      count: 2,
      firstObject: 2,
      firstIndex: 1
    },
    {
      title: 'iterable data with range',
      input: {
        data: new Map([['x', 1], ['y', 2], ['z', 3]]),
        startIndex: 1,
        endIndex: 4
      },
      count: 2,
      firstObject: ['y', 2],
      firstIndex: 1
    },
    {
      title: 'non-iterable data with range',
      input: {
        data: {length: 3},
        startIndex: 2
      },
      count: 1,
      firstObject: undefined,
      firstIndex: 2
    }
  ];

  for (const testCase of TEST_CASES) {
    const {iterable, objectInfo} = createIterable(
      testCase.input.data,
      testCase.input.startIndex,
      testCase.input.endIndex
    );
    let count = 0;
    let firstObject;
    let firstIndex;

    for (const object of iterable) {
      count++;
      objectInfo.index++;
      if (firstIndex === undefined) {
        firstIndex = objectInfo.index;
        firstObject = object;
      }
    }

    t.is(count, testCase.count, `${testCase.title} yields correct object count`);
    t.deepEqual(firstObject, testCase.firstObject, `${testCase.title} yields correct first object`);
    t.is(firstIndex, testCase.firstIndex, `${testCase.title} yields correct first index`);
  }

  t.end();
});

test('getAccessorFromBuffer', t => {
  const TEST_CASES = [
    {
      title: 'plain buffer',
      input: {
        value: new Float32Array([1, 1, 0, 2, 2, 0, 3, 3, 0]),
        size: 3
      },
      output: [[1, 1, 0], [2, 2, 0], [3, 3, 0]]
    },
    {
      title: 'buffer with stride and offset',
      input: {
        value: new Float32Array([0, 0, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0]),
        size: 2,
        stride: 12,
        offset: 12
      },
      output: [[1, 1], [2, 2], [3, 3]]
    },
    {
      title: 'variable-width buffer',
      input: {
        value: new Float32Array([1, 1, 0, 2, 2, 0, 3, 3, 0]),
        size: 3,
        startIndices: [0, 2]
      },
      output: [[1, 1, 0, 2, 2, 0], [3, 3, 0]]
    },
    {
      title: 'variable-width buffer with offset',
      input: {
        value: new Float32Array([0, 0, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0]),
        size: 3,
        offset: 12,
        startIndices: [0, 2]
      },
      output: [[1, 1, 0, 2, 2, 0], [3, 3, 0]]
    },
    {
      title: 'variable-width buffer with stride and offset',
      input: {
        value: new Float32Array([0, 0, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0]),
        size: 2,
        stride: 12,
        offset: 12,
        startIndices: [0, 2]
      },
      output: [[1, 1, 2, 2], [3, 3]]
    },
    {
      title: 'variable-width buffer nested',
      input: {
        value: new Float32Array([1, 1, 0, 2, 2, 0, 3, 3, 0]),
        size: 3,
        startIndices: [0, 2],
        nested: true
      },
      output: [[[1, 1, 0], [2, 2, 0]], [[3, 3, 0]]]
    }
  ];

  for (const testCase of TEST_CASES) {
    t.comment(testCase.title);
    const accessor = getAccessorFromBuffer(testCase.input.value, testCase.input);
    const context = {index: -1, target: []};
    for (const result of testCase.output) {
      context.index++;
      t.deepEqual(accessor(null, context), result, `accessor at index ${context.index}`);
    }
  }

  t.end();
});
