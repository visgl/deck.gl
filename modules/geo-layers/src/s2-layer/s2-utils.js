// s2-geometry is a pure JavaScript port of Google/Niantic's S2 Geometry library
// which is perfect since it works in the browser.
import {S2} from 's2-geometry';

/**
 * Given a S2 hex token this function returns cell level
 * cells level is a number between 1 and 30
 *
 * S2 cell id is a 64 bit number
 * S2 token removed all trailing zeros from the 16 bit converted number
 * */
function getLevelFromToken(token) {
  // leaf level token size is 16. Each 2 bit add a level
  const lastHex = token.substr(token.length - 1);
  // a) token = trailing-zero trimmed hex id
  // b) 64 bit hex id - 3 face bit + 60 bits for 30 levels + 1 bit lsb marker
  const level = 2 * (token.length - 1) - ((lastHex & 1) === 0);
  // c) If lsb bit of last hex digit is zero, we have one more level less of
  return level;
}

/**
 * Given an S2 token this function convert the token to 64 bit id
 * */
function getIdFromToken(token) {
  // pad token with zeros to make the length 16
  const paddedToken = token.padEnd(16, '0')
  return String(parseInt(paddedToken, 16));
}

const RADIAN_TO_DEGREE = 180 / Math.PI;

/* Modified from s2-geometry's S2.XYZToLatLng */
function XYZToLngLat([x, y, z]) {
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lng = Math.atan2(y, x);

  return [lng * RADIAN_TO_DEGREE, lat * RADIAN_TO_DEGREE];
}

function getGeoBounds({face, ij, level}) {
  const result = [];
  const offsets = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0]
  ];

  const resolution = Math.max(1, 100 * Math.pow(2, -level));

  for (let i = 0; i < 4; i++) {
    const offset = offsets[i].slice(0);
    const nextOffset = offsets[i + 1];
    const stepI = (nextOffset[0] - offset[0]) / resolution;
    const stepJ = (nextOffset[1] - offset[1]) / resolution;

    for (let j = 0; j < resolution; j++) {
      offset[0] += stepI;
      offset[1] += stepJ;
      const st = S2.IJToST(ij, level, offset);
      const uv = S2.STToUV(st);
      const xyz = S2.FaceUVToXYZ(face, uv);

      result.push(XYZToLngLat(xyz));
    }
  }
  return result;
}

/**
 * Get a polygon with corner coordinates for an s2 cell
 * @param {*} cell - This can be an S2 key or token
 * @return {Array} - a simple polygon in array format: [[lng, lat], ...]
 *   - each coordinate is an array [lng, lat]
 *   - the polygon is closed, i.e. last coordinate is a copy of the first coordinate
 */
export function getS2Polygon(token) {
  const id = getIdFromToken(token);
  const level = getLevelFromToken(token);

  const s2cell = S2.S2Cell.FromLatLng(S2.idToLatLng(id), level);

  return getGeoBounds(s2cell);
}
