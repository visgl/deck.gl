// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  getBounds,
  boundsContain,
  getTextureCoordinates,
  scaleToAspectRatio,
  packVertices
} from '@deck.gl/aggregation-layers/heatmap-layer/heatmap-layer-utils';

test('HeatmapLayerUtils#getBounds', t => {
  const TESTS = [
    {
      input: [
        [0, 1],
        [-1, -1],
        [2, 0]
      ],
      output: [-1, -1, 2, 1]
    },
    {
      input: [],
      output: [Infinity, Infinity, -Infinity, -Infinity]
    }
  ];
  for (const testCase of TESTS) {
    t.deepEqual(getBounds(testCase.input), testCase.output, 'returns expected result');
  }

  t.end();
});

test('HeatmapLayerUtils#boundsContain', t => {
  const TESTS = [
    {
      name: 'all corners inside',
      currentBounds: [0, 0, 100, 100],
      targetBounds: [20, 0, 100, 80],
      expected: true
    },
    {
      name: 'xMin out of bounds',
      currentBounds: [0, 0, 100, 100],
      targetBounds: [-1, 20, 80, 80],
      expected: false
    },
    {
      name: 'xMax out of bounds',
      currentBounds: [0, 0, 100, 100],
      targetBounds: [20, 20, 110, 80],
      expected: false
    },
    {
      name: 'yMin out of bounds',
      currentBounds: [0, 0, 100, 100],
      targetBounds: [20, -0.1, 80, 80],
      expected: false
    },
    {
      name: 'yMax out of bounds',
      currentBounds: [0, 0, 100, 100],
      targetBounds: [20, 20, 80, 100.1],
      expected: false
    },
    {
      name: 'bounds are same',
      currentBounds: [20, 20, 80, 80],
      targetBounds: [20, 20, 80, 80],
      expected: true
    }
  ];

  TESTS.forEach(tc => {
    const actual = boundsContain(tc.currentBounds, tc.targetBounds);
    t.deepEqual(actual, tc.expected, `should return correct value when ${tc.name}`);
  });
  t.end();
});

test('HeatmapLayerUtils#packVertices', t => {
  const TESTS = [
    {
      name: '2D',
      points: [
        [0, 0],
        [1, 1],
        [2, 2]
      ],
      dimensions: 2,
      expected: [0, 0, 1, 1, 2, 2]
    },
    {
      name: '3D',
      points: [
        [0, 0],
        [1, 1],
        [2, 2]
      ],
      dimensions: 3,
      expected: [0, 0, 0, 1, 1, 0, 2, 2, 0]
    }
  ];

  for (const tc of TESTS) {
    const actual = packVertices(tc.points, tc.dimensions);
    t.deepEqual(
      actual.slice(0, tc.expected.length),
      tc.expected,
      `should return correct vertices for ${tc.name}`
    );
  }
  t.end();
});

test('HeatmapLayerUtils#getTextureCoordinates', t => {
  const TESTS = [
    {
      bounds: [0, 0, 100, 100],
      point: [20, 20],
      expected: [0.2, 0.2]
    },
    {
      bounds: [10, 10, 60, 60],
      point: [45, 35],
      expected: [0.7, 0.5]
    }
  ];

  for (const tc of TESTS) {
    const actual = getTextureCoordinates(tc.point, tc.bounds);
    t.deepEqual(actual, tc.expected, 'should return correct coordinates');
  }
  t.end();
});

test('HeatmapLayerUtils#scaleToAspectRatio', t => {
  const TESTS = [
    {
      title: 'fit width',
      boundingBox: [0, 0, 8, 8],
      width: 8,
      height: 4,
      expected: [-4, 0, 12, 8]
    },
    {
      title: 'fit height',
      boundingBox: [0, 0, 8, 8],
      width: 4,
      height: 8,
      expected: [0, -4, 8, 12]
    },
    {
      title: 'fit both',
      boundingBox: [0, 0, 8, 8],
      width: 16,
      height: 10,
      expected: [-4, -1, 12, 9]
    }
  ];

  for (const tc of TESTS) {
    const actual = scaleToAspectRatio(tc.boundingBox, tc.width, tc.height);
    t.deepEqual(actual, tc.expected, `${tc.title}: returns correct bounds`);
  }
  t.end();
});
