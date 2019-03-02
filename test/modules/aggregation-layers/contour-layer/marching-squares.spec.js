import test from 'tape-catch';
import {
  getCode,
  getVertices,
  CONTOUR_TYPE
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
      5,
      5,
      5,
      // row-1
      5,
      5,
      5,
      // row-2
      5,
      10,
      10
    ],
    gridSize: [3, 3],
    x: 1,
    y: 1,
    code: 12
  },
  {
    cellWeights: [
      // row-0
      5,
      5,
      5,
      // row-1
      10,
      5,
      5,
      // row-2
      10,
      5,
      5
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
      5,
      5,
      5,
      // row-1
      5,
      1,
      6,
      // row-2
      5,
      6,
      1
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
      5,
      5,
      5,
      // row-1
      5,
      5,
      10,
      // row-2
      5,
      10,
      5
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
      5,
      5,
      5,
      // row-1
      5,
      15,
      15,
      // row-2
      5,
      5,
      10
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
      5,
      1,
      6,
      // row-1
      5,
      10,
      6,
      // row-2
      5,
      5,
      10
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

const GETVERTEX_TESTS = [
  // ISO-LINES
  {
    gridOrigin: [100, 200],
    code: 4,
    vertices: [[110, 230], [115, 220]]
  },
  {
    gridOrigin: [100, 200],
    code: 0,
    vertices: []
  },
  {
    gridOrigin: [100, 200],
    code: 6,
    vertices: [[110, 230], [110, 210]]
  },
  {
    gridOrigin: [100, 200],
    code: 15,
    vertices: []
  },

  // non zero cellIndex
  {
    gridOrigin: [100, 200],
    code: 12,
    x: 1,
    y: 1,
    vertices: [[115, 240], [125, 240]],
    gridSize: [3, 3]
  },
  {
    gridOrigin: [100, 200],
    code: 9,
    x: 0,
    y: 1,
    vertices: [[110, 250], [110, 230]],
    gridSize: [3, 3]
  },

  // saddle cases
  {
    gridOrigin: [100, 200],
    code: 5,
    meanCode: 1,
    x: 0,
    y: 0,
    vertices: [[105, 220], [110, 230], [110, 210], [115, 220]],
    gridSize: [3, 3]
  },
  {
    gridOrigin: [100, 200],
    code: 5,
    meanCode: 0,
    x: 0,
    y: 0,
    vertices: [[105, 220], [110, 210], [110, 230], [115, 220]],
    gridSize: [3, 3]
  },

  // ISO-BANDS
  {
    // 2222
    gridOrigin: [100, 200],
    code: 170,
    vertices: [],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  {
    // 2122
    name: 'single-triangle',
    gridOrigin: [100, 200],
    code: 154,
    vertices: [[[115, 220], [115, 230], [110, 230]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  {
    // 0020
    name: 'single-trapezoid',
    gridOrigin: [100, 200],
    code: 8,
    cellSize: [12, 24],
    vertices: [[[110, 212], [114, 212], [118, 220], [118, 228]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  {
    // 0220
    name: 'single-rectangle',
    gridOrigin: [100, 200],
    code: 40,
    cellSize: [12, 24],
    vertices: [[[110, 212], [114, 212], [114, 236], [110, 236]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  {
    // 1111
    name: 'single-rectangle',
    gridOrigin: [100, 200],
    code: 85,
    cellSize: [12, 24],
    vertices: [[[106, 236], [106, 212], [118, 212], [118, 236]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  {
    // 2001
    name: 'single-pentagon',
    gridOrigin: [100, 200],
    code: 129,
    cellSize: [12, 24],
    vertices: [[[106, 224], [106, 212], [112, 212], [114, 236], [110, 236]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  {
    // 0211
    name: 'single-hexagon',
    gridOrigin: [100, 200],
    code: 37,
    cellSize: [12, 24],
    vertices: [[[106, 224], [106, 212], [118, 212], [118, 224], [114, 236], [110, 236]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  // saddle cases
  {
    // 1010
    name: 'saddle-6-sided-mean-0',
    gridOrigin: [100, 200],
    code: 68,
    meanCode: 0,
    cellSize: [12, 24],
    vertices: [[[106, 236], [106, 224], [112, 236]], [[112, 212], [118, 212], [118, 224]]],
    type: CONTOUR_TYPE.ISO_BANDS
  },
  {
    // 1010
    name: 'saddle-6-sided-mean-0',
    gridOrigin: [100, 200],
    code: 68,
    meanCode: 2, // merged with mean-code 1
    cellSize: [12, 24],
    vertices: [[[106, 236], [106, 224], [112, 212], [118, 212], [118, 224], [112, 236]]],
    type: CONTOUR_TYPE.ISO_BANDS
  }
];

test('MarchingSquares#getCode', t => {
  const threshold = 6;
  const x = 0;
  const y = 0;
  const gridSize = [2, 2];
  GETCODE_TESTS.forEach(testCase => {
    const {code, meanCode} = getCode({
      cellWeights: testCase.cellWeights,
      threshold: testCase.threshold || threshold,
      x: testCase.x || x,
      y: testCase.y || y,
      width: testCase.gridSize ? testCase.gridSize[0] : gridSize[0],
      height: testCase.gridSize ? testCase.gridSize[1] : gridSize[1]
    });
    t.equals(code, testCase.code, `Code: expected: ${testCase.code}, actual: ${code}`);
    if (testCase.meanCode) {
      // if meanCode needed for this case
      t.equals(
        meanCode,
        testCase.meanCode,
        `manCoode: expected: ${testCase.meanCode}, actual: ${meanCode}`
      );
    }
  });
  t.end();
});

/* eslint-disable max-nested-callbacks */
test('MarchingSquares#getVertices', t => {
  const x = 0;
  const y = 0;
  const cellSize = [10, 20];
  GETVERTEX_TESTS.forEach(testCase => {
    const vertices = getVertices({
      gridOrigin: testCase.gridOrigin,
      x: testCase.x || x,
      y: testCase.y || y,
      cellSize: testCase.cellSize || cellSize,
      code: testCase.code,
      meanCode: testCase.meanCode,
      type: testCase.type || CONTOUR_TYPE.ISO_LINES
    });
    // Set z coordinate to 0 if not present.
    let expectedVertices = [];
    if (testCase.type === CONTOUR_TYPE.ISO_BANDS) {
      testCase.vertices.forEach(polygon => {
        if (!polygon) {
          return;
        }
        const expectedPolygon = polygon.map(
          vertex => (vertex.length === 2 ? vertex.concat(0) : vertex)
        );
        expectedVertices.push(expectedPolygon);
      });
    } else {
      expectedVertices = testCase.vertices.map(
        vertex => (vertex.length === 2 ? vertex.concat(0) : vertex)
      );
    }
    t.deepEquals(
      vertices,
      expectedVertices,
      `Vertices: expected: ${expectedVertices}, actual: ${vertices}`
    );
  });
  t.end();
});
/* eslint-enable max-nested-callbacks */
