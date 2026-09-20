// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {ClipExtension} from '@deck.gl/extensions';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {SF_VIEW_STATE, expandViewMatrix} from '../view-presets';
import type {TestCase} from '../deck-test-utils';

/**
 * ClipExtension render cases. Every case draws a regular grid so that the effect of the bounds is
 * obvious at a glance:
 *
 * - `clip-geometry`: a 7 x 4 grid of red squares clipped by geometry (`clipByInstance: false`).
 *   The bounds run through the second and sixth columns and through the first and last rows.
 *   Expected: 5 columns x 4 rows of squares, with the outer columns and rows cut to about 60% of
 *   a square along a straight edge, and nothing outside the bounds.
 * - `clip-instance`: the same grid drawn as blue dots at the square centres, clipped by anchor
 *   (`clipByInstance: true`). Expected: 5 columns x 4 rows of whole dots, no partial dots, and
 *   nothing outside the bounds (the two outer columns are hidden).
 * - `clip-geometry-antimeridian-map-vs-globe`: MapView (left half) and GlobeView (right half),
 *   both centred on the antimeridian. A red rectangle spanning 150°E to 150°W is clipped by bounds
 *   that also cross 180°. Expected: one red rectangle 20° wide and 40° tall in the middle of each
 *   half, nothing else.
 *
 * The map, globe and orthographic variants of the grid cases show the same picture. On the globe
 * the clip edges follow parallels and meridians, which is where the flat bounds are evaluated.
 */

const COLUMNS = 7;
const ROWS = 4;
/** Grid spacing and square size in degrees; about 99 px per cell at the shared zoom 11.5 */
const CELL: [number, number] = [0.024, 0.019];
const SQUARE: [number, number] = [0.018, 0.014];
const GRID_CENTER: [number, number] = [SF_VIEW_STATE.longitude, SF_VIEW_STATE.latitude];

const GRID_SQUARES: number[][][] = [];
const GRID_CENTERS: number[][] = [];
for (let column = 0; column < COLUMNS; column++) {
  for (let row = 0; row < ROWS; row++) {
    const x = GRID_CENTER[0] + (column - (COLUMNS - 1) / 2) * CELL[0];
    const y = GRID_CENTER[1] + (row - (ROWS - 1) / 2) * CELL[1];
    const [halfWidth, halfHeight] = [SQUARE[0] / 2, SQUARE[1] / 2];
    GRID_SQUARES.push([
      [x - halfWidth, y - halfHeight],
      [x + halfWidth, y - halfHeight],
      [x + halfWidth, y + halfHeight],
      [x - halfWidth, y + halfHeight]
    ]);
    GRID_CENTERS.push([x, y]);
  }
}

/**
 * Just outside the centres of the second and sixth columns and of the first and last rows: those
 * squares are cut, their centre dots are kept, and the outermost columns are excluded entirely.
 */
const CLIP_BOUNDS: [number, number, number, number] = [
  GRID_CENTER[0] - 2 * CELL[0] - 0.002,
  GRID_CENTER[1] - 1.5 * CELL[1] - 0.0015,
  GRID_CENTER[0] + 2 * CELL[0] + 0.002,
  GRID_CENTER[1] + 1.5 * CELL[1] + 0.0015
];

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

// Only the globe preset needs a looser threshold: the sphere is tessellated, so edges that
// follow parallels/meridians are not pixel-identical to the flat presets
const GLOBE_OVERRIDES = {
  globe: {skip: ['webgpu'], imageDiffOptions: {threshold: 0.985}}
};

const testCases: TestCase[] = [
  ...expandViewMatrix(
    {
      name: 'clip-geometry',
      layers: ({coordinateSystem, toPosition, toBounds}) => [
        new PolygonLayer({
          id: 'clip-geometry',
          data: GRID_SQUARES,
          coordinateSystem,
          getPolygon: square => square.map(toPosition),
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
  ...expandViewMatrix(
    {
      name: 'clip-instance',
      layers: ({coordinateSystem, toPosition, toBounds}) => [
        new ScatterplotLayer({
          id: 'clip-instance',
          data: GRID_CENTERS,
          coordinateSystem,
          getPosition: center => toPosition(center),
          getFillColor: [0, 0, 200],
          getRadius: 14,
          radiusUnits: 'pixels',
          clipBounds: toBounds(CLIP_BOUNDS),
          clipByInstance: true,
          extensions: [new ClipExtension()]
        })
      ],
      overrides: GLOBE_OVERRIDES
    },
    ['map', 'globe', 'orthographic']
  ),
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
