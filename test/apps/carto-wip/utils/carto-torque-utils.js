import assert from 'assert';

// Parses a torque tile into a linear array of points which is easier for deck.gl to deal with
// @param {Array} tile - a torque tile is an array of "pixels"
// @return {Array} - returns an array of points
export function parseTile({tileParams, tileData}) {
  // const tileString = JSON.stringify(tile);
  // console.log(`tileParams ${tileParams}, tileString`);
  // assert(Array.isArray(tile), 'Cannot parse torque tile - expected array of pixels');
  // const n = Math.pow(2.0, tileParams.zoom);

  const corners = tileToLngLatExtents(tileParams);
  const xTileSize = corners.east - corners.west;
  const yTileSize = corners.north - corners.south;

  const rows = Array.isArray(tileData) ? tileData : tileData.rows;
  assert(Array.isArray(rows), 'Cannot parse torque tile - expected array of rows');

  const points = [];
  for (const row of rows) {
    const x = row.x__uint8 | row.x;
    const y = row.y__uint8 | row.y;
    const vals = row.vals__uint8 || row.vals;
    const dates = row.dates__uint16 || row.dates;
    assert(
      Number.isFinite(x) &&
        Number.isFinite(y) &&
        Array.isArray(vals) &&
        Array.isArray(dates) &&
        vals.length === dates.length,
      'Cannot parse torque tile - expected torque row'
    );

    // const scale = Math.pow(2, tileParams.zoom);
    // Generate a linear set of points from the vals and dates arrays
    for (let i = 0; i < vals.length; ++i) {
      points.push({
        // TODO - for some reason divisor had to be changed from 256
        position: [corners.west + (x / 128) * xTileSize, corners.south + (y / 128) * yTileSize],
        value: vals[i],
        time: dates[i]
      });
    }
  }

  return points;
}

export function getTileUrl({userID, layergroupid, zoom, xTileNo, yTileNo}) {
  // return `https://cartocdn-ashbu_b.global.ssl.fastly.net/${userID}/api/v1/map/${layergroupid}
  //  /0/${zoom}/${xTileNo}/${yTileNo}.json.torque`; // eslint-disable-line
  layergroupid = 'cf28c540d3cf15a29a759f84ff440679';
  return `http://1.ashbu.cartocdn.com/${userID}/api/v1/map/${layergroupid}:0/0/${zoom}/${xTileNo}/${yTileNo}.json.torque`; // eslint-disable-line
  // return `http:///viz2/api/v1/map/:0/0/3/3/2.json.torque
}

// Get the southwest corner of the tile
// http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
export function tileToLngLatExtents({xTileNo, yTileNo, zoom}) {
  const n = Math.pow(2.0, zoom);
  const west = (xTileNo / n) * 360 - 180;
  const east = ((xTileNo + 1) / n) * 360 - 180;
  const south = (Math.atan(Math.sinh(Math.PI * (1 - (2 * (yTileNo + 1)) / n))) / Math.PI) * 180;
  const north = (Math.atan(Math.sinh(Math.PI * (1 - (2 * yTileNo) / n))) / Math.PI) * 180;
  // console.log('west, east, south, north: ', west, east, south, north);
  return {west, east, south, north};
}

export function lngLatToTile({longitude, latitude, zoom}) {
  const lat_rad = (latitude / 180) * Math.PI;
  const n = Math.pow(2.0, zoom);
  const xtile = Math.floor(((longitude + 180.0) / 360.0) * n);
  const ytile = Math.floor(
    ((1.0 - Math.log(Math.tan(lat_rad) + 1 / Math.cos(lat_rad)) / Math.PI) / 2.0) * n
  );
  return [xtile, ytile];
}
