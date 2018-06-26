import * as MarchingSquares from './marching-squares';
import assert from 'assert';

// Given all the cell weights, generates contours for each threshold.
export function generateContours({
  thresholds,
  colors,
  cellWeights,
  gridSize,
  gridOrigin,
  cellSize
}) {
  const contourSegments = [];

  thresholds.forEach((threshold, index) => {
    const numCols = gridSize[0];
    for (let cellIndex = 0; cellIndex < gridSize[0] * (gridSize[1] - 1); cellIndex++) {
      if (cellIndex === 0 || (cellIndex + 1) % numCols !== 0) {
        // Get the MarchingSquares code based on neighbor cell weights.
        const code = MarchingSquares.getCode({
          cellWeights,
          thresholdValue: threshold,
          cellIndex,
          gridSize
        });
        // Get the intersection vertices based on MarchingSquares code.
        const vertices = MarchingSquares.getVertices({
          gridOrigin,
          cellIndex,
          cellSize,
          gridSize,
          code
        });
        // We should always get even number of vertices
        assert(vertices.length % 2 === 0);
        for (let i = 0; i < vertices.length; i += 2) {
          contourSegments.push({
            start: vertices[i],
            end: vertices[i + 1],
            threshold
          });
        }
      }
    }
  });
  return contourSegments;
}
