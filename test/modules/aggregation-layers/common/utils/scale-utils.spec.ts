// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  AttributeWithScale,
  applyScaleQuantile,
  applyScaleOrdinal
} from '@deck.gl/aggregation-layers/common/utils/scale-utils';
import {device} from '@deck.gl/test-utils';

const QUANTILE_SCALE_TEST_CASES = [
  {
    title: 'multi-values',
    rangeSize: 4,
    values: [1, 3, 6, 6.9, 7, 7.1, 8, 8.9, 9, 9.1, 10, 13, 14.9, 15, 15.1, 16],
    results: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]
  },
  {
    title: 'multi-values-2',
    rangeSize: 8,
    values: [1, 3, 6, 6.9, 7, 7.1, 8, 8.9, 9, 9.1, 10, 13, 14.9, 15, 15.1, 16],
    results: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7]
  },
  {
    title: 'unsorted',
    rangeSize: 4,
    values: [13, 7, 6, 3, 8.9, 1, 9.1, 8, 16, 7.1, 10, 15.1, 15, 14.9, 9, 6.9],
    results: [2, 1, 0, 0, 1, 0, 2, 1, 3, 1, 2, 3, 3, 3, 2, 0]
  },
  {
    title: 'single-value',
    rangeSize: 4,
    values: new Array(20).fill(0),
    results: new Array(20).fill(3)
  },
  {
    title: 'with-NaN',
    rangeSize: 4,
    values: [NaN, NaN, 0, NaN, 6, 3, NaN, 3, NaN, 2, 0],
    results: [NaN, NaN, 0, NaN, 3, 3, NaN, 3, NaN, 1, 0]
  }
];

const ORDINAL_SCALE_TEST_CASES = [
  {
    title: 'unique-values',
    values: [0.5, 1, 3, 3, 3],
    results: [0, 1, 2, 2, 2]
  },
  {
    title: 'unsorted',
    values: [3, 0.5, 1, 3, 0.5],
    results: [2, 0, 1, 2, 0]
  },
  {
    title: 'with-NaN',
    values: [NaN, NaN, 1, NaN, 0.5, NaN, 3],
    results: [NaN, NaN, 1, NaN, 0, NaN, 2]
  }
];

const ATTRIBUTE_TEST_CASES = [
  {
    title: 'sequence-value',
    input: {
      value: new Float32Array(Array.from({length: 101}, (_, i) => i * 10)),
      offset: 0,
      stride: 4
    },
    length: 101,
    testCases: [
      {
        props: {
          scaleType: 'linear',
          lowerPercentile: 0,
          upperPercentile: 100
        },
        expected: {
          domain: null,
          cutoff: null
        }
      },
      {
        props: {
          scaleType: 'linear',
          lowerPercentile: 0,
          upperPercentile: 90
        },
        expected: {
          domain: null,
          cutoff: [-Infinity, 900]
        }
      },
      {
        props: {
          scaleType: 'linear',
          lowerPercentile: 10,
          upperPercentile: 100
        },
        expected: {
          domain: null,
          cutoff: [100, Infinity]
        }
      },
      {
        props: {
          scaleType: 'quantile',
          lowerPercentile: 10,
          upperPercentile: 100
        },
        expected: {
          domain: [0, 99],
          cutoff: [10, 99]
        }
      }
    ]
  },
  {
    title: 'sparse-value',
    input: {
      value: new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 2]),
      offset: 0,
      stride: 4
    },
    length: 10,
    testCases: [
      {
        props: {
          scaleType: 'quantize',
          lowerPercentile: 0,
          upperPercentile: 100
        },
        expected: {
          domain: null,
          cutoff: null
        }
      },
      {
        props: {
          scaleType: 'quantize',
          lowerPercentile: 20,
          upperPercentile: 80
        },
        expected: {
          domain: null,
          cutoff: [1, 1]
        }
      },
      {
        props: {
          scaleType: 'ordinal',
          lowerPercentile: 0,
          upperPercentile: 80
        },
        expected: {
          domain: [0, 1],
          cutoff: [0, 0]
        }
      },
      {
        props: {
          scaleType: 'ordinal',
          lowerPercentile: 20,
          upperPercentile: 100
        },
        expected: {
          domain: [0, 1],
          cutoff: [0, 1]
        }
      }
    ]
  },
  {
    title: 'interleaved',
    input: {
      value: new Float32Array(new Array(101).fill(0).flatMap((_, i) => [Math.random(), i * 10, 1])),
      offset: 4,
      stride: 12
    },
    length: 101,
    testCases: [
      {
        props: {
          scaleType: 'linear',
          lowerPercentile: 10,
          upperPercentile: 90
        },
        expected: {
          domain: null,
          cutoff: [100, 900]
        }
      }
    ]
  }
];

test('scale-utils#quantileScale', t => {
  for (const tc of QUANTILE_SCALE_TEST_CASES) {
    const output = applyScaleQuantile(new Float32Array(tc.values), tc.rangeSize);
    t.deepEqual(
      output.attribute.value,
      tc.results,
      `applyScaleQuantile ${tc.title} returned expected value`
    );
  }
  t.end();
});

test('scale-utils#ordinalScale', t => {
  for (const tc of ORDINAL_SCALE_TEST_CASES) {
    const output = applyScaleOrdinal(new Float32Array(tc.values));
    t.deepEqual(
      output.attribute.value,
      tc.results,
      `applyScaleOrdinal ${tc.title} returned expected value`
    );
  }
  t.end();
});

test('AttributeWithScale#CPU#update', t => {
  for (const {title, input, length, testCases} of ATTRIBUTE_TEST_CASES) {
    const a = new AttributeWithScale(input, length);
    for (const testCase of testCases) {
      a.update(testCase.props);
      for (const key in testCase.expected) {
        t.deepEqual(
          a[key],
          testCase.expected[key],
          `${title} ${testCase.props.scaleType} returns expected ${key}`
        );
      }
    }
  }
  t.end();
});

test('AttributeWithScale#GPU#update', t => {
  for (const {title, input, length, testCases} of ATTRIBUTE_TEST_CASES) {
    // Simulate a binary attribute with only GPU buffer
    const gpuInput = {
      ...input,
      value: undefined,
      buffer: device.createBuffer({data: input.value})
    };

    const a = new AttributeWithScale(gpuInput, length);
    for (const testCase of testCases) {
      a.update(testCase.props);
      for (const key in testCase.expected) {
        t.deepEqual(
          a[key],
          testCase.expected[key],
          `${title} ${testCase.props.scaleType} returns expected ${key}`
        );
      }
    }
  }
  t.end();
});
