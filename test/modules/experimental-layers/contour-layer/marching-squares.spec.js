import test from 'tape-catch';
import {getCode, getVertices} from '@deck.gl/layers/contour-layer/marching-squares';

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
  }
];

test('MarchingSquares#getCode', t => {
  const threshold = 6;
  const x = 0;
  const y = 0;
  const gridSize = [2, 2];
  GETCODE_TESTS.forEach(testCase => {
    const code = getCode({
      cellWeights: testCase.cellWeights,
      threshold,
      x: testCase.x || x,
      y: testCase.y || y,
      width: testCase.gridSize ? testCase.gridSize[0] : gridSize[0],
      height: testCase.gridSize ? testCase.gridSize[1] : gridSize[1]
    });
    t.equals(code, testCase.code, `Code: expected: ${testCase.code}, actual: ${code}`);
  });
  t.end();
});

test('MarchingSquares#getVertices', t => {
  const x = 0;
  const y = 0;
  const cellSize = [10, 20];
  GETVERTEX_TESTS.forEach(testCase => {
    const vertices = getVertices({
      gridOrigin: testCase.gridOrigin,
      x: testCase.x || x,
      y: testCase.y || y,
      cellSize,
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
