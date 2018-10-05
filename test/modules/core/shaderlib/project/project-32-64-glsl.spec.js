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
import assert from 'assert';
import GL from 'luma.gl/constants';

// import {COORDINATE_SYSTEM, Viewport, WebMercatorViewport} from 'deck.gl';
import {COORDINATE_SYSTEM, WebMercatorViewport} from 'deck.gl';
import project32 from '../../../../../modules/core/src/shaderlib/project32/project32';
import {project, project64} from '@deck.gl/core/shaderlib';
// import {Matrix4, config} from 'math.gl';
import {config} from 'math.gl';
import {gl} from '@deck.gl/test-utils';
import {Transform, Buffer, fp64} from 'luma.gl';
const {fp64LowPart} = fp64;
import {getPixelOffset, clipspaceToScreen, runOnGPU, verifyResult} from './project-glsl-test-utils';
// import {clipspaceToScreen, runOnGPU, verifyResult} from './project-glsl-test-utils';

import {compileVertexShader} from '../shaderlib-test-utils';

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

const DUMMY_SOURCE_BUFFER = new Buffer(gl, 1);
const OUT_BUFFER = new Buffer(gl, 16);

// used in printing a float into GLSL code, 1 will be 1.0 to avoid GLSL compile errors
const MAX_FRACTION_DIGITS = 20;
// convert given array to a GLSL vec2/3/4 string
function toGLSLVec(array) {
  assert(Array.isArray(array) && array.length > 1 && array.length < 5);
  let vecString = `vec${array.length}(`;
  array.forEach(value => {
    vecString += `${value.toFixed(MAX_FRACTION_DIGITS)}, `;
  });
  // remove last , and space
  vecString = `${vecString.slice(0, -2)})`;
  return vecString;
}

function getVendor() {
  const vendorMasked = gl.getParameter(GL.VENDOR);
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const vendorUnmasked = ext && gl.getParameter(ext.UNMASKED_VENDOR_WEBGL || GL.VENDOR);
  return vendorUnmasked || vendorMasked;
}

const TRANSFORM_VS = {
  project_position_to_clipspace: (pos, xy64LowPos = [0, 0]) => `\
varying vec4 outValue;

void main()
{
  outValue = project_position_to_clipspace(${toGLSLVec(pos)}, ${toGLSLVec(
    xy64LowPos
  )}, vec3(0, 0, 0));
}
`,
  project_position_to_clipspace_world_position: (pos, xy64LowPos = [0, 0]) => `\
varying vec4 outValue;

void main()
{
  project_position_to_clipspace(${toGLSLVec(pos)}, ${toGLSLVec(
    xy64LowPos
  )}, vec3(0, 0, 0), outValue);
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
        name: 'project_position_to_clipspace_world_position',
        // NOTE: disbaling transpilation due to https://github.com/stackgl/glsl-transpiler/issues/38
        disableTranspile: true,
        func: ({project_position_to_clipspace}) => {
          const worldPosition = [];
          project_position_to_clipspace([-122.45, 37.78, 0], [0, 0], [0, 0, 0], worldPosition);
          return worldPosition;
        },
        output: TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position(
          [-122.45, 37.78, 0],
          [fp64LowPart(-122.45), fp64LowPart(37.78)]
        )
      },
      {
        name: 'project_position_to_clipspace',
        // NOTE: disbaling transpilation due to: https://github.com/stackgl/glsl-transpiler/issues/38
        // FP64 modules uses `out` variables in many methods for
        disableTranspileFor64: true,
        skipGPUs: ['Intel'],
        func: ({project_position_to_clipspace_vec3_vec2_vec3}) =>
          project_position_to_clipspace_vec3_vec2_vec3([-122.45, 37.78, 0], [0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 0]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [-122.45, 37.78, 0],
          [fp64LowPart(-122.45), fp64LowPart(37.78)]
        )
      },
      {
        name: 'project_position_to_clipspace (non-zero Z)',
        // NOTE: disbaling transpilation due to: https://github.com/stackgl/glsl-transpiler/issues/38
        // FP64 modules uses `out` variables in many methods for
        disableTranspileFor64: true,
        skipGPUs: ['Intel'],
        func: ({project_position_to_clipspace_vec3_vec2_vec3}) =>
          project_position_to_clipspace_vec3_vec2_vec3([-122.45, 37.78, 100], [0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 100]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-6, // test fails with 1e-7
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [-122.45, 37.78, 100],
          [fp64LowPart(-122.45), fp64LowPart(37.78)]
        )
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
        name: 'project_position_to_clipspace_world_position',
        // NOTE: disbaling transpilation due to https://github.com/stackgl/glsl-transpiler/issues/38
        disableTranspile: true,

        disableProject64: true, // NOTE: works with project32 but not with project64, is it expected?
        func: ({project_position_to_clipspace}) => {
          const worldPosition = [];
          project_position_to_clipspace([-122.05, 37.92, 0], [0, 0], [0, 0, 0], worldPosition);
          return worldPosition;
        },
        output: getPixelOffset(
          TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92]),
          TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122, 38])
        ),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position(
          [-122.05, 37.92, 0],
          [fp64LowPart(-122.05), fp64LowPart(37.92)]
        )
      },
      {
        name: 'project_position_to_clipspace',
        // NOTE: disbaling transpilation due to: https://github.com/stackgl/glsl-transpiler/issues/38
        // FP64 modules uses `out` variables in many methods for
        disableTranspileFor64: true,

        disableProject64: true, // NOTE: works with project32 but not with project64, is it expected?
        func: ({project_position_to_clipspace_vec3_vec2_vec3}) =>
          project_position_to_clipspace_vec3_vec2_vec3([-122.05, 37.92, 0], [0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT_HIGH_ZOOM, coords),
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 0]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [-122.05, 37.92, 0],
          [fp64LowPart(-122.05), fp64LowPart(37.92)]
        )
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
        name: 'project_position_to_clipspace_world_position',
        // NOTE: disbaling transpilation due to https://github.com/stackgl/glsl-transpiler/issues/38
        disableTranspile: true,

        disableProject64: true, // NOTE: works with project32 but not with project64, is it expected?
        func: ({project_position_to_clipspace}) => {
          const worldPosition = [];
          project_position_to_clipspace([0.05, 0.08, 0], [0, 0], [0, 0, 0], worldPosition);
          return worldPosition;
        },
        output: getPixelOffset(
          TEST_VIEWPORT.projectFlat([-122, 38]),
          TEST_VIEWPORT.projectFlat([-122.05, 37.92])
        ),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position(
          [0.05, 0.08, 0],
          [fp64LowPart(0.05), fp64LowPart(0.08)]
        )
      },
      {
        name: 'project_position_to_clipspace',
        // NOTE: disbaling transpilation due to: https://github.com/stackgl/glsl-transpiler/issues/38
        // FP64 modules uses `out` variables in many methods for
        disableTranspileFor64: true,

        disableProject64: true, // NOTE: works with project32 but not with project64, is it expected?
        func: ({project_position_to_clipspace_vec3_vec2_vec3}) =>
          project_position_to_clipspace_vec3_vec2_vec3([0.05, 0.08, 0], [0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122, 38, 0]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [0.05, 0.08, 0],
          [fp64LowPart(0.05), fp64LowPart(0.08)]
        )
      }
    ]
  }
];

test('project32&64#vs', t => {
  const oldEpsilon = config.EPSILON;
  const vendor = getVendor(gl);
  [false, true].forEach(usefp64 => {
    /* eslint-disable max-nested-callbacks, complexity */
    TEST_CASES.forEach(testCase => {
      t.comment(testCase.title);

      let uniforms = project.getUniforms(testCase.params);
      if (usefp64) {
        uniforms = Object.assign(uniforms, project64.getUniforms(testCase.params, uniforms));
      }
      testCase.tests.forEach(c => {
        const expected = c.output;
        let skipOnGPU = c.skipGPUs && c.skipGPUs.some(gpu => vendor.indexOf(gpu) >= 0);
        skipOnGPU = skipOnGPU || (usefp64 && c.disableProject64);

        if (Transform.isSupported(gl) && !skipOnGPU) {
          // Reduced precision tolerencewhen using 64 bit project module.
          config.EPSILON = usefp64 ? c.gpu64BitPrecision || 1e-7 : c.precision || 1e-7;
          const sourceBuffers = {dummy: DUMMY_SOURCE_BUFFER};
          const feedbackBuffers = {outValue: OUT_BUFFER};
          let actual = runOnGPU({
            gl,
            uniforms,
            vs: c.vs,
            sourceBuffers,
            feedbackBuffers,
            usefp64
          });
          actual = c.mapResult ? c.mapResult(actual) : actual;
          const name = `GPU: ${usefp64 ? 'project64' : 'project32'} ${c.name}`;
          verifyResult({t, actual, expected, name, sliceActual: true});
        } else if (!c.disableTranspile && (!usefp64 || !c.disableTranspileFor64)) {
          // TODO - resolve dependencies properly
          // luma's assembleShaders require WebGL context to work
          const vsSource =
            []
              .concat(
                usefp64 ? project64.dependencies : project32.dependencies,
                project.dependencies
              )
              .map(dep => dep.vs)
              .join('') + (usefp64 ? project64.vs : project32.vs);

          const projectVS = compileVertexShader(vsSource);

          const module = projectVS(uniforms);
          config.EPSILON = c.precision || 1e-7;
          let actual = c.func(module);
          actual = c.mapResult ? c.mapResult(actual) : actual;
          const name = `CPU: ${usefp64 ? 'project64' : 'project32'} ${c.name}`;
          verifyResult({t, name, actual, expected});
        }
      });
    });
  });
  /* eslint-enable max-nested-callbacks, complexity */

  config.EPSILON = oldEpsilon;
  t.end();
});
