const R_EARTH = 6378000;

/**
 * Calculate density grid from an array of points
 * @param {array} points
 * @param {number} worldUnitSize - unit size in meters
 * @param {function} getPosition - position accessor
 * @returns {object} - grid data, cell dimension and count range
 */
export function pointToDensityGridData(points, worldUnitSize, getPosition) {

  const {gridHash, gridOffset} = _pointsToGridHashing(points, worldUnitSize, getPosition);
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
 * @param {number} worldUnitSize - unit size in meters
 * @param {function} getPosition - position accessor
 * @returns {object} - grid hash and cell dimension
 */
function _pointsToGridHashing(points, worldUnitSize, getPosition) {

  // find the geometric center of sample points
  const allLat = points.map(p => getPosition(p)[1]);
  const latMin = Math.min.apply(null, allLat);
  const latMax = Math.max.apply(null, allLat);

  const centerLat = (latMin + latMax) / 2;

  const gridOffset = _calculateGridLatLonOffset(worldUnitSize, centerLat);

  if (gridOffset.xOffset <= 0 || gridOffset.yOffset <= 0) {
    return {gridHash: {}, gridOffset};
  }
  // calculate count per cell
  const gridHash = points.reduce((accu, pt) => {
    const latIdx = Math.floor((getPosition(pt)[1] + 90) / gridOffset.yOffset);
    const lonIdx = Math.floor((getPosition(pt)[0] + 180) / gridOffset.xOffset);
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
        -180 + gridOffset.xOffset * lonIdx,
        -90 + gridOffset.yOffset * latIdx
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
  const yOffset = _calculateLatOffset(worldUnitSize);
  const xOffset = _calculateLonOffset(latitude, worldUnitSize);
  return {yOffset, xOffset};
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
