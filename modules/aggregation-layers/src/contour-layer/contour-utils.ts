import {getCode, getVertices, CONTOUR_TYPE} from './marching-squares';

// Given all the cell weights, generates contours for each threshold.
/* eslint-disable max-depth */
export function generateContours({
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
}) {
  const contourSegments: {start: number[]; end: number[]; contour: any}[] = [];
  const contourPolygons: {vertices: number[][]; contour: any}[] = [];
  const width = gridSize[0];
  const height = gridSize[1];
  let segmentIndex = 0;
  let polygonIndex = 0;

  for (const data of thresholdData) {
    const {contour} = data;
    const {threshold} = contour;
    for (let x = -1; x < width; x++) {
      for (let y = -1; y < height; y++) {
        // Get the MarchingSquares code based on neighbor cell weights.
        const {code, meanCode} = getCode({
          cellWeights,
          threshold,
          x,
          y,
          width,
          height
        });
        const opts = {
          type: CONTOUR_TYPE.ISO_BANDS,
          gridOrigin,
          cellSize,
          x,
          y,
          width,
          height,
          code,
          meanCode,
          thresholdData: data
        };
        if (Array.isArray(threshold)) {
          opts.type = CONTOUR_TYPE.ISO_BANDS;
          const polygons = getVertices(opts) as number[][][];
          for (const polygon of polygons) {
            contourPolygons[polygonIndex++] = {
              vertices: polygon,
              contour
            };
          }
        } else {
          // Get the intersection vertices based on MarchingSquares code.
          opts.type = CONTOUR_TYPE.ISO_LINES;
          const vertices = getVertices(opts) as number[][];
          for (let i = 0; i < vertices.length; i += 2) {
            contourSegments[segmentIndex++] = {
              start: vertices[i],
              end: vertices[i + 1],
              contour
            };
          }
        }
      }
    }
  }
  return {contourSegments, contourPolygons};
}
/* eslint-enable max-depth */
