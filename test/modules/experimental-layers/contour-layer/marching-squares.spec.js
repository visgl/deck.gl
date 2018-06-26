import test from 'tape-catch';
import MarchingSquares from '@deck.gl/experimental-layers/contour-layer/marching-squares';

const GETCODE_TESTS = [
  {
    cellWeights: [5, 5, 5, 10],
    code: 4
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
    cellIndex: 4,
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
    cellIndex: 3,
    code: 9
  }
];

const GETVERTEX_TESTS = [
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
    cellIndex: 4,
    vertices: [[115, 240], [125, 240]],
    gridSize: [3, 3]
  },
  {
    gridOrigin: [100, 200],
    code: 9,
    cellIndex: 3,
    vertices: [[110, 250], [110, 230]],
    gridSize: [3, 3]
  }
];

test('MarchingSquares#getCode', t => {
  const thresholdValue = 6;
  const cellIndex = 0;
  const gridSize = [2, 2];
  GETCODE_TESTS.forEach(testCase => {
    const code = MarchingSquares.getCode({
      cellWeights: testCase.cellWeights,
      thresholdValue,
      cellIndex: testCase.cellIndex || cellIndex,
      gridSize: testCase.gridSize || gridSize
    });
    t.equals(code, testCase.code, `Code: expected: ${testCase.code}, actual: ${code}`);
  });
  t.end();
});

test('MarchingSquares#getVertices', t => {
  const cellIndex = 0;
  const cellSize = [10, 20];
  const gridSize = [2, 2];
  GETVERTEX_TESTS.forEach(testCase => {
    const vertices = MarchingSquares.getVertices({
      gridOrigin: testCase.gridOrigin,
      cellIndex: testCase.cellIndex || cellIndex,
      cellSize,
      gridSize: testCase.gridSize || gridSize,
      code: testCase.code
    });
    t.deepEquals(
      vertices,
      testCase.vertices,
      `Vertices: expected: ${testCase.vertices}, actual: ${vertices}`
    );
  });
  t.end();
});
