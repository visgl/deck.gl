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

/* eslint-disable no-console, no-invalid-this */
import * as data from 'deck.gl-test/data';

import {WebMercatorViewport} from 'deck.gl';

import {COORDINATE_SYSTEM} from '@deck.gl/core/lib/constants';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';

const VIEWPORT_PARAMS = {
  width: 500,
  height: 500,
  longitude: -122,
  latitude: 37,
  zoom: 12,
  pitch: 30
};

// add tests

export default function viewportBench(suite) {
  return suite
    .group('VIEWPORTS')
    .add('getUniformsFromViewport#LNGLAT', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT
      });
    })
    .add('getUniformsFromViewport#METER_OFFSETS', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
      });
    })
    .add('getUniformsFromViewport#LNGLAT - FP64', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        fp64: true,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT
      });
    })
    .add('getUniformsFromViewport#METER_OFFSETS - FP64', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        fp64: true,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
      });
    })
    .add('WebMercatorViewport', () => {
      return new WebMercatorViewport(VIEWPORT_PARAMS);
    });
}
