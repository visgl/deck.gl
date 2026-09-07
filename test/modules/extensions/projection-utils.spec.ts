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
          expect(Math.hypot(sphere[0], sphere[1], sphere[2])).toBeCloseTo(256, 3);
          // ...while the flat helper yields absolute Mercator common space
          const flat = projectToFlatCommon(layer, POSITION);
          const [x, y] = lngLatToMercatorCommon(POSITION);
          expect(flat[0]).toBeCloseTo(x, 6);
          expect(flat[1]).toBeCloseTo(y, 6);
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
