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

import {WebMercatorViewport} from 'deck.gl';

// generate points in a grid
function pointGrid(N, bbox) {
  const dLon = bbox[2] - bbox[0];
  const dLat = bbox[3] - bbox[1];
  const aspectRatio = dLon / dLat;
  const sizeX = Math.round(Math.sqrt(N * aspectRatio));
  const sizeY = Math.round(Math.sqrt(N / aspectRatio));

  const stepX = dLon / sizeX;
  const stepY = dLat / sizeY;

  const points = Array(sizeX * sizeY);
  let index = 0;

  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      points[index] = [bbox[0] + stepX * x, bbox[1] + stepY * y];
      index++;
    }
  }

  return points;
}

function lngLatToMeterOffset(points, center) {
  const viewport = new WebMercatorViewport({longitude: center[0], latitude: center[1], zoom: 10});
  return points.map(point =>
    viewport.lngLatDeltaToMeters([point[0] - center[0], point[1] - center[1]])
  );
}

let _points100K = null;
let _points100KMeters = null;

export const coordinateOrigin = [-122.4, 37.7];

export function getPoints100K() {
  _points100K = _points100K || pointGrid(1e5, [-122.9, 36.6, -121.9, 38.9]);
  return _points100K;
}

export function getPoints100KMeters() {
  _points100KMeters = _points100KMeters || lngLatToMeterOffset(getPoints100K(), coordinateOrigin);
  return _points100KMeters;
}
