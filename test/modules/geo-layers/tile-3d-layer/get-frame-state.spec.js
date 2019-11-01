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
import {getFrameState} from '@deck.gl/geo-layers/tile-3d-layer/get-frame-state';
import {Viewport} from 'deck.gl';
import {equals} from 'math.gl';

const EPSILON = 1e-5;
const expected = {
  camera: {
    position: [2984642.2356970147, 2727927.6428344236, 4916103.380280777],
    direction: [-0.4670086274740456, -0.4268403526197167, -0.7744096172183581],
    up: [-0.5716213082858781, -0.522455103481462, 0.6326845539127031]
  },
  height: 775,
  frameNumber: 1,
  sseDenominator: 1.15
};

test('getFrameState', t => {
  const viewport = new Viewport({
    width: 793,
    height: 775,
    latitude: 50.751537058389985,
    longitude: 42.42694203247012,
    zoom: 15.5
  });

  const results = getFrameState(viewport, 1);
  t.equals(results.height, expected.height, 'height should match.');
  t.equals(results.frameNumber, expected.frameNumber, 'frameNumber should match.');
  t.ok(
    equals(results.camera.position, expected.camera.position, EPSILON),
    'camera.position should match.'
  );
  t.ok(
    equals(results.camera.direction, expected.camera.direction, EPSILON),
    'camera.direction should match.'
  );
  t.ok(equals(results.camera.up, expected.camera.up, EPSILON), 'camera.up should match.');
  t.ok(results.cullingVolume.planes.length, 6, 'Should have 6 planes.');

  t.end();
});
