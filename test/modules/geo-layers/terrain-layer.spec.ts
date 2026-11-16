// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {device, generateLayerTests, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {
  Deck,
  LayerManager,
  MapView,
  _CustomProjectionView as CustomProjectionView
} from '@deck.gl/core';
import {TerrainLayer, TileLayer} from '@deck.gl/geo-layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TerrainLoader} from '@loaders.gl/raster/terrain/index';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';

const TEST_TERRAIN_MESH = {
  header: {
    boundingBox: [
      [-1, -1, 0],
      [1, 1, 1]
    ]
  },
  attributes: {
    positions: {
      size: 3,
      value: new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 1])
    },
    normals: {
      size: 3,
      value: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])
    },
    texCoords: {
      size: 2,
      value: new Float32Array([0, 0, 1, 0, 0.5, 1])
    }
  }
};

const fetchTerrainFixture: NonNullable<TerrainLayer['props']['fetch']> = (_url, {propName}) =>
  Promise.resolve(propName === 'texture' ? new ImageData(1, 1) : TEST_TERRAIN_MESH);

class TestTerrainLayer extends TerrainLayer {
  static layerName = 'TestTerrainLayer';

  loadTerrain() {
    return TEST_TERRAIN_MESH as any;
  }
}

test('TerrainLayer#initializes its mesh sublayer with a WebGPU device', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView({}).makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const texture = webgpuDevice.createTexture({
    data: new Uint8Array([255, 128, 64, 255]),
    width: 1,
    height: 1
  });
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});
  const layer = new TestTerrainLayer({
    id: 'webgpu-terrain',
    elevationData: 'terrain.png',
    bounds: [-1, -1, 1, 1],
    texture: texture as any
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([layer]);

  const meshLayer = layer.getSubLayers()[0] as SimpleMeshLayer;
  expect(errors).toEqual([]);
  expect(meshLayer).toBeInstanceOf(SimpleMeshLayer);
  expect(meshLayer.state.model).toBeDefined();
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

  layerManager.finalize();
  texture.delete();
});

test('TerrainLayer', async () => {
  const testCases = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'terrain/{z}/{x}/{y}.png',
      texture: 'surface/{z}/{x}/{y}.png',
      fetch: fetchTerrainFixture,
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof TileLayer, 'rendered TileLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({Layer: TerrainLayer, testCases, onError: err => expect(err).toBeFalsy()});

  const testCasesNonTiled = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'terrain.png',
      fetch: fetchTerrainFixture,
      bounds: [-180, 85, 0, 0],
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof SimpleMeshLayer, 'rendered SimpleMeshLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({
    Layer: TerrainLayer,
    testCases: testCasesNonTiled,
    onError: err => expect(err).toBeFalsy()
  });
});

const webglTest = device.type === 'webgl' ? test : test.skip;
const ELEVATION = 100;

/** Builds a flat mesh on the bounds that the layer asks for, at a fixed elevation */
class BoundsTerrainLayer extends TerrainLayer {
  static layerName = 'BoundsTerrainLayer';

  loadTerrain({bounds}) {
    const [minX, minY, maxX, maxY] = bounds;
    return Promise.resolve({
      header: {
        boundingBox: [
          [minX, minY, ELEVATION],
          [maxX, maxY, ELEVATION]
        ]
      },
      attributes: {
        POSITION: {
          size: 3,
          value: new Float32Array([
            minX,
            minY,
            ELEVATION,
            maxX,
            minY,
            ELEVATION,
            maxX,
            maxY,
            ELEVATION,
            minX,
            maxY,
            ELEVATION
          ])
        },
        TEXCOORD_0: {size: 2, value: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])}
      },
      indices: {size: 1, value: new Uint32Array([0, 1, 2, 0, 2, 3])}
    }) as any;
  }
}

for (const {title, crs, viewState, span} of [
  {
    title: 'UTM zone 15N',
    crs: 'EPSG:32615',
    viewState: {center: [-93.2, 45, 0] as [number, number, number], zoom: 10, pitch: 30},
    // Half of the size of a mesh that is approximately 100 pixels wide
    span: [0.05, 0.02]
  },
  {
    title: 'south polar stereographic',
    crs: '+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +datum=WGS84 +units=m',
    viewState: {center: [-60, -70, 0] as [number, number, number], zoom: 6},
    span: [1, 0.4]
  }
]) {
  test(`TerrainLayer#CustomProjectionView draws each tile at its position (${title})`, async () => {
    const view = new CustomProjectionView({crs});
    await view.initialize();
    const viewport = view.makeViewport({width: 400, height: 300, viewState})!;
    let checkedTiles = 0;

    await testLayerAsync({
      Layer: BoundsTerrainLayer,
      viewport,
      testCases: [
        {
          props: {
            elevationData: 'terrain/{z}/{x}/{y}.png',
            fetch: fetchTerrainFixture
          },
          onAfterUpdate: ({layer}) => {
            if (!layer.isLoaded) return;
            const meshLayers = layer.getSubLayers()[0]?.getSubLayers() as SimpleMeshLayer[];
            expect(meshLayers.length, 'draws tiles').toBeGreaterThan(0);
            for (const meshLayer of meshLayers) {
              const {west, south, east, north} = (meshLayer.props as any).tile.bbox;
              // The mesh overlaps its neighbors by one pixel
              const marginLng = (east - west) / 100;
              const marginLat = (north - south) / 100;
              const positions = (meshLayer.props.mesh as any).attributes.POSITION.value;
              for (let i = 0; i < positions.length; i += 3) {
                const common = meshLayer.projectPosition(Array.from(positions.subarray(i, i + 3)), {
                  autoOffset: false
                });
                const [lng, lat, z] = viewport.unprojectPosition(common);
                const message = `${meshLayer.id} vertex ${i / 3}: ${lng}, ${lat}, ${z}`;
                expect(lng, message).toBeGreaterThan(west - marginLng);
                expect(lng, message).toBeLessThan(east + marginLng);
                expect(lat, message).toBeGreaterThan(south - marginLat);
                expect(lat, message).toBeLessThan(north + marginLat);
                expect(z, message).toBeCloseTo(ELEVATION, 3);
              }
              checkedTiles++;
            }
          }
        }
      ],
      onError: err => expect(err).toBeFalsy()
    });
    expect(checkedTiles, 'checked loaded tiles').toBeGreaterThan(0);
  });

  webglTest(`TerrainLayer#CustomProjectionView draws a mesh in its bounds (${title})`, async () => {
    const [lng0, lat0] = viewState.center;
    const bounds: [number, number, number, number] = [
      lng0 - span[0],
      lat0 - span[1],
      lng0 + span[0],
      lat0 + span[1]
    ];
    const layer = new BoundsTerrainLayer({
      id: `terrain-mesh-${title}`,
      elevationData: 'terrain.png',
      bounds,
      fetch: fetchTerrainFixture,
      pickable: true
    });
    const deck = new Deck({
      width: 400,
      height: 300,
      useDevicePixels: false,
      views: new CustomProjectionView({crs}),
      viewState,
      layers: [layer]
    });
    await new Promise<void>(resolve => {
      deck.setProps({
        onAfterRender: () => {
          // @ts-expect-error private member
          if (deck.layerManager && !deck.layerManager.needsUpdate() && layer.isLoaded) {
            resolve();
          }
        }
      });
    });
    const viewport = deck.getViewports()[0];
    for (const [lng, lat] of [
      [lng0, lat0],
      [bounds[0] + span[0] / 10, bounds[1] + span[1] / 10],
      [bounds[2] - span[0] / 10, bounds[3] - span[1] / 10]
    ]) {
      const [x, y] = viewport.project([lng, lat, ELEVATION]);
      expect(deck.pickObject({x, y, radius: 0})?.layer?.id, `${lng}, ${lat}`).toBe(layer.id);
    }
    // The Deck made a WebGL context. Release it: when there are too many, the browser loses the
    // oldest one, which the other tests use.
    const canvas = deck.getCanvas()!;
    expect(canvas, 'the Deck made its own canvas').not.toBe(
      device.getDefaultCanvasContext().canvas
    );
    const gl = canvas.getContext('webgl2')!;
    deck.finalize();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  });
}

test('TerrainLayer#CustomProjectionView keeps the height range in meters', async () => {
  // Heights in feet
  const view = new CustomProjectionView({
    crs: '+proj=utm +zone=15 +datum=WGS84 +units=m +vunits=ft'
  });
  await view.initialize();
  const viewport = view.makeViewport({
    width: 400,
    height: 300,
    viewState: {center: [-93.2, 45, 0], zoom: 10, pitch: 30}
  })!;
  let zRange: number[] | null = null;

  await testLayerAsync({
    Layer: BoundsTerrainLayer,
    viewport,
    testCases: [
      {
        props: {
          elevationData: 'terrain/{z}/{x}/{y}.png',
          fetch: fetchTerrainFixture
        },
        onAfterUpdate: ({layer}) => {
          if (layer.isLoaded && layer.state.zRange) {
            zRange = layer.state.zRange;
          }
        }
      }
    ],
    onError: err => expect(err).toBeFalsy()
  });
  expect(zRange, 'zRange is set').toBeTruthy();
  // TileLayer takes zRange in meters
  expect(zRange![0]).toBeCloseTo(ELEVATION, 3);
  expect(zRange![1]).toBeCloseTo(ELEVATION, 3);
});
