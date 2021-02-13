import {log, COORDINATE_SYSTEM} from '@deck.gl/core';
const R_EARTH = 6378000;

function toFinite(n) {
  return Number.isFinite(n) ? n : 0;
}

// Parse input data to build positions, wights and bounding box.
/* eslint-disable max-statements */
export function getBoundingBox(attributes, vertexCount) {
  // TODO - value might not exist (e.g. attribute transition)
  const positions = attributes.positions.value;

  let yMin = Infinity;
  let yMax = -Infinity;
  let xMin = Infinity;
  let xMax = -Infinity;
  let y;
  let x;

  for (let i = 0; i < vertexCount; i++) {
    x = positions[i * 3];
    y = positions[i * 3 + 1];
    yMin = y < yMin ? y : yMin;
    yMax = y > yMax ? y : yMax;
    xMin = x < xMin ? x : xMin;
    xMax = x > xMax ? x : xMax;
  }

  const boundingBox = {
    xMin: toFinite(xMin),
    xMax: toFinite(xMax),
    yMin: toFinite(yMin),
    yMax: toFinite(yMax)
  };

  return boundingBox;
}
/* eslint-enable max-statements */

// Returns XY translation for positions to peform aggregation in +ve sapce
function getTranslation(boundingBox, gridOffset, coordinateSystem, viewport) {
  const {width, height} = viewport;

  // Origin to define grid
  // DEFAULT coordinate system is treated as LNGLAT
  const worldOrigin =
    coordinateSystem === COORDINATE_SYSTEM.CARTESIAN ? [-width / 2, -height / 2] : [-180, -90];

  // Other coordinate systems not supported/verified yet
  log.assert(
    coordinateSystem === COORDINATE_SYSTEM.CARTESIAN ||
      coordinateSystem === COORDINATE_SYSTEM.LNGLAT ||
      coordinateSystem === COORDINATE_SYSTEM.DEFAULT
  );

  const {xMin, yMin} = boundingBox;
  return [
    // Align origin to match grid cell boundaries in CPU and GPU aggregations
    -1 * (alignToCell(xMin - worldOrigin[0], gridOffset.xOffset) + worldOrigin[0]),
    -1 * (alignToCell(yMin - worldOrigin[1], gridOffset.yOffset) + worldOrigin[1])
  ];
}

// Aligns `inValue` to given `cellSize`
export function alignToCell(inValue, cellSize) {
  const sign = inValue < 0 ? -1 : 1;

  let value = sign < 0 ? Math.abs(inValue) + cellSize : Math.abs(inValue);

  value = Math.floor(value / cellSize) * cellSize;

  return value * sign;
}

/**
 * Based on geometric center of sample points, calculate cellSize in lng/lat (degree) space
 * @param {object} boundingBox - {xMin, yMin, xMax, yMax} contains bounding box of data
 * @param {number} cellSize - grid cell size in meters
 * @param {boolean, optional} converToDegrees - when true offsets are converted from meters to lng/lat (degree) space
 * @returns {xOffset, yOffset} - cellSize size
 */

export function getGridOffset(boundingBox, cellSize, convertToMeters = true) {
  if (!convertToMeters) {
    return {xOffset: cellSize, yOffset: cellSize};
  }

  const {yMin, yMax} = boundingBox;
  const centerLat = (yMin + yMax) / 2;

  return calculateGridLatLonOffset(cellSize, centerLat);
}

export function getGridParams(boundingBox, cellSize, viewport, coordinateSystem) {
  const gridOffset = getGridOffset(
    boundingBox,
    cellSize,
    coordinateSystem !== COORDINATE_SYSTEM.CARTESIAN
  );

  const translation = getTranslation(boundingBox, gridOffset, coordinateSystem, viewport);

  const {xMin, yMin, xMax, yMax} = boundingBox;

  const width = xMax - xMin + gridOffset.xOffset;
  const height = yMax - yMin + gridOffset.yOffset;

  const numCol = Math.ceil(width / gridOffset.xOffset);
  const numRow = Math.ceil(height / gridOffset.yOffset);
  return {gridOffset, translation, width, height, numCol, numRow};
}

/**
 * calculate grid layer cell size in lat lon based on world unit size
 * and current latitude
 * @param {number} cellSize
 * @param {number} latitude
 * @returns {object} - lat delta and lon delta
 */
function calculateGridLatLonOffset(cellSize, latitude) {
  const yOffset = calculateLatOffset(cellSize);
  const xOffset = calculateLonOffset(latitude, cellSize);
  return {yOffset, xOffset};
}

/**
 * with a given x-km change, calculate the increment of latitude
 * based on stackoverflow http://stackoverflow.com/questions/7477003
 * @param {number} dy - change in km
 * @return {number} - increment in latitude
 */
function calculateLatOffset(dy) {
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
function calculateLonOffset(lat, dx) {
  return ((dx / R_EARTH) * (180 / Math.PI)) / Math.cos((lat * Math.PI) / 180);
}
