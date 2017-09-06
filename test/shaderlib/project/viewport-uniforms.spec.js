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
import {getUniformsFromViewport} from 'deck.gl/shaderlib/project/viewport-uniforms';

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

test('Viewport#constructors', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport, 'Created new WebMercatorViewport');
  t.end();
});

test('getUniformsFromViewport', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport, 'Created new WebMercatorViewport');

  let uniforms = getUniformsFromViewport(viewport);
  t.ok(uniforms.devicePixelRatio > 0, 'Returned devicePixelRatio');
  t.ok((uniforms.projectionMatrix instanceof Float32Array) ||
    (uniforms.projectionMatrix instanceof Matrix4), 'Returned projectionMatrix');
  t.ok((uniforms.modelViewMatrix instanceof Float32Array) ||
    (uniforms.modelViewMatrix instanceof Matrix4), 'Returned modelViewMatrix');

  uniforms = getUniformsFromViewport(viewport, {
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
  });
  t.ok(uniforms.projectionCenter.some(x => x), 'Returned non-trivial projection center');

  t.end();
});
