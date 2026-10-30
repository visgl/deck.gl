// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {MapView, OrthographicView, _GlobeView as GlobeView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension, type DashUnits} from '@deck.gl/extensions';

/**
 * PathStyleExtension dash cases. Most goldens stack horizontal strips, listed top to bottom. In
 * the flat vs billboard cases, red is flat and blue is billboard.
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
 * A geographic line that climbs steadily in Z. Seen from straight above in an orthographic
 * MapView, it looks the same at any height; only its arclength grows.
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
// altitude 3 keeps the 900 m paths inside the clip volume
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

// Degrees per Web Mercator pixel at `zoom`, so MapView cases frame the same at every zoom.
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

const DASH_UNIT_WIDTH_ZOOM = 14;
const DASH_UNIT_WIDTH_VIEW = new MapView({orthographic: true});
const DASH_UNIT_WIDTH_VIEW_STATE = {
  longitude: MAP_CENTER[0],
  latitude: MAP_CENTER[1],
  zoom: DASH_UNIT_WIDTH_ZOOM,
  pitch: 0,
  bearing: 0
};

/** The same dash array on a 2px pair (top) and a 6px pair (bottom), at one view. */
function createDashUnitWidthCase(dashUnits: DashUnits, dashArray: [number, number]): TestCase {
  return {
    name: `path-dash-units-width-${dashUnits}`,
    views: DASH_UNIT_WIDTH_VIEW,
    viewState: DASH_UNIT_WIDTH_VIEW_STATE,
    layers: [
      {width: 2, billboard: false},
      {width: 2, billboard: true},
      {width: 6, billboard: false},
      {width: 6, billboard: true}
    ].map(
      ({width, billboard}, index) =>
        new PathLayer({
          id: `units-width-${dashUnits}-${width}-${billboard ? 'billboard' : 'flat'}`,
          data: [createGeographicPath(120, DASH_UNIT_WIDTH_ZOOM, -getStripY(index, 4))],
          getPath: (path: number[][]) => path,
          billboard,
          widthUnits: 'pixels' as const,
          getWidth: width,
          getColor: billboard ? [0, 90, 200] : [200, 0, 0],
          getDashArray: dashArray,
          dashUnits,
          extensions: [new PathStyleExtension({dashMode: 'path'})]
        })
    ),
    goldenImage: `./test/render/golden-images/path-dash-units-width-${dashUnits}.png`
  };
}

/**
 * Renders a case as MapView (left) and GlobeView (right) in one image. Only valid at zoom <= 12,
 * where GlobeView still uses a GlobeViewport. The globe half lands a few pixels off the map half
 * (fp32 sin/cos in `project_globe_`), hence the looser threshold.
 */
function withGlobeSideBySide(testCase: TestCase): TestCase {
  const {viewState} = testCase;
  return {
    ...testCase,
    name: `${testCase.name}-map-vs-globe`,
    views: [
      new MapView({id: 'map', width: '50%'}),
      new GlobeView({resolution: 36, id: 'globe', x: '50%', width: '50%'})
    ],
    viewState: {map: viewState, globe: viewState},
    imageDiffOptions: {threshold: 0.985},
    goldenImage: testCase.goldenImage.replace(/\.png$/, '-map-vs-globe.png')
  };
}

/** Unpitched MapView at `zoom`: a 120-piece pair (top) and a 1-piece pair (bottom). */
function createBillboardMapCase(zoom: number): TestCase {
  return {
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
  };
}

/**
 * dashUnits at `zoom`: a 'widths' pair (top) and a 'pixels' pair (bottom). The stroke is in
 * meters, so it thickens with zoom.
 */
function createDashUnitsCase(zoom: number): TestCase {
  return {
    name: `path-dash-units-z${zoom}`,
    viewState: {longitude: MAP_CENTER[0], latitude: MAP_CENTER[1], zoom, pitch: 0, bearing: 0},
    layers: [
      // [dashUnits, dash array, vertical offset in pixels]
      ['widths', [4, 5], 150],
      ['widths', [4, 5], 90],
      ['pixels', [20, 25], -90],
      ['pixels', [20, 25], -150]
    ].map(([dashUnits, dashArray, offsetPixels], index) => {
      const billboard = index % 2 === 1;
      return new PathLayer({
        id: `units-${dashUnits}-${billboard ? 'billboard' : 'flat'}`,
        data: [createGeographicPath(120, zoom, offsetPixels as number)],
        getPath: (path: number[][]) => path,
        billboard,
        widthUnits: 'meters' as const,
        getWidth: 60,
        widthMinPixels: 2,
        getColor: billboard ? [0, 90, 200] : [200, 0, 0],
        getDashArray: dashArray,
        dashUnits,
        extensions: [new PathStyleExtension({dashMode: 'path'})]
      });
    }),
    goldenImage: `./test/render/golden-images/path-dash-units-z${zoom}.png`
  };
}

/**
 * Billboarded paths in a pitched view. `control` stays in front of the camera; `clippedEnd`,
 * `clippedStart` and `subpixel` each cross behind it at one end.
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
  coordinateSystem: 'cartesian',
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

/** Four shapes: a long thin line, a short thick line, a zigzag and a shallow diagonal. */
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
 * The same path twice, flat (red) just above billboard (blue). They sit apart rather than
 * overlapping so that neither hides the other.
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
  // Segment density: every strip is the same line, split into 1, 2, 4, 12, 40 and 120 pieces
  // ---------------------------------------------------------------------------------------
  // Each piece restarts the pattern.
  // Golden: rows 1-3 match and row 4 differs. Rows 5-6 look solid: their pieces are shorter
  // than one dash.
  createSegmentDensityCase('path-dash-density-default', {
    extensions: [new PathStyleExtension({dash: true})]
  }),
  // Each piece restarts the pattern, fitted to that piece.
  // Golden: rows 1-3 match, with half dashes at the ends; row 4 is spaced wider; rows 5-6 look
  // solid.
  createSegmentDensityCase('path-dash-density-justified', {
    dashJustified: true,
    extensions: [new PathStyleExtension({dash: true})]
  }),
  // Golden: all six rows match.
  createSegmentDensityCase('path-dash-density-high-precision', {
    extensions: [new PathStyleExtension({highPrecisionDash: true})]
  }),
  // Golden: like path-dash-density-default, with rounded dash ends.
  createSegmentDensityCase('path-dash-density-rounded', {
    capRounded: true,
    jointRounded: true,
    extensions: [new PathStyleExtension({dash: true})]
  }),
  // Golden: all six rows match.
  createSegmentDensityCase('path-dash-density-mode-path', {
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  // Golden: all six rows match, each with a half dash at both ends.
  createSegmentDensityCase('path-dash-density-mode-path-justified', {
    dashJustified: true,
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  // Golden: the long line, zigzag and diagonal are dashed. The short thick line looks solid: its
  // pieces are shorter than one dash.
  createPathVariantsCase('path-dash-variants-default', {
    extensions: [new PathStyleExtension({dash: true})]
  }),
  // Golden: all four shapes are dashed, including the short thick line.
  createPathVariantsCase('path-dash-variants-mode-path', {
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  // Golden: every shape begins and ends with a half dash.
  createPathVariantsCase('path-dash-mode-path-justified-variants', {
    dashJustified: true,
    extensions: [new PathStyleExtension({dashMode: 'path'})]
  }),
  {
    // One path with unequal segments, in four rows: segment, segment + justified, path and
    // path + justified. Grey ticks mark the joints.
    // Golden: row 1 restarts the pattern at each tick; row 2 fits it to each segment; row 3 runs
    // straight through the ticks; row 4 does too, with half dashes at both ends.
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
        coordinateSystem: 'cartesian',
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
    // Dash arrays [8, 2], [4, 5], [2, 2], [1, 1], [0.5, 0.5] and [2, 6] on a 40-piece line.
    // Golden: rows 1-2 look solid, since a dash is longer than a piece. Rows 3-5 get finer and
    // row 6 is square dots.
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
  // Sub-pixel dash periods
  // ---------------------------------------------------------------------------------------
  // Dashes of 4, 1, 0.4, 0.15, 0.06 and 0.02 widths on a 10px stroke, square or rounded.
  // Golden (square): dashes get finer, then fade to an even half-transparent bar.
  // Golden (rounded): row 1 is rounded dashes. The other rows look solid, since the round caps
  // close the gaps.
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
  // Diagonal strokes, where dash ends fall between pixel columns
  // ---------------------------------------------------------------------------------------
  {
    // Eight diagonals of fine dashes, alternating square and rounded caps.
    // Golden: eight dashed diagonals with smooth dash ends.
    // Dense on purpose: fewer dash ends would stay under the diff threshold.
    name: 'path-dash-diagonal',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
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
    // Golden: four dashed zigzags: square, rounded, justified and high precision.
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
  // 120-piece circles at zoom -2, 0 and 2
  // ---------------------------------------------------------------------------------------
  // Both circles are flat. Left (red) is `dash`, right (blue) is `highPrecisionDash`.
  // Golden: the left circle restarts at each piece and looks solid. The right circle is dashed
  // all the way round.
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
    // A 1-piece line, a 120-piece line and a circle, each as a red/blue pair.
    // Golden: the 1-piece pair is dashed, with red and blue dashes in the same columns. The
    // 120-piece lines and the circles look solid.
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
    // Golden: like path-dash-billboard-ortho, but every pair is dashed, circles included.
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

  // Golden: in each pair, red and blue dashes sit in the same columns.
  // Map-vs-globe golden: the dashes keep their size and gap across the centre seam.
  // z14 and z18 are past GlobeView's zoom-12 switch to Mercator, so they are map-only.
  ...[10, 14, 18].map(createBillboardMapCase),
  withGlobeSideBySide(createBillboardMapCase(10)),

  // ---------------------------------------------------------------------------------------
  // dashUnits at z12, z13 and z14
  // ---------------------------------------------------------------------------------------
  // Golden: from z12 to z14 the 'widths' dashes (top) grow with the stroke, while the 'pixels'
  // dashes (bottom) keep the same period.
  // Map-vs-globe golden: both halves show the same dash periods.
  ...[12, 13, 14].map(createDashUnitsCase),
  withGlobeSideBySide(createDashUnitsCase(12)),

  // Golden: in 'widths' the thick pair has longer dashes than the thin pair. In 'pixels',
  // 'meters' and 'common', all four rows share one period.
  createDashUnitWidthCase('widths', [4, 5]),
  createDashUnitWidthCase('pixels', [4, 5]),
  createDashUnitWidthCase('meters', [30, 38]),
  createDashUnitWidthCase('common', [4 / 2 ** DASH_UNIT_WIDTH_ZOOM, 5 / 2 ** DASH_UNIT_WIDTH_ZOOM]),

  {
    // 4px dashes on a 29px stroke, with 5, 29 and 45px gaps, square then rounded.
    // Golden: square rows show the literal gaps. Each round cap adds half the stroke width, so the
    // rounded 5px row is one solid bar, the 29px row is touching dots and the 45px row has 16px
    // gaps.
    name: 'path-dash-units-rounded-cap-overlap',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-units-rounded-cap-overlap',
      [
        {gapSize: 5, capRounded: false},
        {gapSize: 5, capRounded: true},
        {gapSize: 29, capRounded: false},
        {gapSize: 29, capRounded: true},
        {gapSize: 45, capRounded: false},
        {gapSize: 45, capRounded: true}
      ].map(({gapSize, capRounded}, index) => ({
        data: [createStraightPath(1, getStripY(index, 6))],
        getWidth: 29,
        getDashArray: [4, gapSize],
        dashUnits: 'pixels',
        capRounded,
        extensions: [new PathStyleExtension({dashMode: 'path'})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-units-rounded-cap-overlap.png'
  },

  // Pitched MapView.
  // Golden: the blue (billboard) dashes on top stay square; the red (flat) dashes below are
  // thinner and slanted by perspective.
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
  // 3D paths: 40-piece lines climbing to 0, 300, 720 and 900 m, seen from straight above
  // ---------------------------------------------------------------------------------------
  // Golden: four lines whose dashes get shorter from top (0 m) to bottom (900 m), evenly along
  // each line. Flat and billboard match apart from colour.
  ...[false, true].map(billboard => ({
    name: `path-dash-3d-${billboard ? 'billboard' : 'flat'}`,
    views: DASH_ELEVATION_VIEW,
    viewState: DASH_ELEVATION_VIEW_STATE,
    layers: createElevationLayers('path-dash-3d', {billboard}),
    goldenImage: `./test/render/golden-images/path-dash-3d-${billboard ? 'billboard' : 'flat'}.png`
  })),
  {
    // The same climbing lines, pitched, as round dots.
    // Golden: four diagonal rows of evenly spaced blue dots. A jump at a joint would show as a
    // cut dot.
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
    // Golden: like path-dash-3d-flat, with antialiasing on.
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
    // A 2-piece line at offsets 0, 1, 2 and -2.
    // Golden: the same dashes in every row; the offsets only move rows up or down.
    name: 'path-dash-offset',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-offset',
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
    // A 4-piece line with a continuous pattern, at offsets 0, 2, 4 and 8.
    // Golden: the same dashes in every row, with no jump at the joints.
    name: 'path-dash-offset-mode-path',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-offset-mode-path',
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
    // Golden: like path-dash-offset, with a half dash at both ends of every row.
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
  {
    // Golden: like path-dash-offset, with 20px dashes and 25px gaps.
    name: 'path-dash-offset-units',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-offset-units',
      [0, 1, 2, -2].map((offset, index) => ({
        data: [createStraightPath(40, getStripY(index, 4))],
        getDashArray: [20, 25],
        dashUnits: 'pixels',
        getOffset: offset,
        extensions: [new PathStyleExtension({dashMode: 'path', offset: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-offset-units.png'
  },

  // ---------------------------------------------------------------------------------------
  // Resolution: the same content supersampled, to catch aliasing in the dash test
  // ---------------------------------------------------------------------------------------
  {
    // Golden: path-dash-arrays at device pixel ratio 2.
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
    // Golden: path-dash-billboard-ortho at device pixel ratio 2.
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

// PathStyleExtension has no WGSL sources yet
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
    // Golden: a full grey row of rounded dashes on top. The red and blue rows stop at the same x
    // where they pass behind the camera, still with rounded ends. The purple subpixel row
    // blends into a solid bar.
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
