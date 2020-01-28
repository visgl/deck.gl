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
import {project} from '@deck.gl/core/shaderlib';
import {projectPosition} from '@deck.gl/core/shaderlib/project/project-functions';
import {equals, config} from 'math.gl';

import {compileVertexShader} from '../shaderlib-test-utils';

const TEST_VIEWPORT = new WebMercatorViewport({
  longitude: -122.45,
  latitude: 37.78,
  zoom: 14
});
const TEST_VIEWPORT_2 = new WebMercatorViewport({
  longitude: -70.1,
  latitude: 40.7,
  zoom: 8
});
const TEST_COORDINATE_ORIGIN = [-122.45, 37.78, 0];

const TEST_CASES = [
  {
    title: 'LNGLAT',
    position: [-70, 41, 1000],
    params: {
      viewport: TEST_VIEWPORT_2,
      coordinateSystem: COORDINATE_SYSTEM.DEFAULT
    },
    result: [156.44444444444446, 320.0378755678335, 0.01687089818244227]
  },
  {
    title: 'LNGLAT_AUTO_OFFSET',
    position: [-122.46, 37.8, 1000],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.DEFAULT
    },
    result: [-0.014226562499999318, 0.03599588695612965, 0.016187212628251565]
  },
  {
    title: 'LNGLAT_OFFSETS',
    position: [-0.05, 0.06, 50],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
      coordinateOrigin: [-122.5, 38.8]
    },
    result: [-0.07111111111110802, 0.10954078583623073, 0.0008212863345433337]
  },
  {
    title: 'METER_OFFSETS',
    position: [-100, 300, 50],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [-122.5, 38.8]
    },
    result: [-0.0016412509100689476, 0.00492356632304336, 0.0008206254565218747]
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
    result: [-0.014222222222187497, 0.03599369037291922, 0.016187212628251565]
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
    result: [-0.014222222222187497, 0.03599369037291922, 0.016187212628251565]
  }
];

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

test('project#projectPosition vs project_position', t => {
  config.EPSILON = 1e-5;

  const vsSource = project.dependencies.map(dep => dep.vs).join('') + project.vs;
  const projectVS = compileVertexShader(vsSource);

  TEST_CASES.filter(testCase => !testCase.params.fromCoordinateSystem).forEach(testCase => {
    const uniforms = project.getUniforms(testCase.params);
    const module = projectVS(uniforms);

    const cpuResult = projectPosition(testCase.position, testCase.params);
    const shaderResult = module.project_position_vec3(testCase.position);

    t.comment(`Comparing ${cpuResult} to ${shaderResult}`);
    t.ok(equals(cpuResult, shaderResult), testCase.title);
  });

  t.end();
});
