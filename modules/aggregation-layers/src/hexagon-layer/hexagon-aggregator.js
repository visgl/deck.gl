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

import {hexbin} from 'd3-hexbin';
import {createIterable, log} from '@deck.gl/core';

/**
 * Use d3-hexbin to performs hexagonal binning from geo points to hexagons
 * @param {Iterable} data - array of points
 * @param {Number} radius - hexagon radius in meter
 * @param {function} getPosition - get points lon lat
 * @param {Object} viewport - current viewport object

 * @return {Object} - hexagons and countRange
 */
export function pointToHexbin(props, aggregationParams) {
  const {data, radius} = props;
  const {viewport, attributes} = aggregationParams;
  // get hexagon radius in mercator world unit
  const centerLngLat = data.length ? getPointsCenter(data, aggregationParams) : null;
  const radiusCommon = getRadiusInCommon(radius, viewport, centerLngLat);

  // add world space coordinates to points
  const screenPoints = [];
  const {iterable, objectInfo} = createIterable(data);
  const positions = attributes.positions.value;
  const {size} = attributes.positions.getAccessor();
  for (const object of iterable) {
    objectInfo.index++;
    const posIndex = objectInfo.index * size;
    const position = [positions[posIndex], positions[posIndex + 1]];
    const arrayIsFinite = Number.isFinite(position[0]) && Number.isFinite(position[1]);
    if (arrayIsFinite) {
      screenPoints.push(
        Object.assign(
          {
            screenCoord: viewport.projectFlat(position)
          },
          object
        )
      );
    } else {
      log.warn('HexagonLayer: invalid position')();
    }
  }

  const newHexbin = hexbin()
    .radius(radiusCommon)
    .x(d => d.screenCoord[0])
    .y(d => d.screenCoord[1]);

  const hexagonBins = newHexbin(screenPoints);

  return {
    hexagons: hexagonBins.map((hex, index) => ({
      position: viewport.unprojectFlat([hex.x, hex.y]),
      points: hex,
      index
    })),
    radiusCommon
  };
}

/**
 * Get the bounding box of all data points
 */
export function getPointsCenter(data, aggregationParams) {
  const {attributes} = aggregationParams;
  const positions = attributes.positions.value;
  const {size} = attributes.positions.getAccessor();

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let i;

  for (i = 0; i < size * data.length; i += size) {
    const x = positions[i];
    const y = positions[i + 1];
    const arrayIsFinite = Number.isFinite(x) && Number.isFinite(y);

    if (arrayIsFinite) {
      minX = Math.min(x, minX);
      maxX = Math.max(x, maxX);
      minY = Math.min(y, minY);
      maxY = Math.max(y, maxY);
    }
  }

  // return center
  return [minX, minY, maxX, maxY].every(Number.isFinite)
    ? [(minX + maxX) / 2, (minY + maxY) / 2]
    : null;
}

/**
 * Get radius in mercator world space coordinates from meter
 * @param {Number} radius - in meter
 * @param {Object} viewport - current viewport object
 * @param {Array<Number>} center - data center

 * @return {Number} radius in mercator world spcae coordinates
 */
export function getRadiusInCommon(radius, viewport, center) {
  const {unitsPerMeter} = viewport.getDistanceScales(center);
  // x, y distance should be the same
  return radius * unitsPerMeter[0];
}
