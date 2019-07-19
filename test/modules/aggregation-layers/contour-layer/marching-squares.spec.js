import test from 'tape-catch';
import {
  getCode,
  getVertices,
  getSmoothOffset,
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
    vertices: [[110, 230], [115, 220]],
    smoothVertices: [[112.5, 230, 0], [115, 223.334, 0]],
    weights: {
      top: 12,
      current: 8,
      right: 10,
      topRight: 4
    },
    smoothEnabled: [true, false]
  },
  {
    gridOrigin: [100, 200],
    code: 0,
    vertices: [],
    smoothVertices: [],
    weights: {
      top: 12,
      current: 8,
      right: 15,
      topRight: 10
    },
    smoothEnabled: [true, false]
  },
  {
    gridOrigin: [100, 200],
    code: 6,
    vertices: [[110, 230], [110, 210]],
    smoothVertices: [[111.667, 230, 0], [111.667, 210, 0]],
    weights: {
      top: 10,
      current: 8,
      right: 5,
      topRight: 4
    },
    smoothEnabled: [true, false]
  },
  {
    gridOrigin: [100, 200],
    code: 15,
    vertices: [],
    smoothVertices: [],
    weights: {
      top: 2,
      current: 3,
      right: 4,
      topRight: 5
    },
    smoothEnabled: [true, false]
  },

  // non zero cellIndex
  {
    gridOrigin: [100, 200],
    code: 12,
    x: 1,
    y: 1,
    vertices: [[115, 240], [125, 240]],
    gridSize: [3, 3],
    smoothVertices: [[115, 241.428, 0], [125, 243.334, 0]],
    weights: {
      top: 3,
      current: 10,
      right: 8,
      topRight: 5
    },
    smoothEnabled: [true, false]
  },
  {
    gridOrigin: [100, 200],
    code: 9,
    x: 0,
    y: 1,
    vertices: [[110, 250], [110, 230]],
    gridSize: [3, 3],
    smoothVertices: [[108.333, 250, 0], [107, 230, 0]],
    weights: {
      top: 3,
      current: 5,
      right: 10,
      topRight: 12
    },
    smoothEnabled: [true, false]
  },

  // saddle cases
  {
    gridOrigin: [100, 200],
    code: 5,
    meanCode: 1,
    x: 0,
    y: 0,
    vertices: [[105, 220], [110, 230], [110, 210], [115, 220]],
    gridSize: [3, 3],
    smoothVertices: [[105, 220, 0], [111, 230, 0], [111, 210, 0], [115, 220, 0]],
    weights: {
      top: 3,
      current: 9,
      right: 4,
      topRight: 8
    },
    smoothEnabled: [true, false]
  },
  {
    gridOrigin: [100, 200],
    code: 5,
    meanCode: 0,
    x: 0,
    y: 0,
    vertices: [[105, 220], [110, 210], [110, 230], [115, 220]],
    gridSize: [3, 3],
    smoothVertices: [[105, 214, 0], [106.429, 210, 0], [110, 230, 0], [115, 222, 0]],
    weights: {
      top: 10,
      current: 5,
      right: 12,
      topRight: 2
    },
    smoothEnabled: [true, false]
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
const GETSMOOTHOFFSET_TESTS = [
  {
    offsetKeys: ['current', 'top'],
    weights: {
      current: 10,
      right: 30,
      top: 40,
      topRight: 60
    },
    threshold: 35,
    offset: 0.333
  },
  {
    offsetKeys: ['right', 'topRight'],
    weights: {
      current: 10,
      right: 30,
      top: 40,
      topRight: 60
    },
    threshold: 35,
    offset: -0.333
  },
  {
    offsetKeys: ['current', 'right'],
    weights: {
      current: 10,
      right: 90,
      top: 40,
      topRight: 30
    },
    threshold: 50,
    offset: 0
  },
  {
    offsetKeys: ['right', 'topRight'],
    weights: {
      current: 10,
      right: 90,
      top: 40,
      topRight: 30
    },
    threshold: 50,
    offset: 0.167
  },
  {
    offsetKeys: ['top', 'topRight'],
    weights: {
      current: 80,
      right: 90,
      top: 50,
      topRight: 60
    },
    threshold: 50,
    offset: -0.5
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
  const thresholdData = {threshold: 6};
  GETVERTEX_TESTS.forEach(testCase => {
    if (!testCase.smoothEnabled) {
      testCase.smoothEnabled = [false];
    }
    testCase.smoothEnabled.forEach(smooth => {
      const vertices = getVertices({
        gridOrigin: testCase.gridOrigin,
        x: testCase.x || x,
        y: testCase.y || y,
        cellSize: testCase.cellSize || cellSize,
        code: testCase.code,
        meanCode: testCase.meanCode,
        type: testCase.type || CONTOUR_TYPE.ISO_LINES,
        weights: testCase.weights,
        thresholdData: testCase.thresholdData || thresholdData,
        _smooth: smooth
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
        const testCaseVertices = smooth ? testCase.smoothVertices : testCase.vertices;
        expectedVertices = testCaseVertices.map(
          vertex => (vertex.length === 2 ? vertex.concat(0) : vertex)
        );
      }
      t.deepEquals(
        vertices,
        expectedVertices,
        `Vertices: expected: ${expectedVertices}, actual: ${vertices}`
      );
    });
  });
  t.end();
});
/* eslint-enable max-nested-callbacks */

test('MarchingSquares#getSmoothOffset', t => {
  GETSMOOTHOFFSET_TESTS.forEach(testCase => {
    let linearInterpolation = getSmoothOffset(
      testCase.offsetKeys,
      testCase.weights,
      testCase.threshold
    );
    linearInterpolation = parseFloat(linearInterpolation.toFixed(3));
    t.deepEquals(
      linearInterpolation,
      testCase.offset,
      `Linear Interpolation: expected: ${testCase.offset}, actual: ${linearInterpolation}`
    );
  });
  t.end();
});
