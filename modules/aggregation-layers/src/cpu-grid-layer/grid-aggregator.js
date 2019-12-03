// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {createIterable} from '@deck.gl/core';

const R_EARTH = 6378000;
const POSITION_ATTRIBUTE_SIZE = 3; // TODO: issue #3956

/**
 * Calculate density grid from an array of points
 * @param {Iterable} data
 * @param {number} cellSize - cell size in meters
 * @param {function} getPosition - position accessor
 * @returns {object} - grid data, cell dimension
 */
export function pointToDensityGridDataCPU(opts) {
  const hashInfo = pointsToGridHashing(opts);
  const result = getGridLayerDataFromGridHash(hashInfo);

  return {
    gridHash: hashInfo.gridHash,
    gridOffset: hashInfo.gridOffset,
    data: result
  };
}

/**
 * Based on geometric center of sample points, calculate cellSize in lng/lat (degree) space
 * @param {object} gridData - contains bounding box of data
 * @param {number} cellSize - grid cell size in meters
 * @returns {yOffset, xOffset} - cellSize size lng/lat (degree) space.
 */

export function getGridOffset(boundingBox, cellSize) {
  const {yMin, yMax} = boundingBox;
  const latMin = yMin;
  const latMax = yMax;
  const centerLat = (latMin + latMax) / 2;

  return calculateGridLatLonOffset(cellSize, centerLat);
}

/**
 * Project points into each cell, return a hash table of cells
 * @param {Iterable} points
 * @param {number} cellSize - unit size in meters
 * @param {function} getPosition - position accessor
 * @returns {object} - grid hash and cell dimension
 */
/* eslint-disable max-statements, complexity */
function pointsToGridHashing(opts) {
  const {data = [], cellSize, attributes, viewport, projectPoints} = opts;

  const {iterable, objectInfo} = createIterable(data);
  const positions = attributes.positions.value;
  let boundingBox = opts.boundingBox;
  if (!boundingBox) {
    let latMin = Infinity;
    let latMax = -Infinity;
    let pLat;
    // eslint-disable-next-line no-unused-vars
    for (const pt of iterable) {
      objectInfo.index++;
      pLat = positions[objectInfo.index * POSITION_ATTRIBUTE_SIZE + 1];

      if (Number.isFinite(pLat)) {
        latMin = pLat < latMin ? pLat : latMin;
        latMax = pLat > latMax ? pLat : latMax;
      }
    }
    boundingBox = {yMin: latMin, yMax: latMax};
  }

  const offsets = opts.cellOffset || [180, 90];
  let gridOffset = opts.gridOffset;
  if (!gridOffset) {
    gridOffset = getGridOffset(boundingBox, cellSize);
  }

  if (gridOffset.xOffset <= 0 || gridOffset.yOffset <= 0) {
    return {gridHash: {}, gridOffset};
  }

  // calculate count per cell
  const gridHash = {};

  // Iterating over again, reset index
  objectInfo.index = -1;
  for (const pt of iterable) {
    objectInfo.index++;
    // const [lng, lat] = getPosition(pt, objectInfo);
    let lng = positions[objectInfo.index * POSITION_ATTRIBUTE_SIZE];
    let lat = positions[objectInfo.index * POSITION_ATTRIBUTE_SIZE + 1];

    if (projectPoints) {
      [lng, lat] = viewport.project([lng, lat]);
    }

    // console.log(`lat: ${lat} lng: ${lng}`);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const latIdx = Math.floor((lat + offsets[1]) / gridOffset.yOffset);
      const lonIdx = Math.floor((lng + offsets[0]) / gridOffset.xOffset);
      const key = `${latIdx}-${lonIdx}`;
      // console.log(`${key} ${pt}`);

      gridHash[key] = gridHash[key] || {count: 0, points: [], lonIdx, latIdx};
      gridHash[key].count += 1;
      gridHash[key].points.push(pt);
    }
  }

  return {gridHash, gridOffset, offsets: [offsets[0] * -1, offsets[1] * -1]};
}
/* eslint-enable max-statements, complexity */

function getGridLayerDataFromGridHash({gridHash, gridOffset, offsets}) {
  const data = [];
  let i = 0;
  for (const key in gridHash) {
    const idxs = key.split('-');
    const latIdx = parseInt(idxs[0], 10);
    const lonIdx = parseInt(idxs[1], 10);

    data.push(
      Object.assign(
        {
          index: i++,
          position: [
            offsets[0] + gridOffset.xOffset * lonIdx,
            offsets[1] + gridOffset.yOffset * latIdx
          ]
        },
        gridHash[key]
      )
    );
  }
  return data;
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
