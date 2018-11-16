import * as MarchingSquares from './marching-squares';

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
  const width = gridSize[0];
  const height = gridSize[1];

  thresholds.forEach((threshold, index) => {
    for (let x = -1; x < width; x++) {
      for (let y = -1; y < height; y++) {
        // Get the MarchingSquares code based on neighbor cell weights.
        const code = MarchingSquares.getCode({
          cellWeights,
          thresholdValue: threshold,
          x,
          y,
          width,
          height
        });
        // Get the intersection vertices based on MarchingSquares code.
        const vertices = MarchingSquares.getVertices({
          gridOrigin,
          cellSize,
          x,
          y,
          width,
          height,
          code
        });
        // We should always get even number of vertices
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
