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
import {equals} from '../../../src/lib/math';
import {WebMercatorViewport} from 'deck.gl';
import utm from 'utm';

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

const TEST_METER_OFFSETS = [
  {
    title: '1m',
    radius: 1
  },
  {
    title: '10m',
    radius: 10
  },
  {
    title: '100m',
    radius: 100
  },
  {
    title: '1km',
    radius: 1000
  },
  {
    title: '10km',
    radius: 10000
  }
];

test('WebMercatorViewport#imports', t => {
  t.ok(WebMercatorViewport, 'WebMercatorViewport import ok');
  t.end();
});

test('WebMercatorViewport#constructor', t => {
  t.ok(new WebMercatorViewport() instanceof WebMercatorViewport,
    'Created new WebMercatorViewport with default args');
  t.end();
});

test('WebMercatorViewport#constructor - 0 width/height', t => {
  const viewport = new WebMercatorViewport(Object.assign(TEST_VIEWPORTS[0].mapState, {
    width: 0,
    height: 0
  }));
  t.ok(viewport instanceof WebMercatorViewport,
    'WebMercatorViewport constructed successfully with 0 width and height');
  t.end();
});

test('WebMercatorViewport.projectFlat', t => {
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
      const lnglatIn = [vc.mapState.longitude + offset, vc.mapState.latitude + offset];
      const xyz = viewport.project(lnglatIn);
      const lnglat = viewport.unproject(xyz);
      t.ok(equals(lnglatIn, lnglat), `Project/unproject ${lnglatIn} to ${lnglat}`);

      const lnglatIn3 = [vc.mapState.longitude + offset, vc.mapState.latitude + offset, 0];
      const xyz3 = viewport.project(lnglatIn3);
      const lnglat3 = viewport.unproject(xyz3);
      t.ok(equals(lnglatIn3, lnglat3),
        `Project/unproject ${lnglatIn3}=>${xyz3}=>${lnglat3}`);
    }
  }
  t.end();
});

test('WebMercatorViewport.project#2D', t => {
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
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc.mapState);
    for (const tc of TEST_VIEWPORTS) {
      const coordinate = [tc.mapState.longitude, tc.mapState.latitude, 0];
      const deltaLngLat = viewport.metersToLngLatDelta(coordinate);
      const deltaMeters = viewport.lngLatDeltaToMeters(deltaLngLat);
      t.comment(`Comparing [${deltaMeters}] to [${coordinate}]`);
      t.ok(equals(deltaMeters, coordinate));
    }
  }
  t.end();
});

/* Test error in metersToLngLatDelta */

// get meter offset [x, y] from one coordinate to another
function getMeterOffset(fromLngLat, toLngLat) {
  const fromUtm = utm.fromLatLon(fromLngLat[1], fromLngLat[0]);
  const toUtm = utm.fromLatLon(toLngLat[1], toLngLat[0], fromUtm.zoneNum);
  return [
    toUtm.easting - fromUtm.easting,
    toUtm.northing - fromUtm.northing
  ];
}

function applyMeterOffset(fromLngLat, meterOffset) {
  const fromUtm = utm.fromLatLon(fromLngLat[1], fromLngLat[0]);
  const p = utm.toLatLon(
    fromUtm.easting + meterOffset[0],
    fromUtm.northing + meterOffset[1],
    fromUtm.zoneNum,
    fromUtm.zoneLetter
  );
  return [p.longitude, p.latitude];
}

test('WebMercatorViewport.meterOffsetModePrecision', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc.mapState);
    const centerLngLat = [viewport.longitude, viewport.latitude];

    for (const pc of TEST_METER_OFFSETS) {
      const POINT_SAMPLE_COUNT = 4;
      let error = 0;

      for (let i = 0; i < POINT_SAMPLE_COUNT; i++) {
        const meterOffset = [
          Math.cos(i / POINT_SAMPLE_COUNT * Math.PI * 2) * pc.radius,
          Math.sin(i / POINT_SAMPLE_COUNT * Math.PI * 2) * pc.radius
        ];

        const centerLngLat2 = applyMeterOffset(centerLngLat, meterOffset);
        const offsetLngLat = viewport.addMetersToLngLat(centerLngLat, meterOffset);
        const offsetPt = getMeterOffset(centerLngLat2, offsetLngLat);

        error = Math.max(error, Math.sqrt(offsetPt[0] * offsetPt[0] + offsetPt[1] * offsetPt[1]));
      }

      // Error must be less than 0.1m or 0.1%
      t.ok(error < 0.1 || error / pc.radius < 0.001, `${pc.title}: ${error.toFixed(5)}`);
    }
  }
  t.end();
});
