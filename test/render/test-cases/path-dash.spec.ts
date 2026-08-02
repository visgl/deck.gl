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
 * - `path-dash-3d-*`: dash length grows along a path that climbs in Z, because the CPU
 *   accumulates 3D distance while the shader coordinate measures 2D.
 */

const STRIP_LENGTH = 720;
const STRIP_SPACING = 62;

/**
 * World Y for strip `index` of `count`, laid out so that index 0 appears at the *top* of the
 * image. `OrthographicView` defaults to `flipY: true`, so screen-down is world-up.
 */
function stripY(index: number, count: number): number {
  return -((count - 1) * STRIP_SPACING) / 2 + index * STRIP_SPACING;
}

/** A horizontal line of `length`, split into `segments` equal collinear pieces. */
function straightPath(segments: number, y: number, length: number = STRIP_LENGTH): number[][] {
  const path: number[][] = [];
  for (let i = 0; i <= segments; i++) {
    path.push([-length / 2 + (length * i) / segments, y]);
  }
  return path;
}

/** A circle approximated by `segments` short chords - the reported dense-polyline failure. */
function circlePath(radius: number, segments: number, center: number[] = [0, 0]): number[][] {
  const path: number[][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    path.push([center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)]);
  }
  return path;
}

/** A sawtooth with sharp corners, to exercise joints and miters under dashing. */
function zigzagPath(segments: number, y: number, amplitude: number = 22): number[][] {
  const path: number[][] = [];
  for (let i = 0; i <= segments; i++) {
    path.push([
      -STRIP_LENGTH / 2 + (STRIP_LENGTH * i) / segments,
      y + (i % 2 === 0 ? -amplitude : amplitude)
    ]);
  }
  return path;
}

/**
 * A horizontal line that also descends steadily in Z.
 *
 * `OrthographicView` is a true parallel projection, so Z does not move the line on screen at
 * all: every strip draws the identical shape and any difference in the dash pattern is
 * attributable to arclength alone. `MapView` cannot isolate it this way, being a perspective
 * projection at every pitch - raising a path there also magnifies it.
 *
 * Z descends rather than climbs because the orthographic camera sits at z = 1 with a near
 * plane at 0.1, so positive Z clips almost immediately while negative Z has ~999 units of
 * room.
 */
function descendingPath(segments: number, y: number, depth: number): number[][] {
  const path: number[][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    path.push([-STRIP_LENGTH / 2 + STRIP_LENGTH * t, y, -depth * t]);
  }
  return path;
}

const MAP_CENTER = [-122.4, 37.78];

// Web Mercator at zoom z is 512 * 2^z pixels around the world, so a degree of longitude is
// (512 * 2^z) / 360 pixels; a degree of latitude covers `1 / cos(latitude)` as much ground.
// The MapView cases size their geometry through these so that a case laid out at z10 frames
// the same way as one at z18 - a fixed degree span would put half the paths off screen.
function lngPerPixel(zoom: number): number {
  return 360 / (512 * 2 ** zoom);
}
function latPerPixel(zoom: number): number {
  return lngPerPixel(zoom) * Math.cos((MAP_CENTER[1] * Math.PI) / 180);
}

/**
 * A polyline in lng/lat spanning `spanPixels` horizontally, centred on `MAP_CENTER` and
 * offset vertically by `offsetPixels`, both measured at `zoom`.
 */
function geoPath(
  segments: number,
  zoom: number,
  offsetPixels: number,
  spanPixels: number = 880
): number[][] {
  const span = spanPixels * lngPerPixel(zoom);
  const latitude = MAP_CENTER[1] + offsetPixels * latPerPixel(zoom);
  const path: number[][] = [];
  for (let i = 0; i <= segments; i++) {
    path.push([MAP_CENTER[0] - span / 2 + (span * i) / segments, latitude]);
  }
  return path;
}

const CARTESIAN = {
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  getPath: (d: number[][]) => d,
  widthUnits: 'pixels' as const,
  getWidth: 10,
  getColor: [200, 0, 0] as [number, number, number]
};

const ORTHO_VIEW_STATE = {target: [0, 0, 0], zoom: 0};

/**
 * Draws one PathLayer per entry, all sharing `CARTESIAN` defaults. Each entry supplies its
 * own geometry and the props under test.
 */
function stripLayers(id: string, entries: Record<string, any>[]): PathLayer[] {
  return entries.map(
    ({data, ...props}, index) =>
      new PathLayer({
        id: `${id}-${index}`,
        data,
        ...CARTESIAN,
        ...props
      })
  );
}

/** Segment counts that all render the same straight line. */
const SEGMENT_COUNTS = [1, 2, 4, 12, 40, 120];

function segmentDensityCase(name: string, dashProps: Record<string, any>): TestCase {
  return {
    name,
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: stripLayers(
      name,
      SEGMENT_COUNTS.map((segments, index) => ({
        data: [straightPath(segments, stripY(index, SEGMENT_COUNTS.length))],
        getDashArray: [4, 5],
        ...dashProps
      }))
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
 * catch.
 */
function billboardParityLayers(
  id: string,
  buildPath: (y: number) => number[][],
  y: number,
  props: Record<string, any> = {}
): PathLayer[] {
  return [false, true].map(
    billboard =>
      new PathLayer({
        id: `${id}-${billboard ? 'billboard' : 'flat'}`,
        data: [buildPath(y + (billboard ? PARITY_OFFSET : -PARITY_OFFSET))],
        billboard,
        ...CARTESIAN,
        getColor: billboard ? [0, 90, 200] : [200, 0, 0],
        getDashArray: [4, 5],
        ...props
      })
  );
}

const testCases: TestCase[] = [
  // ---------------------------------------------------------------------------------------
  // Segment density: every strip is the same line, drawn with a different number of vertices
  // ---------------------------------------------------------------------------------------
  segmentDensityCase('path-dash-density-default', {
    extensions: [new PathStyleExtension({dash: true})]
  }),
  segmentDensityCase('path-dash-density-justified', {
    dashJustified: true,
    extensions: [new PathStyleExtension({dash: true})]
  }),
  segmentDensityCase('path-dash-density-high-precision', {
    extensions: [new PathStyleExtension({highPrecisionDash: true})]
  }),
  segmentDensityCase('path-dash-density-rounded', {
    capRounded: true,
    jointRounded: true,
    extensions: [new PathStyleExtension({dash: true})]
  }),

  // ---------------------------------------------------------------------------------------
  // Dash arrays, from long dashes down to sub-pixel periods
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-arrays',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: stripLayers(
      'path-dash-arrays',
      [
        [8, 2],
        [4, 5],
        [2, 2],
        [1, 1],
        [0.5, 0.5],
        [2, 6]
      ].map((dashArray, index) => ({
        data: [straightPath(40, stripY(index, 6))],
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
    layers: stripLayers('path-dash-corners', [
      {
        data: [zigzagPath(8, stripY(0, 4))],
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({dash: true})]
      },
      {
        data: [zigzagPath(8, stripY(1, 4))],
        getDashArray: [4, 5],
        capRounded: true,
        jointRounded: true,
        extensions: [new PathStyleExtension({dash: true})]
      },
      {
        data: [zigzagPath(8, stripY(2, 4))],
        getDashArray: [4, 5],
        dashJustified: true,
        extensions: [new PathStyleExtension({dash: true})]
      },
      {
        data: [zigzagPath(8, stripY(3, 4))],
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
        data: [circlePath(170, 120, [-200, 0])],
        ...CARTESIAN,
        getDashArray: [4, 5],
        extensions: [new PathStyleExtension({dash: true})]
      }),
      new PathLayer({
        id: 'circle-high-precision',
        data: [circlePath(170, 120, [200, 0])],
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
      ...billboardParityLayers('parity-sparse', y => straightPath(1, y), stripY(0, 3)),
      ...billboardParityLayers('parity-dense', y => straightPath(120, y), stripY(1, 3)),
      ...billboardParityLayers('parity-circle', y => circlePath(80, 120, [0, y - 30]), stripY(2, 3))
    ],
    goldenImage: './test/render/golden-images/path-dash-billboard-ortho.png'
  },
  {
    name: 'path-dash-billboard-ortho-continuous',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: [
      ...billboardParityLayers('parity-sparse', y => straightPath(1, y), stripY(0, 3), {
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      }),
      ...billboardParityLayers('parity-dense', y => straightPath(120, y), stripY(1, 3), {
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      }),
      ...billboardParityLayers(
        'parity-circle',
        y => circlePath(80, 120, [0, y - 30]),
        stripY(2, 3),
        {
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        }
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
        data: [geoPath(segments, zoom, offsetPixels)],
        getPath: (d: number[][]) => d,
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
          data: [geoPath(120, 14, billboard ? 40 : -40, 2400)],
          getPath: (d: number[][]) => d,
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
  // 3D paths. Every strip draws the identical screen line - Z is invisible under a parallel
  // projection - so all four should carry an identical, evenly spaced dash pattern. The
  // CPU accumulates 3D distance between segment starts, so if the shader coordinate advances
  // at the 2D rate within each segment the two disagree by a fixed fraction of every segment
  // and the pattern breaks up at each of the 40 joints.
  // ---------------------------------------------------------------------------------------
  ...[false, true].map(billboard => ({
    name: `path-dash-3d-${billboard ? 'billboard' : 'flat'}`,
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: [0, 300, 720, 900].map(
      (depth, index) =>
        new PathLayer({
          id: `path-dash-3d-${depth}`,
          data: [descendingPath(40, stripY(index, 4), depth)],
          ...CARTESIAN,
          billboard,
          getColor: billboard ? [0, 90, 200] : [200, 0, 0],
          getDashArray: [4, 5],
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        })
    ),
    goldenImage: `./test/render/golden-images/path-dash-3d-${billboard ? 'billboard' : 'flat'}.png`
  })),

  // ---------------------------------------------------------------------------------------
  // Offset extension combined with dashing
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-offset',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    layers: stripLayers(
      'path-dash-offset',
      // Two segments, not forty: at high vertex counts every strip collapses to solid via
      // the segment-density defect and the image says nothing about offsetting. All four
      // strips should share one dash phase - the offset must not rescale the pattern.
      [0, 1, 2, -2].map((offset, index) => ({
        data: [straightPath(2, stripY(index, 4))],
        getDashArray: [4, 5],
        getOffset: offset,
        extensions: [new PathStyleExtension({dash: true, offset: true})]
      }))
    ),
    goldenImage: './test/render/golden-images/path-dash-offset.png'
  },

  // ---------------------------------------------------------------------------------------
  // Resolution: the same content supersampled, to catch aliasing in the dash test
  // ---------------------------------------------------------------------------------------
  {
    name: 'path-dash-arrays-dpr2',
    views: new OrthographicView(),
    viewState: ORTHO_VIEW_STATE,
    useDevicePixels: 2,
    layers: stripLayers(
      'path-dash-arrays-dpr2',
      [
        [8, 2],
        [4, 5],
        [2, 2],
        [1, 1],
        [0.5, 0.5],
        [2, 6]
      ].map((dashArray, index) => ({
        data: [straightPath(40, stripY(index, 6))],
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
      ...billboardParityLayers('parity-sparse', y => straightPath(1, y), stripY(0, 3)),
      ...billboardParityLayers('parity-dense', y => straightPath(120, y), stripY(1, 3)),
      ...billboardParityLayers('parity-circle', y => circlePath(80, 120, [0, y - 30]), stripY(2, 3))
    ],
    goldenImage: './test/render/golden-images/path-dash-billboard-ortho-dpr2.png'
  }
];

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType);
});
