// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

import {COORDINATE_SYSTEM, WebMercatorViewport, OrbitViewport, project} from '@deck.gl/core';
import {project64} from '@deck.gl/extensions';

const TEST_VIEWPORTS = {
  map: new WebMercatorViewport({
    width: 800,
    height: 600,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11,
    bearing: -30,
    pitch: 40
  }),
  mapHighZoom: new WebMercatorViewport({
    width: 800,
    height: 600,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 13,
    bearing: -30,
    pitch: 40
  }),
  infoVis: new OrbitViewport({
    width: 800,
    height: 600,
    rotationX: -30,
    rotationOrbit: 40,
    target: [10.285714285714, -3.14159265359, 0],
    zoom: 8
  })
};

const UNIFORMS = {
  // Projection mode values
  coordinateSystem: Number,
  center: Array,

  // Screen size
  viewportSize: Array,
  devicePixelRatio: Number,

  // Distance at which screen pixels are projected
  focalDistance: Number,
  commonUnitsPerWorldUnit: Array,
  scale: Number, // This is the mercator scale (2 ** zoom)

  modelMatrix: Array,
  viewProjectionMatrix: Array,

  // This is for lighting calculations
  cameraPosition: Array
};

// 64 bit support
const UNIFORMS_64 = {
  project_uViewProjectionMatrixFP64: Array,
  project64_uViewProjectionMatrix: Array,
  project64_uScale: Number
};

const EPSILON = 1e-4;

function getUniformsError(uniforms, formats) {
  for (const name in UNIFORMS) {
    const value = uniforms[name];
    const type = formats[name];
    if (type === Number && !Number.isFinite(value)) {
      return `${name} is not a number`;
    }
    if (type === Array && !value.length) {
      return `${name} is not an array`;
    }
  }
  return null;
}

test('project#getUniforms', () => {
  let uniforms = project.getUniforms({viewport: TEST_VIEWPORTS.map});
  expect(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated').toBeFalsy();
  expect(uniforms.center, 'Returned zero projection center').toEqual([0, 0, 0, 0]);

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.map,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
  expect(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated').toBeFalsy();
  expect(uniforms.center, 'Returned zero projection center').toEqual([0, 0, 0, 0]);

  uniforms = project.getUniforms({viewport: TEST_VIEWPORTS.mapHighZoom});
  expect(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated').toBeFalsy();
  expect(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  ).toBeTruthy();
  expect(
    Math.abs(uniforms.center[0]) < EPSILON && Math.abs(uniforms.center[1]) < EPSILON,
    'project center at center of clipspace'
  ).toBeTruthy();
  expect(uniforms.coordinateOrigin, 'Returned shader coordinate origin').toEqual([
    -122.42694091796875, 37.75153732299805, 0
  ]);
  expect(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  ).toBeTruthy();

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.mapHighZoom,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: Object.freeze([-122.4, 37.7])
  });
  expect(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated').toBeFalsy();
  expect(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  ).toBeTruthy();

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.mapHighZoom,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
  expect(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated').toBeFalsy();
  expect(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  ).toBeTruthy();
  // CARTESIAN + WEB_MERCATOR_AUTO_OFFSET is rounded in the common space
  expect(
    Math.abs(uniforms.center[0]) < EPSILON * 10 && Math.abs(uniforms.center[1]) < EPSILON * 10,
    'project center at center of clipspace'
  ).toBeTruthy();
  expect(
    uniforms.commonUnitsPerWorldUnit[0] === 1 && uniforms.commonUnitsPerWorldUnit[1] === 1,
    'Returned correct distanceScales'
  ).toBeTruthy();

  uniforms = project.getUniforms({
    viewport: TEST_VIEWPORTS.infoVis,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
  expect(getUniformsError(uniforms, UNIFORMS), 'Uniforms validated').toBeFalsy();
  expect(uniforms.coordinateOrigin, 'Returned shader coordinate origin').toEqual([
    10.285714149475098, -3.1415927410125732, 0
  ]);
  expect(
    uniforms.center.some(x => x),
    'Returned non-trivial projection center'
  ).toBeTruthy();
});

test('project64#getUniforms', () => {
  const viewport = TEST_VIEWPORTS.map;
  const uniforms = project.getUniforms({viewport});
  const uniforms64 = project64.getUniforms({viewport}, uniforms);

  expect(getUniformsError(uniforms64, UNIFORMS_64), 'Uniforms validated').toBeFalsy();
});
