// All utility mehtods needed to implement Marching Squres algorithm
// Ref: https://en.wikipedia.org/wiki/Marching_squares
import assert from 'assert';

// Table to map code to the intersection offsets
// All offsets are relative to the center of marching cell (which is top right corner of grid-cell)
const OFFSET = {
  N: [0, 0.5],
  E: [0.5, 0],
  S: [0, -0.5],
  W: [-0.5, 0]
};

// Note: above wiki page invertes white/black dots for generating the code, we don't
const CODE_OFFSET_MAP = {
  0: [],
  1: [[OFFSET.W, OFFSET.S]],
  2: [[OFFSET.S, OFFSET.E]],
  3: [[OFFSET.W, OFFSET.E]],
  4: [[OFFSET.N, OFFSET.E]],
  5: [[OFFSET.W, OFFSET.N], [OFFSET.S, OFFSET.E]],
  6: [[OFFSET.N, OFFSET.S]],
  7: [[OFFSET.W, OFFSET.N]],
  8: [[OFFSET.W, OFFSET.N]],
  9: [[OFFSET.N, OFFSET.S]],
  10: [[OFFSET.W, OFFSET.S], [OFFSET.N, OFFSET.E]],
  11: [[OFFSET.N, OFFSET.E]],
  12: [[OFFSET.W, OFFSET.E]],
  13: [[OFFSET.S, OFFSET.E]],
  14: [[OFFSET.W, OFFSET.S]],
  15: []
};

// Returns marching square code for given cell
/* eslint-disable complexity */
export function getCode(params) {
  // Assumptions
  // Origin is on bottom-left , and X increase to right, Y to top
  // When processing one cell, we process 4 cells, by extending row to top and on column to right
  // to create a 2X2 cell grid

  const {cellWeights, thresholdValue, x, y, width, height} = params;

  assert(x >= -1 && x < width);
  assert(y >= -1 && y < height);

  const leftBoundary = x < 0;
  const rightBoundary = x >= width - 1;
  const bottomBoundary = y < 0;
  const topBoundary = y >= height - 1;

  const top =
    leftBoundary || topBoundary
      ? 0
      : cellWeights[(y + 1) * width + x] - thresholdValue >= 0
        ? 1
        : 0;
  const topRight =
    rightBoundary || topBoundary
      ? 0
      : cellWeights[(y + 1) * width + x + 1] - thresholdValue >= 0
        ? 1
        : 0;
  const right = rightBoundary ? 0 : cellWeights[y * width + x + 1] - thresholdValue >= 0 ? 1 : 0;
  const current =
    leftBoundary || bottomBoundary ? 0 : cellWeights[y * width + x] - thresholdValue >= 0 ? 1 : 0;

  const code = (top << 3) | (topRight << 2) | (right << 1) | current;

  assert(code >= 0 && code < 16);

  return code;
}
/* eslint-enable complexity */

// Returns intersection vertices for given cellindex
export function getVertices(params) {
  const {gridOrigin, cellSize, x, y, code} = params;

  const offsets = CODE_OFFSET_MAP[code];
  // Reference vertex is top-right its co-ordinates are stored at index 0(X) and 1(Y)
  // Move to top-right corner
  const rX = (x + 1) * cellSize[0];
  const rY = (y + 1) * cellSize[1];

  const refVertexX = gridOrigin[0] + rX;
  const refVertexY = gridOrigin[1] + rY;

  const vertices = [];
  offsets.forEach(xyOffsets => {
    xyOffsets.forEach(offset => {
      const vX = refVertexX + offset[0] * cellSize[0];
      const vY = refVertexY + offset[1] * cellSize[1];
      vertices.push([vX, vY]);
    });
  });

  return vertices;
}
