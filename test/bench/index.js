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
/* global console */
import {Suite} from 'benchmark';
import * as data from 'deck.gl/test/data';

import {
  ScatterplotLayer,
  PolygonLayer,
  PathLayer,
  ChoroplethLayer,
  ExtrudedChoroplethLayer64,
  WebMercatorViewport
} from 'deck.gl';

import {parseColor} from 'deck.gl/core/lib/utils/color';

import {COORDINATE_SYSTEM} from 'deck.gl/core/lib/constants';
import {getUniformsFromViewport} from 'deck.gl/shaderlib/project/viewport-uniforms';

import {testInitializeLayer} from 'deck.gl/test/test-utils';

const suite = new Suite();

const COLOR_STRING = '#FFEEBB';
const COLOR_ARRAY = [222, 222, 222];
const VIEWPORT_PARAMS = {
  width: 500, height: 500,
  longitude: -122, latitude: 37, zoom: 12, pitch: 30
};

let testIdx = 0;
const testLayer = new ScatterplotLayer({data: data.points});

// add tests
suite
.add('getUniformsFromViewport#LNGLAT', () => {
  return getUniformsFromViewport(data.sampleViewport, {
    modelMatrix: data.sampleModelMatrix,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT
  });
})
.add('getUniformsFromViewport#METER_OFFSETS', () => {
  return getUniformsFromViewport(data.sampleViewport, {
    modelMatrix: data.sampleModelMatrix,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
  });
})
.add('WebMercatorViewport', () => {
  return new WebMercatorViewport(VIEWPORT_PARAMS);
})
.add('color#parseColor (string)', () => {
  return parseColor(COLOR_STRING);
})
.add('color#parseColor (3 element array)', () => {
  return parseColor(COLOR_ARRAY);
})
.add('ScatterplotLayer#construct', () => {
  return new ScatterplotLayer({data: data.points});
})
.add('ChoroplethLayer#construct', () => {
  return new ChoroplethLayer({data: data.choropleths});
})
.add('PolygonLayer#construct', () => {
  return new PolygonLayer({data: data.choropleths});
})
.add('ScatterplotLayer#initialize', () => {
  const layer = new ChoroplethLayer({data: data.points});
  testInitializeLayer({layer});
})
.add('PathLayer#initialize', () => {
  const layer = new PathLayer({data: data.lines});
  testInitializeLayer({layer});
})
.add('ChoroplethLayer#initialize', () => {
  const layer = new ChoroplethLayer({data: data.choropleths});
  testInitializeLayer({layer});
})
.add('PolygonLayer#initialize (flat)', () => {
  const layer = new PolygonLayer({data: data.choropleths});
  testInitializeLayer({layer});
})
.add('PolygonLayer#initialize (extruded)', () => {
  const layer = new PolygonLayer({data: data.choropleths, extruded: true});
  testInitializeLayer({layer});
})
.add('PolygonLayer#initialize (wireframe)', () => {
  const layer = new PolygonLayer({data: data.choropleths, extruded: true, wireframe: true});
  testInitializeLayer({layer});
})
// .add('PolygonLayer#initialize from Immutable', () => {
//   const layer = new PolygonLayer({data: data.immutableChoropleths});
//   testInitializeLayer({layer});
// })
.add('ExtrudedChoroplethLayer64#initialize', () => {
  try {
    const layer = new ExtrudedChoroplethLayer64({
      id: 'extrudedChoroplethLayer64',
      data: data.choropleths,
      getColor: f => [128, 0, 0],
      pointLightLocation: [
        37.751537058389985,
        -122.42694203247012,
        1e4
      ],
      opacity: 1.0,
      pickable: true
    });
    testInitializeLayer({layer});
  } catch (error) {
    console.error(error);
  }
})
.add('encoding picking color', () => {
  testIdx++;
  testLayer.encodePickingColor(testIdx);
})
// .add('ScatterplotLayer#initialize', () => {
//   const layer = new ScatterplotLayer({data: data.points});
//   testInitializeLayer({layer});
// })
// add listeners
.on('start', (event) => {
  console.log('Starting bench...');
})
.on('cycle', (event) => {
  console.log(String(event.target));
})
.on('complete', function t() {
  console.log(`Fastest is ${this.filter('fastest').map('name')}`);
})
.run({});
