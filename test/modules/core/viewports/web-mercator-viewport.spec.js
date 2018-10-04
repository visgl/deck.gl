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
import {equals, config} from 'math.gl';
import {WebMercatorViewport} from 'deck.gl';

// Adjust sensitivity of math.gl's equals
const LNGLAT_TOLERANCE = 1e-6;
const ALT_TOLERANCE = 1e-5;

/* eslint-disable */
const TEST_VIEWPORTS = [
  {
    mapState: {
      width: 793,
      height: 775,
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5
    }
  },
  {
    mapState: {
      width: 793,
      height: 775,
      latitude: 20.751537058389985,
      longitude: 22.42694203247012,
      zoom: 15.5
    }
  },
  {
    mapState: {
      width: 793,
      height: 775,
      latitude: 50.751537058389985,
      longitude: 42.42694203247012,
      zoom: 15.5,
      bearing: -44.48928121059271,
      pitch: 43.670797287818566
    }
  }
];

test('WebMercatorViewport#imports', t => {
  t.ok(WebMercatorViewport, 'WebMercatorViewport import ok');
  t.end();
});

test('WebMercatorViewport#constructor', t => {
  t.ok(
    new WebMercatorViewport() instanceof WebMercatorViewport,
    'Created new WebMercatorViewport with default args'
  );
  t.end();
});

test('WebMercatorViewport#constructor - 0 width/height', t => {
  const viewport = new WebMercatorViewport(
    Object.assign(TEST_VIEWPORTS[0].mapState, {
      width: 0,
      height: 0
    })
  );
  t.ok(
    viewport instanceof WebMercatorViewport,
    'WebMercatorViewport constructed successfully with 0 width and height'
  );
  t.end();
});

test('WebMercatorViewport.projectFlat', t => {
  config.EPSILON = LNGLAT_TOLERANCE;

  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc.mapState);
    for (const tc of TEST_VIEWPORTS) {
      const lnglatIn = [tc.mapState.longitude, tc.mapState.latitude];
      const xy = viewport.projectFlat(lnglatIn);
      const lnglat = viewport.unprojectFlat(xy);
      t.comment(`Comparing [${lnglatIn}] to [${lnglat}]`);
      t.ok(equals(lnglatIn, lnglat));
    }
  }
  t.end();
});

test('WebMercatorViewport.project#3D', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc.mapState);
    for (const offset of [0, 0.5, 1.0, 5.0]) {
      const lnglatIn3 = [vc.mapState.longitude + offset, vc.mapState.latitude + offset, 0];
      const xyz3 = viewport.project(lnglatIn3);
      const lnglat3 = viewport.unproject(xyz3);
      t.comment(`Project/unproject ${lnglatIn3} => ${xyz3} => ${lnglat3}`);
      config.EPSILON = LNGLAT_TOLERANCE;
      t.ok(equals(lnglatIn3.slice(0, 2), lnglat3.slice(0, 2)), 'LngLat input/output match');
      config.EPSILON = ALT_TOLERANCE;
      t.ok(equals(lnglatIn3[2], lnglat3[2]), 'Altitude input/output match');
    }
  }
  t.end();
});

test('WebMercatorViewport.project#2D', t => {
  config.EPSILON = LNGLAT_TOLERANCE;
  // Cross check positions
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc.mapState);
    for (const tc of TEST_VIEWPORTS) {
      const lnglatIn = [tc.mapState.longitude, tc.mapState.latitude];
      const xy = viewport.project(lnglatIn);
      const lnglat = viewport.unproject(xy);
      t.comment(`Comparing [${lnglatIn}] to [${lnglat}]`);
      t.ok(equals(lnglatIn, lnglat));
    }
  }
  t.end();
});

test('WebMercatorViewport.getScales', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc.mapState);
    const distanceScales = viewport.getDistanceScales();
    t.ok(Array.isArray(distanceScales.metersPerPixel), 'metersPerPixel defined');
    t.ok(Array.isArray(distanceScales.pixelsPerMeter), 'pixelsPerMeter defined');
    t.ok(Array.isArray(distanceScales.degreesPerPixel), 'degreesPerPixel defined');
    t.ok(Array.isArray(distanceScales.pixelsPerDegree), 'pixelsPerDegree defined');
  }
  t.end();
});

test('WebMercatorViewport.meterDeltas', t => {
  config.EPSILON = LNGLAT_TOLERANCE;

  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc.mapState);
    for (const tc of TEST_VIEWPORTS) {
      const coordinate = [tc.mapState.longitude, tc.mapState.latitude, 0];
      const deltaLngLat = viewport.metersToLngLatDelta(coordinate);
      const deltaMeters = viewport.lngLatDeltaToMeters(deltaLngLat);
      t.comment(`Comparing [${deltaMeters}] to [${coordinate}]`);
      t.ok(equals(deltaMeters, coordinate), 'deltaLngLat to deltaMeters');
    }
  }
  t.end();
});
