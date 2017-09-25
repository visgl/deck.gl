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
import {Matrix4} from 'luma.gl';

import {COORDINATE_SYSTEM, Viewport, WebMercatorViewport} from 'deck.gl';
import {getUniformsFromViewport} from 'deck.gl/core/shaderlib/project/viewport-uniforms';

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

  // 64 bit support
  project_uViewProjectionMatrixFP64: Array,

  // This is for lighting calculations
  project_uCameraPosition: Array,

  project64_uViewProjectionMatrix: Array,
  project64_uScale: Number
};

// DEPRECATED UNIFORMS - For backwards compatibility with old custom layers
const DEPRECATED_UNIFORMS = {
  projectionMode: Number,
  projectionCenter: Number,

  projectionOrigin: Array,
  modelMatrix: Array,

  projectionMatrix: Array,
  projectionPixelsPerUnit: Array,
  projectionScale: Number, // This is the mercator scale (2 ** zoom)
  viewportSize: Array,
  devicePixelRatio: Number,
  cameraPos: Array,

  projectionFP64: Array,
  projectionScaleFP64: Array
};

test('Viewport#constructors', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport, 'Created new WebMercatorViewport');
  t.end();
});

test('project#getUniformsFromViewport#shader module style uniforms', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport, 'Created new WebMercatorViewport');

  let uniforms = getUniformsFromViewport({viewport});

  for (const uniform in UNIFORMS) {
    t.ok(uniforms[uniform] !== undefined, `Returned ${uniform}`);
  }

  uniforms = getUniformsFromViewport({
    viewport,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
  });
  t.ok(uniforms.project_uCenter.some(x => x), 'Returned non-trivial projection center');

  t.end();
});

test('preoject#getUniformsFromViewport#deprecated uniforms', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport, 'Created new WebMercatorViewport');

  let uniforms = getUniformsFromViewport({viewport});

  for (const uniform in DEPRECATED_UNIFORMS) {
    t.ok(uniforms[uniform] !== undefined, `Returned deprecated ${uniform}`);
  }

  t.ok(uniforms.devicePixelRatio > 0, 'Returned devicePixelRatio');
  t.ok((uniforms.projectionMatrix instanceof Float32Array) ||
    (uniforms.projectionMatrix instanceof Matrix4), 'Returned projectionMatrix');

  uniforms = getUniformsFromViewport({
    viewport,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
  });
  t.ok(uniforms.projectionCenter.some(x => x), 'Returned non-trivial projection center');

  t.end();
});
