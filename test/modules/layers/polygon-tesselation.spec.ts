// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

import * as Polygon from '@deck.gl/layers/solid-polygon-layer/polygon';
import PolygonTesselator from '@deck.gl/layers/solid-polygon-layer/polygon-tesselator';

import {device} from '@deck.gl/test-utils';

const SAMPLE_DATA = [
  {polygon: [], name: 'empty array'},
  {polygon: [[1, 1]], name: 'too few points', height: 1, color: [255, 0, 0]},
  {
    polygon: [
      [1, 1],
      [2, 2],
      [3, 0]
    ],
    name: 'open path',
    height: 2
  },
  {
    polygon: [
      [1, 1],
      [2, 2],
      [3, 0],
      [1, 1]
    ],
    name: 'closed loop'
  },
  {
    polygon: [
      [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2]
      ],
      [
        [0.5, 0.5],
        [1, 0.5],
        [0.5, 1]
      ]
    ],
    name: 'with 1 hole'
  },
  {
    polygon: [
      [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2]
      ],
      [
        [0.5, 0.5],
        [1, 1],
        [0.5, 1]
      ]
    ],
    name: 'with 1 hole'
  },
  {
    polygon: [
      [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2]
      ],
      [
        [0.5, 0.5],
        [1, 0.5],
        [0.5, 1]
      ],
      [
        [1, 1],
        [1.5, 1.5],
        [1.5, 1]
      ]
    ],
    name: 'with 2 holes'
  },
  {
    polygon: [
      [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2]
      ],
      [
        [0.5, 0.5],
        [1, 0.5],
        [0.5, 1]
      ],
      [
        [1, 1],
        [2, 2]
      ]
    ],
    name: 'with invalid hole'
  },
  {
    polygon: new Float64Array([1, 1, 2, 2, 3, 0]),
    name: 'flat array - open path'
  },
  {
    polygon: new Float64Array([1, 1, 2, 2, 3, 0, 1, 1]),
    name: 'flat array - closed loop'
  },
  {
    polygon: {
      positions: new Float64Array([1, 1, 2, 2, 3, 0, 1, 1])
    },
    name: 'object - single loop'
  },
  {
    polygon: {
      positions: new Float64Array([0, 0, 2, 0, 2, 2, 0, 2, 0.5, 0.5, 1, 0.5, 0.5, 1]),
      holeIndices: [8]
    },
    name: 'object - with holes'
  }
];

const TEST_DATA = [
  {
    title: 'Plain array',
    data: SAMPLE_DATA,
    getGeometry: d => d.polygon,
    positionFormat: 'XY'
  },
  {
    title: 'Iterable',
    data: new Set(SAMPLE_DATA),
    getGeometry: d => d.polygon,
    positionFormat: 'XY'
  }
];

const TEST_CASES = [
  {
    title: 'Tesselation(flat)',
    params: {}
  },
  {
    title: 'Tesselation(fp64)',
    params: {fp64: true}
  }
];

test('polygon#imports', () => {
  expect(typeof Polygon.normalize === 'function', 'Polygon.normalize imported').toBeTruthy();
  expect(
    typeof Polygon.getSurfaceIndices === 'function',
    'Polygon.getSurfaceIndices imported'
  ).toBeTruthy();
});

test('polygon#fuctions', () => {
  for (const object of SAMPLE_DATA) {
    console.log(object.name);

    const complexPolygon = Polygon.normalize(object.polygon, 2);
    expect(
      (complexPolygon.positions || complexPolygon).every(Number.isFinite),
      'Polygon.normalize flattens positions'
    ).toBeTruthy();
    if (complexPolygon.holeIndices) {
      expect(
        Array.isArray(complexPolygon.holeIndices),
        'Polygon.normalize returns starting indices of rings'
      ).toBeTruthy();
    }

    const indices = Polygon.getSurfaceIndices(complexPolygon, 2);
    expect(Array.isArray(indices), 'Polygon.getSurfaceIndices').toBeTruthy();
  }
});

test('polygonTesselator#imports', () => {
  expect(typeof PolygonTesselator === 'function', 'PolygonTesselator imported').toBeTruthy();
});

test('PolygonTesselator#constructor', () => {
  TEST_DATA.forEach(testData => {
    console.log(`Polygon data: ${testData.title}`);

    TEST_CASES.forEach(testCase => {
      console.log(`  ${testCase.title}`);

      const tesselator = new PolygonTesselator(Object.assign({}, testData, testCase.params));
      expect(tesselator instanceof PolygonTesselator, 'PolygonTesselator created').toBeTruthy();
      expect(tesselator.positionSize, 'PolygonTesselator populates positionSize').toBe(2);

      expect(tesselator.instanceCount, 'PolygonTesselator counts points correctly').toBe(73);
      expect(tesselator.vertexCount, 'PolygonTesselator counts indices correctly').toBe(135);
      expect(Array.isArray(tesselator.vertexStarts), 'PolygonTesselator.vertexStarts').toBeTruthy();

      expect(
        ArrayBuffer.isView(tesselator.get('indices')),
        'PolygonTesselator.get indices'
      ).toBeTruthy();
      expect(
        ArrayBuffer.isView(tesselator.get('positions')),
        'PolygonTesselator.get positions'
      ).toBeTruthy();
      expect(
        ArrayBuffer.isView(tesselator.get('vertexValid')),
        'PolygonTesselator.get vertexValid'
      ).toBeTruthy();
    });
  });
});

test('PolygonTesselator#tesselation', () => {
  const tesselator = new PolygonTesselator({
    data: [
      {
        polygon: [
          [1, 1],
          [2, 2],
          [3, 0],
          [1, 1]
        ],
        name: 'simple loop'
      },
      {
        polygon: [
          [
            [0, 0],
            [2, 0],
            [2, 2],
            [0, 2]
          ],
          [
            [0.5, 0.5],
            [1, 0.5],
            [0.5, 1]
          ]
        ],
        name: 'with 1 hole'
      }
    ],
    getGeometry: d => d.polygon,
    positionFormat: 'XY'
  });

  expect(tesselator.get('indices').slice(0, 24), 'returned correct indices').toEqual([
    1, 3, 2, 8, 12, 11, 10, 12, 8, 7, 6, 5, 5, 8, 11, 10, 8, 7, 7, 5, 11, 11, 10, 7
  ]);
  expect(tesselator.get('vertexValid').slice(0, 13), 'returned correct vertexValid').toEqual([
    1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0
  ]);
});

test('PolygonTesselator#3dtesselation', () => {
  const tesselator = new PolygonTesselator({
    // polygon on xz plane
    data: [
      {
        polygon: [
          [1, 0, 1],
          [2, 0, 2],
          [3, 0, 0],
          [1, 0, 1]
        ],
        name: 'simple loop'
      },
      {
        polygon: [
          [
            [0, 0, 0],
            [2, 0, 0],
            [2, 0, 2],
            [0, 0, 2]
          ],
          [
            [0.5, 0, 0.5],
            [1, 0, 0.5],
            [0.5, 0, 1]
          ]
        ],
        name: 'with 1 hole'
      }
    ],
    getGeometry: d => d.polygon,
    positionFormat: 'XYZ',
    full3d: true
  });

  expect(tesselator.get('indices').slice(0, 24), 'returned correct indices').toEqual([
    2, 0, 1, 8, 9, 10, 11, 9, 8, 7, 6, 5, 5, 8, 10, 11, 8, 7, 7, 5, 10, 10, 11, 7
  ]);
  expect(tesselator.get('vertexValid').slice(0, 13), 'returned correct vertexValid').toEqual([
    1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0
  ]);

  tesselator.updateGeometry({
    // polygon on yz plane
    data: [
      {
        polygon: [
          [0, 1, 1],
          [0, 2, 2],
          [0, 3, 0],
          [0, 1, 1]
        ],
        name: 'simple loop'
      },
      {
        polygon: [
          [
            [0, 0, 0],
            [0, 2, 0],
            [0, 2, 2],
            [0, 0, 2]
          ],
          [
            [0, 0.5, 0.5],
            [0, 1, 0.5],
            [0, 0.5, 1]
          ]
        ],
        name: 'with 1 hole'
      }
    ]
  });

  expect(tesselator.get('indices').slice(0, 24), 'returned correct indices').toEqual([
    2, 0, 1, 8, 9, 10, 11, 9, 8, 7, 6, 5, 5, 8, 10, 11, 8, 7, 7, 5, 10, 10, 11, 7
  ]);
  expect(tesselator.get('vertexValid').slice(0, 13), 'returned correct vertexValid').toEqual([
    1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0
  ]);
});

/* eslint-disable max-statements */
test('PolygonTesselator#partial update', () => {
  const accessorCalled = new Set();
  const sampleData = [
    {
      polygon: [
        [1, 1],
        [2, 2],
        [3, 0]
      ],
      id: 'A'
    },
    {
      polygon: [
        [
          [0, 0],
          [2, 0],
          [2, 2],
          [0, 2]
        ]
      ],
      id: 'B'
    }
  ];
  const tesselator = new PolygonTesselator({
    data: sampleData,
    getGeometry: d => {
      accessorCalled.add(d.id);
      return d.polygon;
    },
    positionFormat: 'XY'
  });

  let positions = tesselator.get('positions').slice(0, 27);
  let indices = tesselator.get('indices').slice(0, tesselator.vertexCount);
  expect(tesselator.instanceCount, 'Initial instance count').toBe(9);
  expect(tesselator.vertexCount, 'Initial vertex count').toBe(9);
  // prettier-ignore
  expect(positions, 'positions').toEqual([
    1, 1, 0, 2, 2, 0, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 0, 0, 0, 0, 0
  ]);
  expect(indices, 'incides').toEqual([1, 3, 2, 5, 8, 7, 7, 6, 5]);

  expect(Array.from(accessorCalled), 'Accessor called on all data').toEqual(['A', 'B']);

  sampleData[2] = {
    polygon: [
      [4, 4],
      [5, 5],
      [6, 4]
    ],
    id: 'C'
  };
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 2});
  positions = tesselator.get('positions').slice(0, 39);
  indices = tesselator.get('indices').slice(0, tesselator.vertexCount);
  expect(tesselator.instanceCount, 'Updated instance count').toBe(13);
  expect(tesselator.vertexCount, 'Updated vertex count').toBe(12);
  // prettier-ignore
  expect(positions, 'positions').toEqual([
    1, 1, 0, 2, 2, 0, 3, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 2, 0, 2, 2,
    0, 2, 0, 0, 0, 0, 0, 4, 4, 0,
    5, 5, 0, 6, 4, 0, 4, 4, 0
  ]);
  expect(indices, 'incides').toEqual([1, 3, 2, 5, 8, 7, 7, 6, 5, 10, 12, 11]);
  expect(Array.from(accessorCalled), 'Accessor called only on partial data').toEqual(['C']);

  sampleData[0] = {
    polygon: [
      [2, 2],
      [3, 0],
      [1, 1]
    ],
    id: 'A'
  };
  accessorCalled.clear();
  tesselator.updatePartialGeometry({startRow: 0, endRow: 1});
  positions = tesselator.get('positions').slice(0, 39);
  indices = tesselator.get('indices').slice(0, tesselator.vertexCount);
  expect(tesselator.instanceCount, 'Updated instance count').toBe(13);
  expect(tesselator.vertexCount, 'Updated vertex count').toBe(12);
  // prettier-ignore
  expect(positions, 'positions').toEqual([
    2, 2, 0, 3, 0, 0, 1, 1, 0, 2,
    2, 0, 0, 0, 0, 0, 2, 0, 2, 2,
    0, 2, 0, 0, 0, 0, 0, 4, 4, 0,
    5, 5, 0, 6, 4, 0, 4, 4, 0
  ]);

  expect(indices, 'incides').toEqual([1, 3, 2, 5, 8, 7, 7, 6, 5, 10, 12, 11]);
  expect(Array.from(accessorCalled), 'Accessor called only on partial data').toEqual(['A']);
});

test('PolygonTesselator#normalize', () => {
  const sampleData = [
    {polygon: [1, 1, 2, 2, 3, 0], id: 'not-closed'},
    {polygon: [0, 0, 2, 0, 2, 2, 0, 2, 0, 0], id: 'closed'},
    {
      polygon: {positions: [0, 0, 3, 0, 3, 3, 0, 3, 1, 1, 2, 1, 1, 2], holeIndices: [8]},
      id: 'not-closed-with-holes'
    }
  ];
  const tesselator = new PolygonTesselator({
    data: sampleData,
    normalize: false,
    getGeometry: d => d.polygon,
    positionFormat: 'XY'
  });

  expect(tesselator.instanceCount, 'Updated instanceCount without normalization').toBe(15);

  tesselator.updateGeometry({
    normalize: true
  });

  expect(tesselator.instanceCount, 'Updated instanceCount with normalization').toBe(18);
});

test('PolygonTesselator#geometryBuffer', () => {
  const sampleData = {
    length: 2,
    startIndices: [0, 3],
    attributes: {
      getPolygon: new Float64Array([1, 1, 2, 2, 3, 3, 0, 0, 2, 0, 2, 2, 0, 2, 0, 0])
    }
  };
  const tesselator = new PolygonTesselator({
    data: sampleData,
    buffers: sampleData.attributes,
    geometryBuffer: sampleData.attributes.getPolygon,
    positionFormat: 'XY'
  });

  expect(tesselator.instanceCount, 'Updated instanceCount from geometryBuffer').toBe(9);
  expect(tesselator.get('positions').slice(0, 27), 'positions are populated').toEqual([
    1, 1, 0, 3, 3, 0, 2, 2, 0, 1, 1, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 0, 0, 0, 0, 0
  ]);
  expect(tesselator.get('indices'), 'indices generated').toBeTruthy();
  expect(tesselator.get('vertexValid').slice(0, 9), 'vertexValid are populated').toEqual([
    1, 1, 1, 0, 1, 1, 1, 1, 0
  ]);

  tesselator.updateGeometry({
    normalize: false
  });

  expect(tesselator.instanceCount, 'Updated instanceCount from geometryBuffer').toBe(8);
  expect(tesselator.vertexStarts, 'Used external startIndices').toBe(sampleData.startIndices);
  expect(tesselator.get('positions'), 'skipped packing positions').toBeFalsy();
  expect(tesselator.get('indices'), 'indices generated').toBeTruthy();
  expect(tesselator.get('vertexValid').slice(0, 8), 'vertexValid are populated').toEqual([
    1, 1, 0, 1, 1, 1, 1, 0
  ]);

  sampleData.attributes.indices = new Uint16Array([6, 3, 4, 4, 5, 6]);
  tesselator.updateGeometry({
    normalize: false
  });
  expect(tesselator.get('positions'), 'skipped packing positions').toBeFalsy();
  expect(tesselator.get('indices'), 'skipped packing indices').toBeFalsy();
  expect(tesselator.get('vertexValid').slice(0, 8), 'vertexValid are populated').toEqual([
    1, 1, 0, 1, 1, 1, 1, 0
  ]);
});

test('PolygonTesselator#geometryBuffer#buffer', () => {
  const buffer = device.createBuffer({
    data: new Float32Array([1, 1, 2, 2, 3, 3, 0, 0, 2, 0, 2, 2, 0, 2, 0, 0])
  });
  const sampleData = {
    length: 2,
    startIndices: [0, 3],
    attributes: {
      getPolygon: {buffer, size: 2}
    }
  };
  expect(
    () =>
      new PolygonTesselator({
        data: sampleData,
        buffers: sampleData.attributes,
        geometryBuffer: sampleData.attributes.getPolygon,
        positionFormat: 'XY'
      }),
    'throws on invalid options'
  ).toThrow();

  expect(
    () =>
      new PolygonTesselator({
        data: sampleData,
        buffers: sampleData.attributes,
        geometryBuffer: sampleData.attributes.getPolygon,
        normalize: false,
        positionFormat: 'XY'
      }),
    'throws on invalid options'
  ).toThrow();

  sampleData.attributes.indices = new Uint16Array([0, 1, 2, 3, 4, 5]);

  const tesselator = new PolygonTesselator({
    data: sampleData,
    buffers: sampleData.attributes,
    geometryBuffer: sampleData.attributes.getPolygon,
    normalize: false,
    positionFormat: 'XY'
  });

  expect(tesselator.instanceCount, 'Updated instanceCount from geometryBuffer').toBe(8);
  expect(tesselator.get('positions'), 'skipped packing positions').toBeFalsy();
  expect(tesselator.get('indices'), 'skipped packing indices').toBeFalsy();
  expect(tesselator.get('vertexValid').slice(0, 8), 'vertexValid are populated').toEqual([
    1, 1, 0, 1, 1, 1, 1, 0
  ]);
});

test('PolygonTesselator#normalizeGeometry', () => {
  const sampleData = [
    [
      [150, 30],
      [-150, 30],
      [-150, -30],
      [150, -30],
      [150, 30]
    ]
  ];
  const tesselator = new PolygonTesselator({
    data: sampleData,
    getGeometry: d => d
  });

  expect(tesselator.instanceCount, 'Updated instanceCount from input').toBe(5);

  tesselator.updateGeometry({
    resolution: 30,
    wrapLongitude: false
  });

  // subdivide into smaller segments
  expect(tesselator.instanceCount >= 80, 'Updated instanceCount from input').toBeTruthy();

  tesselator.updateGeometry({
    resolution: null,
    wrapLongitude: true
  });

  // split at 180th meridian
  expect(tesselator.instanceCount, 'Updated instanceCount from input').toBe(9);
});
