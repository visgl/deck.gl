// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  _CustomProjectionViewport as CustomProjectionViewport,
  WebMercatorViewport,
  project
} from '@deck.gl/core';
import {projectPosition} from '@deck.gl/core/shaderlib/project/project-functions';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {projectionEngine} from '@math.gl/geospatial/projection';
import {createTestViewport} from '../../viewports/test-crs';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';

// WGS84 ellipsoid
const SEMI_MAJOR_AXIS = 6378137;
const ECCENTRICITY_SQUARED = 6.69437999014e-3;
const DEGREES_TO_RADIANS = Math.PI / 180;

/** WGS84 longitude/latitude of a point given in the east/north tangent plane of `origin`. */
function addMetersOnEllipsoid(origin: number[], east: number, north: number): [number, number] {
  const lat = origin[1] * DEGREES_TO_RADIANS;
  const lng = origin[0] * DEGREES_TO_RADIANS;
  const n = SEMI_MAJOR_AXIS / Math.sqrt(1 - ECCENTRICITY_SQUARED * Math.sin(lat) ** 2);
  const x0 = n * Math.cos(lat) * Math.cos(lng);
  const y0 = n * Math.cos(lat) * Math.sin(lng);
  const z0 = n * (1 - ECCENTRICITY_SQUARED) * Math.sin(lat);
  const x = x0 - Math.sin(lng) * east - Math.sin(lat) * Math.cos(lng) * north;
  const y = y0 + Math.cos(lng) * east - Math.sin(lat) * Math.sin(lng) * north;
  const z = z0 + Math.cos(lat) * north;
  const p = Math.hypot(x, y);
  let phi = Math.atan2(z, p * (1 - ECCENTRICITY_SQUARED));
  for (let i = 0; i < 10; i++) {
    const nn = SEMI_MAJOR_AXIS / Math.sqrt(1 - ECCENTRICITY_SQUARED * Math.sin(phi) ** 2);
    phi = Math.atan2(z + ECCENTRICITY_SQUARED * nn * Math.sin(phi), p);
  }
  return [Math.atan2(y, x) / DEGREES_TO_RADIANS, phi / DEGREES_TO_RADIANS];
}

// UTM zone 32N. The origin is 2.5 degrees east of the central meridian (9 E),
// where the grid convergence is 2.165 degrees.
const crs = await projectionEngine.getCRS('EPSG:32632');
const origin: [number, number, number] = [11.5, 60, 0];
const viewport = new CustomProjectionViewport({
  crs,
  center: origin,
  zoom: 12,
  width: 800,
  height: 600
});
const metersPerCommonUnit = 1 / viewport.distanceScales.unitsPerWorldUnit[0];
const gpuTest = device.type === 'webgl' ? test : test.skip;

// A translation and a non-uniform scale do not commute with the rotation of the
// grid convergence: [x, y] -> [2x + 300, y / 2 - 200]
const MODEL_MATRIX = new Matrix4().translate([300, -200, 0]).scale([2, 0.5, 1]);

const TEST_CASES: {
  title: string;
  position: [number, number, number];
  /** Low part of a 64-bit position; the GPU adds it to `position` */
  positionLow?: [number, number, number];
  modelMatrix?: Matrix4;
  /** Expected east/north meters from the origin */
  expected: [number, number];
}[] = [
  {title: '1 km north', position: [0, 1000, 0], expected: [0, 1000]},
  {title: '10 km north', position: [0, 10000, 0], expected: [0, 10000]},
  {title: '1 km east', position: [1000, 0, 0], expected: [1000, 0]},
  {title: '10 km east', position: [10000, 0, 0], expected: [10000, 0]},
  {title: '5 km south-west', position: [-3000, -4000, 0], expected: [-3000, -4000]},
  {
    title: 'modelMatrix applies in meter space',
    position: [1000, 4000, 0],
    modelMatrix: MODEL_MATRIX,
    expected: [2300, 1800]
  },
  {
    title: 'low part of a 64-bit position',
    position: [1000, 0, 0],
    positionLow: [0, 2000, 0],
    expected: [1000, 2000]
  },
  {
    title: 'low part of a 64-bit position with modelMatrix',
    position: [1000, 0, 0],
    positionLow: [0, 4000, 0],
    modelMatrix: MODEL_MATRIX,
    expected: [2300, 1800]
  }
];

/** Distance in meters between a common-space position and the true position of an offset */
function getErrorMeters(actual: ArrayLike<number>, expected: [number, number]): number {
  const truth = viewport.projectPosition(addMetersOnEllipsoid(origin, expected[0], expected[1]));
  return Math.hypot(actual[0] - truth[0], actual[1] - truth[1]) * metersPerCommonUnit;
}

test('project#meter-offsets follow the grid convergence of a custom projection (CPU)', () => {
  const east = viewport.projectPosition(addMetersOnEllipsoid(origin, 1, 0));
  const center = viewport.projectPosition(origin);
  const convergence = Math.atan2(east[1] - center[1], east[0] - center[0]) / DEGREES_TO_RADIANS;
  expect(Math.abs(convergence), 'origin is away from the central meridian').toBeGreaterThan(2);

  for (const {title, position, positionLow, modelMatrix = null, expected} of TEST_CASES) {
    // The CPU path has no low part
    if (positionLow) continue;
    const actual = projectPosition(position, {
      viewport,
      coordinateSystem: 'meter-offsets',
      coordinateOrigin: origin,
      sourceCrs: null,
      modelMatrix,
      autoOffset: false
    });
    // A local linear model is within 1/1000 of the offset length at this distance
    expect(getErrorMeters(actual, expected) / Math.hypot(...expected), title).toBeLessThan(0.001);
  }
});

gpuTest(
  'project#meter-offsets follow the grid convergence of a custom projection (GPU)',
  async () => {
    for (const {
      title,
      position,
      positionLow = [0, 0, 0],
      modelMatrix = null,
      expected
    } of TEST_CASES) {
      const actual = await runOnGPU({
        vs: `#version 300 es
        out vec3 result;
        void main() { result = project_position(test.uPos, test.uPos64Low) + project.commonOrigin; }`,
        modules: [project, testUniforms],
        vertexCount: 1,
        varying: 'result',
        shaderInputProps: {
          project: {
            viewport,
            coordinateSystem: 'meter-offsets',
            coordinateOrigin: origin,
            modelMatrix
          },
          test: {uPos: position, uPos64Low: positionLow}
        }
      });
      expect(getErrorMeters(actual, expected) / Math.hypot(...expected), title).toBeLessThan(0.001);
    }
  }
);

test('project#meter-offsets use the per-axis scale where the Jacobian is unavailable', () => {
  // East is undefined at the pole
  const coordinateOrigin: [number, number, number] = [0, 90, 0];
  const testViewport = createTestViewport({center: [0, 0, 0]});
  const {unitsPerMeter} = testViewport.getDistanceScales(coordinateOrigin);
  const props = {
    viewport: testViewport,
    coordinateSystem: 'meter-offsets' as const,
    coordinateOrigin
  };
  const anchor = testViewport.projectPosition(coordinateOrigin);
  const actual = projectPosition([1000, 2000, 0], {
    ...props,
    sourceCrs: null,
    modelMatrix: null,
    autoOffset: false
  });
  expect(actual[0]).toBeCloseTo(anchor[0] + 1000 * unitsPerMeter[0], 9);
  expect(actual[1]).toBeCloseTo(anchor[1] + 2000 * unitsPerMeter[1], 9);
  expect(project.getUniforms(props).modelMatrix, 'modelMatrix is unchanged').toEqual(
    new Matrix4().toArray()
  );
});

test('project#meter-offsets use the per-axis scale where the projection wraps', async () => {
  // East and west of the antimeridian project to opposite edges of the map
  const coordinateOrigin: [number, number, number] = [180, 0, 0];
  const seamViewport = new CustomProjectionViewport({
    crs: await projectionEngine.getCRS('EPSG:3857'),
    center: [179, 0, 0],
    zoom: 12,
    width: 800,
    height: 600
  });
  const targetOrigin = seamViewport.crs.converter.WGS84.from(coordinateOrigin);
  const {unitsPerMeter} = seamViewport.getDistanceScales(targetOrigin);
  const props = {
    viewport: seamViewport,
    coordinateSystem: 'meter-offsets' as const,
    coordinateOrigin
  };
  const anchor = seamViewport.projectPosition(coordinateOrigin);
  const actual = projectPosition([-1000, 2000, 0], {
    ...props,
    sourceCrs: null,
    modelMatrix: null,
    autoOffset: false
  });
  expect(actual[0]).toBeCloseTo(anchor[0] - 1000 * unitsPerMeter[0], 9);
  expect(actual[1]).toBeCloseTo(anchor[1] + 2000 * unitsPerMeter[1], 9);
  expect(project.getUniforms(props).modelMatrix, 'modelMatrix is unchanged').toEqual(
    new Matrix4().toArray()
  );
});

test('project#meter-offsets leave the model matrix of a WebMercatorViewport unchanged', () => {
  const uniforms = project.getUniforms({
    viewport: new WebMercatorViewport({
      longitude: origin[0],
      latitude: origin[1],
      zoom: 12,
      width: 800,
      height: 600
    }),
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: origin,
    modelMatrix: MODEL_MATRIX
  });
  expect(uniforms.modelMatrix).toBe(MODEL_MATRIX);
});
