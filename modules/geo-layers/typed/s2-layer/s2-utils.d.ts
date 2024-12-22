export declare function getS2QuadKey(token: string | number): string;
/**
 * Get a polygon with corner coordinates for an s2 cell
 * @param {*} cell - This can be an S2 key or token
 * @return {Float64Array} - a simple polygon in flat array format: [lng0, lat0, lng1, lat1, ...]
 *   - the polygon is closed, i.e. last coordinate is a copy of the first coordinate
 */
export declare function getS2Polygon(token: string | number): Float64Array;
// # sourceMappingURL=s2-utils.d.ts.map
