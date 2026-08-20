// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, test} from 'vitest';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {runRenderTestSuite, isRenderTestDeviceEnabled} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';
import {measureWebGPUEdges, STROKE_COLOR} from '../webgpu-antialiasing-test-utils';

import {COORDINATE_SYSTEM, Deck, OrthographicView, _GlobeView as GlobeView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {zigzag, zigzag3D, meterPaths, positionOrigin} from 'deck.gl-test/data';

// biome-ignore format: preserve layout
const DASH_TEST_DATA = [
  [53.38,218.93,43.55,179.03,26.22,158.15,-2.25,138.62,-38.51,128.07,-72.23,127.35,-103.39,133.87,
    -117.30,141.74,-126.97,153.52,-130.41,168.93,-126.97,184.34,-117.30,196.12,-103.39,203.99,-72.23,210.51,
    -38.51,209.79,-2.25,199.24,26.22,179.71,43.55,158.83,53.38,118.93,43.55,79.03,26.22,58.15,-2.25,38.62,
    -38.51,28.07,-72.23,27.35,-103.39,33.87,-117.30,41.74,-126.97,53.52,-130.41,68.93,-126.97,84.34,-117.30,96.12,
    -103.39,103.99,-72.23,110.51,-38.51,109.79,-2.25,99.24,26.22,79.71,43.55,58.83,53.38,18.93],
  [-147.88,-152.35,-97.88,-238.95,2.12,-238.95,52.12,-152.35,2.12,-65.75,-97.88,-65.75,-147.88,-152.35]
];

const ROUNDED_TEST_DATA = [
  {
    path: [
      [-200, -200],
      [-100, 200],
      [-25, -100],
      [25, 100],
      [75, -100]
    ]
  }
];

const testCases = [
  {
    name: 'path-miter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: zigzag,
        opacity: 0.6,
        getPath: f => f.path,
        getColor: [255, 0, 0],
        getWidth: 200,
        miterLimit: 0,
        widthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/path-lnglat.png'
  },
  {
    name: 'path-lnglat-binary',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: {
          length: zigzag.length,
          startIndices: zigzag.reduce(
            (acc, d) => {
              acc.push(acc[acc.length - 1] + d.path.length);
              return acc;
            },
            [0]
          ),
          attributes: {
            getPath: {
              value: new Float64Array(zigzag.flatMap(d => d.path.flat())),
              size: 2
            },
            getColor: {
              value: new Uint8Array(zigzag.flatMap(d => d.path.flatMap(p => [255, 0, 0]))),
              size: 3
            }
          }
        },
        getWidth: 200,
        miterLimit: 0,
        opacity: 0.6,
        widthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/path-lnglat.png'
  },
  {
    name: 'path-billboard',
    viewState: {
      latitude: 37.7518488,
      longitude: -122.427699,
      zoom: 16.5,
      pitch: 55,
      bearing: -20
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: zigzag3D,
        opacity: 0.6,
        billboard: true,
        getPath: f => f.path,
        getColor: f => [128, 0, 0],
        getWidth: f => 10
      })
    ],
    goldenImage: './test/render/golden-images/path-billboard.png'
  },
  {
    name: 'path-meter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-meter',
        data: meterPaths,
        getColor: [255, 0, 0],
        getWidth: 10,
        widthScale: 100,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: positionOrigin
      })
    ],
    goldenImage: './test/render/golden-images/path-meter.png'
  },
  {
    name: 'path-rounded',
    viewState: {
      latitude: 37.79,
      longitude: -122.41,
      zoom: 15,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-rounded',
        data: ROUNDED_TEST_DATA,
        getColor: [255, 0, 0],
        getWidth: 60,
        jointRounded: true,
        capRounded: true,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.41, 37.79]
      }),
      new PathLayer({
        id: 'path-rounded-cap',
        data: ROUNDED_TEST_DATA,
        getColor: [0, 255, 0],
        getWidth: 60,
        jointRounded: false,
        capRounded: true,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.415, 37.79]
      }),
      new PathLayer({
        id: 'path-rounded-joint',
        data: ROUNDED_TEST_DATA,
        getColor: [0, 0, 255],
        getWidth: 60,
        jointRounded: true,
        capRounded: false,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.405, 37.79]
      })
    ],
    goldenImage: './test/render/golden-images/path-rounded.png'
  },
  {
    name: 'path-dash',
    skip: ['webgpu'],
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: -0.5
    },
    layers: [
      new PathLayer({
        id: 'path-dash-justified',
        data: DASH_TEST_DATA,
        getPath: d => d,
        positionFormat: 'XY',
        getDashArray: [4, 5],
        getLineColor: [200, 0, 0],
        widthMinPixels: 10,
        dashJustified: true,
        extensions: [new PathStyleExtension({dash: true})]
      }),
      new PathLayer({
        id: 'path-dash-high-precision',
        modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 0, 0, 1],
        data: DASH_TEST_DATA,
        getPath: d => d,
        positionFormat: 'XY',
        getDashArray: [4, 5],
        getLineColor: [200, 0, 0],
        widthMinPixels: 10,
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      })
    ],
    goldenImage: './test/render/golden-images/path-dash.png'
  },
  {
    name: 'path-dash-rounded',
    skip: ['webgpu'],
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: -0.5
    },
    layers: [
      new PathLayer({
        id: 'path-dash-justified',
        data: DASH_TEST_DATA,
        getPath: d => d,
        positionFormat: 'XY',
        getDashArray: [4, 5],
        getLineColor: [200, 0, 0],
        widthMinPixels: 10,
        dashJustified: true,
        capRounded: true,
        jointRounded: true,
        extensions: [new PathStyleExtension({dash: true})]
      }),
      new PathLayer({
        id: 'path-dash-high-precision',
        modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 0, 0, 1],
        data: DASH_TEST_DATA,
        getPath: d => d,
        positionFormat: 'XY',
        getDashArray: [4, 5],
        getLineColor: [200, 0, 0],
        widthMinPixels: 10,
        capRounded: true,
        jointRounded: true,
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      })
    ],
    goldenImage: './test/render/golden-images/path-dash-rounded.png'
  },
  {
    name: 'path-offset',
    skip: ['webgpu'],
    viewState: {
      latitude: 37.71,
      longitude: -122.405,
      zoom: 13
    },
    layers: [
      new PathLayer({
        id: 'path-offset',
        data: [
          {
            path: [
              [-122.39, 37.7],
              [-122.42, 37.7],
              [-122.42, 37.72]
            ],
            color: [255, 180, 0]
          },
          {
            path: [
              [-122.42, 37.72],
              [-122.42, 37.7],
              [-122.39, 37.7]
            ],
            color: [80, 0, 255]
          }
        ],
        getPath: f => f.path,
        getColor: f => f.color,
        getWidth: 100,
        getOffset: 1,
        extensions: [new PathStyleExtension({offset: true})]
      })
    ],
    goldenImage: './test/render/golden-images/path-offset.png'
  },
  {
    name: 'path-globe',
    views: [new GlobeView()],
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 1.5
    },
    layers: [
      new PathLayer({
        id: 'path-globe',
        data: getGraticules(30),
        getPath: d => d,
        widthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/path-globe.png'
  }
];

function getGraticules(resolution) {
  const graticules = [];
  for (let lat = 0; lat < 90; lat += resolution) {
    const path1 = [];
    const path2 = [];
    for (let lon = -180; lon <= 180; lon += 90) {
      path1.push([lon, lat]);
      path2.push([lon, -lat]);
    }
    graticules.push(path1);
    graticules.push(path2);
  }
  for (let lon = -180; lon < 180; lon += resolution) {
    const path = [];
    for (let lat = -90; lat <= 90; lat += 90) {
      path.push([lon, lat]);
    }
    graticules.push(path);
  }
  return graticules;
}

// `antialiasing` exists for contexts created without multisampling - notably interleaved rendering
// into a base map, since MapLibre and Mapbox create their WebGL context with `antialias: false`.
// Both the isolated no-MSAA device and `includeAA: true` are required for this golden to
// distinguish shader coverage from browser multisampling and pixelmatch's default AA filtering.
// See dev-docs/RFCs/v9.4/analytic-antialiasing-rfc.md
const ANTIALIASING_GOLDEN_DIAGONALS = Array.from({length: 20}, (_, index) => ({
  path: [
    [-170, -210 + index * 10],
    [170, -210 + index * 10 + 6]
  ]
}));

const ANTIALIASING_GOLDEN_ZIGZAG = [
  {
    path: [
      [-170, 20],
      [-60, 100],
      [50, 20],
      [170, 90]
    ]
  }
];

function offsetAntialiasingPaths(xOffset: number, paths: {path: number[][]}[]) {
  return paths.map(data => ({path: data.path.map(([x, y]) => [x + xOffset, y])}));
}

function createAntialiasingGoldenVariant(antialiasing: boolean) {
  const xOffset = antialiasing ? 200 : -200;
  const suffix = antialiasing ? 'on' : 'off';
  return [
    new PathLayer({
      id: `path-aa-diagonals-${suffix}`,
      data: offsetAntialiasingPaths(xOffset, ANTIALIASING_GOLDEN_DIAGONALS),
      getPath: data => data.path,
      getColor: [20, 20, 20],
      getWidth: 2,
      widthUnits: 'pixels',
      antialiasing
    }),
    new PathLayer({
      id: `path-aa-rounded-${suffix}`,
      data: offsetAntialiasingPaths(xOffset, ANTIALIASING_GOLDEN_ZIGZAG),
      getPath: data => data.path,
      getColor: [200, 60, 0],
      getWidth: 7,
      widthUnits: 'pixels',
      jointRounded: true,
      capRounded: true,
      antialiasing
    }),
    new PathLayer({
      id: `path-aa-miter-${suffix}`,
      data: offsetAntialiasingPaths(xOffset, ANTIALIASING_GOLDEN_ZIGZAG).map(data => ({
        path: data.path.map(([x, y]) => [x, y + 110])
      })),
      getPath: data => data.path,
      getColor: [0, 90, 200],
      getWidth: 7,
      widthUnits: 'pixels',
      jointRounded: false,
      capRounded: false,
      antialiasing
    })
  ];
}

const antialiasingGoldenTestCases: TestCase[] = [
  {
    name: 'path-antialiasing',
    skip: ['msaa'],
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [...createAntialiasingGoldenVariant(false), ...createAntialiasingGoldenVariant(true)],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/path-antialiasing.png'
  }
];

const ANTIALIASING_TEST_WIDTH = 240;
const ANTIALIASING_TEST_HEIGHT = 180;
const ANTIALIASING_MEASURE_DIAGONALS = [0, 1, 2, 3].map(index => ({
  path: [
    [-110, -70 + index * 42],
    [110, -70 + index * 42 + 6 + index * 9]
  ]
}));

type Coverage = {solid: number; partial: number; levels: number; minimumPartial: number};

function createAntialiasingTestContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.style.cssText =
    `position:absolute;top:0;left:0;width:${ANTIALIASING_TEST_WIDTH}px;` +
    `height:${ANTIALIASING_TEST_HEIGHT}px;`;
  document.body.appendChild(container);
  return container;
}

/** Render one PathLayer into a context without MSAA and measure the resulting coverage. */
async function measureAntialiasingCoverage(layerProps: Record<string, unknown>): Promise<Coverage> {
  const container = createAntialiasingTestContainer();
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
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0}
  });

  const coverage = await new Promise<Coverage>(resolve => {
    deck.setProps({
      layers: [
        new PathLayer({
          id: 'path-antialiasing',
          data: ANTIALIASING_MEASURE_DIAGONALS,
          getPath: data => data.path,
          getColor: [20, 20, 20],
          getWidth: 2,
          widthUnits: 'pixels',
          ...layerProps
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

describe('PathLayer render tests', () => {
  describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
    runRenderTestSuite([...testCases, ...antialiasingGoldenTestCases] as TestCase[], deviceType);
  });

  describe('webgl-no-msaa', () => {
    runRenderTestSuite(antialiasingGoldenTestCases, 'webgl', {
      deviceMode: 'isolated',
      webgl: {antialias: false}
    });
  });
});

describe.skipIf(!isRenderTestDeviceEnabled('webgl'))('PathLayer#antialiasing', () => {
  test('adds analytic coverage where the context provides none', async () => {
    const off = await measureAntialiasingCoverage({antialiasing: false});
    const on = await measureAntialiasingCoverage({antialiasing: true});

    expect(off.solid, 'strokes were drawn').toBeGreaterThan(500);
    expect(on.solid, 'strokes were drawn').toBeGreaterThan(200);
    expect(
      off.partial,
      `antialiasing:false in a non-MSAA context should produce no partial coverage ` +
        `(got ${off.partial} partial pixels)`
    ).toBe(0);
    expect(
      on.partial,
      `antialiasing:true should feather the edges (got ${on.partial} partial pixels)`
    ).toBeGreaterThan(300);
    expect(
      on.levels,
      `coverage should be continuous, not quantized (got ${on.levels} distinct alpha levels)`
    ).toBeGreaterThan(40);
    expect(
      on.minimumPartial,
      `the rasterized envelope should include the outer half of the coverage ramp ` +
        `(minimum alpha ${on.minimumPartial})`
    ).toBeLessThan(96);
  }, 60000);

  test('feather survives an extension that rescales the stroke', async () => {
    const on = await measureAntialiasingCoverage({antialiasing: true});
    const onOffset = await measureAntialiasingCoverage({
      antialiasing: true,
      getOffset: 1,
      extensions: [new PathStyleExtension({offset: true})]
    });

    expect(onOffset.solid, 'offset strokes were drawn').toBeGreaterThan(200);
    expect(
      onOffset.partial,
      `offset stroke should still be feathered (got ${onOffset.partial} partial pixels)`
    ).toBeGreaterThan(200);
    expect(
      onOffset.levels,
      `offset coverage should be continuous (got ${onOffset.levels} distinct alpha levels)`
    ).toBeGreaterThan(40);

    const ratio = onOffset.partial / on.partial;
    expect(
      ratio,
      `offset feather should be comparable to un-offset (on=${on.partial}, ` +
        `offset=${onOffset.partial}, ratio=${ratio.toFixed(3)})`
    ).toBeGreaterThan(0.35);
  }, 60000);
});

describe.skipIf(!isRenderTestDeviceEnabled('webgpu'))('PathLayer#antialiasing on WebGPU', () => {
  test('coverage is applied before premultiplication', async () => {
    const {partial, worstOvershoot} = await measureWebGPUEdges([
      new PathLayer({
        id: 'webgpu-path-antialiasing',
        data: ANTIALIASING_MEASURE_DIAGONALS,
        getPath: data => data.path,
        getColor: STROKE_COLOR,
        getWidth: 2,
        widthUnits: 'pixels',
        antialiasing: true
      })
    ]);

    expect(partial, `strokes should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
      300
    );
    expect(
      worstOvershoot,
      `premultiplied red should track alpha (worst overshoot ${worstOvershoot})`
    ).toBeLessThanOrEqual(2);
  }, 60000);
});
