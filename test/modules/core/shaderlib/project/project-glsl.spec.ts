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

import {COORDINATE_SYSTEM, WebMercatorViewport, OrthographicViewport, project} from '@deck.gl/core';
import {Matrix4, Vector3, config, equals, NumericArray} from '@math.gl/core';
import {fp64} from '@luma.gl/shadertools';
const {fp64LowPart} = fp64;

import {getPixelOffset, runOnGPU, verifyGPUResult} from './project-glsl-test-utils';
import {UniformValue} from '@luma.gl/shadertools/dist/lib/shader-module/shader-module';
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

const TEST_VIEWPORT_ORTHO = new OrthographicViewport({
  width: 800,
  height: 600,
  target: [50, 50, 0],
  zoom: 1
});

const TRANSFORM_VS = {
  project_size: (type: 'float' | 'vec2' | 'vec3') => `\
#version 300 es

uniform vec3 uWorldPos;
uniform vec4 uCommonPos;
uniform ${type} uMeterSize;
out ${type} outValue;

void main()
{
  geometry.worldPosition = uWorldPos;
  geometry.position = uCommonPos;
  outValue = project_size(uMeterSize);
}
`,
  project_position: `\
#version 300 es

uniform vec3 uPos;
uniform vec3 uPos64Low;

out vec4 outValue;

void main()
{
  geometry.worldPosition = uPos;
  outValue = project_position(vec4(uPos, 1.0), uPos64Low);
}
`,
  project_common_position_to_clipspace: `\
#version 300 es

uniform vec3 uPos;
out vec3 outValue;

void main()
{
  geometry.worldPosition = uPos;
  vec4 pos = project_position(vec4(uPos, 1.0), vec3(0.));
  vec4 glPos = project_common_position_to_clipspace(pos);
  outValue = glPos.xyz / glPos.w;
  outValue = vec3(
    (1.0 + outValue.x) / 2.0 * project.viewportSize.x,
    (1.0 - outValue.y) / 2.0 * project.viewportSize.y,
    outValue.z
  );
}
`
};

type TestCase = {
  title: string;
  params: Record<string, any>;
  tests: {
    name: string;
    vs: string;
    precision?: number;
    input: Record<string, UniformValue>;
    output: any;
  }[];
};
const TEST_CASES: TestCase[] = [
  {
    title: 'LNGLAT mode',
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    tests: [
      {
        name: 'project_size(float)',
        vs: TRANSFORM_VS.project_size('float'),
        input: {
          uWorldPos: [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0],
          uCommonPos: [0, 0, 0, 0],
          uMeterSize: 1
        },
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter[2]
      },
      {
        name: 'project_size(vec2)',
        vs: TRANSFORM_VS.project_size('vec2'),
        input: {
          uWorldPos: [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0],
          uCommonPos: [0, 0, 0, 0],
          uMeterSize: [1, 1]
        },
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter.slice(0, 2)
      },
      {
        name: 'project_size(vec3)',
        vs: TRANSFORM_VS.project_size('vec3'),
        input: {
          uWorldPos: [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0],
          uCommonPos: [0, 0, 0, 0],
          uMeterSize: [1, 1, 1]
        },
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter
      },
      {
        name: 'project_position',
        vs: TRANSFORM_VS.project_position,
        input: {
          uPos: [-122.45, 37.78, 0],
          uPos64Low: [fp64LowPart(-122.45), fp64LowPart(37.78), 0]
        },
        output: TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1]),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        vs: TRANSFORM_VS.project_common_position_to_clipspace,
        input: {
          uPos: [-122.45, 37.78, 0]
        },
        output: TEST_VIEWPORT.project([-122.45, 37.78, 0]),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_common_position_to_clipspace (vec4, non-zero z)',
        vs: TRANSFORM_VS.project_common_position_to_clipspace,
        input: {
          uPos: [-122.45, 37.78, 100]
        },
        output: TEST_VIEWPORT.project([-122.45, 37.78, 100]),
        precision: PIXEL_TOLERANCE
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
        vs: TRANSFORM_VS.project_position,
        input: {
          uPos: [-122.05, 37.92, 0],
          uPos64Low: [0, 0, 0]
        },
        // common space position is offset from viewport center
        output: getPixelOffset(
          TEST_VIEWPORT_HIGH_ZOOM.projectPosition([-122.05, 37.92, 0]),
          TEST_VIEWPORT_HIGH_ZOOM.projectPosition([
            TEST_VIEWPORT.longitude,
            TEST_VIEWPORT.latitude,
            0
          ])
        ),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        vs: TRANSFORM_VS.project_common_position_to_clipspace,
        input: {
          uPos: [-122.05, 37.92, 0]
        },
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 0]),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_common_position_to_clipspace (vec4, non-zero z)',
        vs: TRANSFORM_VS.project_common_position_to_clipspace,
        input: {
          uPos: [-122.05, 37.92, 100]
        },
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 100]),
        precision: PIXEL_TOLERANCE
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
        vs: TRANSFORM_VS.project_position,
        input: {
          uPos: [1000, 1000, 0],
          uPos64Low: [0, 0, 0]
        },
        // common space position is offset from coordinateOrigin
        // @turf/destination
        // destination([-122.05, 37.92], 1 * Math.sqrt(2), 45) -> [ -122.0385984916185, 37.92899265369385 ]
        output: getPixelOffset(
          TEST_VIEWPORT.projectPosition([-122.0385984916185, 37.92899265369385, 100]),
          TEST_VIEWPORT.projectPosition([-122.05, 37.92, 0])
        ),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        vs: TRANSFORM_VS.project_common_position_to_clipspace,
        input: {
          uPos: [1000, 1000, 0]
        },
        output: TEST_VIEWPORT.project([-122.0385984916185, 37.92899265369385, 100]),
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
        name: 'project_position',
        vs: TRANSFORM_VS.project_position,
        input: {
          uPos: [0.05, 0.08, 0],
          uPos64Low: [0, 0, 0]
        },
        // common space position is offset from coordinateOrigin
        output: getPixelOffset(
          TEST_VIEWPORT.projectPosition([-122, 38, 0]),
          TEST_VIEWPORT.projectPosition([-122.05, 37.92, 0])
        ),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        vs: TRANSFORM_VS.project_common_position_to_clipspace,
        input: {
          uPos: [0.05, 0.08, 0]
        },
        output: TEST_VIEWPORT.project([-122, 38, 0]),
        precision: PIXEL_TOLERANCE
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
        vs: TRANSFORM_VS.project_position,
        input: {
          uPos: [200, 200, 0],
          uPos64Low: [0, 0, 0]
        },
        // common space position is offset from viewport center
        output: getPixelOffset(
          TEST_VIEWPORT_ORTHO.projectPosition([-200, 200, 10]),
          TEST_VIEWPORT_ORTHO.projectPosition([50, 50, 0])
        ),
        precision: PIXEL_TOLERANCE
      },
      {
        name: 'project_common_position_to_clipspace(vec4)',
        vs: TRANSFORM_VS.project_common_position_to_clipspace,
        input: {
          uPos: [200, 200, 0]
        },
        output: TEST_VIEWPORT_ORTHO.project([-200, 200, 10]),
        precision: PIXEL_TOLERANCE
      }
    ]
  }
];

test('project#vs', async t => {
  const oldEpsilon = config.EPSILON;

  for (const testCase of TEST_CASES) {
    t.comment(testCase.title);

    for (const {name, vs, input, output, precision = 1e-7} of testCase.tests) {
      config.EPSILON = precision;
      let actual: NumericArray = await runOnGPU({
        vs,
        varying: 'outValue',
        modules: [project],
        vertexCount: 1,
        shaderInputProps: {project: testCase.params},
        uniforms: input
      });

      t.is(verifyGPUResult(actual, output), true, name);
    }
  }

  config.EPSILON = oldEpsilon;
  t.end();
});

test('project#vs#project_get_orientation_matrix', async t => {
  const vs = `\
#version 300 es

uniform vec3 uDirUp;
uniform vec3 uInput;
out vec3 outValue;

void main() {
  mat3 transform = project_get_orientation_matrix(uDirUp);
  outValue = transform * uInput;
}
  `;
  const shaderInputProps = {
    project: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    }
  };

  const runTransform = async (up: NumericArray, v: NumericArray): Promise<Vector3> => {
    const result = await runOnGPU({
      vs,
      varying: 'outValue',
      modules: [project],
      vertexCount: 1,
      shaderInputProps,
      uniforms: {uDirUp: up, uInput: v}
    });
    return new Vector3(result.slice(0, 3));
  };

  const testTransforms = [
    new Matrix4(),
    new Matrix4().rotateX(Math.PI),
    new Matrix4().rotateX(Math.PI / 6).rotateZ(-Math.PI / 2)
  ];

  const vectorA = new Vector3([-3, -4, 12]);
  const vectorB = new Vector3([-1, 1, 1]);
  const angleAB = vectorA.clone().normalize().dot(vectorB.clone().normalize());

  for (const matrix of testTransforms) {
    const up = matrix.transformAsVector([0, 0, 1]);

    const transformedUp = await runTransform(up, [0, 0, 1]);
    t.comment(`actual=${transformedUp}`);
    t.comment(`expected=${up}`);
    t.ok(equals(transformedUp, up, 1e-7), 'Transformed up as expected');

    const transformedA = await runTransform(up, vectorA);
    t.ok(equals(transformedA.length, vectorA.length, 1e-7), 'Vector length is preserved');
    const transformedB = await runTransform(up, vectorB);
    t.ok(equals(transformedB.length, vectorB.length, 1e-7), 'Vector length is preserved');

    t.ok(
      equals(transformedA.normalize().dot(transformedB.normalize()), angleAB, 1e-7),
      'Angle between vectors is preserved'
    );
  }

  t.end();
});
