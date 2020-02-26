// s2-geometry is a pure JavaScript port of Google/Niantic's S2 Geometry library
// which is perfect since it works in the browser.
import {
  toHilbertQuadkey,
  FromHilbertQuadKey,
  IJToST,
  STToUV,
  FaceUVToXYZ,
  XYZToLngLat
} from './s2-geometry';
import Long from 'long';

/**
 * Given an S2 token this function convert the token to 64 bit id
   https://github.com/google/s2-geometry-library-java/blob/c04b68bf3197a9c34082327eeb3aec7ab7c85da1/src/com/google/common/geometry/S2CellId.java#L439
 * */
function getIdFromToken(token) {
  // pad token with zeros to make the length 16
  const paddedToken = token.padEnd(16, '0');
  return Long.fromString(paddedToken, 16);
}

const MAX_RESOLUTION = 100;

/* Adapted from s2-geometry's S2Cell.getCornerLatLngs */
function getGeoBounds({face, ij, level}) {
  const offsets = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];

  // The S2 cell edge is curved: http://s2geometry.io/
  // This is more prominent at lower levels
  // resolution is the number of segments to generate per edge.
  // We exponentially reduce resolution as level increases so it doesn't affect perf
  // when there are a large number of cells
  const resolution = Math.max(1, Math.ceil(MAX_RESOLUTION * Math.pow(2, -level)));
  const result = new Float64Array(4 * resolution * 2 + 2);
  let ptIndex = 0;

  for (let i = 0; i < 4; i++) {
    const offset = offsets[i].slice(0);
    const nextOffset = offsets[i + 1];
    const stepI = (nextOffset[0] - offset[0]) / resolution;
    const stepJ = (nextOffset[1] - offset[1]) / resolution;

    for (let j = 0; j < resolution; j++) {
      offset[0] += stepI;
      offset[1] += stepJ;
      // Cell can be represented by coordinates IJ, ST, UV, XYZ
      // http://s2geometry.io/devguide/s2cell_hierarchy#coordinate-systems
      const st = IJToST(ij, level, offset);
      const uv = STToUV(st);
      const xyz = FaceUVToXYZ(face, uv);
      const lngLat = XYZToLngLat(xyz);

      result[ptIndex++] = lngLat[0];
      result[ptIndex++] = lngLat[1];
    }
  }
  // close the loop
  result[ptIndex++] = result[0];
  result[ptIndex++] = result[1];
  return result;
}

export function getS2QuadKey(token) {
  if (typeof token === 'string') {
    if (token.indexOf('/') > 0) {
      // is Hilbert quad key
      return token;
    }
    // is S2 token
    token = getIdFromToken(token);
  }
  // is Long id
  return toHilbertQuadkey(token.toString());
}

/**
 * Get a polygon with corner coordinates for an s2 cell
 * @param {*} cell - This can be an S2 key or token
 * @return {Array} - a simple polygon in array format: [[lng, lat], ...]
 *   - each coordinate is an array [lng, lat]
 *   - the polygon is closed, i.e. last coordinate is a copy of the first coordinate
 */
export function getS2Polygon(token) {
  const key = getS2QuadKey(token);
  const s2cell = FromHilbertQuadKey(key);

  return getGeoBounds(s2cell);
}
