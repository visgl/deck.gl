// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {
  COORDINATE_SYSTEM,
  WebMercatorViewport,
  OrthographicViewport,
  project,
  ProjectProps
} from '@deck.gl/core';
import {Matrix4, Vector3, config, equals, NumericArray, NumberArray3} from '@math.gl/core';
import {fp64} from '@luma.gl/shadertools';
const {fp64LowPart} = fp64;

import {
  getPixelOffset,
  runOnGPU,
  TestProps,
  testUniforms,
  verifyGPUResult
} from './project-glsl-test-utils';
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
  project_size: (dimension: 1 | 2 | 3) => `\
#version 300 es

out ${dimension === 1 ? 'float' : `vec${dimension}`} outValue;

void main()
{
  geometry.worldPosition = test.uWorldPos;
  geometry.position = test.uCommonPos;
  outValue = project_size(test.uMeterSize${dimension});
}
`,
  project_position: `\
#version 300 es

out vec4 outValue;

void main()
{
  geometry.worldPosition = test.uPos;
  outValue = project_position(vec4(test.uPos, 1.0), test.uPos64Low);
}
`,
  project_common_position_to_clipspace: `\
#version 300 es

out vec3 outValue;

void main()
{
  geometry.worldPosition = test.uPos;
  vec4 pos = project_position(vec4(test.uPos, 1.0), vec3(0.));
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

export type TestCase = {
  title: string;
  params: ProjectProps;
  tests: {
    name: string;
    vs: string;
    precision?: number;
    input: TestProps;
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
        vs: TRANSFORM_VS.project_size(1),
        input: {
          uWorldPos: [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0],
          uCommonPos: [0, 0, 0, 0],
          uMeterSize1: 1
        },
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter[2]
      },
      {
        name: 'project_size(vec2)',
        vs: TRANSFORM_VS.project_size(2),
        input: {
          uWorldPos: [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0],
          uCommonPos: [0, 0, 0, 0],
          uMeterSize2: [1, 1]
        },
        output: TEST_VIEWPORT.getDistanceScales().unitsPerMeter.slice(0, 2)
      },
      {
        name: 'project_size(vec3)',
        vs: TRANSFORM_VS.project_size(3),
        input: {
          uWorldPos: [TEST_VIEWPORT.longitude, TEST_VIEWPORT.latitude, 0],
          uCommonPos: [0, 0, 0, 0],
          uMeterSize3: [1, 1, 1]
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
      coordinateOrigin: [-122.05, 37.92, 0],
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
      coordinateOrigin: [-122.05, 37.92, 0]
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
        modules: [project, testUniforms],
        vertexCount: 1,
        shaderInputProps: {
          project: testCase.params,
          test: input
        },
        uniforms: {}
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

out vec3 outValue;

void main() {
  mat3 transform = project_get_orientation_matrix(test.uDirUp);
  outValue = transform * test.uInput;
}
  `;
  const runTransform = async (up: NumericArray, v: NumericArray): Promise<Vector3> => {
    const result = await runOnGPU({
      vs,
      varying: 'outValue',
      modules: [project, testUniforms],
      vertexCount: 1,
      shaderInputProps: {
        project: {
          viewport: TEST_VIEWPORT,
          coordinateSystem: COORDINATE_SYSTEM.LNGLAT
        },
        test: {uDirUp: up as NumberArray3, uInput: v as NumberArray3}
      },
      uniforms: {}
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
