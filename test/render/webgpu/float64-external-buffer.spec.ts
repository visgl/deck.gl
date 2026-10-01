// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// External Buffers bound to double-precision (`type: 'float64'`) attributes on WebGPU.
// As on WebGL, an external Buffer only supplies the high part, and the low part is zero.

/// <reference types="@webgpu/types" />

import {test, expect, beforeAll, afterEach, afterAll, describe} from 'vitest';
import {commands} from 'vitest/browser';
import {Deck, MapView, OrthographicView, WebMercatorViewport} from '@deck.gl/core';
import type {Layer} from '@deck.gl/core';
import {ArcLayer, ScatterplotLayer} from '@deck.gl/layers';
import {Buffer} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';
import type {Device} from '@luma.gl/core';
import {isRenderTestDeviceEnabled} from '../render-test-suite';

const WIDTH = 400;
const HEIGHT = 300;
const RADIUS_PIXELS = 10;
const FILL_COLOR = [255, 0, 0, 255] as const;

const LNGLAT_POINTS = [
  [-122.45, 37.76, 0],
  [-122.41, 37.76, 0],
  [-122.45, 37.8, 0],
  [-122.41, 37.8, 0]
];
const LNGLAT_VIEW_STATE = {longitude: -122.43, latitude: 37.78, zoom: 11};

const CARTESIAN_POINTS = [
  [-120, -80, 0],
  [120, -80, 0],
  [-120, 80, 0],
  [120, 80, 0]
];
const CARTESIAN_VIEW = new OrthographicView();
const CARTESIAN_VIEW_STATE = {target: [0, 0, 0] as [number, number, number], zoom: 0};

const METER_ORIGIN: [number, number, number] = [-122.43, 37.78, 0];
const METER_POINTS = [
  [-1500, -1500, 0],
  [1500, -1500, 0],
  [-1500, 1500, 0],
  [1500, 1500, 0]
];

type FrameResult = {
  /** Error returned by the outer `popErrorScope('validation')` around the frame */
  scopeError: GPUError | null;
  /** Errors captured by luma.gl's own error scopes and routed to `deviceProps.onError` */
  lumaErrors: Error[];
  /** Errors thrown during layer updates and routed to `Deck.onError` */
  deckErrors: Error[];
  /** RGBA readback of the WebGPU canvas for the rendered frame */
  pixels: ImageData;
  deck: Deck<any>;
};

describe.runIf(isRenderTestDeviceEnabled('webgpu'))('float64 external Buffer on WebGPU', () => {
  let deck: Deck<any> | null = null;
  let container: HTMLDivElement | null = null;
  let lumaErrors: Error[] = [];
  let deckErrors: Error[] = [];

  beforeAll(async () => {
    // A missing adapter must fail the suite, not skip it
    const adapter = await navigator.gpu?.requestAdapter();
    expect(adapter, 'navigator.gpu.requestAdapter() returns an adapter').toBeTruthy();

    container = document.createElement('div');
    container.style.cssText = `position: absolute; left: 0; top: 0; width: ${WIDTH}px; height: ${HEIGHT}px; background: #000;`;
    document.body.appendChild(container);

    await new Promise<void>(resolve => {
      deck = new Deck({
        parent: container!,
        width: WIDTH,
        height: HEIGHT,
        useDevicePixels: false,
        views: new MapView({}),
        viewState: LNGLAT_VIEW_STATE,
        layers: [],
        deviceProps: {
          type: 'webgpu',
          adapters: [webgpuAdapter],
          onError: (error: Error) => {
            lumaErrors.push(error);
            return true;
          }
        },
        onError: (error: Error) => {
          deckErrors.push(error);
        },
        onLoad: () => resolve()
      });
    });
    expect(getDevice(deck!).type, 'Deck created a WebGPU device').toBe('webgpu');
  });

  afterEach(async () => {
    // Clear the layers so that the next case starts from an empty frame
    await renderFrame({createLayers: () => []});
  });

  afterAll(() => {
    deck?.finalize();
    deck = null;
    // Remove the container so that it does not cover the canvas of later render tests
    container?.remove();
    container = null;
  });

  function getDevice(deckInstance: Deck<any>): Device {
    // @ts-expect-error accessing protected device
    return deckInstance.device as Device;
  }

  /** Updates layers and draws one frame inside a validation error scope */
  async function renderFrame(props: {
    createLayers: (device: Device) => Layer[];
    isCartesian?: boolean;
  }): Promise<FrameResult> {
    const deckInstance = deck!;
    const device = getDevice(deckInstance);
    const gpuDevice = device.handle as GPUDevice;
    // Let any in-flight work settle so that errors are attributed to this frame
    await gpuDevice.queue.onSubmittedWorkDone();
    lumaErrors = [];
    deckErrors = [];

    const layers = props.createLayers(device);
    gpuDevice.pushErrorScope('validation');
    deckInstance.setProps({
      views: props.isCartesian ? CARTESIAN_VIEW : new MapView({}),
      viewState: props.isCartesian ? CARTESIAN_VIEW_STATE : LNGLAT_VIEW_STATE,
      layers
    });
    // Same order as Deck._onRenderFrame: apply the new layers, then draw
    // @ts-expect-error accessing protected layerManager
    deckInstance.layerManager.updateLayers();
    deckInstance.redraw('test');
    // Read back the canvas in the same task as the draw, before the frame is presented
    const pixels = readCanvasPixels(deckInstance.getCanvas()!);
    await gpuDevice.queue.onSubmittedWorkDone();
    // Scopes resolve in order, so luma.gl's inner scopes have reported by the time this resolves
    const scopeError = await gpuDevice.popErrorScope();

    return {
      scopeError,
      lumaErrors: [...lumaErrors],
      deckErrors: [...deckErrors],
      pixels,
      deck: deckInstance
    };
  }

  function readCanvasPixels(canvas: HTMLCanvasElement): ImageData {
    const canvas2d = document.createElement('canvas');
    canvas2d.width = WIDTH;
    canvas2d.height = HEIGHT;
    const context = canvas2d.getContext('2d', {willReadFrequently: true})!;
    context.drawImage(canvas, 0, 0, WIDTH, HEIGHT);
    return context.getImageData(0, 0, WIDTH, HEIGHT);
  }

  function getPixel(pixels: ImageData, x: number, y: number): number[] {
    const index = (Math.round(y) * pixels.width + Math.round(x)) * 4;
    return Array.from(pixels.data.subarray(index, index + 4));
  }

  function isFillColor(pixel: number[]): boolean {
    return pixel[0] > 200 && pixel[1] < 50 && pixel[2] < 50 && pixel[3] > 200;
  }

  /** Compares the rendered frame against a CPU projection of the source positions */
  function expectPointsRendered(
    frame: FrameResult,
    positions: number[][],
    coordinateOrigin?: [number, number, number]
  ) {
    const viewport = frame.deck.getViewports()[0];
    let expectedFillCount = 0;
    for (const position of positions) {
      const worldPosition = coordinateOrigin
        ? (viewport as WebMercatorViewport).addMetersToLngLat(coordinateOrigin, position)
        : position;
      const [x, y] = viewport.project(worldPosition);
      expect(
        isFillColor(getPixel(frame.pixels, x, y)),
        `point ${position} rendered at [${x}, ${y}]`
      ).toBe(true);
      expectedFillCount += Math.PI * RADIUS_PIXELS * RADIUS_PIXELS;
    }
    let fillCount = 0;
    for (let i = 0; i < frame.pixels.data.length; i += 4) {
      if (isFillColor(Array.from(frame.pixels.data.subarray(i, i + 4)))) {
        fillCount++;
      }
    }
    // Nothing is drawn anywhere else: no stray or displaced circles
    expect(fillCount / expectedFillCount, 'filled pixel count matches 4 circles').toBeGreaterThan(
      0.85
    );
    expect(fillCount / expectedFillCount, 'filled pixel count matches 4 circles').toBeLessThan(
      1.15
    );
  }

  function expectNoErrors(frame: FrameResult) {
    expect(frame.scopeError?.message ?? null, 'no validation error in outer scope').toBe(null);
    expect(
      frame.deckErrors.map(error => error.message),
      'no deck errors'
    ).toEqual([]);
    expect(
      frame.lumaErrors.map(error => error.message),
      'no luma.gl errors'
    ).toEqual([]);
  }

  async function expectGoldenImage(goldenImage: string) {
    const canvas = deck!.getCanvas()!;
    const rect = canvas.getBoundingClientRect();
    const result = await commands.captureAndDiffScreen({
      goldenImage,
      region: {x: rect.left, y: rect.top, width: rect.width, height: rect.height},
      threshold: 0.99,
      tolerance: 0.1,
      saveOnFail: true,
      createDiffImage: true
    });
    expect(result.success, `${goldenImage}: ${result.error}`).toBe(true);
  }

  function createBuffer(device: Device, rows: number[][], rowLayout: (row: number[]) => number[]) {
    const data = new Float32Array(rows.flatMap(rowLayout));
    const buffer = device.createBuffer({
      usage: Buffer.VERTEX | Buffer.COPY_DST | Buffer.COPY_SRC,
      data
    });
    return {buffer, data};
  }

  const PACKED_ROW = (row: number[]) => row;
  const HIGH_LOW_ROW = (row: number[]) => [...row, 0, 0, 0];
  // Non-zero data after each position, which would displace the points if read as the low part
  const INTERLEAVED_ROW = (row: number[]) => [...row, 5, 5, 5];

  function makeLayer(props: Record<string, unknown>) {
    return new ScatterplotLayer({
      id: 'points',
      radiusUnits: 'pixels',
      getRadius: RADIUS_PIXELS,
      getFillColor: FILL_COLOR,
      ...props
    });
  }

  async function readBuffer(buffer: Buffer): Promise<Float32Array> {
    const bytes = await buffer.readAsync();
    return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
  }

  /** Creates a layer bound to an external Buffer, keeping a reference to the Buffer for readback */
  function createBufferLayer(
    device: Device,
    positions: number[][],
    rowLayout: (row: number[]) => number[],
    getLayerProps: (buffer: Buffer) => Record<string, unknown>,
    bound: {buffer?: Buffer; data?: Float32Array}
  ): ScatterplotLayer[] {
    const {buffer, data} = createBuffer(device, positions, rowLayout);
    bound.buffer = buffer;
    bound.data = data;
    return [makeLayer(getLayerProps(buffer))];
  }

  describe.each([
    {name: 'lnglat', isCartesian: false, positions: LNGLAT_POINTS},
    {name: 'cartesian', isCartesian: true, positions: CARTESIAN_POINTS}
  ])('float64 external Buffer ($name)', ({name, isCartesian, positions}) => {
    const coordinateSystem = isCartesian ? 'cartesian' : 'lnglat';
    const goldenImage = `./test/render/golden-images/webgpu/scatterplot-float64-${name}.png`;

    /** Renders one frame with the positions bound to an external Buffer */
    async function renderBuffer(
      rowLayout: (row: number[]) => number[],
      getAttributes: (buffer: Buffer) => Record<string, unknown>
    ) {
      const bound: {buffer?: Buffer; data?: Float32Array} = {};
      const frame = await renderFrame({
        isCartesian,
        createLayers: device =>
          createBufferLayer(
            device,
            positions,
            rowLayout,
            buffer => ({coordinateSystem, data: {length: 4, attributes: getAttributes(buffer)}}),
            bound
          )
      });
      expectNoErrors(frame);

      // The bound buffer holds the CPU reference rows, element-wise
      // @ts-expect-error accessing protected layerManager
      const layer = frame.deck.layerManager.getLayers()[0];
      const attribute = layer.getAttributeManager()!.attributes.instancePositions;
      expect(attribute.getBuffer(), 'external buffer is bound').toBe(bound.buffer);
      expect(await readBuffer(bound.buffer!)).toEqual(bound.data);

      expectPointsRendered(frame, positions);
      await expectGoldenImage(goldenImage);
      bound.buffer!.destroy();
    }

    test('deck-managed Float64Array renders (reference)', async () => {
      const frame = await renderFrame({
        isCartesian,
        createLayers: () => [makeLayer({coordinateSystem, data: positions, getPosition: d => d})]
      });
      expectNoErrors(frame);
      expectPointsRendered(frame, positions);
      await expectGoldenImage(goldenImage);
    });

    test("float32x3 Buffer with type 'float32' and stride 12 renders", async () => {
      await renderBuffer(PACKED_ROW, buffer => ({
        instancePositions: {buffer, type: 'float32', stride: 12}
      }));
    });

    test('float32x3 Buffer passed as getPosition renders', async () => {
      await renderBuffer(PACKED_ROW, buffer => ({
        getPosition: {buffer, size: 3, type: 'float32', stride: 12}
      }));
    });

    test('a Float32Array value supplied with the Buffer does not change how it is read', async () => {
      await renderBuffer(PACKED_ROW, buffer => ({
        getPosition: {buffer, value: new Float32Array(positions.flat()), size: 3, stride: 12}
      }));
    });

    test('float32x4 Buffer overriding the declared size renders', async () => {
      await renderBuffer(
        row => [...row, 0],
        buffer => ({instancePositions: {buffer, size: 4, stride: 16}})
      );
    });

    test('Buffer written as [x, y, z, 0, 0, 0] rows renders', async () => {
      await renderBuffer(HIGH_LOW_ROW, buffer => ({instancePositions: buffer}));
    });

    test('interleaved rows: the 12 bytes after each position are not read', async () => {
      // e.g. the interleaved positions and colors example in the performance guide
      await renderBuffer(INTERLEAVED_ROW, buffer => ({
        getPosition: {buffer, size: 3, offset: 0, stride: 24}
      }));
    });

    test('deck-managed Float32Array renders', async () => {
      const frame = await renderFrame({
        isCartesian,
        createLayers: () => [
          makeLayer({
            coordinateSystem,
            data: {length: 4, attributes: {getPosition: new Float32Array(positions.flat())}}
          })
        ]
      });
      expectNoErrors(frame);
      expectPointsRendered(frame, positions);
      await expectGoldenImage(goldenImage);
    });
  });

  test('base vertexOffset skips the first row of an external Buffer', async () => {
    class OffsetScatterplotLayer extends ScatterplotLayer {
      initializeState() {
        super.initializeState();
        this.getAttributeManager()!.addInstanced({
          instancePositions: {
            size: 3,
            type: 'float64',
            accessor: 'getPosition',
            vertexOffset: 1
          }
        });
      }
    }

    const {buffer} = createBuffer(getDevice(deck!), [[0, 0, 0], ...CARTESIAN_POINTS], PACKED_ROW);
    try {
      const frame = await renderFrame({
        isCartesian: true,
        createLayers: () => [
          new OffsetScatterplotLayer({
            id: 'offset-points',
            coordinateSystem: 'cartesian',
            radiusUnits: 'pixels',
            getRadius: RADIUS_PIXELS,
            getFillColor: FILL_COLOR,
            data: {length: 4, attributes: {instancePositions: {buffer, stride: 12}}}
          })
        ]
      });
      expectNoErrors(frame);
      expectPointsRendered(frame, CARTESIAN_POINTS);
      await expectGoldenImage(
        './test/render/golden-images/webgpu/scatterplot-float64-cartesian.png'
      );
    } finally {
      buffer.destroy();
    }
  });

  test('ArcLayer external endpoints fit the WebGPU vertex buffer limit', async () => {
    const device = getDevice(deck!);
    const targetPoints = CARTESIAN_POINTS.map(([x, y, z]) => [x + 30, y, z]);
    const source = createBuffer(device, CARTESIAN_POINTS, HIGH_LOW_ROW).buffer;
    const target = createBuffer(device, targetPoints, HIGH_LOW_ROW).buffer;
    try {
      // Keep the same layer id while the shared low layout gains and loses attributes.
      for (const [externalSource, externalTarget] of [
        [true, true],
        [true, false],
        [false, false],
        [false, true],
        [true, true]
      ]) {
        const frame = await renderFrame({
          isCartesian: true,
          createLayers: () => [
            new ArcLayer({
              id: 'external-arcs',
              coordinateSystem: 'cartesian',
              getSourceColor: FILL_COLOR,
              getTargetColor: FILL_COLOR,
              getHeight: 0,
              getWidth: 8,
              data: {
                length: 4,
                attributes: {
                  getSourcePosition: externalSource
                    ? {buffer: source, stride: 24}
                    : new Float64Array(CARTESIAN_POINTS.flat()),
                  getTargetPosition: externalTarget
                    ? {buffer: target, stride: 24}
                    : new Float64Array(targetPoints.flat())
                }
              }
            })
          ]
        });
        expectNoErrors(frame);
        for (const [x, y, z] of CARTESIAN_POINTS) {
          const pixel = frame.deck.getViewports()[0].project([x + 15, y, z]);
          expect(isFillColor(getPixel(frame.pixels, pixel[0], pixel[1]))).toBe(true);
        }
      }
    } finally {
      source.destroy();
      target.destroy();
    }
  });

  describe('float64 external Buffer (meter-offsets, fp64: false)', () => {
    const layerProps = {coordinateSystem: 'meter-offsets', coordinateOrigin: METER_ORIGIN};

    /** Renders one frame with the positions bound to an external Buffer */
    async function renderBuffer(
      rowLayout: (row: number[]) => number[],
      getAttributes: (buffer: Buffer) => Record<string, unknown>
    ) {
      const bound: {buffer?: Buffer; data?: Float32Array} = {};
      const frame = await renderFrame({
        createLayers: device =>
          createBufferLayer(
            device,
            METER_POINTS,
            rowLayout,
            buffer => ({...layerProps, data: {length: 4, attributes: getAttributes(buffer)}}),
            bound
          )
      });
      expectNoErrors(frame);
      expect(await readBuffer(bound.buffer!)).toEqual(bound.data);
      expectPointsRendered(frame, METER_POINTS, METER_ORIGIN);
      bound.buffer!.destroy();
    }

    test('deck-managed positions render (reference)', async () => {
      const frame = await renderFrame({
        createLayers: () => [makeLayer({...layerProps, data: METER_POINTS, getPosition: d => d})]
      });
      expectNoErrors(frame);
      expectPointsRendered(frame, METER_POINTS, METER_ORIGIN);
    });

    test('float32x3 Buffer with the default stride renders', async () => {
      await renderBuffer(PACKED_ROW, buffer => ({instancePositions: buffer}));
    });

    test('float32x3 Buffer with stride 12 renders', async () => {
      await renderBuffer(PACKED_ROW, buffer => ({instancePositions: {buffer, stride: 12}}));
    });

    test('[x, y, z, 0, 0, 0] rows with stride 24 render', async () => {
      await renderBuffer(HIGH_LOW_ROW, buffer => ({instancePositions: {buffer, stride: 24}}));
    });
  });
});
