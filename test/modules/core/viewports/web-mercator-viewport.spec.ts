// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {equals, config, Vector3} from '@math.gl/core';
import {WebMercatorViewport} from 'deck.gl';
import {Matrix4} from '@math.gl/core';

// Adjust sensitivity of math.gl's equals
const LNGLAT_TOLERANCE = 1e-6;
const ALT_TOLERANCE = 1e-5;
const OFFSET_TOLERANCE = 1e-5;

const DEGREES_TO_RADIANS = Math.PI / 180;

/* eslint-disable */
const TEST_VIEWPORTS = [
  {
    width: 800,
    height: 600,
    latitude: 38,
    longitude: -122,
    zoom: 11
  },
  {
    width: 800,
    height: 600,
    latitude: 23,
    longitude: 20,
    zoom: 15,
    pich: 30,
    bearing: -85
  },
  {
    width: 800,
    height: 600,
    latitude: 65,
    longitude: 42,
    zoom: 16,
    pitch: 15,
    bearing: 30
  }
];

test('WebMercatorViewport#imports', () => {
  expect(WebMercatorViewport, 'WebMercatorViewport import ok').toBeTruthy();
});

test('WebMercatorViewport#constructor', () => {
  expect(
    new WebMercatorViewport() instanceof WebMercatorViewport,
    'Created new WebMercatorViewport with default args'
  ).toBeTruthy();

  expect(
    new WebMercatorViewport(
      Object.assign({}, TEST_VIEWPORTS[0], {
        width: 0,
        height: 0
      })
    ) instanceof WebMercatorViewport,
    'WebMercatorViewport constructed successfully with 0 width and height'
  ).toBeTruthy();
});

test('WebMercatorViewport#padding', () => {
  const viewport = new WebMercatorViewport({...TEST_VIEWPORTS[0], padding: {left: 100, top: 20}});
  const center = viewport.project([viewport.longitude, viewport.latitude]);
  expect(
    equals(center, [viewport.width / 2 + 50, viewport.height / 2 + 10]),
    'viewport center is offset'
  ).toBeTruthy();
});

test('WebMercatorViewport.projectFlat', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = LNGLAT_TOLERANCE;

  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc);
    for (const tc of TEST_VIEWPORTS) {
      const lnglatIn = [tc.longitude, tc.latitude];
      const xy = viewport.projectFlat(lnglatIn);
      const lnglat = viewport.unprojectFlat(xy);
      console.log(`Comparing [${lnglatIn}] to [${lnglat}]`);
      expect(equals(lnglatIn, lnglat)).toBeTruthy();
    }
  }
  config.EPSILON = oldEpsilon;
});

test('WebMercatorViewport.project#3D', () => {
  const oldEpsilon = config.EPSILON;
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc);
    for (const offset of [0, 0.5, 1.0, 5.0]) {
      const lnglatIn3 = [vc.longitude + offset, vc.latitude + offset, 0];
      const xyz3 = viewport.project(lnglatIn3);
      const lnglat3 = viewport.unproject(xyz3);
      console.log(`Project/unproject ${lnglatIn3} => ${xyz3} => ${lnglat3}`);
      config.EPSILON = LNGLAT_TOLERANCE;
      expect(
        equals(lnglatIn3.slice(0, 2), lnglat3.slice(0, 2)),
        'LngLat input/output match'
      ).toBeTruthy();
      config.EPSILON = ALT_TOLERANCE;
      expect(equals(lnglatIn3[2], lnglat3[2]), 'Altitude input/output match').toBeTruthy();
    }
  }
  config.EPSILON = oldEpsilon;
});

test('WebMercatorViewport.project#2D', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = LNGLAT_TOLERANCE;
  // Cross check positions
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc);
    for (const tc of TEST_VIEWPORTS) {
      const lnglatIn = [tc.longitude, tc.latitude];
      const xy = viewport.project(lnglatIn);
      const lnglat = viewport.unproject(xy);
      console.log(`Comparing [${lnglatIn}] to [${lnglat}]`);
      expect(equals(lnglatIn, lnglat)).toBeTruthy();
    }
  }
  config.EPSILON = oldEpsilon;
});

test('WebMercatorViewport.getScales', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = OFFSET_TOLERANCE;

  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc);
    const distanceScales = viewport.getDistanceScales();
    expect(
      distanceScales.metersPerUnit &&
        distanceScales.unitsPerMeter &&
        distanceScales.degreesPerUnit &&
        distanceScales.unitsPerDegree,
      'distanceScales defined'
    ).toBeTruthy();

    expect(
      equals(
        distanceScales.metersPerUnit.map((d, i) => d * distanceScales.unitsPerMeter[i]),
        [1, 1, 1]
      ),
      'metersPerUnit/unitsPerMeter match'
    ).toBeTruthy();

    expect(
      equals(
        distanceScales.degreesPerUnit.map((d, i) => d * distanceScales.unitsPerDegree[i]),
        [1, 1, 1]
      ),
      'degreesPerUnit/unitsPerDegree match'
    ).toBeTruthy();

    for (const offset of [-0.01, 0.005, 0.01]) {
      const xyz0 = [
        viewport.center[0] + distanceScales.unitsPerDegree[0] * offset,
        viewport.center[1] + distanceScales.unitsPerDegree[1] * offset
      ];
      const xyz1 = viewport.projectFlat([vc.longitude + offset, vc.latitude + offset, 0]);

      expect(equals(xyz0, xyz1), 'unitsPerDegree matches projection').toBeTruthy();
    }
  }
  config.EPSILON = oldEpsilon;
});

test('WebMercatorViewport.getFrustumPlanes', () => {
  const CULLING_TEST_CASES = [
    {
      pixels: [400, 300],
      result: null
    },
    {
      pixels: [799, 1],
      result: null
    },
    {
      pixels: [1, 599],
      result: null
    },
    {
      pixels: [799, 599],
      result: null
    },
    {
      pixels: [1, 1],
      result: null
    },
    {
      pixels: [-1, 300],
      result: 'left'
    },
    {
      pixels: [801, 300],
      result: 'right'
    },
    {
      pixels: [400, -1],
      result: 'top'
    },
    {
      pixels: [400, 601],
      result: 'bottom'
    },
    {
      pixels: [400, 300, -1.01],
      result: 'near'
    },
    {
      pixels: [400, 300, 1.01],
      result: 'far'
    }
  ];

  for (const vc of TEST_VIEWPORTS) {
    const viewport = new WebMercatorViewport(vc);
    const planes = viewport.getFrustumPlanes();

    for (const tc of CULLING_TEST_CASES) {
      const lngLat = viewport.unproject(tc.pixels);
      const commonPosition = viewport.projectPosition(lngLat);
      expect(getCulling(commonPosition, planes), 'point culled').toBe(tc.result);
    }
  }
});

test('WebMercatorViewport.subViewports', () => {
  let viewport = new WebMercatorViewport(TEST_VIEWPORTS[0]);
  expect(viewport.subViewports, 'gets correct subViewports').toEqual(null);

  viewport = new WebMercatorViewport({...TEST_VIEWPORTS[0], repeat: true});
  expect(viewport.subViewports, 'gets correct subViewports').toEqual([viewport]);

  viewport = new WebMercatorViewport({
    width: 800,
    height: 400,
    longitude: 0,
    latitude: 0,
    zoom: 0,
    repeat: true
  });
  const {subViewports} = viewport;
  expect(subViewports.length, 'gets correct subViewports').toBe(3);
  expect(subViewports[0].project([0, 0]), 'center offset in subViewports[0]').toEqual([
    400 - 512,
    200
  ]);
  expect(subViewports[1].project([0, 0]), 'center offset in subViewports[1]').toEqual([400, 200]);
  expect(subViewports[2].project([0, 0]), 'center offset in subViewports[2]').toEqual([
    400 + 512,
    200
  ]);

  expect(viewport.subViewports, 'subViewports are cached').toBe(subViewports);
});

test('WebMercatorViewport#constructor#fovy', () => {
  const oldEpsilon = config.EPSILON;
  config.EPSILON = 0.01;

  const fovy = 25;
  const projectionMatrix = new Matrix4().perspective({
    fovy: fovy * DEGREES_TO_RADIANS,
    aspect: 4 / 3,
    near: 0.1,
    far: 10
  });

  let viewport = new WebMercatorViewport({...TEST_VIEWPORTS[0], projectionMatrix});
  expect(viewport.fovy, 'fovy is calculated from projectionMatrix').toBe(fovy);
  expect(
    equals(viewport.altitude, 2.255),
    'altitude is calculated from projectionMatrix'
  ).toBeTruthy();

  viewport = new WebMercatorViewport({...TEST_VIEWPORTS[0], fovy});
  expect(viewport.fovy, 'fovy is passed through').toBe(fovy);
  expect(equals(viewport.altitude, 2.255), 'altitude is calculated from fovy').toBeTruthy();

  viewport = new WebMercatorViewport({...TEST_VIEWPORTS[0], altitude: 2});
  expect(viewport.altitude, 'altitude is passed through').toBe(2);
  expect(equals(viewport.fovy, 28.072), 'fovy is calculated from altitude').toBeTruthy();

  viewport = new WebMercatorViewport(TEST_VIEWPORTS[0]);
  expect(viewport.altitude, 'using default altitude').toBe(1.5);
  expect(equals(viewport.fovy, 36.87), 'fovy is calculated from altitude').toBeTruthy();

  config.EPSILON = oldEpsilon;
});

function getCulling(p, planes) {
  let outDir = null;
  p = new Vector3(p);
  for (const dir in planes) {
    const plane = planes[dir];
    if (p.dot(plane.normal) > plane.distance) {
      outDir = dir;
      break;
    }
  }
  return outDir;
}
