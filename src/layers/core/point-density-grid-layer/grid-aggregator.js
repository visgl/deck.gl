const R_EARTH = 6378;

/**
 * Calculate density grid from an array of points
 * @param {array} points
 * @param {number} worldUnitSize - unit size in kilometer
 * @returns {object} - grid data, cell dimension and count range
 */
export function pointToDensityGridData(points, worldUnitSize) {
  const {gridHash, gridOffset} = _pointsToGridHashing(points, worldUnitSize);
  const layerData = _getGridLayerDataFromGridHash(gridHash, gridOffset);
  const countRange = _getCellCountExtent(layerData);

  return {
    gridOffset,
    layerData,
    countRange
  };
}

/**
 * Project points into each cell, return a hash table of cells
 * @param {array} points
 * @param {number} worldUnitSize - unit size in kilometer
 * @returns {object} - grid hash and cell dimension
 */
function _pointsToGridHashing(points, worldUnitSize) {

  // find the geometric center of sample points
  const allLat = points.map(p => p.COORDINATES[1]);
  const latMin = Math.min.apply(null, allLat);
  const latMax = Math.max.apply(null, allLat);

  const centerLat = (latMin + latMax) / 2;

  const gridOffset = _calculateGridLatLonOffset(worldUnitSize, centerLat);

  // calculate count per cell
  const gridHash = points.reduce((accu, pt) => {
    const latIdx = Math.floor((pt.COORDINATES[1] + 90) / gridOffset.latOffset);
    const lonIdx = Math.floor((pt.COORDINATES[0] + 180) / gridOffset.lonOffset);
    const key = `${latIdx}-${lonIdx}`;

    accu[key] = accu[key] || {count: 0, points: []};
    accu[key].count += 1;
    accu[key].points.push(pt);

    return accu;
  }, {});

  return {gridHash, gridOffset};
}

function _getGridLayerDataFromGridHash(gridHash, gridOffset) {
  return Object.keys(gridHash).reduce((accu, key, i) => {
    const idxs = key.split('-');
    const latIdx = parseInt(idxs[0], 10);
    const lonIdx = parseInt(idxs[1], 10);

    accu.push(Object.assign({
      index: i,
      position: [
        -180 + gridOffset.lonOffset * lonIdx,
        -90 + gridOffset.latOffset * latIdx
      ]
    }, gridHash[key]));

    return accu;
  }, []);
}

function _getCellCountExtent(data) {
  return data.length ? [
    Math.min.apply(null, data.map(d => d.count)),
    Math.max.apply(null, data.map(d => d.count))
  ] : [0, 1];
}

/**
 * calculate grid layer cell size in lat lon based on world unit size
 * and current latitude
 * @param {number} worldUnitSize
 * @param {number} latitude
 * @returns {object} - lat delta and lon delta
 */
function _calculateGridLatLonOffset(worldUnitSize, latitude) {
  const latOffset = _calculateLatOffset(worldUnitSize);
  const lonOffset = _calculateLonOffset(latitude, worldUnitSize);
  return {latOffset, lonOffset};
}

/**
 * with a given x-km change, calculate the increment of latitude
 * based on stackoverflow http://stackoverflow.com/questions/7477003
 * @param {number} dy - change in km
 * @return {number} - increment in latitude
 */
function _calculateLatOffset(dy) {
  return (dy / R_EARTH) * (180 / Math.PI);
}

/**
 * with a given x-km change, and current latitude
 * calculate the increment of longitude
 * based on stackoverflow http://stackoverflow.com/questions/7477003
 * @param {number} lat - latitude of current location (based on city)
 * @param {number} dx - change in km
 * @return {number} - increment in longitude
 */
function _calculateLonOffset(lat, dx) {
  return (dx / R_EARTH) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
}
