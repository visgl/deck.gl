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
 * The organizing idea is that a dash is a property of the stroke, not of the tessellation:
 * every strip inside a `segment density` case draws the *same* straight line and differs
 * only in how many vertices it is built from, so all strips in one image should be
 * indistinguishable. Cases are laid out as horizontal strips stacked vertically, following
 * the `OrthographicView` convention already used by `path-layer.spec.ts`.
 *
 * IMPORTANT: the golden images committed alongside this file record how dashing behaves
 * *today*, defects included. They are a baseline to diff future work against, not a
 * statement of desired output. Measured from these goldens, with `getDashArray: [4, 5]`:
 *
 * - `path-dash-density-default`: the 1, 2 and 4 segment strips dash correctly at a 43.4px
 *   period; the 12 segment strip drifts to 55.4px; the 40 and 120 segment strips render
 *   **fully solid**. All six draw the identical straight line. Dash phase restarts at every
 *   vertex, so once a segment is shorter than one dash period nothing is ever discarded.
 * - `path-dash-density-justified`: same collapse to solid - justification is also computed
 *   per segment, so it does not rescue dense polylines.
 * - `path-dash-density-high-precision`: all six strips identical and correct. The
 *   continuous-arclength mechanism works; it is simply opt-in.
 * - `path-dash-billboard-map-z14`: flat dashes at a 34.8px period (correct for an 8px
 *   stroke); the billboard copy of the same geometry renders **solid** when dense and at a
 *   52.0px period - 1.5x too long - when sparse. `billboard: true` combined with
 *   `highPrecisionDash` is broken.
 * - `path-dash-3d-*`: every row has identical screen geometry under an orthographic
 *   `MapView`, but dash phase jumps at segment joints as elevation increases because the CPU
 *   accumulates 3D distance while the shader coordinate measures 2D.
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
 * Four paths that deliberately vary length, width, dash array and shape. Later stack layers
 * reuse this exact fixture to isolate the effects of path mode and whole-path justification.
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

  // Matched control for the path-mode variants added later in the stack. This captures the
  // existing per-segment behavior on the same four paths without justification.
  createPathVariantsCase('path-dash-variants-default', {
    extensions: [new PathStyleExtension({dash: true})]
  }),

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
  // Dense closed polyline - the reported failure, at three orthographic zoom levels
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

  // Unpitched MapView across zoom levels - flat and billboard must stay locked together.
  // Each zoom draws a dense pair in the upper half and a sparse pair in the lower half; a
  // dense stripe that differs from the sparse one directly above it is the segment-density
  // bug, and a blue stripe that differs from the red one beside it is a billboard bug.
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

  // Pitched MapView - flat and billboard are EXPECTED to diverge toward the horizon
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
  // an orthographic MapView at pitch 0 - so they should carry identical dash patterns. The
  // CPU accumulates 3D distance between segment starts; if the shader coordinate advances
  // at the 2D rate within each elevated segment, the two disagree at each of the 40 joints.
  // ---------------------------------------------------------------------------------------
  ...[false, true].map(billboard => ({
    name: `path-dash-3d-${billboard ? 'billboard' : 'flat'}`,
    views: DASH_ELEVATION_VIEW,
    viewState: DASH_ELEVATION_VIEW_STATE,
    layers: createElevationLayers('path-dash-3d', {billboard}),
    goldenImage: `./test/render/golden-images/path-dash-3d-${billboard ? 'billboard' : 'flat'}.png`
  })),
  {
    // Rounded caps make phase discontinuities at data vertices visible as wedges cut out of
    // the circles. This pitched 3D billboard case keeps those segment-boundary artifacts easy
    // to inspect as behavior changes through the stack.
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
      // Two segments, not forty: at high vertex counts every strip collapses to solid via
      // the segment-density defect and the image says nothing about offsetting. All four
      // strips should share one dash phase - the offset must not rescale the pattern.
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
    // The case above uses segment-local phase, where vDashOffset is zero. Only a
    // continuous phase can expose drift introduced when offset geometry widens the stroke.
    name: 'path-dash-offset-mode-path',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: createStripLayers(
      'path-dash-offset-mode-path',
      // Four segments provide three joints where a phase discontinuity can appear.
      // highPrecisionDash is intentionally used because it is the continuous-path spelling
      // available before this stack adds dashMode. Increasing offsets make the defect visible.
      [0, 2, 4, 8].map((offset, index) => ({
        data: [createStraightPath(4, getStripY(index, 4))],
        getDashArray: [4, 5],
        getOffset: offset,
        extensions: [new PathStyleExtension({highPrecisionDash: true, offset: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-offset-mode-path.png'
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

// Dash ends are the subject of these images, and pixelmatch discards antialiased pixels
// from the mismatch count unless told otherwise. Establish that sensitivity in the baseline
// so later behavior changes are measured against a consistent comparison policy.
const DASH_IMAGE_DIFF_OPTIONS = {includeAA: true};

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
