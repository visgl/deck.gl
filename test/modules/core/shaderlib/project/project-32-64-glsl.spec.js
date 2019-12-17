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
import GL from '@luma.gl/constants';

// import {COORDINATE_SYSTEM, Viewport, WebMercatorViewport} from 'deck.gl';
import {COORDINATE_SYSTEM, WebMercatorViewport} from 'deck.gl';
import {project, project32} from '@deck.gl/core';
import {project64} from '@deck.gl/extensions';
// import {Matrix4, config} from 'math.gl';
import {config} from 'math.gl';
import {gl} from '@deck.gl/test-utils';
import {Transform, Buffer, fp64} from '@luma.gl/core';
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
  project_position_to_clipspace: (pos, pos64Low = [0, 0, 0]) => `\
varying vec4 outValue;

void main()
{
  outValue = project_position_to_clipspace(${toGLSLVec(pos)}, ${toGLSLVec(
    pos64Low
  )}, vec3(0, 0, 0));
}
`,
  project_position_to_clipspace_world_position: (pos, pos64Low = [0, 0, 0]) => `\
varying vec4 outValue;

void main()
{
  project_position_to_clipspace(${toGLSLVec(pos)}, ${toGLSLVec(pos64Low)}, vec3(0, 0, 0), outValue);
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
        func: ({project_position_to_clipspace}) => {
          let worldPosition = [];
          project_position_to_clipspace([-122.45, 37.78, 0], [0, 0, 0], [0, 0, 0], worldPosition);
          [worldPosition] = project_position_to_clipspace.__out__;
          return worldPosition;
        },
        output: TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position(
          [-122.45, 37.78, 0],
          [fp64LowPart(-122.45), fp64LowPart(37.78), 0]
        )
      },
      {
        name: 'project_position_to_clipspace',
        skipGPUs: ['Intel'],
        func: ({project_position_to_clipspace_vec3_vec3_vec3}) =>
          project_position_to_clipspace_vec3_vec3_vec3([-122.45, 37.78, 0], [0, 0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 0]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [-122.45, 37.78, 0],
          [fp64LowPart(-122.45), fp64LowPart(37.78), 0]
        )
      },
      {
        name: 'project_position_to_clipspace (non-zero Z)',
        skipGPUs: ['Intel'],
        func: ({project_position_to_clipspace_vec3_vec3_vec3}) =>
          project_position_to_clipspace_vec3_vec3_vec3([-122.45, 37.78, 100], [0, 0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 100]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-6, // test fails with 1e-7
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [-122.45, 37.78, 100],
          [fp64LowPart(-122.45), fp64LowPart(37.78), 0]
        )
      }
    ]
  },
  {
    title: 'LNGLAT mode - high zoom',
    params: {
      viewport: TEST_VIEWPORT_HIGH_ZOOM,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    tests: [
      {
        name: 'project_position_to_clipspace_world_position',
        // disableTranspileFor64: true,
        skipGPUs: ['Intel'],

        func: ({project_position_to_clipspace}) => {
          let worldPosition = [];
          project_position_to_clipspace([-122.05, 37.92, 0], [0, 0, 0], [0, 0, 0], worldPosition);
          [worldPosition] = project_position_to_clipspace.__out__;
          return worldPosition;
        },
        output: TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92])
          .map((x, i) => x - TEST_VIEWPORT_HIGH_ZOOM.center[i])
          .concat([0, 1]),
        output64: TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92]).concat([0, 1]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position(
          [-122.05, 37.92, 0],
          [fp64LowPart(-122.05), fp64LowPart(37.92), 0]
        )
      },
      {
        name: 'project_position_to_clipspace',
        skipGPUs: ['Intel'],

        func: ({project_position_to_clipspace_vec3_vec3_vec3}) =>
          project_position_to_clipspace_vec3_vec3_vec3([-122.05, 37.92, 0], [0, 0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT_HIGH_ZOOM, coords),
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 0]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [-122.05, 37.92, 0],
          [fp64LowPart(-122.05), fp64LowPart(37.92), 0]
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
        func: ({project_position_to_clipspace}) => {
          let worldPosition = [];
          project_position_to_clipspace([0.05, 0.08, 0], [0, 0, 0], [0, 0, 0], worldPosition);
          [worldPosition] = project_position_to_clipspace.__out__;
          return worldPosition;
        },
        output: getPixelOffset(
          TEST_VIEWPORT.projectPosition([-122, 38, 0]),
          TEST_VIEWPORT.projectPosition([-122.05, 37.92, 0])
        ),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position(
          [0.05, 0.08, 0],
          [fp64LowPart(0.05), fp64LowPart(0.08), 0]
        )
      },
      {
        name: 'project_position_to_clipspace',

        func: ({project_position_to_clipspace_vec3_vec3_vec3}) =>
          project_position_to_clipspace_vec3_vec3_vec3([0.05, 0.08, 0], [0, 0, 0], [0, 0, 0]),
        mapResult: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122, 38, 0]),
        precision: PIXEL_TOLERANCE,
        gpu64BitPrecision: 1e-7,
        vs: TRANSFORM_VS.project_position_to_clipspace(
          [0.05, 0.08, 0],
          [fp64LowPart(0.05), fp64LowPart(0.08), 0]
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
      if (usefp64 && testCase.params.coordinateSystem !== COORDINATE_SYSTEM.LNGLAT) {
        // Apply 64 bit projection only for LNGLAT_DEPRECATED
        return;
      }

      t.comment(`${testCase.title}: ${usefp64 ? 'fp64' : 'fp32'}`);

      let uniforms = project.getUniforms(testCase.params);
      if (usefp64) {
        uniforms = Object.assign(uniforms, project64.getUniforms(testCase.params, uniforms));
      }
      testCase.tests.forEach(c => {
        const expected = (usefp64 && c.output64) || c.output;
        const skipOnGPU = c.skipGPUs && c.skipGPUs.some(gpu => vendor.indexOf(gpu) >= 0);

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
        } else {
          // TODO - resolve dependencies properly
          // luma's assembleShaders require WebGL context to work
          const module = usefp64 ? project64 : project32;
          const dependencies = appendDependencies(module, []).concat(module);
          const vsSource = dependencies.map(dep => dep.vs).join('');

          const projectVS = compileVertexShader(vsSource);

          // This is a work around for the transpiled shader code not able to handle type conversion
          // It expects project_uViewProjectionMatrixFP64 to be vec2[16], not float[32]
          const projectMatrix64 = uniforms.project_uViewProjectionMatrixFP64;
          if (projectMatrix64 && projectMatrix64 instanceof Float32Array) {
            const normalizedProjectMatrix64 = Array.from({length: 16}, (d, i) => {
              return [projectMatrix64[i * 2], projectMatrix64[i * 2 + 1]];
            });
            uniforms.project_uViewProjectionMatrixFP64 = normalizedProjectMatrix64;
          }

          const projectFunc = projectVS(uniforms);
          config.EPSILON = c.precision || 1e-7;
          let actual = c.func(projectFunc);
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

function appendDependencies(module, result) {
  const dependencies = module.dependencies;
  if (dependencies && dependencies.length > 0) {
    for (const dep of dependencies) {
      result = appendDependencies(dep, result);
    }
    result = result.concat(dependencies);
  }
  return result;
}
