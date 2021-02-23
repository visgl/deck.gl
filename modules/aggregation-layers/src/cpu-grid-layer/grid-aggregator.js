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
import {getGridOffset} from '../utils/grid-aggregation-utils';

/**
 * Calculate density grid from an array of points
 * @param {Object} props - object containing :
 * @param {Iterable} [props.data] - data objects to be aggregated
 * @param {Integer} [props.cellSize] - size of the grid cell
 *
 * @param {Object} aggregationParams - object containing :
 * @param {Object} gridOffset - {xOffset, yOffset} cell size in meters
 * @param {Integer} width - width of the grid
 * @param {Integer} height - height of the grid
 * @param {Boolean} projectPoints - `true` if doing screen space projection, `false` otherwise
 * @param {Array} attributes - attributes array containing position values
 * @param {Viewport} viewport - viewport to be used for projection
 * @param {Array} posOffset - [xOffset, yOffset] offset to be applied to positions to get cell index
 * @param {Object} boundingBox - {xMin, yMin, xMax, yMax} bounding box of input data
 *
 * @returns {object} - grid data, cell dimension
 */
export function pointToDensityGridDataCPU(props, aggregationParams) {
  const hashInfo = pointsToGridHashing(props, aggregationParams);
  const result = getGridLayerDataFromGridHash(hashInfo);

  return {
    gridHash: hashInfo.gridHash,
    gridOffset: hashInfo.gridOffset,
    data: result
  };
}

/**
 * Project points into each cell, return a hash table of cells
 * @param {Iterable} points
 * @param {number} cellSize - unit size in meters
 * @param {function} getPosition - position accessor
 * @returns {object} - grid hash and cell dimension
 */
/* eslint-disable max-statements, complexity */
function pointsToGridHashing(props, aggregationParams) {
  const {data = [], cellSize} = props;
  const {attributes, viewport, projectPoints, numInstances} = aggregationParams;
  const positions = attributes.positions.value;
  const {size} = attributes.positions.getAccessor();
  const boundingBox =
    aggregationParams.boundingBox || getPositionBoundingBox(attributes.positions, numInstances);
  const offsets = aggregationParams.posOffset || [180, 90];
  const gridOffset = aggregationParams.gridOffset || getGridOffset(boundingBox, cellSize);

  if (gridOffset.xOffset <= 0 || gridOffset.yOffset <= 0) {
    return {gridHash: {}, gridOffset};
  }

  const {width, height} = viewport;
  const numCol = Math.ceil(width / gridOffset.xOffset);
  const numRow = Math.ceil(height / gridOffset.yOffset);

  // calculate count per cell
  const gridHash = {};

  const {iterable, objectInfo} = createIterable(data);
  const position = new Array(3);
  for (const pt of iterable) {
    objectInfo.index++;
    position[0] = positions[objectInfo.index * size];
    position[1] = positions[objectInfo.index * size + 1];
    position[2] = size >= 3 ? positions[objectInfo.index * size + 2] : 0;
    const [x, y] = projectPoints ? viewport.project(position) : position;
    if (Number.isFinite(x) && Number.isFinite(y)) {
      const yIndex = Math.floor((y + offsets[1]) / gridOffset.yOffset);
      const xIndex = Math.floor((x + offsets[0]) / gridOffset.xOffset);
      if (
        !projectPoints ||
        // when doing screen space agggregation (projectPoints = true), filter points outside of the viewport range.
        (xIndex >= 0 && xIndex < numCol && yIndex >= 0 && yIndex < numRow)
      ) {
        const key = `${yIndex}-${xIndex}`;

        gridHash[key] = gridHash[key] || {count: 0, points: [], lonIdx: xIndex, latIdx: yIndex};
        gridHash[key].count += 1;
        gridHash[key].points.push({
          source: pt,
          index: objectInfo.index
        });
      }
    }
  }

  return {gridHash, gridOffset, offsets: [offsets[0] * -1, offsets[1] * -1]};
}
/* eslint-enable max-statements, complexity */

function getGridLayerDataFromGridHash({gridHash, gridOffset, offsets}) {
  const data = new Array(Object.keys(gridHash).length);
  let i = 0;
  for (const key in gridHash) {
    const idxs = key.split('-');
    const latIdx = parseInt(idxs[0], 10);
    const lonIdx = parseInt(idxs[1], 10);
    const index = i++;

    data[index] = {
      index,
      position: [
        offsets[0] + gridOffset.xOffset * lonIdx,
        offsets[1] + gridOffset.yOffset * latIdx
      ],
      ...gridHash[key]
    };
  }
  return data;
}

// Calculate bounding box of position attribute
function getPositionBoundingBox(positionAttribute, numInstance) {
  // TODO - value might not exist (e.g. attribute transition)
  const positions = positionAttribute.value;
  const {size} = positionAttribute.getAccessor();

  let yMin = Infinity;
  let yMax = -Infinity;
  let xMin = Infinity;
  let xMax = -Infinity;
  let y;
  let x;

  for (let i = 0; i < numInstance; i++) {
    x = positions[i * size];
    y = positions[i * size + 1];
    if (Number.isFinite(x) && Number.isFinite(y)) {
      yMin = y < yMin ? y : yMin;
      yMax = y > yMax ? y : yMax;
      xMin = x < xMin ? x : xMin;
      xMax = x > xMax ? x : xMax;
    }
  }

  return {xMin, xMax, yMin, yMax};
}
