// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {vecNormalized} from '../../../utils/utils';
import {
  OrthographicViewport,
  Viewport,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport
} from 'deck.gl';
import {Matrix4, Vector3} from '@math.gl/core';

/* eslint-disable */
const TEST_VIEWPORTS = [
  {
    id: 'orthographic',
    width: 800,
    height: 600,
    viewMatrix: new Matrix4().lookAt({eye: [0, 0, 1]}),
    near: 1,
    far: 10,
    position: [10, -20, 0],
    zoom: 1
  },
  {
    id: 'orbit',
    width: 800,
    height: 600,
    viewMatrix: new Matrix4()
      .lookAt({
        eye: [0, 0, 1.0722534602547793],
        up: [0, 1, 0]
      })
      .rotateX(-Math.PI / 6)
      .rotateY((Math.PI * 2) / 3)
      .scale(0.4266666666666667),
    fovy: 50,
    near: 0.1,
    far: 10,
    position: [10, -20, 30],
    zoom: 8
  },
  {
    id: 'first-person',
    width: 800,
    height: 600,
    longitude: -122,
    latitude: 38,
    viewMatrix: new Matrix4()
      .lookAt({
        eye: [0, 0, 0],
        center: [0.6, -0.8, 0],
        up: [0, 0, 1]
      })
      .scale(Math.pow(2, 15.910865502636394)),
    position: [0, 0, 2],
    zoom: 15.910865502636394
  }
];

test('Viewport#imports', () => {
  expect(Viewport, 'Viewport import ok').toBeTruthy();
});

test('Viewport#constructor', () => {
  expect(new Viewport() instanceof Viewport, 'Created new Viewport with default args').toBeTruthy();
  expect(
    new Viewport(TEST_VIEWPORTS[0]) instanceof Viewport,
    'Created new Viewport with test args'
  ).toBeTruthy();

  expect(
    new Viewport(
      Object.assign({}, TEST_VIEWPORTS[0], {
        width: 0,
        height: 0
      })
    ) instanceof Viewport,
    'Viewport constructed successfully with 0 width and height'
  ).toBeTruthy();
});

test('Viewport#equals', () => {
  const viewport1a = new Viewport(TEST_VIEWPORTS[0]);
  const viewport1b = new Viewport(TEST_VIEWPORTS[0]);
  const viewport2a = new Viewport(TEST_VIEWPORTS[1]);
  const viewport2b = new Viewport(TEST_VIEWPORTS[1]);

  expect(viewport1a.equals(viewport1a), 'Viewport equality correct').toBeTruthy();
  expect(viewport1a.equals(viewport1b), 'Viewport equality correct').toBeTruthy();
  expect(viewport2a.equals(viewport2b), 'Viewport equality correct').toBeTruthy();
  expect(viewport1a.equals(viewport2a), 'Viewport equality correct').toBeFalsy();

  const globeOptions = {width: 800, height: 600, longitude: 0, latitude: 0, zoom: 1};
  const globeResolution10a = new GlobeViewport({...globeOptions, resolution: 10});
  const globeResolution10b = new GlobeViewport({...globeOptions, resolution: 10});
  const globeResolution5 = new GlobeViewport({...globeOptions, resolution: 5});
  expect(
    globeResolution10a.equals(globeResolution10b),
    'matching globe tessellation resolutions are equal'
  ).toBeTruthy();
  expect(
    globeResolution10a.equals(globeResolution5),
    'different globe tessellation resolutions are not equal'
  ).toBeFalsy();

  const orthographicOptions = {width: 800, height: 600, zoomY: 0};
  const orthographicZoom1a = new OrthographicViewport({...orthographicOptions, zoomX: 1});
  const orthographicZoom1b = new OrthographicViewport({...orthographicOptions, zoomX: 1});
  const orthographicZoom2 = new OrthographicViewport({...orthographicOptions, zoomX: 2});
  expect(
    orthographicZoom1a.equals(orthographicZoom1b),
    'matching anisotropic common-space scales are equal'
  ).toBeTruthy();
  expect(
    orthographicZoom1a.equals(orthographicZoom2),
    'different anisotropic common-space scales are not equal'
  ).toBeFalsy();

  const webMercatorOptions = {width: 800, height: 600, longitude: 0, latitude: 20, zoom: 10};
  const currentMeterSizes = new WebMercatorViewport(webMercatorOptions);
  const legacyMeterSizes = new WebMercatorViewport({
    ...webMercatorOptions,
    legacyMeterSizes: true
  });
  const matchingLegacyMeterSizes = new WebMercatorViewport({
    ...webMercatorOptions,
    legacyMeterSizes: true
  });
  expect(
    currentMeterSizes.equals(legacyMeterSizes),
    'different meter projection modes are not equal'
  ).toBeFalsy();
  expect(
    legacyMeterSizes.equals(currentMeterSizes),
    'meter projection equality is symmetric'
  ).toBeFalsy();
  expect(
    legacyMeterSizes.equals(matchingLegacyMeterSizes),
    'matching legacy meter projection modes are equal'
  ).toBeTruthy();
});

test('Viewport.getScales', () => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new Viewport(vc.mapState);
    const distanceScales = viewport.getDistanceScales();
    expect(
      distanceScales.metersPerUnit && distanceScales.unitsPerMeter,
      'distanceScales defined'
    ).toBeTruthy();
  }
});

test('Viewport.containsPixel', () => {
  const viewport = new Viewport({x: 0, y: 0, width: 10, height: 10});

  expect(viewport.containsPixel({x: 5, y: 5}), 'pixel is inside').toBeTruthy();
  expect(viewport.containsPixel({x: 0, y: 0}), 'pixel is inside').toBeTruthy();
  expect(viewport.containsPixel({x: 10, y: 10}), 'pixel is outside').toBeFalsy();
  expect(
    viewport.containsPixel({x: -1, y: -1, width: 2, height: 2}),
    'rectangle overlaps'
  ).toBeTruthy();
  expect(
    viewport.containsPixel({x: -3, y: -3, width: 2, height: 2}),
    'rectangle is outside'
  ).toBeFalsy();
  expect(
    viewport.containsPixel({x: 9, y: 0, width: 2, height: 2}),
    'rectangle overlaps'
  ).toBeTruthy();
  expect(
    viewport.containsPixel({x: 0, y: 9, width: 2, height: 2}),
    'rectangle overlaps'
  ).toBeTruthy();
  expect(
    viewport.containsPixel({x: 11, y: 11, width: 2, height: 2}),
    'rectangle is outside'
  ).toBeFalsy();
});

test('Viewport.getFrustumPlanes', () => {
  const CULLING_TEST_CASES = [
    {
      pixels: [400, 300, 0],
      result: null
    },
    {
      pixels: [799, 1, 0],
      result: null
    },
    {
      pixels: [1, 599, 0],
      result: null
    },
    {
      pixels: [799, 599, 0],
      result: null
    },
    {
      pixels: [1, 1, 0],
      result: null
    },
    {
      pixels: [-1, 300, 0],
      result: 'left'
    },
    {
      pixels: [801, 300, 0],
      result: 'right'
    },
    {
      pixels: [400, -1, 0],
      result: 'top'
    },
    {
      pixels: [400, 601, 0],
      result: 'bottom'
    },
    {
      pixels: [400, 300, -1.01],
      result: 'near'
    },
    {
      pixels: [400, 301, 1.01],
      result: 'far'
    }
  ];

  // TODO - fix first person viewport
  for (const vc of TEST_VIEWPORTS.slice(0, 2)) {
    console.log(vc.id);
    const viewport = new Viewport(vc);
    const planes = viewport.getFrustumPlanes();

    for (const side in planes) {
      const plane = planes[side];
      expect(Number.isFinite(plane.distance), 'distance is defined').toBeTruthy();
      expect(vecNormalized(plane.normal), 'normal is defined').toBeTruthy();
    }

    expect(viewport.getFrustumPlanes(), 'frustum planes are cached').toBe(planes);

    for (const tc of CULLING_TEST_CASES) {
      const lngLat = viewport.unproject(tc.pixels);
      const commonPosition = viewport.projectPosition(lngLat);
      const culledDirs = getCulling(commonPosition, planes);
      if (tc.result) {
        expect(
          culledDirs && culledDirs.includes(tc.result),
          `point culled (${tc.result})`
        ).toBeTruthy();
      } else {
        expect(culledDirs, 'point not culled').toBe(null);
      }
    }
  }
});

function getCulling(p, planes) {
  const outDirs = [];
  p = new Vector3(p);
  for (const dir in planes) {
    const plane = planes[dir];
    if (p.dot(plane.normal) > plane.distance) {
      outDirs.push(dir);
    }
  }
  return outDirs.length ? outDirs : null;
}
