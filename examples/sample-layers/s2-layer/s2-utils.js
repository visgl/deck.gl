// s2-geometry is a pure JavaScript port of Google/Niantic's S2 Geometry library
// which is perfect since it works in the browser.
import {S2} from 's2-geometry';

// import {hexToDec} from 'hex2dec';
function hexToDec(hexString) {
  return String(parseInt(hexString, 16));
}

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
  const padding = 16 - token.length;
  const paddedToken = token + new Array(padding + 1).join('0');
  return hexToDec(paddedToken);
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
  const corners = s2cell.getCornerLatLngs();
  const polygon = corners.map(corner => [corner.lng, corner.lat]);
  // close the polygon: first and last position of the ring should be the same
  polygon.push(polygon[0]);
  return polygon;
}
