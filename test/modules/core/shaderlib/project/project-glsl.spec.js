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
import {Matrix4, equals, config} from 'math.gl';

import {compileVertexShader} from '../shaderlib-test-utils';

// viewport,
// devicePixelRatio = 1,
// modelMatrix = null,
// coordinateSystem = COORDINATE_SYSTEM.LNGLAT,
// coordinateOrigin = DEFAULT_COORDINATE_ORIGIN,
// wrapLongitude = false,

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

const TEST_CASES = [
  {
    title: 'LNGLAT mode',
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.LNGLAT
    },
    tests: [
      {
        func: 'project_scale',
        args: [1],
        output: TEST_VIEWPORT.getDistanceScales().pixelsPerMeter[2]
      },
      {
        func: 'project_scale_vec2',
        args: [[1, 1]],
        output: TEST_VIEWPORT.getDistanceScales().pixelsPerMeter.slice(0, 2)
      },
      {
        func: 'project_scale_vec3',
        args: [[1, 1, 1]],
        output: TEST_VIEWPORT.getDistanceScales().pixelsPerMeter
      },
      {
        func: 'project_position',
        args: [[-122.45, 37.78, 0, 1], [0, 0]],
        output: TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1])
      },
      {
        func: 'project_to_clipspace',
        args: [TEST_VIEWPORT.projectFlat([-122.45, 37.78]).concat([0, 1])],
        postFunc: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.45, 37.78, 0])
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
        func: 'project_position',
        args: [[-122.05, 37.92, 0, 1], [0, 0]],
        output: getPixelOffset(
          TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92]),
          TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122, 38])
        ),
        precision: 0.01
      },
      {
        func: 'project_to_clipspace',
        args: [
          getPixelOffset(
            TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122.05, 37.92]),
            TEST_VIEWPORT_HIGH_ZOOM.projectFlat([-122, 38])
          )
        ],
        postFunc: coords => clipspaceToScreen(TEST_VIEWPORT_HIGH_ZOOM, coords),
        output: TEST_VIEWPORT_HIGH_ZOOM.project([-122.05, 37.92, 0])
      }
    ]
  },
  {
    title: 'METER_OFFSETS mode',
    params: {
      viewport: TEST_VIEWPORT,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [-122.05, 37.92]
    },
    tests: [
      {
        func: 'project_position',
        args: [[1000, 1000, 0, 1], [0, 0]],
        // @turf/destination
        // destination([-122.05, 37.92], 1 * Math.sqrt(2), 45) -> [ -122.0385984916185, 37.92899265369385 ]
        output: getPixelOffset(
          TEST_VIEWPORT.projectFlat([-122.0385984916185, 37.92899265369385]),
          TEST_VIEWPORT.projectFlat([-122.05, 37.92])
        ),
        precision: 0.01
      },
      {
        func: 'project_to_clipspace',
        args: [
          getPixelOffset(
            TEST_VIEWPORT.projectFlat([-122.0385984916185, 37.92899265369385]),
            TEST_VIEWPORT.projectFlat([-122.05, 37.92])
          )
        ],
        postFunc: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122.0385984916185, 37.92899265369385, 0])
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
        func: 'project_position',
        args: [[0.05, 0.08, 0, 1], [0, 0]],
        output: getPixelOffset(
          TEST_VIEWPORT.projectFlat([-122, 38]),
          TEST_VIEWPORT.projectFlat([-122.05, 37.92])
        ),
        precision: 0.01
      },
      {
        func: 'project_to_clipspace',
        args: [
          getPixelOffset(
            TEST_VIEWPORT.projectFlat([-122, 38]),
            TEST_VIEWPORT.projectFlat([-122.05, 37.92])
          )
        ],
        postFunc: coords => clipspaceToScreen(TEST_VIEWPORT, coords),
        output: TEST_VIEWPORT.project([-122, 38, 0])
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
        func: 'project_position',
        args: [[200, 200, 0, 1], [0, 0]],
        output: [-200, 200, 10, 1]
      },
      {
        func: 'project_to_clipspace',
        args: [[-200, 200, 10, 1]],
        postFunc: coords => clipspaceToScreen(TEST_VIEWPORT_ORTHO, coords),
        output: TEST_VIEWPORT_ORTHO.project([-200, 200, 10])
      }
    ]
  }
];

function getPixelOffset(p1, p2, z = 0) {
  return [p1[0] - p2[0], p1[1] - p2[1], z, 1];
}

function clipspaceToScreen(viewport, coords) {
  return [
    ((coords[0] / coords[3] + 1) / 2) * viewport.width,
    ((1 - coords[1] / coords[3]) / 2) * viewport.height,
    coords[2] / coords[3]
  ];
}

test('project#vs', t => {
  // TODO - resolve dependencies properly
  // luma's assembleShaders require WebGL context to work
  const vsSource = project.dependencies.map(dep => dep.vs).join('') + project.vs;
  const projectVS = compileVertexShader(vsSource);
  const oldEpsilon = config.EPSILON;

  TEST_CASES.forEach(testCase => {
    t.comment(testCase.title);

    const uniforms = project.getUniforms(testCase.params);
    const functions = projectVS(uniforms);

    testCase.tests.forEach(c => {
      let actual = functions[c.func].apply(null, c.args);
      if (c.postFunc) {
        actual = c.postFunc(actual);
      }
      const expected = c.output;
      config.EPSILON = c.precision || 1e-7;

      if (equals(actual, expected)) {
        t.pass(`${c.func} returns correct result`);
      } else {
        t.fail(`${c.func} returns ${actual}, expecting ${expected}`);
      }
    });
  });

  config.EPSILON = oldEpsilon;
  t.end();
});
