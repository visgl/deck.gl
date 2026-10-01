// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  COORDINATE_SYSTEM,
  OrthographicViewport,
  WebMercatorViewport,
  _GlobeViewport as GlobeViewport,
  project
} from '@deck.gl/core';
import type {ProjectUniforms} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {
  getFlatCommonOrigin,
  isFlatViewport,
  lngLatToMercatorCommon,
  projectBoundsToFlatCommon,
  projectToFlatCommon
} from '@deck.gl/extensions/utils/projection-utils';

const SF = {longitude: -122.42694203247012, latitude: 37.751537058389985};
const SIZE = {width: 800, height: 450};
const POSITION = [-122.43, 37.75, 0];

const mercatorViewport = new WebMercatorViewport({...SF, ...SIZE, zoom: 11.5});
// zoom >= 12 switches the shader to WEB_MERCATOR_AUTO_OFFSET (offset-relative common space)
const mercatorHighZoomViewport = new WebMercatorViewport({...SF, ...SIZE, zoom: 14});
const globeViewport = new GlobeViewport({...SF, ...SIZE, zoom: 11.5});
const orthographicViewport = new OrthographicViewport({...SIZE, target: [0, 0, 0], zoom: 0});

test('projection-utils#isFlatViewport', () => {
  expect(isFlatViewport(mercatorViewport)).toBe(true);
  expect(isFlatViewport(mercatorHighZoomViewport)).toBe(true);
  expect(isFlatViewport(orthographicViewport)).toBe(true);
  expect(isFlatViewport(globeViewport)).toBe(false);
});

test('projection-utils#getFlatCommonOrigin', () => {
  // Under GLOBE the flat space is absolute Mercator: never re-add commonOrigin, which for
  // meter-offsets on the globe holds a sphere-space position
  const globeUniforms = project.getUniforms({
    viewport: globeViewport,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [-122.43, 37.75, 0]
  }) as ProjectUniforms;
  expect(getFlatCommonOrigin(globeUniforms, globeViewport)).toEqual([0, 0]);

  // Under WEB_MERCATOR_AUTO_OFFSET the flat space is offset-relative, like geometry.position
  const mercatorUniforms = project.getUniforms({
    viewport: mercatorHighZoomViewport,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    coordinateOrigin: [0, 0, 0]
  }) as ProjectUniforms;
  expect(mercatorUniforms.commonOrigin[0]).not.toBe(0);
  expect(getFlatCommonOrigin(mercatorUniforms, mercatorHighZoomViewport)).toEqual([
    mercatorUniforms.commonOrigin[0],
    mercatorUniforms.commonOrigin[1]
  ]);
});

test('projection-utils#projectToFlatCommon pairs with project_common_position_to_flat', () => {
  testLayer({
    Layer: ScatterplotLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'GlobeViewport: absolute Mercator',
        viewport: globeViewport,
        props: {data: [POSITION], getPosition: d => d},
        onAfterUpdate: ({layer}) => {
          // The layer's own projection is sphere XYZ (radius GLOBE_RADIUS = 256)...
          const sphere = layer.projectPosition(POSITION);
          expect(Math.hypot(sphere[0], sphere[1], sphere[2])).toBeCloseTo(256, 12);
          // ...while the flat helper yields absolute Mercator common space
          const flat = projectToFlatCommon(layer, POSITION);
          const [x, y] = lngLatToMercatorCommon(POSITION);
          expect(flat[0]).toBeCloseTo(x, 12);
          expect(flat[1]).toBeCloseTo(y, 12);
        }
      },
      {
        title: 'WebMercatorViewport zoom 14: offset-relative like geometry.position',
        viewport: mercatorHighZoomViewport,
        updateProps: {radiusScale: 2},
        onAfterUpdate: ({layer}) => {
          const flat = projectToFlatCommon(layer, POSITION);
          expect(flat).toEqual(layer.projectPosition(POSITION));
          expect(flat).not.toEqual(layer.projectPosition(POSITION, {autoOffset: false}));
        }
      },
      {
        title: 'OrthographicViewport: cartesian identity',
        viewport: orthographicViewport,
        updateProps: {coordinateSystem: COORDINATE_SYSTEM.CARTESIAN, data: [[10, -20, 0]]},
        onAfterUpdate: ({layer}) => {
          expect(projectToFlatCommon(layer, [10, -20, 0])).toEqual([10, -20, 0]);
          // corners are re-ordered into min/max bounds
          expect(projectBoundsToFlatCommon(layer, [10, 20, -10, -20])).toEqual([-10, -20, 10, 20]);
        }
      }
    ]
  });
});

test('projection-utils#projectToFlatCommon mirrors the globe METER_OFFSETS shader branch', () => {
  const coordinateOrigin: [number, number, number] = [-122.43, 37.75, 0];
  // 300 km east, 200 km south: large enough for the tangent-plane (shader) and the lng/lat
  // (Layer.projectPosition) paths to disagree by hundreds of meters
  const offset = [300000, -200000, 0];

  testLayer({
    Layer: ScatterplotLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'GlobeViewport: ENU displacement on the sphere, then Mercator',
        viewport: globeViewport,
        props: {
          data: [offset],
          getPosition: d => d,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin
        },
        onAfterUpdate: ({layer}) => {
          // Emulate project_position() under PROJECTION_MODE_GLOBE + COORDINATE_SYSTEM_METER_OFFSETS
          const uniforms = project.getUniforms({
            viewport: globeViewport,
            coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
            coordinateOrigin
          }) as ProjectUniforms;
          const origin = Array.from(uniforms.commonOrigin);
          const uz = normalize(origin);
          const ux = normalize([uz[1], -uz[0], 0]);
          const uy = cross(uz, ux);
          const metersToCommon = 256 / 6370972;
          const sphere = origin.map(
            (o, i) =>
              o + (ux[i] * -offset[0] + uy[i] * -offset[1] + uz[i] * offset[2]) * metersToCommon
          );
          // project_globe_to_mercator_
          const expected = lngLatToMercatorCommon(globeViewport.unprojectPosition(sphere));

          const flat = projectToFlatCommon(layer, offset);
          expect(flat[0]).toBeCloseTo(expected[0], 12);
          expect(flat[1]).toBeCloseTo(expected[1], 12);

          // The lng/lat route is not the shader's twin at this distance
          const viaLngLat = layer.projectPosition(offset, {
            viewport: new WebMercatorViewport({width: 1, height: 1, zoom: 0}),
            autoOffset: false
          });
          const metersPerCommonUnit = 40075017 / 512;
          const divergenceMeters =
            Math.hypot(viaLngLat[0] - expected[0], viaLngLat[1] - expected[1]) *
            metersPerCommonUnit;
          expect(divergenceMeters).toBeGreaterThan(50);
        }
      }
    ]
  });
});

test('projection-utils#projectBoundsToFlatCommon unwraps bounds across the antimeridian', () => {
  testLayer({
    Layer: ScatterplotLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        title: 'GlobeViewport',
        viewport: globeViewport,
        props: {data: [POSITION], getPosition: d => d},
        onAfterUpdate: ({layer}) => {
          const [x170] = lngLatToMercatorCommon([170, 0]);
          const [xMinus170] = lngLatToMercatorCommon([-170, 0]);
          // left edge east of the right edge: the right edge is one world width further on
          const crossing = projectBoundsToFlatCommon(layer, [170, -20, -170, 20]);
          expect(crossing[0]).toBeCloseTo(x170, 12);
          expect(crossing[2]).toBeCloseTo(xMinus170 + 512, 12);
          expect(crossing[2] - crossing[0]).toBeCloseTo((20 / 360) * 512, 12);
          // ordinary bounds are untouched
          const plain = projectBoundsToFlatCommon(layer, [-170, -20, 170, 20]);
          expect(plain[0]).toBeCloseTo(xMinus170, 12);
          expect(plain[2]).toBeCloseTo(x170, 12);
          // edges less than 180° apart in the wrong order are re-ordered, not unwrapped
          const [x10] = lngLatToMercatorCommon([10, 0]);
          const [x20] = lngLatToMercatorCommon([20, 0]);
          const reversed = projectBoundsToFlatCommon(layer, [20, 20, 10, -20]);
          expect(reversed[0]).toBeCloseTo(x10, 12);
          expect(reversed[2]).toBeCloseTo(x20, 12);
        }
      },
      {
        title: 'WebMercatorViewport',
        viewport: mercatorViewport,
        onAfterUpdate: ({layer}) => {
          const crossing = projectBoundsToFlatCommon(layer, [170, -20, -170, 20]);
          expect(crossing[2] - crossing[0]).toBeCloseTo((20 / 360) * 512, 12);
        }
      }
    ]
  });
});

function normalize(v: number[]): number[] {
  const length = Math.hypot(v[0], v[1], v[2]);
  return v.map(c => c / length);
}

function cross(a: number[], b: number[]): number[] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
