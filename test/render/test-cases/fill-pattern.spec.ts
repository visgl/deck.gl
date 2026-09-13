// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {COORDINATE_SYSTEM, MapView, OrthographicView} from '@deck.gl/core';
import type {Unit} from '@deck.gl/core';
import {PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {
  FillStyleExtension,
  type FillStyleExtensionProps,
  type ProceduralPatternMapping
} from '@deck.gl/extensions';
import {polygons} from 'deck.gl-test/data';

type PatternDatum = {
  polygon: number[][];
  pattern: string;
  color?: [number, number, number];
};

const MAP_POLYGON: PatternDatum[] = [
  {
    polygon: [
      [-1, -1],
      [-1, 1],
      [1, 1],
      [1, -1]
    ],
    pattern: 'pattern'
  }
];

const ORTHOGRAPHIC_POLYGON: PatternDatum[] = [
  {
    polygon: [
      [-320, -180],
      [-320, 180],
      [320, 180],
      [320, -180]
    ],
    pattern: 'pattern'
  }
];

function createPatternLayer({
  id,
  data,
  mapping,
  sizeUnits,
  scale = 1,
  cartesian = false,
  stroked = true
}: {
  id: string;
  data: PatternDatum[];
  mapping: ProceduralPatternMapping;
  sizeUnits?: Unit;
  scale?: number;
  cartesian?: boolean;
  stroked?: boolean;
}) {
  return new PolygonLayer<PatternDatum, FillStyleExtensionProps<PatternDatum>>({
    id,
    data,
    coordinateSystem: cartesian ? COORDINATE_SYSTEM.CARTESIAN : undefined,
    getPolygon: d => d.polygon,
    getFillColor: d => d.color ?? [40, 120, 220],
    getLineColor: [20, 20, 20],
    lineWidthMinPixels: 2,
    stroked,
    fillPatternMapping: mapping,
    fillPatternSizeUnits: sizeUnits,
    getFillPattern: d => d.pattern,
    getFillPatternScale: scale,
    extensions: [new FillStyleExtension({proceduralPattern: true})]
  });
}

const rasterPatternTestCases: TestCase[] = [
  {
    name: 'polygon-pattern-mask',
    skip: ['webgpu'],
    viewState: {
      latitude: 37.75,
      longitude: -122.43,
      zoom: 11.5
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-pattern',
        data: polygons,
        getPolygon: f => f,
        filled: true,
        stroked: true,
        getFillColor: [60, 180, 240],

        fillPatternMask: true,
        fillPatternAtlas: '/test/data/pattern.png',
        fillPatternMapping: '/test/data/pattern.json',
        getFillPattern: (f, {index}) => (index % 2 === 0 ? 'dots' : 'hatch-cross'),
        getFillPatternScale: 5,
        getFillPatternOffset: [0, 0],

        extensions: [new FillStyleExtension({pattern: true})]
      })
    ],
    goldenImage: './test/render/golden-images/polygon-pattern-mask.png'
  },
  {
    name: 'polygon-pattern',
    skip: ['webgpu'],
    viewState: {
      latitude: 37.75,
      longitude: -122.43,
      zoom: 11.5
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-pattern',
        data: polygons,
        getPolygon: f => f,
        filled: true,
        stroked: true,

        fillPatternMask: false,
        fillPatternAtlas: '/test/data/pattern.png',
        fillPatternMapping: '/test/data/pattern.json',
        getFillPattern: (f, {index}) => (index % 2 === 0 ? 'dots' : 'hatch-cross'),
        getFillPatternScale: 5,
        getFillPatternOffset: [0, 0],

        extensions: [new FillStyleExtension({pattern: true})]
      })
    ],
    goldenImage: './test/render/golden-images/polygon-pattern.png'
  },
  {
    name: 'polygon-pattern-background',
    skip: ['webgpu'],
    viewState: {
      latitude: 37.75,
      longitude: -122.43,
      zoom: 11.5
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-pattern-background',
        data: polygons,
        getPolygon: f => f,
        filled: true,
        stroked: true,
        // The pattern is white, the fill behind it is styled independently
        getFillColor: [255, 255, 255],

        fillPatternMask: true,
        fillPatternAtlas: '/test/data/pattern.png',
        fillPatternMapping: '/test/data/pattern.json',
        getFillPattern: (f, {index}) => (index % 2 === 0 ? 'dots' : 'hatch-cross'),
        getFillPatternScale: 5,
        getFillPatternOffset: [0, 0],
        // Opaque background on even features, semi-transparent on odd ones
        getFillPatternBackgroundColor: (f, {index}) =>
          index % 2 === 0 ? [60, 180, 240] : [240, 140, 60, 128],

        extensions: [new FillStyleExtension({pattern: true})]
      })
    ],
    goldenImage: './test/render/golden-images/polygon-pattern-background.png'
  }
];

const explicitUnitTestCases: TestCase[] = (
  [
    {
      sizeUnits: 'common' as const,
      mapping: {pattern: {type: 'dots' as const, radius: 0.015, gap: 0.03}}
    },
    {
      sizeUnits: 'pixels' as const,
      mapping: {pattern: {type: 'dots' as const, radius: 6, gap: 12}}
    }
  ] satisfies Array<{
    sizeUnits: Unit;
    mapping: ProceduralPatternMapping;
  }>
).flatMap(({sizeUnits, mapping}) =>
  [8, 12].map(zoom => ({
    name: `fill-pattern-size-units-${sizeUnits}-zoom-${zoom}`,
    views: new MapView(),
    viewState: {longitude: 0, latitude: 0, zoom},
    layers: [
      createPatternLayer({
        id: `${sizeUnits}-zoom-${zoom}`,
        data: MAP_POLYGON,
        mapping,
        sizeUnits
      })
    ],
    goldenImage: `./test/render/golden-images/fill-pattern-size-units-${sizeUnits}-zoom-${zoom}.png`,
    skip: ['webgpu']
  }))
);

const orientationTestCases: TestCase[] = [false, true].map(flipY => ({
  name: `fill-pattern-orientation-flip-y-${flipY}`,
  views: new OrthographicView({flipY}),
  viewState: {target: [0, 0, 0], zoom: 0},
  layers: [
    new PolygonLayer<PatternDatum, FillStyleExtensionProps<PatternDatum>>({
      id: `orientation-${flipY}`,
      data: ORTHOGRAPHIC_POLYGON,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPolygon: d => d.polygon,
      getFillColor: [40, 120, 220],
      stroked: false,
      fillPatternAtlas: '/test/data/pattern.png',
      fillPatternMapping: '/test/data/pattern.json',
      fillPatternSizeUnits: 'pixels',
      getFillPattern: () => 'hatch-1x',
      getFillPatternScale: 1,
      extensions: [new FillStyleExtension({pattern: true})]
    })
  ],
  // Both views should produce the same screen-space orientation.
  goldenImage: './test/render/golden-images/fill-pattern-orientation.png',
  skip: ['webgpu']
}));

type PatternSwatch = {
  position: [number, number];
  pattern: string;
  color: [number, number, number];
  scale: number;
};

const PATTERN_SWATCHES: PatternSwatch[] = [
  {position: [-300, 0], pattern: 'default-hatch', color: [255, 255, 255], scale: 5},
  {position: [-200, 0], pattern: 'default-cross-hatch', color: [255, 255, 255], scale: 5},
  {position: [-100, 0], pattern: 'default-dots', color: [255, 255, 255], scale: 5},
  {position: [0, 0], pattern: 'hatch', color: [40, 120, 220], scale: 1},
  {position: [100, 0], pattern: 'double-hatch', color: [0, 160, 120], scale: 1},
  {position: [200, 0], pattern: 'cross-hatch', color: [220, 120, 20], scale: 1},
  {position: [300, 0], pattern: 'dots', color: [180, 60, 180], scale: 1}
];

const customPatternTestCase: TestCase = {
  name: 'fill-pattern-procedural-configs',
  views: new OrthographicView(),
  viewState: {target: [0, 0, 0], zoom: 0},
  layers: [
    new ScatterplotLayer<PatternSwatch, FillStyleExtensionProps<PatternSwatch>>({
      id: 'procedural-configs',
      data: PATTERN_SWATCHES,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: d => d.position,
      getRadius: 44,
      radiusUnits: 'pixels',
      getFillColor: d => d.color,
      getLineColor: [80, 80, 80],
      getLineWidth: 2,
      lineWidthUnits: 'pixels',
      stroked: true,
      fillPatternMapping: {
        'default-hatch': {type: 'hatch'},
        'default-cross-hatch': {type: 'cross-hatch'},
        'default-dots': {type: 'dots'},
        hatch: {type: 'hatch', angle: 20, strokeWidth: 6, gap: 12},
        'double-hatch': {type: 'hatch', angle: -25, strokeWidth: 4, gap: [5, 16]},
        'cross-hatch': {type: 'cross-hatch', angles: [15, 105], strokeWidth: 3, gap: 14},
        dots: {type: 'dots', radius: 5, gap: 12, angle: 20, skew: 30}
      },
      fillPatternSizeUnits: 'pixels',
      getFillPattern: d => d.pattern,
      getFillPatternScale: d => d.scale,
      getFillPatternBackgroundColor: [0, 0, 0, 255],
      extensions: [new FillStyleExtension({proceduralPattern: true})]
    })
  ],
  goldenImage: './test/render/golden-images/fill-pattern-procedural-configs.png',
  skip: ['webgpu']
};

const testCases = [
  ...rasterPatternTestCases,
  ...explicitUnitTestCases,
  ...orientationTestCases,
  customPatternTestCase
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases, deviceType);
});
