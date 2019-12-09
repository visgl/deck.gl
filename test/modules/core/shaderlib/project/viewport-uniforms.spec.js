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

import {COORDINATE_SYSTEM, MapView, OrbitView} from 'deck.gl';
import {project} from '@deck.gl/core';
import {project64} from '@deck.gl/extensions';

const TEST_VIEWPORTS = {
  map: new MapView().makeViewport({
    width: 800,
    height: 600,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11,
      bearing: -30,
      pitch: 40
    }
  }),
  mapHighZoom: new MapView().makeViewport({
    width: 800,
    height: 600,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      bearing: -30,
      pitch: 40
    }
  }),
  infoVis: new OrbitView().makeViewport({
    width: 800,
    height: 600,
    viewState: {
      rotationX: -30,
      rotationOrbit: 40,
      target: [10.285714285714, -3.14159265359],
      zoom: 8
    }
  })
};

const UNIFORMS = {
  // Projection mode values
  project_uCoordinateSystem: Number,
  project_uCenter: Array,

  // Screen size
  project_uViewportSize: Array,
  project_uDevicePixelRatio: Number,

  // Distance at which screen pixels are projected
  project_uFocalDistance: Number,
  project_uCommonUnitsPerWorldUnit: Array,
  project_uScale: Number, // This is the mercator scale (2 ** zoom)

  project_uModelMatrix: Array,
  project_uViewProjectionMatrix: Array,

  // This is for lighting calculations
  project_uCameraPosition: Array
};

// 64 bit support
const UNIFORMS_64 = {
  project_uViewProjectionMatrixFP64: Array,
  project64_uViewProjectionMatrix: Array,
  project64_uScale: Number
};

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
  t.deepEqual(uniforms.project_uCenter, [0, 0, 0, 0], 'Returned zero projection center');

  uniforms = project.getUniforms({viewport: TEST_VIEWPORTS.mapHighZoom});
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.deepEqual(
    uniforms.project_uCoordinateOrigin,
    [-122.42694091796875, 37.75153732299805, 0],
    'Returned shader coordinate origin'
  );
  t.ok(uniforms.project_uCenter.some(x => x), 'Returned non-trivial projection center');

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.mapHighZoom,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [-122.4, 37.7]
  });
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.ok(uniforms.project_uCenter.some(x => x), 'Returned non-trivial projection center');

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.infoVis,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
  t.notOk(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated');
  t.deepEqual(
    uniforms.project_uCoordinateOrigin,
    [10.285714149475098, -3.1415927410125732, 0],
    'Returned shader coordinate origin'
  );
  t.ok(uniforms.project_uCenter.some(x => x), 'Returned non-trivial projection center');

  t.end();
});

test('project64#getUniforms', t => {
  const viewport = TEST_VIEWPORTS.map;
  const uniforms = project.getUniforms({viewport});
  const uniforms64 = project64.getUniforms({viewport}, uniforms);

  t.notOk(getUniformsError(uniforms64, UNIFORMS_64), 'Uniforms validated');
  t.end();
});
