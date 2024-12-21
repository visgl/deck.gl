/**
 * Calculate density grid from an array of points
 * @param {Object} props - object containing :
 * @param {Iterable} [props.data] - data objects to be aggregated
 * @param {Integer} [props.cellSize] - size of the grid cell
 *
 * @param {Object} aggregationParams - object containing :
 * @param {Object} gridOffset - {xOffset, yOffset} cell size in meters
 * @param {Integer} width - width of the grid
 * @param {Integer} height - height of the grid
 * @param {Boolean} projectPoints - `true` if doing screen space projection, `false` otherwise
 * @param {Array} attributes - attributes array containing position values
 * @param {Viewport} viewport - viewport to be used for projection
 * @param {Array} posOffset - [xOffset, yOffset] offset to be applied to positions to get cell index
 * @param {Object} boundingBox - {xMin, yMin, xMax, yMax} bounding box of input data
 *
 * @returns {object} - grid data, cell dimension
 */
export declare function pointToDensityGridDataCPU(
  props: any,
  aggregationParams: any
): {
  gridHash: {};
  gridOffset: any;
  data: any[];
};
// # sourceMappingURL=grid-aggregator.d.ts.map
