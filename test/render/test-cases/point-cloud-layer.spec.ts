// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, test} from 'vitest';
import {luma} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/webgl';
import {runRenderTestSuite, isRenderTestDeviceEnabled} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';
import {measureWebGPUEdges, STROKE_COLOR} from '../webgpu-antialiasing-test-utils';

import {OrbitView, COORDINATE_SYSTEM, Deck, OrthographicView} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {getPointCloud, positionOrigin} from 'deck.gl-test/data';

const POINTCLOUD = getPointCloud();

const testCases = [
  {
    name: 'pointcloud-identity',
    views: [
      new OrbitView({
        fov: 30,
        orbitAxis: 'Y'
      })
    ],
    viewState: {
      rotationX: 15,
      rotationOrbit: 30
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-identity',
        data: [{position: [0, 100, 0]}, {position: [-100, -100, 0]}, {position: [100, -100, 0]}],
        opacity: 0.8,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: d => d.position,
        getNormal: d => [0, 0.5, 0.2],
        getColor: d => [255, 255, 0, 128],
        pointSize: 50
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-identity.png'
  },
  {
    name: 'pointcloud-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-lnglat',
        data: POINTCLOUD,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        coordinateOrigin: positionOrigin,
        getPosition: d => [d.position[0] * 1e-5, d.position[1] * 1e-5, d.position[2]],
        getNormal: d => d.normal,
        getColor: d => d.color,
        pointSize: 1.333333,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-lnglat.png'
  },
  {
    name: 'pointcloud-meter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-meter',
        data: {
          length: POINTCLOUD.length,
          attributes: {
            getPosition: new Float32Array(POINTCLOUD.flatMap(d => d.position)),
            getNormal: new Float32Array(POINTCLOUD.flatMap(d => d.normal)),
            getColor: {
              value: new Uint8Array(POINTCLOUD.flatMap(d => [...d.color, 255])),
              size: 4
            }
          }
        },
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: positionOrigin,
        pointSize: 1.333333,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-meter.png'
  }
];

// Render without MSAA and include antialiased pixels in the diff. Both settings are required for
// the golden to distinguish shader coverage from the browser's default multisampling.
const ANTIALIASING_GOLDEN_POINTS = Array.from({length: 13 * 11}, (_, index) => ({
  position: [-156 + (index % 13) * 26.125, -190 + Math.floor(index / 13) * 38.25, 0]
}));

function createAntialiasingGoldenVariant(antialiasing: boolean): PointCloudLayer {
  const xOffset = antialiasing ? 200 : -200;
  return new PointCloudLayer({
    id: `point-cloud-antialiasing-${antialiasing ? 'on' : 'off'}`,
    data: ANTIALIASING_GOLDEN_POINTS.map(({position}) => ({
      position: [position[0] + xOffset, position[1], 0]
    })),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    getPosition: data => data.position,
    getColor: (_, {index}) => (index % 2 ? [20, 20, 20] : [0, 90, 200]),
    pointSize: 7,
    antialiasing
  });
}

const antialiasingGoldenTestCases: TestCase[] = [
  {
    name: 'point-cloud-antialiasing',
    skip: ['msaa'],
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0},
    layers: [createAntialiasingGoldenVariant(false), createAntialiasingGoldenVariant(true)],
    imageDiffOptions: {threshold: 0.998, includeAA: true},
    goldenImage: './test/render/golden-images/point-cloud-antialiasing.png'
  }
];

const ANTIALIASING_TEST_WIDTH = 240;
const ANTIALIASING_TEST_HEIGHT = 180;
const ANTIALIASING_MEASURE_POINTS = [
  {position: [-75.25, -40.25, 0]},
  {position: [-18.25, 32.5, 0]},
  {position: [42.75, -22.5, 0]},
  {position: [83.5, 47.25, 0]}
];

type Coverage = {solid: number; partial: number; levels: number; tangentAlpha: number};

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
    views: new OrthographicView(),
    viewState: {target: [0, 0, 0], zoom: 0}
  });

  const coverage = await new Promise<Coverage>(resolve => {
    deck.setProps({
      layers: [
        new PointCloudLayer({
          id: 'point-cloud-antialiasing',
          data: ANTIALIASING_MEASURE_POINTS,
          pointSize: 20,
          getColor: [20, 20, 20],
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
        const levels = new Set<number>();
        for (let index = 3; index < pixels.length; index += 4) {
          const alpha = pixels[index];
          if (alpha === 255) {
            solid++;
          } else if (alpha > 0) {
            partial++;
            levels.add(alpha);
          }
        }
        // The first point is centered at framebuffer (44.75, 130.25). Its enclosing triangle's
        // left edge is tangent to the circle at x=24.75. Pixel (24, 130) is outside that edge and
        // is covered only when the triangle gets its AA envelope.
        const tangentAlpha = pixels[(130 * ANTIALIASING_TEST_WIDTH + 24) * 4 + 3];
        resolve({solid, partial, levels: levels.size, tangentAlpha});
      }
    });
  });

  deck.finalize();
  device.destroy();
  container.remove();
  return coverage;
}

describe('PointCloudLayer render tests', () => {
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

describe.runIf(isRenderTestDeviceEnabled('webgl'))('PointCloudLayer#antialiasing', () => {
  test('adds analytic coverage where the context provides none', async () => {
    const off = await measureAntialiasingCoverage(false);
    const on = await measureAntialiasingCoverage(true);

    expect(off.solid, 'points were drawn').toBeGreaterThan(4000);
    expect(off.partial, 'non-MSAA points have hard edges by default').toBe(0);
    expect(on.partial, 'analytic antialiasing feathers circular edges').toBeGreaterThan(300);
    expect(on.levels, 'coverage is continuous').toBeGreaterThan(40);
    expect(on.tangentAlpha, 'coverage extends past the triangle tangent').toBeGreaterThan(0);
    expect(on.tangentAlpha, 'the tangent sample is on the outer half of the ramp').toBeLessThan(
      128
    );
  }, 60000);
});

describe.runIf(isRenderTestDeviceEnabled('webgpu'))(
  'PointCloudLayer#antialiasing on WebGPU',
  () => {
    test('coverage is applied before premultiplication', async () => {
      const {partial, worstOvershoot} = await measureWebGPUEdges([
        new PointCloudLayer({
          id: 'webgpu-point-cloud-antialiasing',
          data: [
            {position: [-75.5, -40.25, 0]},
            {position: [-18.25, 32.5, 0]},
            {position: [42.75, -22.5, 0]},
            {position: [83.5, 47.25, 0]}
          ],
          pointSize: 20,
          getColor: STROKE_COLOR,
          antialiasing: true
        })
      ]);

      expect(partial, `points should be feathered (got ${partial} partial pixels)`).toBeGreaterThan(
        300
      );
      expect(worstOvershoot, 'premultiplied red should track alpha').toBeLessThanOrEqual(2);
    }, 60000);
  }
);
