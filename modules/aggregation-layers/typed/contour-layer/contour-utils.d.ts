export declare function generateContours({
  thresholdData,
  cellWeights,
  gridSize,
  gridOrigin,
  cellSize
}: {
  thresholdData: any;
  cellWeights: Float32Array;
  gridSize: number[];
  gridOrigin: number[];
  cellSize: number[];
}): {
  contourSegments: {
    start: number[];
    end: number[];
    contour: any;
  }[];
  contourPolygons: {
    vertices: number[][];
    contour: any;
  }[];
};
// # sourceMappingURL=contour-utils.d.ts.map
