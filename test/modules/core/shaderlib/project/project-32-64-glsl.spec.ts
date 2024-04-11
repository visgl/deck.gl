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

// import {COORDINATE_SYSTEM, Viewport, WebMercatorViewport} from 'deck.gl';
import {COORDINATE_SYSTEM, WebMercatorViewport, project, project32} from '@deck.gl/core';
import {project64} from '@deck.gl/extensions';
// import {Matrix4, config} from '@math.gl/core';
import {config} from '@math.gl/core';
import {fp64} from '@luma.gl/shadertools';
const {fp64LowPart} = fp64;
import {getPixelOffset, runOnGPU, verifyGPUResult} from './project-glsl-test-utils';

const PIXEL_TOLERANCE = 0.001;

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

const TRANSFORM_VS = {
  project_position_to_clipspace: `\
#version 300 es

uniform vec3 uPos;
uniform vec3 uPos64Low;
out vec3 outValue;

void main()
{
  geometry.worldPosition = uPos;
  vec4 glPos = project_position_to_clipspace(uPos, uPos64Low, vec3(0, 0, 0));
  outValue = glPos.xyz / glPos.w;
  outValue = vec3(
    (1.0 + outValue.x) / 2.0 * project.viewportSize.x,
    (1.0 - outValue.y) / 2.0 * project.viewportSize.y,
    outValue.z
  );
}
`,
  project_position_to_clipspace_world_position: `\
#version 300 es

uniform vec3 uPos;
uniform vec3 uPos64Low;
out vec4 outValue;

void main()
{
  geometry.worldPosition = uPos;
  project_position_to_clipspace(uPos, uPos64Low, vec3(0, 0, 0), outValue);
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
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position,
        input: [-122.45, 37.78, 0],
        output: TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1])
      },
      {
        name: 'project_position_to_clipspace',
        vs: TRANSFORM_VS.project_position_to_clipspace,
        input: [-122.45, 37.78, 0],
        output: TEST_VIEWPORT.project([-122.45, 37.78, 0]),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_position_to_clipspace (non-zero Z)',
        vs: TRANSFORM_VS.project_position_to_clipspace,
        input: [-122.45, 37.78, 100],
        output: TEST_VIEWPORT.project([-122.45, 37.78, 100]),
        precision: PIXEL_TOLERANCE
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
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position,
        input: [-122.05, 37.92, 0],
        output: TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92])
          .map((x, i) => x - TEST_VIEWPORT_HIGH_ZOOM.center[i])
          .concat([0, 1]),
        output64: TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92]).concat([0, 1])
      },
      {
        name: 'project_position_to_clipspace',
        vs: TRANSFORM_VS.project_position_to_clipspace,
        input: [-122.05, 37.92, 0],
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 0]),
        precision: PIXEL_TOLERANCE
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
        vs: TRANSFORM_VS.project_position_to_clipspace_world_position,
        input: [0.05, 0.08, 0],
        output: getPixelOffset(
          TEST_VIEWPORT.projectPosition([-122, 38, 0]),
          TEST_VIEWPORT.projectPosition([-122.05, 37.92, 0])
        )
      },
      {
        name: 'project_position_to_clipspace',
        vs: TRANSFORM_VS.project_position_to_clipspace,
        input: [0.05, 0.08, 0],
        output: TEST_VIEWPORT.project([-122, 38, 0]),
        precision: PIXEL_TOLERANCE
      }
    ]
  }
];

test('project32&64#vs', async t => {
  const oldEpsilon = config.EPSILON;

  for (const usefp64 of [false, true]) {
    /* eslint-disable max-nested-callbacks, complexity */
    for (const testCase of TEST_CASES) {
      if (usefp64 && testCase.params.coordinateSystem !== COORDINATE_SYSTEM.LNGLAT) {
        // Apply 64 bit projection only for LNGLAT_DEPRECATED
        return;
      }

      t.comment(`${testCase.title}: ${usefp64 ? 'fp64' : 'fp32'}`);

      let uniforms = project.getUniforms(testCase.params);
      if (usefp64) {
        uniforms = {
          ...uniforms,
          ...project64.getUniforms(testCase.params, uniforms),
          // fp64arithmetic uniform
          ONE: 1.0
        };
      }

      for (const c of testCase.tests) {
        const expected = (usefp64 && c.output64) || c.output;
        const actual = await runOnGPU({
          vs: c.vs,
          modules: usefp64 ? [project64] : [project32],
          varying: 'outValue',
          vertexCount: 1,
          uniforms: {
            ...uniforms,
            uPos: c.input,
            uPos64Low: c.input.map(fp64LowPart)
          }
        });
        config.EPSILON = c.precision ?? 1e-5;

        t.is(
          verifyGPUResult(actual, expected),
          true,
          `${usefp64 ? 'project64' : 'project32'} ${c.name}`
        );
      }
    }
  }
  /* eslint-enable max-nested-callbacks, complexity */

  config.EPSILON = oldEpsilon;
  t.end();
});
