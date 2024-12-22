export declare function getBoundingBox(
  attributes: any,
  vertexCount: any
): {
  xMin: any;
  xMax: any;
  yMin: any;
  yMax: any;
};
export declare function alignToCell(inValue: any, cellSize: any): number;
/**
 * Based on geometric center of sample points, calculate cellSize in lng/lat (degree) space
 * @param {object} boundingBox - {xMin, yMin, xMax, yMax} contains bounding box of data
 * @param {number} cellSize - grid cell size in meters
 * @param {boolean, optional} converToDegrees - when true offsets are converted from meters to lng/lat (degree) space
 * @returns {xOffset, yOffset} - cellSize size
 */
export declare function getGridOffset(
  boundingBox: any,
  cellSize: any,
  convertToMeters?: boolean
): {
  xOffset: any;
  yOffset: any;
};
export declare function getGridParams(
  boundingBox: any,
  cellSize: any,
  viewport: any,
  coordinateSystem: any
): {
  gridOffset: {
    xOffset: any;
    yOffset: any;
  };
  translation: number[];
  width: any;
  height: any;
  numCol: number;
  numRow: number;
};
// # sourceMappingURL=grid-aggregation-utils.d.ts.map
