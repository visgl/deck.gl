// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {luma, Buffer, Texture, type Device, type Framebuffer} from '@luma.gl/core';
import {webgl2Adapter, type WebGLDevice} from '@luma.gl/webgl';
import {webglDevice as sharedWebGLDevice} from '@luma.gl/test-utils';
import {webgpuAdapter, type WebGPUDevice} from '@luma.gl/webgpu';
import {COORDINATE_SYSTEM, Deck, OrbitView, type Layer} from '@deck.gl/core';
import {
  _TerrainExtension as TerrainExtension,
  type TerrainExtensionProps
} from '@deck.gl/extensions';
import {SimpleMeshLayer, ScenegraphLayer} from '@deck.gl/mesh-layers';
import {registerLoaders} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';
import {Geometry} from '@luma.gl/engine';
import {
  PathLayer,
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  ColumnLayer,
  PointCloudLayer,
  SolidPolygonLayer,
  BitmapLayer,
  IconLayer,
  TextLayer,
  type PathLayerProps
} from '@deck.gl/layers';

registerLoaders(GLTFLoader);

const SIZE = 256;
const DATA = [
  {
    path: [
      [-100, 0],
      [100, 0]
    ],
    timestamps: [0, 100]
  }
];
// Keep slow software GPUs from accumulating frames while an async pixel read is pending.
class TestDeck extends Deck {
  pause() {
    this.animationLoop?.stop();
  }
  resume() {
    this.animationLoop?.start();
  }
}
let deck: TestDeck | undefined;
let container: HTMLDivElement | undefined;
let device: Device | undefined;
let framebuffer: Framebuffer | undefined;
let colorTexture: Texture | undefined;
const validationErrors: string[] = [];

async function readFrame(): Promise<Uint8Array> {
  if (device!.type === 'webgl') {
    const gl = (device as WebGLDevice).gl;
    const pixels = new Uint8Array(SIZE * SIZE * 4);
    gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
  }
  // Submit the render pass before copying; WebGPU readback is asynchronous.
  device!.submit();
  const buffer = device!.createBuffer({
    byteLength: SIZE * SIZE * 4,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  try {
    const encoder = device!.createCommandEncoder();
    encoder.copyTextureToBuffer({
      sourceTexture: colorTexture!,
      destinationBuffer: buffer,
      bytesPerRow: SIZE * 4,
      width: SIZE,
      height: SIZE
    });
    device!.submit(encoder.finish());
    const data = await buffer.readAsync();
    const pixels = new Uint8Array(data.length);
    // Normalize texture origin to WebGL's bottom-left pixel coordinates.
    for (let y = 0; y < SIZE; y++) {
      pixels.set(data.subarray(y * SIZE * 4, (y + 1) * SIZE * 4), (SIZE - 1 - y) * SIZE * 4);
    }
    return pixels;
  } finally {
    buffer.destroy();
  }
}

afterEach(async () => {
  deck?.pause();
  if (device?.type === 'webgpu') await (device as WebGPUDevice).handle.queue.onSubmittedWorkDone();
  deck?.finalize();
  framebuffer?.destroy();
  colorTexture?.destroy();
  device?.destroy();
  // WebGLDevice.destroy does not release the browser context. Without this,
  // per-test canvases evict the shared device used by later lifecycle tests.
  if (device?.type === 'webgl') {
    (device as WebGLDevice).gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
  container?.remove();
  deck = undefined;
  device = undefined;
  framebuffer = undefined;
  colorTexture = undefined;
  expect(validationErrors.splice(0)).toEqual([]);
  expect(sharedWebGLDevice?.isLost, 'The shared lifecycle-test context must remain valid').toBe(
    false
  );
});

function renderFrame(
  props: Partial<PathLayerProps & TerrainExtensionProps> = {},
  sideView: boolean | number = false,
  rotationOrbit = 0,
  terrain?: Layer | Layer[],
  timelineTime: number | null = 1000,
  overrideLayer?: Layer
): Promise<Uint8Array> {
  const layer =
    overrideLayer ||
    new PathLayer({
      id: `path-${props.terrainDrawMode ?? 'xyz'}`,
      data: DATA,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPath: d => d.path,
      widthUnits: 'pixels',
      getWidth: 8,
      getColor: [255, 255, 255],
      pickable: true,
      ...props
    });
  return new Promise((resolve, reject) => {
    // Freeze the renderer timeline for pixel comparisons, not the layer API.
    const onBeforeRender = () => {
      if (timelineTime !== null) {
        layer.context.timeline.pause();
        layer.context.timeline.setTime(timelineTime);
      }
    };
    let renderedFrames = 0;
    let captured = false;
    const onAfterRender = () => {
      if (captured) return;
      deck!.pause();
      device!.submit();
      const complete =
        device!.type === 'webgpu'
          ? (device as WebGPUDevice).handle.queue.onSubmittedWorkDone()
          : Promise.resolve();
      complete.then(() => {
        // Effect registration rebuilds source models before the height map becomes valid.
        if (
          !layer.isLoaded ||
          (device!.type === 'webgpu' &&
            layer.getModels().some(model => model.pipeline.isPending)) ||
          (terrain && renderedFrames++ < 2)
        ) {
          deck!.resume();
          return;
        }
        captured = true;
        readFrame().then(resolve, reject);
      }, reject);
    };
    if (deck) {
      deck.setProps({layers: [terrain, layer], onBeforeRender, onAfterRender, onError: reject});
      deck.resume();
    } else {
      deck = new TestDeck({
        device,
        _framebuffer: device!.type === 'webgpu' ? framebuffer : undefined,
        parent: container,
        width: SIZE,
        height: SIZE,
        useDevicePixels: false,
        _animate: true,
        views: new OrbitView({orbitAxis: 'Z', orthographic: true}),
        initialViewState: {
          target: [0, 0, 0],
          zoom: 0,
          rotationX: typeof sideView === 'number' ? sideView : sideView ? 0 : 90,
          rotationOrbit
        },
        layers: [terrain, layer],
        onBeforeRender,
        onAfterRender,
        onError: reject
      });
    }
  });
}

function totalBrightness(pixels: Uint8Array): number {
  return pixels.reduce((sum, value, index) => sum + (index % 4 === 3 ? 0 : value), 0);
}

function createTerrain(height: (x: number, y: number) => number, draw = false, operation?: 'draw') {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 20;
  for (let row = 0; row <= segments; row++) {
    for (let col = 0; col <= segments; col++) {
      const x = -150 + col * 15;
      const y = -150 + row * 15;
      positions.push(x, y, height(x, y));
      if (row < segments && col < segments) {
        const vertex = row * (segments + 1) + col;
        indices.push(
          vertex,
          vertex + 1,
          vertex + segments + 1,
          vertex + 1,
          vertex + segments + 2,
          vertex + segments + 1
        );
      }
    }
  }
  return new SimpleMeshLayer({
    id: 'terrain',
    data: [{}],
    mesh: new Geometry({
      topology: 'triangle-list',
      indices: new Uint16Array(indices),
      attributes: {positions: {size: 3, value: new Float32Array(positions)}}
    }),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    _instanced: false,
    getPosition: [0, 0, 0],
    getColor: [0, 0, 0],
    material: false,
    operation: operation ?? (draw ? 'terrain+draw' : 'terrain'),
    parameters: {depthWriteEnabled: true, cullMode: 'none'}
  });
}

describe.each(['webgl', 'webgpu'] as const)('TerrainExtension %s rendering', backend => {
  beforeEach(async ({skip}) => {
    if (backend === 'webgpu') {
      const adapter = await navigator.gpu?.requestAdapter();
      if (import.meta.env.RENDER_TEST_DEVICE === 'webgpu') {
        expect(adapter, 'The required WebGPU test lane must expose an adapter').toBeTruthy();
      }
      if (!adapter) skip('WebGPU is unavailable in this browser');
    }
    container = document.createElement('div');
    container.style.cssText = `width: ${SIZE}px; height: ${SIZE}px`;
    document.body.appendChild(container);
    device = await luma.createDevice({
      type: backend,
      _cacheShaders: true,
      _cachePipelines: true,
      adapters: [webgl2Adapter, webgpuAdapter],
      createCanvasContext: {container, width: SIZE, height: SIZE, useDevicePixels: false}
    });
    expect(device.type).toBe(backend);
    if (backend === 'webgpu') {
      (device as WebGPUDevice).handle.addEventListener('uncapturederror', event => {
        validationErrors.push(event.error.message);
      });
    }
    colorTexture = device.createTexture({
      width: SIZE,
      height: SIZE,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT | Texture.COPY_SRC
    });
    framebuffer = device.createFramebuffer({
      width: SIZE,
      height: SIZE,
      colorAttachments: [colorTexture],
      depthStencilAttachment: 'depth24plus'
    });
  });
  it.each(backend === 'webgpu' ? [40, -40] : [40])(
    'fits a 2D path to a sloping height map at %s elevation',
    async elevation => {
      const height = (x: number, y: number) => elevation + x * 0.15 + y * 0.1;
      const elevatedData = [{...DATA[0], path: DATA[0].path.map(([x, y]) => [x, y, height(x, y)])}];
      const reference = await renderFrame({data: elevatedData}, 35);
      const fitted = await renderFrame(
        {extensions: [new TerrainExtension()], terrainDrawMode: 'offset'},
        35,
        0,
        createTerrain(height)
      );
      expect(totalBrightness(reference)).toBeGreaterThan(1000);
      let difference = 0;
      for (let i = 0; i < fitted.length; i++) {
        if (i % 4 !== 3) difference += Math.abs(fitted[i] - reference[i]);
      }
      expect(difference / totalBrightness(reference)).toBeLessThan(0.08);
    }
  );

  it('selects the upper surface regardless of terrain draw order and updates changed meshes', async () => {
    const extensions = [new TerrainExtension()];
    const props = {extensions, terrainDrawMode: 'offset' as const};
    const lower = createTerrain(() => 15).clone({id: 'lower'});
    const upper = createTerrain(() => 55).clone({id: 'upper'});
    const elevatedData = [{...DATA[0], path: DATA[0].path.map(([x, y]) => [x, y, 55])}];
    const reference = await renderFrame({data: elevatedData}, 35);
    for (const terrain of [
      [lower, upper],
      [upper, lower]
    ]) {
      const fitted = await renderFrame(props, 35, 0, terrain);
      expect(pixelDifference(reference, fitted)).toBeLessThan(0.08);
    }
    const changed = createTerrain(() => 35).clone({id: 'upper'});
    const updated = await renderFrame(props, 35, 0, [lower, changed]);
    expect(pixelDifference(reference, updated)).toBeGreaterThan(0.5);
    const newReference = await renderFrame(
      {data: [{...DATA[0], path: DATA[0].path.map(([x, y]) => [x, y, 35])}]},
      35
    );
    expect(pixelDifference(newReference, updated)).toBeLessThan(0.08);
  });

  it.each(['arc', 'line', 'column', 'point', 'polygon', 'bitmap', 'icon', 'text', 'scenegraph'])(
    'renders the %s layer with terrain offset',
    async kind => {
      const image = document.createElement('canvas');
      image.width = image.height = 16;
      const context = image.getContext('2d')!;
      context.fillStyle = 'white';
      context.fillRect(0, 0, 16, 16);
      const props = {
        id: kind,
        data: [{}],
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        extensions: [new TerrainExtension()],
        terrainDrawMode: 'offset' as const,
        getPosition: [0, 0, 0] as [number, number, number],
        getColor: [255, 255, 255] as [number, number, number]
      };
      const line = {
        getSourcePosition: [-60, 0, 0],
        getTargetPosition: [60, 0, 0],
        getWidth: 8,
        getSourceColor: [255, 255, 255],
        getTargetColor: [255, 255, 255]
      };
      const layers = {
        arc: () => new ArcLayer({...props, ...line, getHeight: 0.1}),
        line: () => new LineLayer({...props, ...line}),
        column: () =>
          new ColumnLayer({...props, radius: 20, getElevation: 20, getFillColor: [255, 255, 255]}),
        point: () => new PointCloudLayer({...props, pointSize: 12}),
        polygon: () =>
          new SolidPolygonLayer({
            ...props,
            getPolygon: () => [
              [-30, -20],
              [30, -20],
              [30, 20],
              [-30, 20]
            ],
            getFillColor: [255, 255, 255]
          }),
        bitmap: () => new BitmapLayer({...props, image, bounds: [-30, -20, 30, 20]}),
        icon: () =>
          new IconLayer({
            ...props,
            iconAtlas: image,
            iconMapping: {square: {x: 0, y: 0, width: 16, height: 16}},
            getIcon: () => 'square',
            getSize: 24
          }),
        scenegraph: () =>
          new ScenegraphLayer({...props, scenegraph: '/test/data/BoxAnimated.glb', sizeScale: 20}),
        text: () =>
          new TextLayer({
            ...props,
            getText: () => 'Terrain',
            getSize: 24,
            background: true,
            getBackgroundColor: [255, 255, 255]
          })
      };
      const pixels = await renderFrame(
        {},
        35,
        0,
        createTerrain(() => 40),
        0,
        layers[kind]()
      );
      expect(totalBrightness(pixels)).toBeGreaterThan(1000);
    }
  );

  it('samples the correct texture row and lifts billboard anchors without collapsing their radius', async () => {
    const height = (x: number, y: number) => 50 + x * 0.1 + y * 0.3;
    const points = [
      [-60, 50],
      [70, -50]
    ];
    const scatter = new ScatterplotLayer({
      id: 'points-xyz',
      data: points.map(([x, y]) => [x, y, height(x, y)]),
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: d => d,
      radiusUnits: 'pixels',
      getRadius: 8,
      getFillColor: [255, 255, 255],
      billboard: true
    });
    const reference = await renderFrame({}, 35, 0, undefined, 0, scatter);
    const fitted = await renderFrame(
      {},
      35,
      0,
      createTerrain(height),
      0,
      scatter.clone({
        id: 'points-offset',
        data: points,
        extensions: [new TerrainExtension()],
        terrainDrawMode: 'offset'
      })
    );
    expect(pixelDifference(reference, fitted)).toBeLessThan(0.08);
  });
});

function pixelDifference(reference: Uint8Array, actual: Uint8Array) {
  expect(totalBrightness(reference)).toBeGreaterThan(1000);
  let difference = 0;
  for (let i = 0; i < actual.length; i++) {
    if (i % 4 !== 3) difference += Math.abs(actual[i] - reference[i]);
  }
  return difference / totalBrightness(reference);
}
