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

import {COORDINATE_SYSTEM, WebMercatorViewport, OrbitViewport, project} from '@deck.gl/core';
import {project64} from '@deck.gl/extensions';

const TEST_VIEWPORTS = {
  map: new WebMercatorViewport({
    width: 800,
    height: 600,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11,
    bearing: -30,
    pitch: 40
  }),
  mapHighZoom: new WebMercatorViewport({
    width: 800,
    height: 600,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 13,
    bearing: -30,
    pitch: 40
  }),
  infoVis: new OrbitViewport({
    width: 800,
    height: 600,
    rotationX: -30,
    rotationOrbit: 40,
    target: [10.285714285714, -3.14159265359, 0],
    zoom: 8
  })
};

const UNIFORMS = {
  // Projection mode values
  coordinateSystem: Number,
  center: Array,

  // Screen size
  viewportSize: Array,
  devicePixelRatio: Number,

  // Distance at which screen pixels are projected
  focalDistance: Number,
  commonUnitsPerWorldUnit: Array,
  scale: Number, // This is the mercator scale (2 ** zoom)

  modelMatrix: Array,
  viewProjectionMatrix: Array,

  // This is for lighting calculations
  cameraPosition: Array
};

// 64 bit support
const UNIFORMS_64 = {
  project_uViewProjectionMatrixFP64: Array,
  project64_uViewProjectionMatrix: Array,
  project64_uScale: Number
};

const EPSILON = 1e-4;

function getUniformsError(uniforms, formats) {
  for (const name in UNIFORMS) {
    const value = uniforms[name];
    const type = formats[name];
    if (type === Number && !Number.isFinite(value)) {
      return `${name} is not a number`;
    }
    if (type === Array && !value.length) {
      return `${name} is not an array`;
    }
  }
  return null;
}

test('project#getUniforms', t => {
  let uniforms = project.getUniforms({viewport: TEST_VIEWPORTS.map});
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.deepEqual(uniforms.center, [0, 0, 0, 0], 'Returned zero projection center');

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.map,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.deepEqual(uniforms.center, [0, 0, 0, 0], 'Returned zero projection center');

  uniforms = project.getUniforms({viewport: TEST_VIEWPORTS.mapHighZoom});
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.ok(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  );
  t.ok(
    Math.abs(uniforms.center[0]) < EPSILON && Math.abs(uniforms.center[1]) < EPSILON,
    'project center at center of clipspace'
  );
  t.deepEqual(
    uniforms.coordinateOrigin,
    [-122.42694091796875, 37.75153732299805, 0],
    'Returned shader coordinate origin'
  );
  t.ok(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  );

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.mapHighZoom,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: Object.freeze([-122.4, 37.7])
  });
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.ok(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  );

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.mapHighZoom,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.ok(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  );
  // CARTESIAN + WEB_MERCATOR_AUTO_OFFSET is rounded in the common space
  t.ok(
    Math.abs(uniforms.center[0]) < EPSILON * 10 && Math.abs(uniforms.center[1]) < EPSILON * 10,
    'project center at center of clipspace'
  );
  t.ok(
    uniforms.commonUnitsPerWorldUnit[0] === 1 && uniforms.commonUnitsPerWorldUnit[1] === 1,
    'Returned correct distanceScales'
  );

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.infoVis,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.deepEqual(
    uniforms.coordinateOrigin,
    [10.285714149475098, -3.1415927410125732, 0],
    'Returned shader coordinate origin'
  );
  t.ok(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  );

  t.end();
});

test('project64#getUniforms', t => {
  const viewport = TEST_VIEWPORTS.map;
  const uniforms = project.getUniforms({viewport});
  const uniforms64 = project64.getUniforms({viewport}, uniforms);

  t.notOk(getUniformsError(uniforms64, UNIFORMS_64), 'Uniforms validated');
  t.end();
});
