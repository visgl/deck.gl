// All utility mehtods needed to implement Marching Squres algorithm
// Ref: https://en.wikipedia.org/wiki/Marching_squares

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
export function getCode({cellWeights, thresholdValue, x, y, width, height}) {
  // Assumptions
  // Origin is on bottom-left , and X increase to right, Y to top
  // When processing one cell, we process 4 cells, by extending row to top and on column to right
  // to create a 2X2 cell grid

  const isLeftBoundary = x < 0;
  const isRightBoundary = x >= width - 1;
  const isBottomBoundary = y < 0;
  const isTopBoundary = y >= height - 1;

  const top =
    isLeftBoundary || isTopBoundary
      ? 0
      : cellWeights[(y + 1) * width + x] - thresholdValue >= 0
        ? 1
        : 0;
  const topRight =
    isRightBoundary || isTopBoundary
      ? 0
      : cellWeights[(y + 1) * width + x + 1] - thresholdValue >= 0
        ? 1
        : 0;
  const right = isRightBoundary ? 0 : cellWeights[y * width + x + 1] - thresholdValue >= 0 ? 1 : 0;
  const current =
    isLeftBoundary || isBottomBoundary
      ? 0
      : cellWeights[y * width + x] - thresholdValue >= 0
        ? 1
        : 0;

  const code = (top << 3) | (topRight << 2) | (right << 1) | current;

  return code;
}
/* eslint-enable complexity */

// Returns intersection vertices for given cellindex
// [x, y] refers current marchng cell, reference vertex is always top-right corner
export function getVertices({gridOrigin, cellSize, x, y, code}) {
  const offsets = CODE_OFFSET_MAP[code];

  // Reference vertex is at top-right move to top-right corner

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
