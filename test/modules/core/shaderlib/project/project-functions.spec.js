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

import test from 'tape-catch';

import {COORDINATE_SYSTEM, WebMercatorViewport} from 'deck.gl';
import {projectPosition} from '@deck.gl/core/shaderlib/project/project-functions';
import {equals, config} from 'math.gl';

const TEST_VIEWPORT = new WebMercatorViewport({
  longitude: -122.45,
  latitude: 37.78,
  zoom: 14
});
const TEST_COORDINATE_ORIGIN = [-122.45, 37.78, 0];
const TEST_DISTANCE_SCALES = TEST_VIEWPORT.getDistanceScales(TEST_COORDINATE_ORIGIN);

const TEST_CASES = [
  {
    title: 'LNGLAT',
    position: [-122.45, 37.78, 1000],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    result: [1341012.1955555552, 3242222.268726864, 265.13951782419525]
  },
  {
    title: 'LNGLAT_OFFSETS',
    position: [0.01, 0.01, 0],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
      coordinateOrigin: TEST_COORDINATE_ORIGIN
    },
    result: projectOffset(
      [0.01, 0.01, 0],
      TEST_DISTANCE_SCALES.pixelsPerDegree,
      TEST_DISTANCE_SCALES.pixelsPerDegree2
    )
  },
  {
    // TODO: replace with non-trivial test case
    // WebMercatorViewport.addMetersToLngLat is not accurate
    title: 'METER_OFFSETS',
    position: [0, 0, 0],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: TEST_COORDINATE_ORIGIN
    },
    result: projectOffset(
      [0, 0, 0],
      TEST_DISTANCE_SCALES.pixelsPerDegree,
      TEST_DISTANCE_SCALES.pixelsPerDegree2
    )
  },
  {
    title: 'LNGLAT to METER_OFFSETS',
    position: [-122.46, 37.8, 1000],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: TEST_COORDINATE_ORIGIN,
      fromCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    result: [-233.01688888831995, -589.7206230699085, 265.13951782419525]
  },
  {
    title: 'LNGLAT to LNGLAT_OFFSETS',
    position: [-122.46, 37.8, 1000],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
      coordinateOrigin: TEST_COORDINATE_ORIGIN,
      fromCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    result: [-233.01688888831995, -589.7206230699085, 265.13951782419525]
  }
];

/*
vec4 project_offset_(vec4 offset) {
  vec3 pixelsPerUnit = project_uPixelsPerUnit + project_uPixelsPerUnit2 * offset.y;
  return vec4(offset.xyz * pixelsPerUnit, offset.w);
}
*/
function projectOffset(offset, pixelsPerUnit, pixelsPerUnit2) {
  return [
    offset[0] * (pixelsPerUnit[0] + pixelsPerUnit2[0] * offset[1]),
    offset[1] * (pixelsPerUnit[1] + pixelsPerUnit2[1] * offset[1]),
    offset[2] * (pixelsPerUnit[2] + pixelsPerUnit2[2] * offset[1])
  ];
}

test('project#projectPosition', t => {
  config.EPSILON = 1e-7;

  TEST_CASES.forEach(testCase => {
    const result = projectPosition(testCase.position, testCase.params);
    t.comment(result);
    t.comment(testCase.result);
    t.ok(equals(result, testCase.result), testCase.title);
  });

  t.end();
});
