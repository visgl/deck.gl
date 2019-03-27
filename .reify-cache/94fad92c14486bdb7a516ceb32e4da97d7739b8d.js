"use strict";var module1=module;var test;module1.link('tape-catch',{default(v){test=v}},0);var COORDINATE_SYSTEM,WebMercatorViewport;module1.link('deck.gl',{COORDINATE_SYSTEM(v){COORDINATE_SYSTEM=v},WebMercatorViewport(v){WebMercatorViewport=v}},1);var project;module1.link('@deck.gl/core/shaderlib',{project(v){project=v}},2);var projectPosition;module1.link('@deck.gl/core/shaderlib/project/project-functions',{projectPosition(v){projectPosition=v}},3);var equals,config;module1.link('math.gl',{equals(v){equals=v},config(v){config=v}},4);var compileVertexShader;module1.link('../shaderlib-test-utils',{compileVertexShader(v){compileVertexShader=v}},5);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    result: [40049.77777777778, 49142.30385463462, 4.318949934705221]
  },
  {
    title: 'LNGLAT_AUTO_OFFSET',
    position: [-122.46, 37.8, 1000],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    result: [-233.08799999998882, -589.7566118892282, 265.21129170127364]
  },
  {
    title: 'LNGLAT_DEPRECATED',
    position: [-122.465, 37.8, 1000],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED
    },
    result: [1340662.6702222219, 3241632.548103794, 265.13951782419525]
  },
  {
    title: 'LNGLAT_OFFSETS',
    position: [-0.05, 0.06, 50],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
      coordinateOrigin: [-122.5, 38.8]
    },
    result: [-1165.0844444443937, -1794.7162351408042, 13.45595530515798]
  },
  {
    title: 'METER_OFFSETS',
    position: [-100, 300, 50],
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [-122.5, 38.8]
    },
    result: [-26.890254910569638, -80.66771063674241, 13.445127479654396]
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
    result: [-233.01688888831995, -589.7206230699085, 265.21129170127364]
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
    result: [-233.01688888831995, -589.7206230699085, 265.21129170127364]
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
