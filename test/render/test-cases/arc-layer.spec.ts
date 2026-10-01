// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, test} from 'vitest';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {runRenderTestSuite, isRenderTestDeviceEnabled} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';
import {measureWebGPUEdges, STROKE_COLOR} from '../webgpu-antialiasing-test-utils';

import {COORDINATE_SYSTEM, Deck, MapView, OrthographicView} from '@deck.gl/core';
import {ArcLayer} from '@deck.gl/layers';

import * as dataSamples from 'deck.gl-test/data';

const testCases = [
  {
    name: 'arc-lnglat',
    viewState: {
      latitude: 37.76,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        opacity: 0.8,
        getWidth: 2,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat.png'
  },
  {
    name: 'arc-lnglat-wrap-longitude',
    viewState: {
      latitude: 37.76,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        opacity: 0.8,
        getWidth: 2,
        wrapLongitude: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat.png'
  },
  {
    name: 'arc-lnglat-wrap-longitude-high-zoom',
    viewState: {
      latitude: 37.76,
      longitude: -122.45,
      zoom: 13,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        opacity: 0.8,
        getWidth: 2,
        wrapLongitude: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat-high-zoom.png'
  },
  {
    name: 'arc-lnglat-3d',
    viewState: {
      latitude: 37.788,
      longitude: -122.45,
      zoom: 13,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat-3d',
        data: [
          {source: [-122.46, 37.77, -150], target: [-122.44, 37.77, 450], height: 0.5},
          {source: [-122.46, 37.77, -150], target: [-122.44, 37.77, 450], height: 1},
          {source: [-122.46, 37.77, -150], target: [-122.44, 37.77, 450], height: 2},
          {source: [-122.46, 37.78, 600], target: [-122.44, 37.78, 0], height: 0.5},
          {source: [-122.46, 37.78, 600], target: [-122.44, 37.78, 0], height: 1},
          {source: [-122.46, 37.78, 600], target: [-122.44, 37.78, 0], height: 2}
        ],
        opacity: 0.8,
        getWidth: 4,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getHeight: d => d.height,
        getSourceColor: [255, 255, 0],
        getTargetColor: [255, 0, 0]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat-3d.png'
  },
  {
    name: 'arc-shortest-path',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 20,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'arc-shortest-path',
        data: dataSamples.greatCircles,
        wrapLongitude: true,
        getWidth: 5,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-shortest-path.png'
  },
  {
    name: 'arc-shortest-path-high-zoom',
    viewState: {
      latitude: 0,
      longitude: -179.99,
      zoom: 13,
      pitch: 20,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'arc-shortest-path-high-zoom',
        data: [
          {source: [179.8, 0.1], target: [-179.8, -0.1]},
          {source: [-179.8, 0.1], target: [179.8, -0.1]}
        ],
        wrapLongitude: true,
        getWidth: 5,
        getHeight: 0,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-shortest-path-high-zoom.png'
  },
  {
    name: 'arc-shortest-path-high-zoom-2',
    viewState: {
      latitude: 0,
      longitude: 179.99,
      zoom: 13,
      pitch: 20,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'arc-shortest-path-high-zoom',
        data: [
          {source: [179.8, 0.1], target: [-179.8, -0.1]},
          {source: [-179.8, 0.1], target: [179.8, -0.1]}
        ],
        wrapLongitude: true,
        getWidth: 5,
        getHeight: 0,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-shortest-path-high-zoom-2.png'
  },
  {
    name: 'great-circle',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'great-circle',
        data: dataSamples.greatCircles,
        getWidth: 5,
        getHeight: 0,
        greatCircle: true,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/great-circle.png'
  },
  {
    name: 'great-circle-modified-segments',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'great-circle-modified-segments',
        data: [{source: [64, 17], target: [-112, 7]}],
        getWidth: 5,
        getHeight: 0,
        greatCircle: true,
        numSegments: 150,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/great-circle-modified-segments.png'
  }
];

// Render without MSAA and include antialiased pixels in the diff. Both settings are required for
// the golden to distinguish shader coverage from the browser's default multisampling.
const ANTIALIASING_GOLDEN_ARCS = Array.from({length: 18}, (_, index) => ({
  sourcePosition: [-170, -210 + index * 24, 0],
  targetPosition: [170, -204 + index * 24, 0]
}));

function createAntialiasingGoldenVariant(antialiasing: boolean): ArcLayer {
  const xOffset = antialiasing ? 200 : -200;
  return new ArcLayer({
    id: `arc-antialiasing-${antialiasing ? 'on' : 'off'}`,
    data: ANTIALIASING_GOLDEN_ARCS.map(({sourcePosition, targetPosition}) => ({
      sourcePosition: [sourcePosition[0] + xOffset, sourcePosition[1], 0],
      targetPosition: [targetPosition[0] + xOffset, targetPosition[1], 0]
    })),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getSourcePosition: data => data.sourcePosition,
    getTargetPosition: data => data.targetPosition,
    getSourceColor: [200, 60, 0],
    getTargetColor: [0, 90, 200],
    getWidth: 2,
    getHeight: 0.2,
    getTilt: 90,
    widthUnits: 'pixels',
    numSegments: 50,
    antialiasing
  });
}

const antialiasingGoldenTestCases: TestCase[] = [
  {
    name: 'arc-antialiasing',
    skip: ['msaa'],
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [createAntialiasingGoldenVariant(false), createAntialiasingGoldenVariant(true)],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/arc-antialiasing.png'
  }
];

const ANTIALIASING_TEST_WIDTH = 240;
const ANTIALIASING_TEST_HEIGHT = 180;
const ANTIALIASING_MEASURE_ARCS = [0, 1, 2, 3].map(index => ({
  sourcePosition: [-122.49, 37.73 + index * 0.015],
  targetPosition: [-122.41, 37.732 + index * 0.018]
}));

type Coverage = {solid: number; partial: number; levels: number; minimumPartial: number};

async function measureAntialiasingCoverage(antialiasing: boolean): Promise<Coverage> {
  const container = document.createElement('div');
  container.style.cssText =
    `position:absolute;top:0;left:0;width:${ANTIALIASING_TEST_WIDTH}px;` +
    `height:${ANTIALIASING_TEST_HEIGHT}px;`;
  document.body.appendChild(container);

  const device = await luma.createDevice({
    type: 'webgl',
    adapters: [webgl2Adapter],
    webgl: {antialias: false},
    createCanvasContext: {
      container,
      width: ANTIALIASING_TEST_WIDTH,
      height: ANTIALIASING_TEST_HEIGHT,
      useDevicePixels: false,
      autoResize: true
    }
  });

  const deck = new Deck({
    device,
    container,
    width: ANTIALIASING_TEST_WIDTH,
    height: ANTIALIASING_TEST_HEIGHT,
    useDevicePixels: false,
    initialViewState: {longitude: -122.45, latitude: 37.76, zoom: 11}
  });

  const coverage = await new Promise<Coverage>(resolve => {
    deck.setProps({
      layers: [
        new ArcLayer({
          id: 'arc-antialiasing',
          data: ANTIALIASING_MEASURE_ARCS,
          getSourceColor: [20, 20, 20],
          getTargetColor: [20, 20, 20],
          getWidth: 2,
          getHeight: 0.4,
          widthUnits: 'pixels',
          antialiasing
        })
      ],
      onAfterRender: () => {
        const gl = (device as any).gl;
        const pixels = new Uint8Array(ANTIALIASING_TEST_WIDTH * ANTIALIASING_TEST_HEIGHT * 4);
        gl.readPixels(
          0,
          0,
          ANTIALIASING_TEST_WIDTH,
          ANTIALIASING_TEST_HEIGHT,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels
        );
        let solid = 0;
        let partial = 0;
        let minimumPartial = 255;
        const levels = new Set<number>();
        for (let index = 3; index < pixels.length; index += 4) {
          const alpha = pixels[index];
          if (alpha === 255) {
            solid++;
          } else if (alpha > 0) {
            partial++;
            minimumPartial = Math.min(minimumPartial, alpha);
            levels.add(alpha);
          }
        }
        resolve({solid, partial, levels: levels.size, minimumPartial});
      }
    });
  });

  deck.finalize();
  device.destroy();
  container.remove();
  return coverage;
}

describe('ArcLayer render tests', () => {
  describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
    runRenderTestSuite([...testCases, ...antialiasingGoldenTestCases] as TestCase[], deviceType);
  });
});

describe.runIf(isRenderTestDeviceEnabled('webgl'))('ArcLayer#antialiasing', () => {
  test('adds analytic coverage where the context provides none', async () => {
    const off = await measureAntialiasingCoverage(false);
    const on = await measureAntialiasingCoverage(true);

    expect(off.solid, 'arcs were drawn').toBeGreaterThan(500);
    expect(off.partial, 'non-MSAA arcs have hard edges by default').toBe(0);
    expect(on.partial, 'analytic antialiasing feathers the arc edges').toBeGreaterThan(300);
    expect(on.levels, 'coverage is continuous').toBeGreaterThan(40);
    expect(on.minimumPartial, 'the full centered coverage ramp is rasterized').toBeLessThan(96);
  }, 60000);
});

describe.runIf(isRenderTestDeviceEnabled('webgpu'))('ArcLayer#antialiasing on WebGPU', () => {
  test('coverage is applied before premultiplication', async () => {
    const {partial, worstOvershoot} = await measureWebGPUEdges(
      [
        new ArcLayer({
          id: 'webgpu-arc-antialiasing',
          data: ANTIALIASING_MEASURE_ARCS,
          getSourceColor: STROKE_COLOR,
          getTargetColor: STROKE_COLOR,
          getWidth: 2,
          getHeight: 0.4,
          antialiasing: true
        })
      ],
      new MapView(),
      {longitude: -122.45, latitude: 37.76, zoom: 11}
    );

    expect(partial, `arcs should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
      300
    );
    expect(worstOvershoot, 'premultiplied red should track alpha').toBeLessThanOrEqual(2);
  }, 60000);
});
