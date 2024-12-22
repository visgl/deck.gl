/**
 * Use d3-hexbin to performs hexagonal binning from geo points to hexagons
 * @param {Iterable} data - array of points
 * @param {Number} radius - hexagon radius in meter
 * @param {function} getPosition - get points lon lat
 * @param {Object} viewport - current viewport object

 * @return {Object} - hexagons and countRange
 */
export declare function pointToHexbin(
  props: any,
  aggregationParams: any
): {
  hexagons: any;
  radiusCommon: number;
};
/**
 * Get the bounding box of all data points
 */
export declare function getPointsCenter(data: any, aggregationParams: any): number[];
/**
 * Get radius in mercator world space coordinates from meter
 * @param {Number} radius - in meter
 * @param {Object} viewport - current viewport object
 * @param {Array<Number>} center - data center

 * @return {Number} radius in mercator world spcae coordinates
 */
export declare function getRadiusInCommon(radius: any, viewport: any, center: any): number;
// # sourceMappingURL=hexagon-aggregator.d.ts.map
