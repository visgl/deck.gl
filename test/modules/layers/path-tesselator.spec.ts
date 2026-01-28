// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

import PathTesselator from '@deck.gl/layers/path-layer/path-tesselator';

const SAMPLE_DATA = [
  {path: [], width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1]], width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {
    path: [
      [1, 1],
      [1, 1]
    ],
    width: 1,
    dashArray: [0, 0],
    color: [0, 0, 0]
  },
  {
    path: [
      [1, 1],
      [2, 2],
      [3, 3]
    ],
    width: 2,
    dashArray: [0, 0],
    color: [255, 0, 0]
  },
  {path: new Float64Array([1, 1, 2, 2, 3, 3]), width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {
    path: [
      [1, 1],
      [2, 2],
      [3, 3],
      [1, 1]
    ],
    width: 3,
    dashArray: [2, 1],
    color: [0, 0, 255]
  }
];
const INSTANCE_COUNT = 12;

const TEST_DATA = [
  {
    title: 'Plain array',
    data: SAMPLE_DATA,
    getGeometry: d => d.path,
    positionFormat: 'XY'
  },
  {
    title: 'Iterable',
    data: new Set(SAMPLE_DATA),
    getGeometry: d => d.path,
    positionFormat: 'XY'
  }
];

const TEST_CASES = [
  {
    title: 'Tesselation',
    params: {}
  },
  {
    title: 'Tesselation(fp64)',
    params: {fp64: true}
  }
];

test('PathTesselator#imports', () => {
  expect(typeof PathTesselator === 'function', 'PathTesselator imported').toBeTruthy();
});

test('PathTesselator#constructor', () => {
  TEST_DATA.forEach(testData => {
    console.log(`Path data: ${testData.title}`);
    const tesselator = new PathTesselator(testData);
    expect(tesselator instanceof PathTesselator, 'PathTesselator created').toBeTruthy();
    expect(tesselator.instanceCount, 'Coorectly counted instances').toBe(INSTANCE_COUNT);
  });
});

test('PathTesselator#constructor', () => {
  TEST_DATA.forEach(testData => {
    console.log(`Path data: ${testData.title}`);

    TEST_CASES.forEach(testCase => {
      console.log(`  ${testCase.title}`);
      const tesselator = new PathTesselator(Object.assign({}, testData, testCase.params));

      expect(
        ArrayBuffer.isView(tesselator.get('positions')),
        'PathTesselator.get positions'
      ).toBeTruthy();
      expect(tesselator.get('positions').slice(0, 9), 'positions are filled').toEqual([
        1, 1, 0, 2, 2, 0, 3, 3, 0
      ]);

      expect(
        tesselator.get('positions').slice(21, 30),
        'positions is handling loop correctly'
      ).toEqual([2, 2, 0, 3, 3, 0, 1, 1, 0]);
    });
  });
});

/* eslint-disable max-statements */
test('PathTesselator#partial update', () => {
  const accessorCalled = new Set();
  const sampleData = [
    {
      path: [
        [1, 1],
        [2, 2],
        [3, 3]
      ],
      id: 'A'
    },
    {
      path: [
        [1, 1],
        [2, 2],
        [3, 3],
        [1, 1]
      ],
      id: 'B'
    }
  ];
  const tesselator = new PathTesselator({
    data: sampleData,
    getGeometry: d => {
      accessorCalled.add(d.id);
      return d.path;
    },
    positionFormat: 'XY'
  });

  let positions = tesselator.get('positions').slice(0, 21);
  expect(tesselator.instanceCount, 'Initial instance count').toBe(9);
  expect(positions.slice(0, 18), 'positions').toEqual([
    1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0
  ]);
  expect(Array.from(accessorCalled), 'Accessor called on all data').toEqual(['A', 'B']);

  sampleData[2] = {
    path: [
      [4, 4],
      [5, 5],
      [6, 6]
    ],
    id: 'C'
  };
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 2});
  positions = tesselator.get('positions').slice(0, 36);
  expect(tesselator.instanceCount, 'Updated instance count').toBe(12);
  expect(positions, 'positions').toEqual(
    // prettier-ignore
    [
      1, 1, 0,
      2, 2, 0,
      3, 3, 0,
      1, 1, 0,
      2, 2, 0,
      3, 3, 0,
      1, 1, 0,
      2, 2, 0,
      3, 3, 0,
      4, 4, 0,
      5, 5, 0,
      6, 6, 0
    ]
  );
  expect(Array.from(accessorCalled), 'Accessor called only on partial data').toEqual(['C']);

  sampleData[0] = {
    path: [
      [6, 6],
      [5, 5],
      [4, 4]
    ],
    id: 'A'
  };
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 0, endRow: 1});
  positions = tesselator.get('positions').slice(0, 27);
  expect(tesselator.instanceCount, 'Updated instance count').toBe(12);
  expect(positions, 'positions').toEqual([
    6, 6, 0, 5, 5, 0, 4, 4, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0
  ]);
  expect(Array.from(accessorCalled), 'Accessor called only on partial data').toEqual(['A']);
});

test('PathTesselator#normalize', () => {
  const sampleData = [
    {path: [1, 1, 2, 2, 3, 3], id: 'A'},
    {path: [1, 1, 2, 2, 3, 3, 1, 1], id: 'B'}
  ];
  const tesselator = new PathTesselator({
    data: sampleData,
    loop: false,
    normalize: false,
    getGeometry: d => d.path,
    positionFormat: 'XY'
  });

  expect(tesselator.instanceCount, 'Updated instanceCount as open paths').toBe(7);

  tesselator.updateGeometry({
    loop: true,
    normalize: false
  });

  expect(tesselator.instanceCount, 'Updated instanceCount as closed loops').toBe(11);

  tesselator.updateGeometry({
    normalize: true
  });

  expect(tesselator.instanceCount, 'Updated instanceCount with normalization').toBe(9);
});

test('PathTesselator#geometryBuffer', () => {
  const sampleData = {
    length: 2,
    startIndices: [0, 2],
    attributes: {
      getPath: new Float64Array([1, 1, 2, 2, 1, 1, 2, 2, 3, 3, 1, 1])
    }
  };
  const tesselator = new PathTesselator({
    data: sampleData,
    buffers: sampleData.attributes,
    geometryBuffer: sampleData.attributes.getPath,
    positionFormat: 'XY'
  });

  expect(tesselator.instanceCount, 'Updated instanceCount from geometryBuffer').toBe(8);
  expect(tesselator.get('positions').slice(0, 24), 'positions are populated').toEqual([
    1, 1, 0, 2, 2, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0, 1, 1, 0, 2, 2, 0, 3, 3, 0
  ]);
  expect(tesselator.get('segmentTypes').slice(0, 8), 'segmentTypes are populated').toEqual([
    3, 4, 4, 0, 0, 0, 4, 4
  ]);

  tesselator.updateGeometry({
    normalize: false
  });

  expect(tesselator.instanceCount, 'Updated instanceCount from geometryBuffer').toBe(6);
  expect(tesselator.vertexStarts, 'Used external startIndices').toBe(sampleData.startIndices);
  expect(tesselator.get('positions'), 'skipped packing positions').toBeFalsy();
  expect(tesselator.get('segmentTypes').slice(0, 6), 'segmentTypes are populated').toEqual([
    3, 4, 1, 0, 2, 4
  ]);

  expect(
    () =>
      tesselator.updateGeometry({
        data: {length: 2}
      }),
    'throws if missing startIndices'
  ).toThrow();
});

test('PathTesselator#normalizeGeometry', () => {
  const sampleData = [
    [
      [150, 0],
      [-150, 0]
    ]
  ];
  const tesselator = new PathTesselator({
    data: sampleData,
    getGeometry: d => d
  });

  expect(tesselator.instanceCount, 'Updated instanceCount from input').toBe(2);

  tesselator.updateGeometry({
    resolution: 30,
    wrapLongitude: false
  });

  // subdivide into smaller segments
  expect(tesselator.instanceCount, 'Updated instanceCount from input').toBe(11);

  tesselator.updateGeometry({
    resolution: null,
    wrapLongitude: true
  });

  // split at 180th meridian
  expect(tesselator.instanceCount, 'Updated instanceCount from input').toBe(4);
});
