// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {
  getCode,
  getLines,
  getPolygons
} from '@deck.gl/aggregation-layers/contour-layer/marching-squares';

const GETCODE_TESTS = [
  // ISO LINES
  {
    cellWeights: [5, 5, 5, 10],
    code: 4
    /*
    ---------
    |   |   |
    | 5 *10 |
    |   |   |
    ----#-*--
    |   |   |
    | 5 | 5 |
    |   |   |
    ---------
    // # is reference vertex
    // * are intersection points for code#4 (North and East with reference to #)
    */
  },
  {
    cellWeights: [5, 5, 5, 5],
    code: 0
  },
  {
    cellWeights: [5, 10, 5, 10],
    code: 6
  },
  {
    cellWeights: [10, 10, 10, 10],
    code: 15
  },

  // non zero cellIndex
  {
    cellWeights: [
      // ----------------
      // |  5 | 10 | 10 | => row-2
      // ----------------
      // | 5  |  5 |  5 | => row-1
      // ----------------
      // | 5  |  5 |  5 | => row-0
      // ---------------
      // row-0
      5, 5, 5,
      // row-1
      5, 5, 5,
      // row-2
      5, 10, 10
    ],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 12
  },
  {
    cellWeights: [
      // row-0
      5, 5, 5,
      // row-1
      10, 5, 5,
      // row-2
      10, 5, 5
    ],
    gridSize: [3, 3],
    x: 0,
    y: 1,
    code: 9
  },

  // saddle cases
  {
    cellWeights: [
      // row-0
      5, 5, 5,
      // row-1
      5, 1, 6,
      // row-2
      5, 6, 1
    ],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 10,
    meanCode: 0
  },
  {
    cellWeights: [
      // row-0
      5, 5, 5,
      // row-1
      5, 5, 10,
      // row-2
      5, 10, 5
    ],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 10,
    meanCode: 1
  },

  // ISO BANDS
  {
    cellWeights: [5, 5, 5, 3],
    code: 154, // 2122
    threshold: [2, 4]
    /*
    ---------
    |   |   |
    | 5 * 3 |
    |   |   |
    ----#-*--
    |   |   |
    | 5 | 5 |
    |   |   |
    ---------
    // # is reference vertex
    // * are intersection points for code#4 (North and East with reference to #)
    */
  },
  {
    cellWeights: [5, 5, 5, 5],
    code: 170,
    threshold: [2, 4]
  },
  // single triangle case
  {
    cellWeights: [2, 5, 5, 5],
    threshold: [2, 4],
    code: 169
  },
  // single trapezoid case
  {
    cellWeights: [10, 1, 10, 10],
    threshold: [2, 9],
    code: 162
  },
  // single rectangle case
  {
    // 1122
    cellWeights: [10, 10, 2, 8],
    threshold: [2, 9],
    code: 90
  },
  // single hexagon case
  {
    cellWeights: [3, 0, 8, 30],
    threshold: [2, 9],
    code: 97
  },

  // non zero cellIndex
  {
    // 0122
    cellWeights: [
      // ----------------
      // |  5 | 5  | 10 | => row-2
      // ----------------
      // | 5  | 15 | 15 | => row-1
      // ----------------
      // | 5  |  5 |  5 | => row-0
      // ---------------
      // row-0
      5, 5, 5,
      // row-1
      5, 15, 15,
      // row-2
      5, 5, 10
    ],
    threshold: [6, 11],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 26
  },
  {
    // 2110
    cellWeights: [
      // row-0
      5, 1, 6,
      // row-1
      5, 10, 6,
      // row-2
      5, 5, 10
    ],
    threshold: [6, 7],
    gridSize: [3, 3],
    x: 1,
    y: 0,
    code: 148
  },

  // saddle cases
  {
    // 1010
    cellWeights: [5, 6, 6, 5],
    threshold: [6, 7],
    code: 68
  },
  // 2020
  {
    cellWeights: [5, 10, 10, 5],
    threshold: [6, 9],
    code: 136
  }
];

const GETLINES_TESTS = [
  // ISO-LINES
  {
    code: 4,
    vertices: [
      [1, 1.5, 0],
      [1.5, 1, 0]
    ]
  },
  {
    code: 0,
    vertices: []
  },
  {
    code: 6,
    vertices: [
      [1, 1.5, 0],
      [1, 0.5, 0]
    ]
  },
  {
    code: 15,
    vertices: []
  },

  // non zero cellIndex
  {
    code: 12,
    x: 1,
    y: 1,
    vertices: [
      [1.5, 2, 0],
      [2.5, 2, 0]
    ]
  },
  {
    code: 9,
    x: 0,
    y: 1,
    vertices: [
      [1, 2.5, 0],
      [1, 1.5, 0]
    ]
  },

  // saddle cases
  {
    code: 5,
    meanCode: 1,
    x: 0,
    y: 0,
    vertices: [
      [0.5, 1, 0],
      [1, 1.5, 0],
      [1, 0.5, 0],
      [1.5, 1, 0]
    ]
  },
  {
    code: 5,
    meanCode: 0,
    x: 0,
    y: 0,
    vertices: [
      [0.5, 1, 0],
      [1, 0.5, 0],
      [1, 1.5, 0],
      [1.5, 1, 0]
    ]
  }
];

const GETPOLYGONS_TESTS = [
  // ISO-BANDS
  {
    // 2222
    code: 170,
    vertices: []
  },
  {
    // 2122
    name: 'single-triangle',
    code: 154,
    vertices: [
      [
        [1.5, 1, 0],
        [1.5, 1.5, 0],
        [1, 1.5, 0]
      ]
    ]
  },
  {
    // 0020
    name: 'single-trapezoid',
    code: 8,
    cellSize: [12, 24],
    vertices: [
      [
        [5 / 6, 0.5, 0],
        [7 / 6, 0.5, 0],
        [1.5, 5 / 6, 0],
        [1.5, 7 / 6, 0]
      ]
    ]
  },
  {
    // 0220
    name: 'single-rectangle',
    code: 40,
    cellSize: [12, 24],
    vertices: [
      [
        [5 / 6, 0.5, 0],
        [7 / 6, 0.5, 0],
        [7 / 6, 1.5, 0],
        [5 / 6, 1.5, 0]
      ]
    ]
  },
  {
    // 1111
    name: 'single-rectangle',
    code: 85,
    vertices: [
      [
        [0.5, 1.5, 0],
        [0.5, 0.5, 0],
        [1.5, 0.5, 0],
        [1.5, 1.5, 0]
      ]
    ]
  },
  {
    // 2001
    name: 'single-pentagon',
    code: 129,
    vertices: [
      [
        [0.5, 1, 0],
        [0.5, 0.5, 0],
        [1, 0.5, 0],
        [7 / 6, 1.5, 0],
        [5 / 6, 1.5, 0]
      ]
    ]
  },
  {
    // 0211
    name: 'single-hexagon',
    code: 37,
    vertices: [
      [
        [0.5, 1, 0],
        [0.5, 0.5, 0],
        [1.5, 0.5, 0],
        [1.5, 1, 0],
        [7 / 6, 1.5, 0],
        [5 / 6, 1.5, 0]
      ]
    ]
  },
  // saddle cases
  {
    // 1010
    name: 'saddle-6-sided-mean-0',
    code: 68,
    meanCode: 0,
    vertices: [
      [
        [0.5, 1.5, 0],
        [0.5, 1, 0],
        [1, 1.5, 0]
      ],
      [
        [1, 0.5, 0],
        [1.5, 0.5, 0],
        [1.5, 1, 0]
      ]
    ]
  },
  {
    // 1010
    name: 'saddle-6-sided-mean-0',
    code: 68,
    meanCode: 2, // merged with mean-code 1
    vertices: [
      [
        [0.5, 1.5, 0],
        [0.5, 1, 0],
        [1, 0.5, 0],
        [1.5, 0.5, 0],
        [1.5, 1, 0],
        [1, 1.5, 0]
      ]
    ]
  }
];

function getValueReader(cellWeights: number[], gridSize: number[]) {
  return (x: number, y: number) => cellWeights[y * gridSize[0] + x];
}

test('MarchingSquares#getCode', t => {
  for (const testCase of GETCODE_TESTS) {
    const {cellWeights, threshold = 6, x = 0, y = 0, gridSize = [2, 2]} = testCase;

    const {code, meanCode} = getCode({
      getValue: getValueReader(cellWeights, gridSize),
      threshold: testCase.threshold || threshold,
      x: x,
      y: y,
      xRange: [0, gridSize[0]],
      yRange: [0, gridSize[1]]
    });
    t.equals(code, testCase.code, `Code: expected=${testCase.code}, actual=${code}`);
    if (testCase.meanCode) {
      // if meanCode needed for this case
      t.equals(
        meanCode,
        testCase.meanCode,
        `meanCode: expected=${testCase.meanCode}, actual=${meanCode}`
      );
    }
  }
  t.end();
});

test('MarchingSquares#getLines', t => {
  for (const testCase of GETLINES_TESTS) {
    const {x = 0, y = 0, code, meanCode} = testCase;
    const vertices = getLines({x, y, z: 0, code, meanCode});
    t.deepEquals(vertices, testCase.vertices, 'Returns expected vertices');
  }
  t.end();
});

test('MarchingSquares#getPolygons', t => {
  for (const testCase of GETPOLYGONS_TESTS) {
    const {code, meanCode} = testCase;
    const vertices = getPolygons({x: 0, y: 0, z: 0, code, meanCode});
    t.deepEquals(vertices, testCase.vertices, 'Returns expected vertices');
  }
  t.end();
});
