const R_EARTH = 6378;

/**
 * Aggregate points for the grid layer
 * @param {array} points
 * @param {number} worldUnitSize - unit size in kilometer
 * @returns {object} - grid data and cell dimension
 */
export function pointsToWorldGrid(points, worldUnitSize) {

  // find the geometric center of sample points
  const allLat = points.map(p => p.COORDINATES[1]);
  const latMin = Math.min.apply(null, allLat);
  const latMax = Math.max.apply(null, allLat);

  const centerLat = (latMin + latMax) / 2;

  const gridDelta = _calculateGridLatLngDelta(worldUnitSize, centerLat);

  // calculate count per cell
  const gridHash = points.reduce((accu, pt) => {
    const latIdx = Math.floor((pt.COORDINATES[1] + 90) / gridDelta.latDelta);
    const lngIdx = Math.floor((pt.COORDINATES[0] + 180) / gridDelta.lngDelta);
    const key = `${latIdx}-${lngIdx}`;

    accu[key] = accu[key] + 1 || 1;
    return accu;
  }, {});

  const maxHeight = Math.max.apply(null, Object.values(gridHash));

  const data = Object.keys(gridHash).reduce((accu, key) => {
    const idxs = key.split('-');
    const latIdx = parseInt(idxs[0], 10);
    const lngIdx = parseInt(idxs[1], 10);

    accu.push({
      position: [
        -180 + gridDelta.lngDelta * lngIdx,
        -90 + gridDelta.latDelta * latIdx
      ],
      value: gridHash[key] / maxHeight
    });

    return accu;
  }, []);

  return Object.assign({data}, gridDelta);
}

/**
 * calculate grid layer cell size in lat lng based on world unit size
 * and current latitude
 * @param {number} worldUnitSize
 * @param {number} latitude
 * @returns {object} - lat delta and lng delta
 */
export function _calculateGridLatLngDelta(worldUnitSize, latitude) {
  const latDelta = calculateLatDelta(worldUnitSize);
  const lngDelta = calculateLngDelta(latitude, worldUnitSize);
  return {latDelta, lngDelta};
}

/**
 * with a given x-km change, calculate the increment of latitude
 * based on stackoverflow http://stackoverflow.com/questions/7477003
 * @param {number} dy - change in km
 * @return {number} - increment in latitude
 */
export function calculateLatDelta(dy) {
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
export function calculateLngDelta(lat, dx) {
  return (dx / R_EARTH) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
}
