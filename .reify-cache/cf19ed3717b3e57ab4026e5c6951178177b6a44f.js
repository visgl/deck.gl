"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var COORDINATE_SYSTEM,WebMercatorViewport;module.link('deck.gl',{COORDINATE_SYSTEM(v){COORDINATE_SYSTEM=v},WebMercatorViewport(v){WebMercatorViewport=v}},1);var project,project64;module.link('@deck.gl/core/shaderlib',{project(v){project=v},project64(v){project64=v}},2);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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






const TEST_DATA = {
  mapState: {
    width: 793,
    height: 775,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    bearing: -44.48928121059271,
    pitch: 43.670797287818566
    // altitude: undefined
  }
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
  project_uPixelsPerUnit: Array,
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

test('project#getUniforms', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);

  let uniforms = project.getUniforms({viewport});

  for (const uniform in UNIFORMS) {
    t.ok(uniforms[uniform] !== undefined, `Returned ${uniform}`);
  }

  uniforms = project.getUniforms({
    viewport,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
  });
  t.ok(uniforms.project_uCenter.some(x => x), 'Returned non-trivial projection center');

  t.end();
});

test('project64#getUniforms', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  const uniforms = project.getUniforms({viewport});
  const uniforms64 = project64.getUniforms({viewport}, uniforms);

  for (const uniform in UNIFORMS_64) {
    t.ok(uniforms64[uniform] !== undefined, `Return ${uniform}`);
  }
  t.end();
});
