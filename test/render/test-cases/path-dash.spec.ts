// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {COORDINATE_SYSTEM, MapView, OrthographicView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';

/**
 * Dash rendering matrix for PathStyleExtension.
 *
 * Many images stack several horizontal strips. In the segment-density cases, every strip
 * draws the same straight line, but builds it from a different number of pieces. Imagine
 * drawing one line with one long ruler, then drawing it again with many short rulers:
 *
 * - `path-dash-density-default`: each piece starts the dash pattern over. Rows made from
 *   different numbers of pieces are therefore expected to look different.
 * - `path-dash-density-justified`: each piece still starts over, but its dashes and gaps are
 *   adjusted to fit that piece evenly. Rows with different piece lengths may look different.
 * - `path-dash-density-high-precision`: one measurement runs along the entire line instead
 *   of starting over at each piece. All rows should show the same dash pattern.
 * - `path-dash-density-rounded`: uses the same per-piece pattern as the default case, with
 *   rounded dash ends and path joints. It shows that rounding remains well formed as the
 *   number of pieces changes.
 *
 * The golden images are the expected output. Comments beside the remaining cases explain
 * what each image is meant to show and which differences between rows are intentional.
 */

const STRIP_LENGTH = 720;
const STRIP_SPACING = 62;

/**
 * World Y for strip `index` of `count`, laid out so that index 0 appears at the *top* of the
 * image. `OrthographicView` defaults to `flipY: true`, so screen-down is world-up.
 */
function getStripY(index: number, count: number): number {
  return -((count - 1) * STRIP_SPACING) / 2 + index * STRIP_SPACING;
}

/** A horizontal line of `length`, split into `segments` equal collinear pieces. */
function createStraightPath(
  segments: number,
  verticalPosition: number,
  length: number = STRIP_LENGTH
): number[][] {
  const path: number[][] = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    path.push([-length / 2 + (length * pointIndex) / segments, verticalPosition]);
  }
  return path;
}

/** A circle approximated by `segments` short chords - the reported dense-polyline failure. */
function createCirclePath(radius: number, segments: number, center: number[] = [0, 0]): number[][] {
  const path: number[][] = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    const angle = (pointIndex / segments) * 2 * Math.PI;
    path.push([center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)]);
  }
  return path;
}

/** A sawtooth with sharp corners, to exercise joints and miters under dashing. */
function createZigzagPath(
  segments: number,
  verticalPosition: number,
  amplitude: number = 22
): number[][] {
  const path: number[][] = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    path.push([
      -STRIP_LENGTH / 2 + (STRIP_LENGTH * pointIndex) / segments,
      verticalPosition + (pointIndex % 2 === 0 ? -amplitude : amplitude)
    ]);
  }
  return path;
}

/** A straight line at `angleDegrees`, split into equal collinear segments. */
function createDiagonalPath(
  segments: number,
  verticalPosition: number,
  angleDegrees: number = 27
): number[][] {
  const radians = (angleDegrees * Math.PI) / 180;
  const path: number[][] = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    const fraction = pointIndex / segments - 0.5;
    path.push([
      Math.cos(radians) * STRIP_LENGTH * fraction,
      verticalPosition + Math.sin(radians) * STRIP_LENGTH * fraction
    ]);
  }
  return path;
}

/**
 * A geographic line that climbs steadily in Z.
 *
 * The 3D render cases use an orthographic `MapView` at pitch 0. Elevation therefore changes
 * neither the line's position nor its scale on screen, so any difference between rows is
 * attributable to arclength alone. The elevated camera keeps the full path inside the clip
 * volume while retaining geographic coordinates and elevations in meters.
 */
function createClimbingPath(
  segments: number,
  zoom: number,
  offsetPixels: number,
  heightMeters: number
): number[][] {
  return createGeographicPath(segments, zoom, offsetPixels).map((point, index) => [
    point[0],
    point[1],
    (heightMeters * index) / segments
  ]);
}

const MAP_CENTER = [-122.4, 37.78];
const DASH_ELEVATION_ZOOM = 16;
const DASH_ELEVATION_HEIGHTS = [0, 300, 720, 900];
const DASH_ELEVATION_VIEW = new MapView({orthographic: true, altitude: 3});
const DASH_ELEVATION_VIEW_STATE = {
  longitude: MAP_CENTER[0],
  latitude: MAP_CENTER[1],
  zoom: DASH_ELEVATION_ZOOM,
  pitch: 0,
  bearing: 0
};
const DASH_ELEVATION_PITCHED_VIEW_STATE = {
  ...DASH_ELEVATION_VIEW_STATE,
  zoom: DASH_ELEVATION_ZOOM - 1,
  pitch: 45,
  bearing: 20
};

// Web Mercator at a given zoom is 512 * 2^zoom pixels around the world, so a degree of
// longitude is (512 * 2^zoom) / 360 pixels; a degree of latitude covers
// `1 / cos(latitude)` as much ground. The MapView cases size their geometry through these so
// that a case laid out at zoom 10 frames the same way as one at zoom 18 - a fixed degree span
// would put half the paths off screen.
function getLongitudePerPixel(zoom: number): number {
  return 360 / (512 * 2 ** zoom);
}
function getLatitudePerPixel(zoom: number): number {
  return getLongitudePerPixel(zoom) * Math.cos((MAP_CENTER[1] * Math.PI) / 180);
}

/**
 * A polyline in lng/lat spanning `spanPixels` horizontally, centred on `MAP_CENTER` and
 * offset vertically by `offsetPixels`, both measured at `zoom`.
 */
function createGeographicPath(
  segments: number,
  zoom: number,
  offsetPixels: number,
  spanPixels: number = 880
): number[][] {
  const span = spanPixels * getLongitudePerPixel(zoom);
  const latitude = MAP_CENTER[1] + offsetPixels * getLatitudePerPixel(zoom);
  const path: number[][] = [];
  for (let pointIndex = 0; pointIndex <= segments; pointIndex++) {
    path.push([MAP_CENTER[0] - span / 2 + (span * pointIndex) / segments, latitude]);
  }
  return path;
}

/**
 * Four billboarded paths in a perspective view:
 *
 * - `control` stays completely in front of the camera and provides the ordinary reference.
 * - `clippedEnd` starts in front of the camera and ends behind it.
 * - `clippedStart` starts behind the camera and ends in front of it.
 * - `subpixel` also crosses behind the camera, but uses dashes smaller than one pixel.
 *
 * The clipped paths should keep the same dash measurement as their hidden portions pass behind
 * the camera. Their visible ends should remain rounded, offsets should only move them sideways,
 * and the subpixel pattern should blend evenly. The fixed coordinates keep every visible end
 * inside the 800x450 image so these behaviors can be reviewed together.
 */
const CLIPPED_COMPOSITION_PATHS = {
  control: [
    [-122.4058975956, 37.7797300396, 307.2247788],
    [-122.4040545969, 37.7797300396, 307.2247788],
    [-122.3978815942, 37.7797300396, 307.2247788]
  ],
  clippedEnd: [
    [-122.4058975956, 37.779001709, 166.953558],
    [-122.4040545969, 37.779001709, 166.953558],
    [-122.3985675923, 37.7669494206, 801.5731104]
  ],
  clippedStart: [
    [-122.3985675923, 37.7672312217, 855.8369622],
    [-122.4040545969, 37.778200537, 12.6552152],
    [-122.4058975956, 37.778200537, 12.6552152]
  ],
  subpixel: [
    [-122.4058975956, 37.7774721913, -127.6160055],
    [-122.4040545969, 37.7774721913, -127.6160055],
    [-122.3985675923, 37.7674874036, 905.1677366]
  ]
};

function createElevationLayers(
  layerIdentifier: string,
  {billboard = false, antialiasing = false}: {billboard?: boolean; antialiasing?: boolean} = {}
): PathLayer[] {
  return DASH_ELEVATION_HEIGHTS.map(
    (heightMeters, index) =>
      new PathLayer({
        id: `${layerIdentifier}-${heightMeters}`,
        data: [createClimbingPath(40, DASH_ELEVATION_ZOOM, -getStripY(index, 4), heightMeters)],
        getPath: (path: number[][]) => path,
        billboard,
        antialiasing,
        widthUnits: 'pixels' as const,
        getWidth: 8,
        getColor: billboard ? [0, 90, 200] : [200, 0, 0],
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      })
  );
}

const CARTESIAN = {
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  getPath: (path: number[][]) => path,
  widthUnits: 'pixels' as const,
  getWidth: 10,
  getColor: [200, 0, 0] as [number, number, number]
};

const ORTHO_VIEW_STATE = {target: [0, 0, 0], zoom: 0};

/**
 * Draws one PathLayer per entry, all sharing `CARTESIAN` defaults. Each entry supplies its
 * own geometry and the props under test.
 */
function createStripLayers(layerId: string, entries: Record<string, any>[]): PathLayer[] {
  return entries.map(
    ({data, ...layerProperties}, index) =>
      new PathLayer({
        id: `${layerId}-${index}`,
        data,
        ...CARTESIAN,
        ...layerProperties
      })
  );
}

/** Segment counts that all render the same straight line. */
const SEGMENT_COUNTS = [1, 2, 4, 12, 40, 120];

function createSegmentDensityCase(name: string, dashProperties: Record<string, any>): TestCase {
  return {
    name,
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      name,
      SEGMENT_COUNTS.map((segments, index) => ({
        data: [createStraightPath(segments, getStripY(index, SEGMENT_COUNTS.length))],
        getDashArray: [4, 5],
        ...dashProperties
      }))
    ),
    goldenImage: `./test/render/golden-images/${name}.png`
  };
}

/**
 * Four paths that vary length, width, dash array and shape. Together they show that the dash
 * controls behave consistently across common path shapes and styling combinations.
 */
function createPathVariantsCase(name: string, layerProperties: Record<string, any>): TestCase {
  return {
    name,
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      name,
      [
        {
          data: [createStraightPath(40, getStripY(0, 4), 720)],
          getWidth: 6,
          getDashArray: [4, 5]
        },
        {
          data: [createStraightPath(40, getStripY(1, 4), 540)],
          getWidth: 12,
          getDashArray: [4, 5]
        },
        {
          data: [createZigzagPath(16, getStripY(2, 4), 14)],
          getWidth: 8,
          getDashArray: [3, 2]
        },
        {
          // Keep the diagonal within its row so it remains visually separate from the zigzag.
          data: [createDiagonalPath(40, getStripY(3, 4), 5)],
          getWidth: 16,
          getDashArray: [2, 3]
        }
      ].map(pathProperties => ({...pathProperties, ...layerProperties}))
    ),
    goldenImage: `./test/render/golden-images/${name}.png`
  };
}

/** Vertical spacing for comparing mode combinations on one unevenly divided path. */
const MODE_COMBINATION_ROW_SPACING = 96;

/** Unequal segment lengths that include runs shorter than the configured dash period. */
const MODE_COMBINATION_SEGMENT_LENGTHS = [260, 90, 210, 160];

const DASH_MODE_COMBINATIONS: {
  dashMode: 'segment' | 'path';
  dashJustified: boolean;
}[] = [
  {dashMode: 'segment', dashJustified: false},
  {dashMode: 'segment', dashJustified: true},
  {dashMode: 'path', dashJustified: false},
  {dashMode: 'path', dashJustified: true}
];

function createUnevenPath(verticalPosition: number): number[][] {
  const path: number[][] = [];
  let horizontalPosition = -STRIP_LENGTH / 2;
  path.push([horizontalPosition, verticalPosition]);
  for (const segmentLength of MODE_COMBINATION_SEGMENT_LENGTHS) {
    horizontalPosition += segmentLength;
    path.push([horizontalPosition, verticalPosition]);
  }
  return path;
}

function getModeCombinationVerticalPosition(index: number): number {
  return (
    -((DASH_MODE_COMBINATIONS.length - 1) * MODE_COMBINATION_ROW_SPACING) / 2 +
    index * MODE_COMBINATION_ROW_SPACING
  );
}

/** Vertical gap between the flat and billboard copies of a parity pair, in world units. */
const PARITY_OFFSET = 16;

/**
 * Same geometry drawn twice as adjacent stripes: flat in red, billboarded in blue, with
 * identical width and dash array. Parity is read off vertically - when the two modes agree
 * the dashes line up into columns, and any disagreement shows as drifting phase or a
 * different period between the two stripes. They are deliberately *not* drawn on top of one
 * another, since the upper layer would simply hide the discrepancy this case exists to
 * catch. Closed shapes can request a larger `parityOffset` so the two copies do not overlap.
 */
function billboardParityLayers(
  layerId: string,
  createPath: (verticalPosition: number) => number[][],
  verticalPosition: number,
  layerProperties: Record<string, any> = {},
  parityOffset: number = PARITY_OFFSET
): PathLayer[] {
  return [false, true].map(
    billboard =>
      new PathLayer({
        id: `${layerId}-${billboard ? 'billboard' : 'flat'}`,
        data: [createPath(verticalPosition + (billboard ? parityOffset : -parityOffset))],
        billboard,
        ...CARTESIAN,
        getColor: billboard ? [0, 90, 200] : [200, 0, 0],
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({dash: true})],
        ...layerProperties
      })
  );
}

const testCases: TestCase[] = [
  // ---------------------------------------------------------------------------------------
  // Segment density: every strip is the same line, drawn with a different number of vertices
  // ---------------------------------------------------------------------------------------
  createSegmentDensityCase('path-dash-density-default', {
    extensions: [new PathStyleExtension({dash: true})]
  }),
  createSegmentDensityCase('path-dash-density-justified', {
    dashJustified: true,
    extensions: [new PathStyleExtension({dash: true})]
  }),
  createSegmentDensityCase('path-dash-density-high-precision', {
    extensions: [new PathStyleExtension({highPrecisionDash: true})]
  }),
  createSegmentDensityCase('path-dash-density-rounded', {
    capRounded: true,
    jointRounded: true,
    extensions: [new PathStyleExtension({dash: true})]
  }),
  // dashMode 'path' is the whole point of the exercise: all six strips draw the same line and
  // must come out identical no matter how many vertices it was built from.
  createSegmentDensityCase('path-dash-density-mode-path', {
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  // Justified now composes with continuous phase instead of overriding it. The period is
  // stretched once across the whole path, so every strip still matches.
  createSegmentDensityCase('path-dash-density-mode-path-justified', {
    dashJustified: true,
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  // Matched variants isolate segment mode, continuous path mode, and whole-path
  // justification on exactly the same geometry and style inputs.
  createPathVariantsCase('path-dash-variants-default', {
    extensions: [new PathStyleExtension({dash: true})]
  }),
  createPathVariantsCase('path-dash-variants-mode-path', {
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  // Whole-path justification must derive its period from each path's own arclength and
  // stroke width. Every path should begin and end with half a dash and contain only complete
  // periods between.
  createPathVariantsCase('path-dash-mode-path-justified-variants', {
    dashJustified: true,
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  {
    // Compare the complete dashMode x dashJustified state space on identical geometry.
    // Unequal segments and joint markers make each phase domain visibly distinct.
    name: 'path-dash-mode-combinations',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: [
      ...DASH_MODE_COMBINATIONS.map(
        ({dashMode, dashJustified}, index) =>
          new PathLayer({
            id: `mode-combinations-${dashMode}-${dashJustified}`,
            data: [createUnevenPath(getModeCombinationVerticalPosition(index))],
            ...CARTESIAN,
            // One dash unit is half the 14px stroke width, yielding a 63px period.
            getWidth: 14,
            getDashArray: [5, 4],
            dashJustified,
            extensions: [new PathStyleExtension({dashMode})]
          })
      ),
      new PathLayer({
        id: 'mode-combinations-joints',
        data: DASH_MODE_COMBINATIONS.flatMap((_, index) => {
          const verticalPosition = getModeCombinationVerticalPosition(index);
          return createUnevenPath(verticalPosition).map(([horizontalPosition]) => [
            [horizontalPosition, verticalPosition - 22],
            [horizontalPosition, verticalPosition + 22]
          ]);
        }),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPath: (path: number[][]) => path,
        widthUnits: 'pixels' as const,
        getWidth: 1.5,
        getColor: [90, 90, 90]
      })
    ],
    goldenImage: './test/render/golden-images/path-dash-mode-combinations.png'
  },

  // ---------------------------------------------------------------------------------------
  // Dash arrays, from long dashes down to sub-pixel periods
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-arrays',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-arrays',
      [
        [8, 2],
        [4, 5],
        [2, 2],
        [1, 1],
        [0.5, 0.5],
        [2, 6]
      ].map((dashArray, index) => ({
        data: [createStraightPath(40, getStripY(index, 6))],
        getDashArray: dashArray,
        extensions: [new PathStyleExtension({dash: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-arrays.png'
  },

  // ---------------------------------------------------------------------------------------
  // Sub-pixel dash periods. The stroke is 10px wide, so one dash unit is 5px and the last
  // strips put a whole period well inside a single pixel. A per-fragment comparison cannot
  // represent that and aliases into moire or reads as solid depending on where the phase lands.
  // Square caps should fade toward their 50% interval duty cycle. Rounded caps should preserve
  // capsule area per scanline: the center becomes opaque where neighboring caps close the gap,
  // while coverage falls toward the square duty cycle at the lateral edge.
  // ---------------------------------------------------------------------------------------
  ...[false, true].map(capRounded => ({
    name: `path-dash-subpixel-${capRounded ? 'rounded' : 'square'}`,
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      `path-dash-subpixel-${capRounded ? 'rounded' : 'square'}`,
      [4, 1, 0.4, 0.15, 0.06, 0.02].map((dashSize, index) => ({
        data: [createStraightPath(1, getStripY(index, 6))],
        getDashArray: [dashSize, dashSize],
        capRounded,
        jointRounded: capRounded,
        extensions: [new PathStyleExtension({dash: true})]
      }))
    ),
    goldenImage: `./test/render/golden-images/path-dash-subpixel-${
      capRounded ? 'rounded' : 'square'
    }.png`
  })),

  // ---------------------------------------------------------------------------------------
  // Diagonal strokes, where dash ends fall between pixel columns and prefiltering has real
  // partial coverage to produce. Paired with the suite-wide includeAA policy, this is the case
  // that actually holds dash-end antialiasing to account.
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-diagonal',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    // Deliberately dense. One dash end perturbs only a handful of pixels, so a handful of
    // ends stays far below the 1% mismatch the threshold requires and the case would pass
    // with the feature deleted. Eight lines of fine dashes put enough dash-end edge on
    // screen for the diff to register it.
    layers: createStripLayers(
      'path-dash-diagonal',
      [
        [1.5, 1.5, false],
        [1.5, 1.5, true],
        [1, 1, false],
        [1, 1, true],
        [1.5, 1.5, false],
        [1.5, 1.5, true],
        [1, 1, false],
        [1, 1, true]
      ].map(([dashSize, gapSize, capRounded], index) => ({
        data: [createDiagonalPath(1, (index - 3.5) * 54)],
        getDashArray: [dashSize, gapSize],
        getWidth: 14,
        capRounded,
        jointRounded: capRounded,
        extensions: [new PathStyleExtension({dash: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-diagonal.png'
  },

  // ---------------------------------------------------------------------------------------
  // Corners: dashes across sharp joints, square vs rounded
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-corners',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers('path-dash-corners', [
      {
        data: [createZigzagPath(8, getStripY(0, 4))],
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({dash: true})]
      },
      {
        data: [createZigzagPath(8, getStripY(1, 4))],
        getDashArray: [4, 5],
        capRounded: true,
        jointRounded: true,
        extensions: [new PathStyleExtension({dash: true})]
      },
      {
        data: [createZigzagPath(8, getStripY(2, 4))],
        getDashArray: [4, 5],
        dashJustified: true,
        extensions: [new PathStyleExtension({dash: true})]
      },
      {
        data: [createZigzagPath(8, getStripY(3, 4))],
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      }
    ]),
    goldenImage: './test/render/golden-images/path-dash-corners.png'
  },

  // ---------------------------------------------------------------------------------------
  // Closed polylines at three zoom levels. The left circle restarts its pattern at each piece;
  // the right circle measures continuously around the entire path.
  // ---------------------------------------------------------------------------------------
  ...[-2, 0, 2].map(zoom => ({
    name: `path-dash-circle-zoom${zoom}`,
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom},
    layers: [
      new PathLayer({
        id: 'circle-default',
        data: [createCirclePath(170, 120, [-200, 0])],
        ...CARTESIAN,
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({dash: true})]
      }),
      new PathLayer({
        id: 'circle-high-precision',
        data: [createCirclePath(170, 120, [200, 0])],
        ...CARTESIAN,
        getColor: [0, 90, 200],
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      })
    ],
    goldenImage: `./test/render/golden-images/path-dash-circle-zoom${zoom}.png`
  })),

  // ---------------------------------------------------------------------------------------
  // Billboard parity: flat (red) vs billboard (blue), same geometry, same view
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-billboard-ortho',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: [
      ...billboardParityLayers(
        'parity-sparse',
        verticalPosition => createStraightPath(1, verticalPosition),
        getStripY(0, 4)
      ),
      ...billboardParityLayers(
        'parity-dense',
        verticalPosition => createStraightPath(120, verticalPosition),
        getStripY(1, 4)
      ),
      ...billboardParityLayers(
        'parity-circle',
        verticalPosition => createCirclePath(30, 120, [0, verticalPosition]),
        getStripY(3, 4),
        {},
        50
      )
    ],
    goldenImage: './test/render/golden-images/path-dash-billboard-ortho.png'
  },
  {
    name: 'path-dash-billboard-ortho-continuous',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: [
      ...billboardParityLayers(
        'parity-sparse',
        verticalPosition => createStraightPath(1, verticalPosition),
        getStripY(0, 4),
        {extensions: [new PathStyleExtension({highPrecisionDash: true})]}
      ),
      ...billboardParityLayers(
        'parity-dense',
        verticalPosition => createStraightPath(120, verticalPosition),
        getStripY(1, 4),
        {extensions: [new PathStyleExtension({highPrecisionDash: true})]}
      ),
      ...billboardParityLayers(
        'parity-circle',
        verticalPosition => createCirclePath(30, 120, [0, verticalPosition]),
        getStripY(3, 4),
        {
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        },
        50
      )
    ],
    goldenImage: './test/render/golden-images/path-dash-billboard-ortho-continuous.png'
  },

  // Unpitched MapView across zoom levels. Each image compares dense paths in the upper half
  // with sparse paths in the lower half, and flat red paths with billboarded blue paths.
  // Because every path follows the same straight line, their dashes should line up regardless
  // of segment count or billboard mode.
  ...[10, 14, 18].map(zoom => ({
    name: `path-dash-billboard-map-z${zoom}`,
    viewState: {longitude: MAP_CENTER[0], latitude: MAP_CENTER[1], zoom, pitch: 0, bearing: 0},
    layers: [
      // [segments, vertical offset in pixels]
      [120, 110],
      [120, 80],
      [1, -80],
      [1, -110]
    ].flatMap(([segments, offsetPixels], index) => {
      const billboard = index % 2 === 1;
      return new PathLayer({
        id: `map-${segments}-${billboard ? 'billboard' : 'flat'}`,
        data: [createGeographicPath(segments, zoom, offsetPixels)],
        getPath: (path: number[][]) => path,
        billboard,
        widthUnits: 'pixels' as const,
        getWidth: 8,
        getColor: billboard ? [0, 90, 200] : [200, 0, 0],
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      });
    }),
    goldenImage: `./test/render/golden-images/path-dash-billboard-map-z${zoom}.png`
  })),

  // Pitched MapView. Perspective makes the flat path shrink toward the horizon, while the
  // billboarded path keeps its width facing the screen, so their screen patterns may diverge.
  {
    name: 'path-dash-billboard-pitched',
    views: new MapView({}),
    viewState: {longitude: MAP_CENTER[0], latitude: MAP_CENTER[1], zoom: 14, pitch: 50, bearing: 0},
    layers: [false, true].map(
      billboard =>
        new PathLayer({
          id: `pitched-${billboard ? 'billboard' : 'flat'}`,
          data: [createGeographicPath(120, 14, billboard ? 40 : -40, 2400)],
          getPath: (path: number[][]) => path,
          billboard,
          widthUnits: 'pixels' as const,
          getWidth: 8,
          getColor: billboard ? [0, 90, 200] : [200, 0, 0],
          getDashArray: [4, 5],
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        })
    ),
    goldenImage: './test/render/golden-images/path-dash-billboard-pitched.png'
  },

  // ---------------------------------------------------------------------------------------
  // 3D paths. Every row draws the identical geographic line on screen - Z is invisible in
  // an orthographic MapView at pitch 0 - while its true arclength increases with elevation.
  // The projected dashes should therefore shorten uniformly without phase jumps at any of
  // the 40 joints, and the flat and billboard images should agree exactly apart from color.
  // ---------------------------------------------------------------------------------------
  ...[false, true].map(billboard => ({
    name: `path-dash-3d-${billboard ? 'billboard' : 'flat'}`,
    views: DASH_ELEVATION_VIEW,
    viewState: DASH_ELEVATION_VIEW_STATE,
    layers: createElevationLayers('path-dash-3d', {billboard}),
    goldenImage: `./test/render/golden-images/path-dash-3d-${billboard ? 'billboard' : 'flat'}.png`
  })),
  {
    // Rounded dash ends make any phase jump at a data vertex visible as a missing wedge. The
    // expected pattern continues smoothly across every joint at every tested elevation.
    name: 'path-dash-3d-billboard-pitched-rounded',
    views: DASH_ELEVATION_VIEW,
    viewState: DASH_ELEVATION_PITCHED_VIEW_STATE,
    layers: DASH_ELEVATION_HEIGHTS.map(
      (heightMeters, index) =>
        new PathLayer({
          id: `path-dash-3d-billboard-pitched-rounded-${heightMeters}`,
          data: [createClimbingPath(40, DASH_ELEVATION_ZOOM, -getStripY(index, 4), heightMeters)],
          getPath: (path: number[][]) => path,
          billboard: true,
          widthUnits: 'pixels' as const,
          getWidth: 29,
          getColor: [0, 90, 200],
          // Equivalent to a 4px dash and a 45.25px nominal gap on a 29px stroke.
          getDashArray: [4 / 14.5, 45.25 / 14.5],
          capRounded: true,
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        })
    ),
    goldenImage: './test/render/golden-images/path-dash-3d-billboard-pitched-rounded.png',
    imageDiffOptions: {threshold: 0.999}
  },
  {
    name: 'path-dash-3d-flat-antialiasing',
    views: DASH_ELEVATION_VIEW,
    viewState: DASH_ELEVATION_VIEW_STATE,
    layers: createElevationLayers('path-dash-3d-antialiasing', {antialiasing: true}),
    goldenImage: './test/render/golden-images/path-dash-3d-flat-antialiasing.png'
  },

  // ---------------------------------------------------------------------------------------
  // Offset extension combined with dashing
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-offset',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-offset',
      // The same two-piece line is drawn at four offsets. Only its sideways position should
      // change; dash length, gap length and phase should remain the same in every row.
      [0, 1, 2, -2].map((offset, index) => ({
        data: [createStraightPath(2, getStripY(index, 4))],
        getDashArray: [4, 5],
        getOffset: offset,
        extensions: [new PathStyleExtension({dash: true, offset: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-offset.png'
  },
  {
    // A continuous pattern crosses all four pieces of the line. Increasing the offset should
    // move the line sideways without changing the pattern or introducing a jump at a joint.
    name: 'path-dash-offset-mode-path',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-offset-mode-path',
      // Four pieces provide three joints where continuity can be checked. `highPrecisionDash`
      // selects the continuous-path behavior exercised by this case.
      [0, 2, 4, 8].map((offset, index) => ({
        data: [createStraightPath(4, getStripY(index, 4))],
        getDashArray: [4, 5],
        getOffset: offset,
        extensions: [new PathStyleExtension({highPrecisionDash: true, offset: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-offset-mode-path.png'
  },
  {
    name: 'path-dash-offset-mode-path-justified',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-offset-mode-path-justified',
      [0, 1, 2, -2].map((offset, index) => ({
        data: [createStraightPath(40, getStripY(index, 4))],
        getDashArray: [4, 5],
        dashJustified: true,
        getOffset: offset,
        extensions: [new PathStyleExtension({dashMode: 'path', offset: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-offset-mode-path-justified.png'
  },

  // ---------------------------------------------------------------------------------------
  // Resolution: the same content supersampled, to catch aliasing in the dash test
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-arrays-dpr2',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    useDevicePixels: 2,
    layers: createStripLayers(
      'path-dash-arrays-dpr2',
      [
        [8, 2],
        [4, 5],
        [2, 2],
        [1, 1],
        [0.5, 0.5],
        [2, 6]
      ].map((dashArray, index) => ({
        data: [createStraightPath(40, getStripY(index, 6))],
        getDashArray: dashArray,
        extensions: [new PathStyleExtension({dash: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-arrays-dpr2.png'
  },
  {
    name: 'path-dash-billboard-ortho-dpr2',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    useDevicePixels: 2,
    layers: [
      ...billboardParityLayers(
        'parity-sparse',
        verticalPosition => createStraightPath(1, verticalPosition),
        getStripY(0, 4)
      ),
      ...billboardParityLayers(
        'parity-dense',
        verticalPosition => createStraightPath(120, verticalPosition),
        getStripY(1, 4)
      ),
      ...billboardParityLayers(
        'parity-circle',
        verticalPosition => createCirclePath(30, 120, [0, verticalPosition]),
        getStripY(3, 4),
        {},
        50
      )
    ],
    goldenImage: './test/render/golden-images/path-dash-billboard-ortho-dpr2.png'
  }
];

// PathStyleExtension injects GLSL and has no WGSL equivalent, so no dash case can run on
// WebGPU yet. The backend still belongs in the matrix rather than being commented out of it:
// skipping case by case is what the rest of the render suite does, and these skips are the
// list to delete once the extension gains WGSL sources.
const DASH_SKIP_DEVICES = ['webgpu'];

// Dash ends are the subject of these images. Include antialiased pixels in the comparison so
// changes to partially covered edge pixels are not ignored.
const DASH_IMAGE_DIFF_OPTIONS = {includeAA: true};

const CLIPPED_COMPOSITION_VIEW_STATE = {
  longitude: -122.4,
  latitude: 37.78,
  zoom: 15,
  pitch: 60,
  bearing: 0
};

const clippedCompositionTestCases: TestCase[] = [
  {
    name: 'path-dash-clipped-composition',
    views: new MapView(),
    viewState: CLIPPED_COMPOSITION_VIEW_STATE,
    layers: (
      [
        ['control', 0, [1.5, 3.5], [80, 80, 80]],
        ['clippedEnd', 1, [1.5, 3.5], [200, 0, 0]],
        ['clippedStart', -1, [1.5, 3.5], [0, 90, 200]],
        ['subpixel', 1, [0.06, 0.06], [120, 0, 160]]
      ] as const
    ).map(
      ([pathName, offset, dashArray, color]) =>
        new PathLayer({
          id: `path-dash-clipped-composition-${pathName}`,
          data: [CLIPPED_COMPOSITION_PATHS[pathName]],
          getPath: (path: number[][]) => path,
          billboard: true,
          antialiasing: true,
          jointRounded: true,
          capRounded: true,
          widthUnits: 'pixels',
          getWidth: 14,
          getColor: color,
          getDashArray: dashArray,
          getOffset: offset,
          extensions: [new PathStyleExtension({highPrecisionDash: true, offset: true})]
        })
    ),
    goldenImage: './test/render/golden-images/path-dash-clipped-composition.png',
    imageDiffOptions: {threshold: 0.998, includeAA: true}
  }
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(
    testCases.map(testCase => ({
      ...testCase,
      imageDiffOptions: {...DASH_IMAGE_DIFF_OPTIONS, ...testCase.imageDiffOptions},
      skip: DASH_SKIP_DEVICES
    })) as TestCase[],
    deviceType
  );
});

describe('webgl-no-msaa', () => {
  runRenderTestSuite(clippedCompositionTestCases, 'webgl', {
    deviceMode: 'isolated',
    webgl: {antialias: false}
  });
});
