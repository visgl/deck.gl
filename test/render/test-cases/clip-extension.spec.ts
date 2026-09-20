// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {ClipExtension} from '@deck.gl/extensions';
import {points, polygons} from 'deck.gl-test/data';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {expandViewMatrix} from '../view-presets';
import type {TestCase} from '../deck-test-utils';

/** A rectangle from 150°E across the antimeridian to 150°W (written as 210°), 30°S to 30°N */
const ANTIMERIDIAN_POLYGON = [
  [
    [150, -30],
    [150, 30],
    [210, 30],
    [210, -30]
  ]
];
/** Left edge east of the right edge: the bounds cross the antimeridian */
const ANTIMERIDIAN_CLIP_BOUNDS: [number, number, number, number] = [170, -20, -170, 20];
const ANTIMERIDIAN_VIEW_STATE = {longitude: 180, latitude: 0, zoom: 1.6};

/** lng/lat rectangle inside the shared San Francisco view; converted per preset via `toBounds` */
const CLIP_BOUNDS: [number, number, number, number] = [-122.47, 37.73, -122.39, 37.78];

// Only the globe preset needs a looser threshold: the sphere is tessellated, so edges that
// follow parallels/meridians are not pixel-identical to the flat presets
const GLOBE_OVERRIDES = {
  globe: {skip: ['webgpu'], imageDiffOptions: {threshold: 0.985}}
};

const testCases: TestCase[] = [
  // Geometry (fragment shader) mode: polygons are trimmed at the bounds
  ...expandViewMatrix(
    {
      name: 'clip-geometry',
      layers: ({coordinateSystem, toPosition, toBounds}) => [
        new PolygonLayer({
          id: 'clip-geometry',
          data: polygons,
          coordinateSystem,
          // each entry is a list of rings
          getPolygon: f => f.map(ring => ring.map(toPosition)),
          getFillColor: [200, 0, 0],
          stroked: false,
          clipBounds: toBounds(CLIP_BOUNDS),
          clipByInstance: false,
          extensions: [new ClipExtension()]
        })
      ],
      overrides: GLOBE_OVERRIDES
    },
    ['map', 'globe', 'orthographic']
  ),
  // Instance (vertex shader) mode: whole points are shown/hidden by their anchor
  ...expandViewMatrix(
    {
      name: 'clip-instance',
      layers: ({coordinateSystem, toPosition, toBounds}) => [
        new ScatterplotLayer({
          id: 'clip-instance',
          data: points,
          coordinateSystem,
          getPosition: d => toPosition(d.COORDINATES),
          getFillColor: [0, 0, 200],
          getRadius: 4,
          radiusUnits: 'pixels',
          clipBounds: toBounds(CLIP_BOUNDS),
          extensions: [new ClipExtension()]
        })
      ],
      overrides: GLOBE_OVERRIDES
    },
    ['map', 'globe', 'orthographic']
  ),
  /**
   * MapView (left half) and GlobeView (right half), both centred on the antimeridian. A red
   * rectangle spanning 150°E to 150°W is clipped by bounds that also cross 180°.
   * Expected: one red rectangle 20° wide and 40° tall in the middle of each half, nothing else.
   */
  {
    name: 'clip-geometry-antimeridian-map-vs-globe',
    views: [
      new MapView({id: 'map', width: '50%'}),
      new GlobeView({id: 'globe', x: '50%', width: '50%'})
    ],
    viewState: {map: ANTIMERIDIAN_VIEW_STATE, globe: ANTIMERIDIAN_VIEW_STATE},
    layers: [
      new PolygonLayer({
        id: 'clip-geometry-antimeridian',
        data: ANTIMERIDIAN_POLYGON,
        getPolygon: d => d,
        getFillColor: [200, 0, 0],
        stroked: false,
        clipBounds: ANTIMERIDIAN_CLIP_BOUNDS,
        clipByInstance: false,
        extensions: [new ClipExtension()]
      })
    ],
    imageDiffOptions: {threshold: 0.985},
    goldenImage: './test/render/golden-images/clip-geometry-antimeridian-map-vs-globe.png'
  }
];

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases, deviceType);
});
