const R_EARTH = 6378000;

/**
 * Aggregate points for the grid layer
 * @param {array} points
 * @param {number} cellSize - cell size in meters
 * @returns {object} - grid data and cell dimension
 */
export function pointsToWorldGrid(points, cellSize) {
  // find the geometric center of sample points
  const allLat = points.map(p => p.COORDINATES[1]);
  const latMin = Math.min.apply(null, allLat);
  const latMax = Math.max.apply(null, allLat);

  const centerLat = (latMin + latMax) / 2;

  const gridOffset = _calculateGridLatLonOffset(cellSize, centerLat);

  // calculate count per cell
  const gridHash = points.reduce((accu, pt) => {
    const latIdx = Math.floor((pt.COORDINATES[1] + 90) / gridOffset.latOffset);
    const lonIdx = Math.floor((pt.COORDINATES[0] + 180) / gridOffset.lonOffset);
    const key = `${latIdx}-${lonIdx}`;

    accu[key] = accu[key] + 1 || 1;
    return accu;
  }, {});

  const maxHeight = Math.max.apply(null, Object.keys(gridHash).map(k => gridHash[k]));

  const data = Object.keys(gridHash).reduce((accu, key) => {
    const idxs = key.split('-');
    const latIdx = parseInt(idxs[0], 10);
    const lonIdx = parseInt(idxs[1], 10);

    accu.push({
      position: [-180 + gridOffset.lonOffset * lonIdx, -90 + gridOffset.latOffset * latIdx],
      value: gridHash[key] / maxHeight
    });

    return accu;
  }, []);

  return Object.assign({data}, {cellSize});
}

/**
 * calculate grid layer cell size in lat lon based on world unit size
 * and current latitude
 * @param {number} cellSize
 * @param {number} latitude
 * @returns {object} - lat delta and lon delta
 */
export function _calculateGridLatLonOffset(cellSize, latitude) {
  const latOffset = calculateLatOffset(cellSize);
  const lonOffset = calculateLonOffset(latitude, cellSize);
  return {latOffset, lonOffset};
}

/**
 * with a given x-km change, calculate the increment of latitude
 * based on stackoverflow http://stackoverflow.com/questions/7477003
 * @param {number} dy - change in km
 * @return {number} - increment in latitude
 */
export function calculateLatOffset(dy) {
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
export function calculateLonOffset(lat, dx) {
  return ((dx / R_EARTH) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
}
