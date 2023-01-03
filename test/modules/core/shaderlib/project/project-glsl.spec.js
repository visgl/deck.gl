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

import test from 'tape-promise/tape';

import {COORDINATE_SYSTEM, WebMercatorViewport, OrthographicView} from 'deck.gl';
import {project} from '@deck.gl/core/shaderlib';
import {Matrix4, Matrix3, Vector3, config, equals} from '@math.gl/core';
import {device} from '@deck.gl/test-utils';
import {Transform, Buffer} from '@luma.gl/webgl-legacy';
import {fp64} from '@luma.gl/shadertools';
const {fp64LowPart} = fp64;

import {compileVertexShader} from '../shaderlib-test-utils';
import {getPixelOffset, clipspaceToScreen, runOnGPU, verifyResult} from './project-glsl-test-utils';
const PIXEL_TOLERANCE = 1e-4;

const TEST_VIEWPORT = new WebMercatorViewport({
  longitude: -122,
  latitude: 38,
  zoom: 10,
  pitch: 20,
  bearing: -35,
  width: 800,
  height: 600
});

const TEST_VIEWPORT_HIGH_ZOOM = new WebMercatorViewport({
  longitude: -122,
  latitude: 38,
  zoom: 16,
  pitch: 60,
  bearing: 75,
  width: 800,
  height: 600
});

const TEST_VIEWPORT_ORTHO = new OrthographicView().makeViewport({
  width: 800,
  height: 600,
  viewState: {
    target: [50, 50, 0],
    zoom: 1
  }
});

const DUMMY_SOURCE_BUFFER = new Buffer(device, 1);
const OUT_BUFFER = new Buffer(device, 16);

// used in printing a float into GLSL code, 1 will be 1.0 to avoid GLSL compile errors
const MAX_FRACTION_DIGITS = 5;
function getScalerType(a) {
  if (Array.isArray(a)) {
    return `vec${a.length}`;
  }
  return 'float';
}
function getScaler(a) {
  if (Array.isArray(a)) {
    return `${getScalerType(a)}(${a.map(x => x.toFixed(MAX_FRACTION_DIGITS)).join(',')})`;
  }
  return a.toFixed(MAX_FRACTION_DIGITS);
}

const TRANSFORM_VS = {
  project_size: (meter, worldPosition, commonPosition = [0, 0, 0, 0]) => `\
varying ${getScalerType(meter)} outValue;

void main()
{
  geometry.worldPosition = ${getScaler(worldPosition)};
  geometry.position = ${getScaler(commonPosition)};
  outValue = project_size(${getScaler(meter)});
}
`,
  project_position: (pos, pos64Low = [0, 0, 0]) => `\
varying vec4 outValue;

void main()
{
  geometry.worldPosition = ${getScaler(pos.slice(0, 3))};
  outValue = project_position(${getScaler(pos)}, ${getScaler(pos64Low)});
}
`,
  project_common_position_to_clipspace_vec4: pos => `\
varying vec4 outValue;

void main()
{
  geometry.worldPosition = ${getScaler(pos.slice(0, 3))};
  vec4 pos = project_position(${getScaler(pos)}, vec3(0.));
  outValue = project_common_position_to_clipspace(pos);
}
`
};
const TEST_CASES = [
  {
    title: 'LNGLAT mode',
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    tests: [
      {
        name: 'project_size(float)',
        func: ({project_size_float}) => project_size_float(1),
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter[2],
        vs: TRANSFORM_VS.project_size(1, [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0])
      },
      {
        name: 'project_size(vec2)',
        func: ({project_size_vec2}) => project_size_vec2([1, 1]),
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter.slice(0, 2),
        vs: TRANSFORM_VS.project_size([1, 1], [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0])
      },
      {
        name: 'project_size(vec3)',
        func: ({project_size_vec3}) => project_size_vec3([1, 1, 1]),
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter,
        vs: TRANSFORM_VS.project_size(
          [1, 1, 1],
          [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0]
        )
      },
      {
        name: 'project_position',
        func: ({project_position}) => project_position([-122.45, 37.78, 0, 1], [0, 0, 0]),
        output: TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1]),
        gpuPrecision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position(
          [-122.45, 37.78, 0, 1],
          [fp64LowPart(-122.45), fp64LowPart(37.78), 0]
        )
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        func: ({project_position, project_common_position_to_clipspace_vec4}) =>
          project_common_position_to_clipspace_vec4(
            project_position([-122.45, 37.78, 0, 1], [0, 0, 0])
          ),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 0]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_common_position_to_clipspace_vec4([-122.45, 37.78, 0, 1])
      },
      {
        name: 'project_common_position_to_clipspace (vec4, non-zero z)',
        func: ({project_position, project_common_position_to_clipspace_vec4}) =>
          project_common_position_to_clipspace_vec4(
            project_position([-122.45, 37.78, 100, 1], [0, 0, 0])
          ),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 100]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_common_position_to_clipspace_vec4([-122.45, 37.78, 100, 1])
      }
    ]
  },
  {
    title: 'LNGLAT mode - auto offset',
    params: {
      viewport: TEST_VIEWPORT_HIGH_ZOOM,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    tests: [
      {
        name: 'project_position',
        func: ({project_position}) => project_position([-122.05, 37.92, 0, 1], [0, 0, 0]),
        // common space position is offset from viewport center
        output: getPixelOffset(
          TEST_VIEWPORT_HIGH_ZOOM.projectPosition([-122.05, 37.92, 0]),
          TEST_VIEWPORT_HIGH_ZOOM.projectPosition([-122, 38, 0])
        ),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position([-122.05, 37.92, 0, 1])
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        func: ({project_position, project_common_position_to_clipspace_vec4}) =>
          project_common_position_to_clipspace_vec4(
            project_position([-122.05, 37.92, 0, 1], [0, 0, 0])
          ),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT_HIGH_ZOOM, coords),
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 0]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_common_position_to_clipspace_vec4([-122.05, 37.92, 0, 1])
      },
      {
        name: 'project_common_position_to_clipspace (vec4, non-zero z)',
        func: ({project_position, project_common_position_to_clipspace_vec4}) =>
          project_common_position_to_clipspace_vec4(
            project_position([-122.05, 37.92, 100, 1], [0, 0, 0])
          ),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT_HIGH_ZOOM, coords),
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 100]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_common_position_to_clipspace_vec4([-122.05, 37.92, 100, 1])
      }
    ]
  },
  {
    title: 'METER_OFFSETS mode',
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [-122.05, 37.92],
      modelMatrix: new Matrix4().translate([0, 0, 100])
    },
    tests: [
      {
        name: 'project_position',
        func: ({project_position}) => project_position([1000, 1000, 0, 1], [0, 0, 0]),
        // common space position is offset from coordinateOrigin
        // @turf/destination
        // destination([-122.05, 37.92], 1 * Math.sqrt(2), 45) -> [ -122.0385984916185, 37.92899265369385 ]
        output: getPixelOffset(
          TEST_VIEWPORT.projectPosition([-122.0385984916185, 37.92899265369385, 100]),
          TEST_VIEWPORT.projectPosition([-122.05, 37.92, 0])
        ),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position([1000, 1000, 0, 1])
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        func: ({project_position, project_common_position_to_clipspace_vec4}) =>
          project_common_position_to_clipspace_vec4(
            project_position([1000, 1000, 0, 1], [0, 0, 0])
          ),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.0385984916185, 37.92899265369385, 100]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_common_position_to_clipspace_vec4([1000, 1000, 0, 1])
      }
    ]
  },
  {
    title: 'LNGLAT_OFFSETS mode',
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
      coordinateOrigin: [-122.05, 37.92]
    },
    tests: [
      {
        name: 'project_position',
        func: ({project_position}) => project_position([0.05, 0.08, 0, 1], [0, 0, 0]),
        // common space position is offset from coordinateOrigin
        output: getPixelOffset(
          TEST_VIEWPORT.projectPosition([-122, 38, 0]),
          TEST_VIEWPORT.projectPosition([-122.05, 37.92, 0])
        ),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position([0.05, 0.08, 0, 1])
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        func: ({project_position, project_common_position_to_clipspace_vec4}) =>
          project_common_position_to_clipspace_vec4(
            project_position([0.05, 0.08, 0, 1], [0, 0, 0])
          ),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122, 38, 0]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_common_position_to_clipspace_vec4([0.05, 0.08, 0, 1])
      }
    ]
  },
  {
    title: 'IDENTITY mode with modelMatrix',
    params: {
      viewport: TEST_VIEWPORT_ORTHO,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      modelMatrix: new Matrix4().rotateZ(Math.PI / 2).translate([0, 0, 10])
    },
    tests: [
      {
        name: 'project_position',
        func: ({project_position}) => project_position([200, 200, 0, 1], [0, 0, 0]),
        // common space position is offset from viewport center
        output: getPixelOffset(
          TEST_VIEWPORT_ORTHO.projectPosition([-200, 200, 10]),
          TEST_VIEWPORT_ORTHO.projectPosition([50, 50, 0])
        ),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position([200, 200, 0, 1])
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        func: ({project_position, project_common_position_to_clipspace_vec4}) =>
          project_common_position_to_clipspace_vec4(project_position([200, 200, 0, 1], [0, 0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT_ORTHO.project([-200, 200, 10]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_common_position_to_clipspace_vec4([200, 200, 0, 1])
      }
    ]
  }
];

// TODO - luma.gl v9 likely GPU identification error?
test.skip('project#vs', t => {
  // TODO - resolve dependencies properly
  // luma's assembleShaders require WebGL context to work
  const vsSource = `${
    project.dependencies.map(dep => dep.vs).join('')
    // for setting test context
  }void set_geometry(vec4 position) {geometry.position = position;}\n${project.vs}`;
  const projectVS = compileVertexShader(vsSource);
  const oldEpsilon = config.EPSILON;

  TEST_CASES.forEach(testCase => {
    t.comment(testCase.title);

    const {viewport} = testCase.params;
    const uniforms = project.getUniforms(testCase.params);
    const module = projectVS(uniforms);
    module.set_geometry(viewport.center.concat(1));

    testCase.tests.forEach(c => {
      const expected = c.output;
      if (Transform.isSupported(device)) {
        config.EPSILON = c.gpuPrecision || c.precision || 1e-7;
        const sourceBuffers = {dummy: DUMMY_SOURCE_BUFFER};
        const feedbackBuffers = {outValue: OUT_BUFFER};
        let actual = runOnGPU({device, uniforms, vs: c.vs, sourceBuffers, feedbackBuffers});
        actual = c.mapResult ? c.mapResult(actual) : actual;
        const name = `GPU: ${c.name}`;
        verifyResult({t, name, actual, expected, sliceActual: true});
      } else {
        config.EPSILON = c.precision || 1e-7;
        let actual = c.func(module);
        actual = c.mapResult ? c.mapResult(actual) : actual;
        const name = `CPU: ${c.name}`;
        verifyResult({t, name, actual, expected});
      }
    });
  });

  config.EPSILON = oldEpsilon;
  t.end();
});

test('project#vs#project_get_orientation_matrix', t => {
  const vsSource = project.dependencies.map(dep => dep.vs).join('') + project.vs;
  const projectVS = compileVertexShader(vsSource);
  const getOrientationMatrix = projectVS({}).project_get_orientation_matrix;

  const testCases = [
    [0, 0, 1],
    [0, 0, -1],
    [3, 0, 0],
    [0, 4, 0],
    [3, 4, 12]
  ];

  const vectorA = new Vector3([-3, -4, 12]);
  const vectorB = new Vector3([-1, 1, 1]);
  const angleAB = vectorA.clone().normalize().dot(vectorB.clone().normalize());

  for (const testVector of testCases) {
    const matrix = new Matrix3(getOrientationMatrix(testVector));

    const result = matrix.transform([0, 0, 1]);
    const expected = new Vector3(testVector).normalize();
    t.comment(`result=${result.join(',')}`);
    t.comment(`expected=${expected.join(',')}`);
    t.ok(equals(result, expected), 'Transformed unit vector as expected');

    const result2 = new Vector3(matrix.transform(vectorA));
    t.is(result2.len(), 13, 'Vector length is preserved');

    const result3 = new Vector3(matrix.transform(vectorB));
    t.is(result3.len(), Math.sqrt(3), 'Vector length is preserved');

    t.is(
      result2.normalize().dot(result3.normalize()),
      angleAB,
      'Angle between vectors is preserved'
    );
  }

  t.end();
});
