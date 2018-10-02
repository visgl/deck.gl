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

import {COORDINATE_SYSTEM, Viewport, WebMercatorViewport} from 'deck.gl';
import {project} from '@deck.gl/core/shaderlib';
import {Matrix4, config} from 'math.gl';
import {gl} from '@deck.gl/test-utils';
import {Transform, Buffer, fp64} from 'luma.gl';
const {fp64LowPart} = fp64;

import {compileVertexShader} from '../shaderlib-test-utils';
import {getPixelOffset, clipspaceToScreen, runOnGPU, verifyResult} from './project-glsl-test-utils';
const PIXEL_TOLERANCE = 0.01;

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

const TEST_VIEWPORT_ORTHO = new Viewport({
  width: 800,
  height: 600,
  viewMatrix: new Matrix4().lookAt({eye: [0, 0, 1], lookAt: [0, 0, 0], up: [0, 1, 0]}),
  projectionMatrix: new Matrix4().ortho({
    left: -400,
    right: 400,
    bottom: 300,
    top: -300,
    near: 1,
    far: 100
  })
});

const DUMMY_SOURCE_BUFFER = new Buffer(gl, 1);
const OUT_BUFFER = new Buffer(gl, 16);

// used in printing a float into GLSL code, 1 will be 1.0 to avoid GLSL compile errors
const MAX_FRACTION_DIGITS = 5;

const TRANSFORM_VS = {
  project_scale: meter => `\
varying float outValue;

void main()
{
  outValue = project_scale(${meter.toFixed(MAX_FRACTION_DIGITS)});
}
`,
  project_scale_vec2: meter => `\
  varying vec2 outValue;

  void main()
  {
    outValue = project_scale(vec2(${meter[0].toFixed(MAX_FRACTION_DIGITS)}, ${meter[1].toFixed(
    MAX_FRACTION_DIGITS
  )}));
  }
  `,
  project_scale_vec3: meter => `\
  varying vec3 outValue;

  void main()
  {
    outValue = project_scale(vec3(${meter[0].toFixed(MAX_FRACTION_DIGITS)}, ${meter[1].toFixed(
    MAX_FRACTION_DIGITS
  )}, ${meter[2].toFixed(MAX_FRACTION_DIGITS)}));
  }
  `,
  project_position: (pos, xy64LowPos = [0, 0]) => `\
varying vec4 outValue;

void main()
{
  outValue = project_position(vec4(${pos[0].toFixed(MAX_FRACTION_DIGITS)}, ${pos[1].toFixed(
    MAX_FRACTION_DIGITS
  )}, ${pos[2].toFixed(MAX_FRACTION_DIGITS)}, ${pos[3].toFixed(
    MAX_FRACTION_DIGITS
  )}), vec2(${xy64LowPos[0].toFixed(MAX_FRACTION_DIGITS)}, ${xy64LowPos[1].toFixed(
    MAX_FRACTION_DIGITS
  )}));
}
`,
  project_to_clipspace: pos => `\
varying vec4 outValue;

void main()
{
  vec4 pos = project_position(vec4(${pos[0].toFixed(MAX_FRACTION_DIGITS)}, ${pos[1].toFixed(
    MAX_FRACTION_DIGITS
  )}, ${pos[2].toFixed(MAX_FRACTION_DIGITS)}, ${pos[3].toFixed(
    MAX_FRACTION_DIGITS
  )}), vec2(0., 0.));
  outValue = project_to_clipspace(pos);
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
        name: 'project_scale(float)',
        func: ({project_scale}) => project_scale(1),
        output: TEST_VIEWPORT.getDistanceScales().pixelsPerMeter[2],
        vs: TRANSFORM_VS.project_scale(1)
      },
      {
        name: 'project_scale(vec2)',
        func: ({project_scale_vec2}) => project_scale_vec2([1, 1]),
        output: TEST_VIEWPORT.getDistanceScales().pixelsPerMeter.slice(0, 2),
        vs: TRANSFORM_VS.project_scale_vec2([1, 1])
      },
      {
        name: 'project_scale(vec3)',
        func: ({project_scale_vec3}) => project_scale_vec3([1, 1, 1]),
        output: TEST_VIEWPORT.getDistanceScales().pixelsPerMeter,
        vs: TRANSFORM_VS.project_scale_vec3([1, 1, 1])
      },
      {
        name: 'project_position',
        func: ({project_position}) => project_position([-122.45, 37.78, 0, 1], [0, 0]),
        output: TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1]),
        gpuPrecision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position(
          [-122.45, 37.78, 0, 1],
          [fp64LowPart(-122.45), fp64LowPart(37.78)]
        )
      },
      {
        name: 'project_to_clipspace',
        func: ({project_position, project_to_clipspace}) =>
          project_to_clipspace(project_position([-122.45, 37.78, 0, 1], [0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 0]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_to_clipspace([-122.45, 37.78, 0, 1])
      },
      {
        name: 'project_to_clipspace (non-zero z)',
        func: ({project_position, project_to_clipspace}) =>
          project_to_clipspace(project_position([-122.45, 37.78, 100, 1], [0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 100]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_to_clipspace([-122.45, 37.78, 100, 1])
      }
    ]
  },
  {
    title: 'LNGLAT_EXPERIMENTAL mode - auto offset',
    params: {
      viewport: TEST_VIEWPORT_HIGH_ZOOM,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT_EXPERIMENTAL
    },
    tests: [
      {
        name: 'project_position',
        func: ({project_position}) => project_position([-122.05, 37.92, 0, 1], [0, 0]),
        output: getPixelOffset(
          TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92]),
          TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122, 38])
        ),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position([-122.05, 37.92, 0, 1])
      },
      {
        name: 'project_to_clipspace',
        func: ({project_position, project_to_clipspace}) =>
          project_to_clipspace(project_position([-122.05, 37.92, 0, 1], [0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT_HIGH_ZOOM, coords),
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 0]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_to_clipspace([-122.05, 37.92, 0, 1])
      },
      {
        name: 'project_to_clipspace (non-zero z)',
        func: ({project_position, project_to_clipspace}) =>
          project_to_clipspace(project_position([-122.05, 37.92, 100, 1], [0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT_HIGH_ZOOM, coords),
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 100]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_to_clipspace([-122.05, 37.92, 100, 1])
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
        func: ({project_position}) => project_position([1000, 1000, 0, 1], [0, 0]),
        // @turf/destination
        // destination([-122.05, 37.92], 1 * Math.sqrt(2), 45) -> [ -122.0385984916185, 37.92899265369385 ]
        output: getPixelOffset(
          TEST_VIEWPORT.projectFlat([-122.0385984916185, 37.92899265369385]),
          TEST_VIEWPORT.projectFlat([-122.05, 37.92]),
          100 * TEST_VIEWPORT.distanceScales.pixelsPerMeter[2]
        ),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position([1000, 1000, 0, 1])
      },
      {
        name: 'project_to_clipspace',
        func: ({project_position, project_to_clipspace}) =>
          project_to_clipspace(project_position([1000, 1000, 0, 1], [0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.0385984916185, 37.92899265369385, 100]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_to_clipspace([1000, 1000, 0, 1])
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
        func: ({project_position}) => project_position([0.05, 0.08, 0, 1], [0, 0]),
        output: getPixelOffset(
          TEST_VIEWPORT.projectFlat([-122, 38]),
          TEST_VIEWPORT.projectFlat([-122.05, 37.92])
        ),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_position([0.05, 0.08, 0, 1])
      },
      {
        name: 'project_to_clipspace',
        func: ({project_position, project_to_clipspace}) =>
          project_to_clipspace(project_position([0.05, 0.08, 0, 1], [0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122, 38, 0]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_to_clipspace([0.05, 0.08, 0, 1])
      }
    ]
  },
  {
    title: 'IDENTITY mode with modelMatrix',
    params: {
      viewport: TEST_VIEWPORT_ORTHO,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      modelMatrix: new Matrix4().rotateZ(Math.PI / 2).translate([0, 0, 10])
    },
    tests: [
      {
        name: 'project_position',
        func: ({project_position}) => project_position([200, 200, 0, 1], [0, 0]),
        output: [-200, 200, 10, 1],
        vs: TRANSFORM_VS.project_position([200, 200, 0, 1])
      },
      {
        name: 'project_to_clipspace',
        func: ({project_position, project_to_clipspace}) =>
          project_to_clipspace(project_position([200, 200, 0, 1], [0, 0])),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT_ORTHO.project([-200, 200, 10]),
        precision: PIXEL_TOLERANCE,
        vs: TRANSFORM_VS.project_to_clipspace([200, 200, 0, 1])
      }
    ]
  }
];

test('project#vs', t => {
  // TODO - resolve dependencies properly
  // luma's assembleShaders require WebGL context to work
  const vsSource = project.dependencies.map(dep => dep.vs).join('') + project.vs;
  const projectVS = compileVertexShader(vsSource);
  const oldEpsilon = config.EPSILON;

  TEST_CASES.forEach(testCase => {
    t.comment(testCase.title);

    const uniforms = project.getUniforms(testCase.params);
    const module = projectVS(uniforms);

    testCase.tests.forEach(c => {
      const expected = c.output;
      if (Transform.isSupported(gl)) {
        config.EPSILON = c.gpuPrecision || c.precision || 1e-7;
        const sourceBuffers = {dummy: DUMMY_SOURCE_BUFFER};
        const feedbackBuffers = {outValue: OUT_BUFFER};
        let actual = runOnGPU({gl, uniforms, vs: c.vs, sourceBuffers, feedbackBuffers});
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
