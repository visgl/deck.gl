// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Requires a hardware GPU adapter and full Chromium. Run with `yarn test-gpu-hardware`.

import {test, expect, beforeAll, afterAll, vi} from 'vitest';
import {luma, Buffer, Texture} from '@luma.gl/core';
import type {Device, Framebuffer, QuerySet} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';
import type {WebGPUDevice} from '@luma.gl/webgpu';
import {webgl2Adapter} from '@luma.gl/webgl';
import type {WebGLDevice} from '@luma.gl/webgl';
import {Deck, MapView} from '@deck.gl/core';
import type {DeckProps} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';

type FrameTimings = {cpuTime: number; gpuTime?: number};

const SIZE = 256;
const MAX_FRAMES = 120;
// Center region used for the pixel comparison
const REGION = {x: 96, y: 96, width: 64, height: 64};

let timestampDevice: WebGPUDevice;
let noTimestampDevice: WebGPUDevice;

beforeAll(async () => {
  // Fail, rather than skip, when the browser has no WebGPU adapter
  const adapter = await navigator.gpu?.requestAdapter();
  expect(adapter, 'navigator.gpu.requestAdapter() returned null').toBeTruthy();

  // `debug: false` keeps luma's own debug GPU timer (which creates a QuerySet) out of the spies
  timestampDevice = (await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    debug: false,
    debugGPUTime: false,
    optionalFeatures: ['timestamp-query'],
    createCanvasContext: {width: SIZE, height: SIZE}
  })) as WebGPUDevice;
  expect(timestampDevice.features.has('timestamp-query'), 'adapter lacks timestamp-query').toBe(
    true
  );

  // The default 'core' feature level requests no optional features
  noTimestampDevice = (await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    debug: false,
    debugGPUTime: false,
    createCanvasContext: {width: SIZE, height: SIZE}
  })) as WebGPUDevice;
  expect(noTimestampDevice.features.has('timestamp-query')).toBe(false);
});

afterAll(() => {
  timestampDevice?.destroy();
  noTimestampDevice?.destroy();
});

function createFramebuffer(device: Device): Framebuffer {
  // COPY_SRC allows reading the color attachment back
  const colorTexture = device.createTexture({
    width: SIZE,
    height: SIZE,
    format: 'rgba8unorm',
    usage: Texture.RENDER_ATTACHMENT | Texture.COPY_SRC
  });
  return device.createFramebuffer({
    width: SIZE,
    height: SIZE,
    colorAttachments: [colorTexture],
    depthStencilAttachment: 'depth24plus'
  });
}

const renderCounts = new WeakMap<Deck, number>();

function createDeck(
  device: Device,
  framebuffer: Framebuffer,
  props: DeckProps<any> = {}
): Deck<any> {
  const deck: Deck = new Deck({
    device,
    width: SIZE,
    height: SIZE,
    useDevicePixels: false,
    _framebuffer: framebuffer,
    viewState: {longitude: -122.4, latitude: 37.75, zoom: 9},
    layers: [
      new ScatterplotLayer({
        id: 'points-100k',
        data: FIXTURES.getPoints100K(),
        getPosition: d => d,
        getRadius: 100,
        radiusMinPixels: 1,
        getFillColor: [255, 128, 0]
      })
    ],
    onAfterRender: () => renderCounts.set(deck, getRenderCount(deck) + 1),
    ...props
  });
  return deck;
}

function getRenderCount(deck: Deck): number {
  return renderCounts.get(deck) ?? 0;
}

function nextAnimationFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function waitForFrames(predicate: () => boolean, description: string): Promise<void> {
  for (let frame = 0; frame < MAX_FRAMES; frame++) {
    if (predicate()) {
      return;
    }
    await nextAnimationFrame();
  }
  throw new Error(`${description} after ${MAX_FRAMES} frames`);
}

/** Waits until deck has drawn and has nothing left to redraw */
async function waitForIdle(deck: Deck): Promise<void> {
  await waitForFrames(
    () =>
      getRenderCount(deck) > 0 &&
      deck.isInitialized &&
      !deck.needsRedraw({clearRedrawFlags: false}),
    'deck did not become idle'
  );
}

/** Reads a region of the framebuffer's color attachment back to the CPU */
async function readRegion(device: WebGPUDevice, framebuffer: Framebuffer): Promise<Uint8Array> {
  const texture = framebuffer.colorAttachments[0].texture;
  const layout = texture.computeMemoryLayout(REGION);
  const buffer = device.createBuffer({
    byteLength: layout.byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  texture.readBuffer(REGION, buffer);
  await device.handle.queue.onSubmittedWorkDone();
  const bytes = await buffer.readAsync();
  buffer.destroy();
  // Strip row padding
  const rowBytes = REGION.width * 4;
  const pixels = new Uint8Array(rowBytes * REGION.height);
  for (let row = 0; row < REGION.height; row++) {
    pixels.set(
      bytes.subarray(row * layout.bytesPerRow, row * layout.bytesPerRow + rowBytes),
      row * rowBytes
    );
  }
  return pixels;
}

/**
 * Collects the QuerySets created on a device, the raw [begin, end] timestamps of each pass that is
 * read back, and the GPU time of each draw computed from those raw timestamps
 */
function spyOnQuerySets(device: Device) {
  const passTimestamps: Promise<{timestamps: bigint[]; duration: number}>[] = [];
  const drawDurations: Promise<number>[] = [];
  const drawPassCounts: number[] = [];
  let drawPassDurations: Promise<number>[] = [];
  const createQuerySet = device.createQuerySet.bind(device);
  const spy = vi.spyOn(device, 'createQuerySet').mockImplementation(props => {
    const querySet: QuerySet = createQuerySet(props);
    const readResults = querySet.readResults.bind(querySet);
    const readTimestampDuration = querySet.readTimestampDuration.bind(querySet);
    vi.spyOn(querySet, 'readTimestampDuration').mockImplementation((beginIndex, endIndex) => {
      // FrameTimer reads the passes of one draw in order, starting at index 0
      if (beginIndex === 0) {
        const passDurations: Promise<number>[] = [];
        drawPassDurations = passDurations;
        // All passes of a draw are read synchronously, before this microtask runs
        drawDurations.push(
          Promise.resolve().then(async () => {
            drawPassCounts.push(passDurations.length);
            const durations = await Promise.all(passDurations);
            return durations.reduce((sum, duration) => sum + duration, 0);
          })
        );
      }
      const duration = readTimestampDuration(beginIndex, endIndex);
      const timestamps = readResults({firstQuery: beginIndex, queryCount: 2});
      passTimestamps.push(
        Promise.all([timestamps, duration]).then(([raw, value]) => ({
          timestamps: raw,
          duration: value
        }))
      );
      drawPassDurations.push(duration);
      return duration;
    });
    return querySet;
  });
  return {spy, passTimestamps, drawDurations, drawPassCounts};
}

/** Checks each GPU timed sample against the raw timestamps read back from its query set */
async function expectGpuTimesMatchTimestamps(
  timings: FrameTimings[],
  {passTimestamps, drawDurations}: ReturnType<typeof spyOnQuerySets>
) {
  for (const {timestamps, duration} of await Promise.all(passTimestamps)) {
    const [begin, end] = timestamps;
    expect(begin > 0n, 'begin timestamp was not written').toBe(true);
    expect(end > begin, `end ${end} <= begin ${begin}`).toBe(true);
    expect(duration).toBe(Number(end - begin) / 1e6);
  }
  // Samples may arrive out of draw order
  const sortNumbers = (values: number[]) => [...values].sort((left, right) => left - right);
  const gpuTimes = timings.flatMap(frameTimings => frameTimings.gpuTime ?? []);
  expect(sortNumbers(gpuTimes)).toEqual(sortNumbers(await Promise.all(drawDurations)));
  for (const gpuTime of gpuTimes) {
    expect(gpuTime).toBeGreaterThan(0);
    // A single draw cannot take a second of GPU time; guards against unwritten timestamps
    expect(gpuTime).toBeLessThan(1000);
  }
}

async function expectGpuTimedDeck(device: WebGPUDevice, props: DeckProps<any> = {}) {
  const querySpies = spyOnQuerySets(device);
  const timings: FrameTimings[] = [];
  const errors: Error[] = [];
  const framebuffer = createFramebuffer(device);

  device.handle.pushErrorScope('validation');
  const deck = createDeck(device, framebuffer, {
    ...props,
    _onFrameTimings: (frameTimings: FrameTimings) => timings.push(frameTimings),
    onError: error => errors.push(error)
  } as DeckProps);

  await waitForFrames(
    () => timings.some(frameTimings => frameTimings.gpuTime !== undefined),
    'no _onFrameTimings callback with gpuTime'
  );
  await waitForIdle(deck);
  await device.handle.queue.onSubmittedWorkDone();
  const validationError = await device.handle.popErrorScope();

  expect(validationError, validationError?.message).toBeNull();
  expect(errors).toEqual([]);
  expect(querySpies.spy).toHaveBeenCalled();
  for (const frameTimings of timings) {
    expect(frameTimings.cpuTime).toBeGreaterThan(0);
  }
  await expectGpuTimesMatchTimestamps(timings, querySpies);

  deck.finalize();
  framebuffer.destroy();
  querySpies.spy.mockRestore();
  return querySpies.drawPassCounts;
}

test('Deck#_onFrameTimings reports gpuTime with timestamp-query (100k points)', async () => {
  const drawPassCounts = await expectGpuTimedDeck(timestampDevice);
  expect(drawPassCounts.every(count => count >= 1)).toBe(true);
});

test('Deck#_onFrameTimings sums multiple render passes', async () => {
  // WebGPU draws each viewport in its own render pass, and each pass is timed
  const drawPassCounts = await expectGpuTimedDeck(timestampDevice, {
    views: [
      new MapView({id: 'left', x: 0, width: '33%'}),
      new MapView({id: 'center', x: '33%', width: '34%'}),
      new MapView({id: 'right', x: '67%', width: '33%'})
    ]
  });
  expect(drawPassCounts.length).toBeGreaterThan(0);
  expect(drawPassCounts.every(count => count >= 3)).toBe(true);
});

test('Deck#_onFrameTimings does not change rendered output', async () => {
  const device = timestampDevice;
  const referenceFramebuffer = createFramebuffer(device);
  const timedFramebuffer = createFramebuffer(device);

  device.handle.pushErrorScope('validation');

  const referenceDeck = createDeck(device, referenceFramebuffer);
  await waitForIdle(referenceDeck);
  const referencePixels = await readRegion(device, referenceFramebuffer);
  referenceDeck.finalize();

  const timings: FrameTimings[] = [];
  const timedDeck = createDeck(device, timedFramebuffer, {
    _onFrameTimings: (frameTimings: FrameTimings) => timings.push(frameTimings)
  } as DeckProps);
  await waitForFrames(() => timings.length > 0, 'no _onFrameTimings callback');
  await waitForIdle(timedDeck);
  const timedPixels = await readRegion(device, timedFramebuffer);
  timedDeck.finalize();

  await device.handle.queue.onSubmittedWorkDone();
  const validationError = await device.handle.popErrorScope();
  expect(validationError, validationError?.message).toBeNull();

  // The region must contain drawn points, otherwise the comparison is vacuous
  expect(referencePixels.some(value => value !== 0)).toBe(true);
  expect(timedPixels.length).toBe(referencePixels.length);
  let mismatchCount = 0;
  for (let index = 0; index < referencePixels.length; index++) {
    if (timedPixels[index] !== referencePixels[index]) {
      mismatchCount++;
    }
  }
  expect(mismatchCount).toBe(0);

  referenceFramebuffer.destroy();
  timedFramebuffer.destroy();
});

test('Deck#_onFrameTimings omits gpuTime without timestamp-query', async () => {
  const device = noTimestampDevice;
  const {spy} = spyOnQuerySets(device);
  const timings: FrameTimings[] = [];
  const errors: Error[] = [];
  const framebuffer = createFramebuffer(device);

  device.handle.pushErrorScope('validation');
  const deck = createDeck(device, framebuffer, {
    _onFrameTimings: (frameTimings: FrameTimings) => timings.push(frameTimings),
    onError: error => errors.push(error)
  } as DeckProps);

  await waitForFrames(() => timings.length > 0, 'no _onFrameTimings callback');
  await waitForIdle(deck);
  await device.handle.queue.onSubmittedWorkDone();
  const validationError = await device.handle.popErrorScope();

  expect(validationError, validationError?.message).toBeNull();
  expect(errors).toEqual([]);
  expect(spy).not.toHaveBeenCalled();
  for (const frameTimings of timings) {
    expect(frameTimings.cpuTime).toBeGreaterThan(0);
    expect(frameTimings.gpuTime).toBeUndefined();
    expect('gpuTime' in frameTimings).toBe(false);
  }

  deck.finalize();
  framebuffer.destroy();
  spy.mockRestore();
});

test('Deck#_onFrameTimings leaves WebGPU render passes to the luma debug GPU timer', async () => {
  const device = (await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    debug: false,
    debugGPUTime: true,
    optionalFeatures: ['timestamp-query'],
    createCanvasContext: {width: SIZE, height: SIZE}
  })) as WebGPUDevice;
  const framebuffer = createFramebuffer(device);
  const timings: FrameTimings[] = [];
  const gpuTimesPerFrame: number[] = [];
  const deck = createDeck(device, framebuffer, {
    _animate: true,
    _onFrameTimings: (frameTimings: FrameTimings) => timings.push(frameTimings),
    _onMetrics: metrics => gpuTimesPerFrame.push(metrics.gpuTimePerFrame)
  });
  try {
    // _onMetrics reports every 60 frames
    for (let frame = 0; frame < 4 * MAX_FRAMES && !gpuTimesPerFrame.some(Boolean); frame++) {
      await nextAnimationFrame();
    }
    expect(device._isDebugGPUTimeEnabled()).toBe(true);
    expect(gpuTimesPerFrame.some(Boolean), 'luma timed no deck render passes').toBe(true);
    expect(timings.length).toBeGreaterThan(0);
    for (const frameTimings of timings) {
      expect(frameTimings.gpuTime).toBeUndefined();
    }
  } finally {
    deck.finalize();
    framebuffer.destroy();
    device.destroy();
  }
});

test('Deck without _onFrameTimings creates no QuerySet', async () => {
  const device = timestampDevice;
  const {spy} = spyOnQuerySets(device);
  const framebuffer = createFramebuffer(device);

  const deck = createDeck(device, framebuffer, {_animate: true});
  await waitForFrames(() => getRenderCount(deck) >= 10, 'deck did not render 10 frames');

  expect(spy).not.toHaveBeenCalled();

  deck.finalize();
  framebuffer.destroy();
  spy.mockRestore();
});

// Use this hardware project's full Chromium for the WebGL timer extension too.
test.each([false, true])(
  'Deck#WebGL frame timings recover between views (debugGPUTime: %s)',
  async debugGPUTime => {
    const device = await luma.createDevice({
      type: 'webgl',
      adapters: [webgl2Adapter],
      debug: false,
      debugGPUTime,
      createCanvasContext: {width: SIZE, height: SIZE}
    });
    const framebuffer = createFramebuffer(device);
    const timings: FrameTimings[] = [];
    const errors: Error[] = [];
    const deck = createDeck(device, framebuffer, {
      views: ['left', 'center', 'right'].map(
        (id, index) => new MapView({id, x: index * 80, width: 80})
      ),
      layers: [
        new ScatterplotLayer({
          data: [[-122.4, 37.75]],
          getPosition: d => d,
          radiusMinPixels: 5
        })
      ],
      _onFrameTimings: timing => timings.push(timing),
      onError: error => errors.push(error)
    });
    try {
      expect(device.features.has('timestamp-query')).toBe(true);
      await waitForIdle(deck);
      await waitForFrames(() => timings.length > 0, 'missing WebGL timing');
      const gl = (device as WebGLDevice).gl;
      const extension = gl.getExtension('EXT_disjoint_timer_query_webgl2')!;
      expect(gl.getError()).toBe(gl.NO_ERROR);

      const layerManager = deck['layerManager']!;
      const activateViewport = layerManager.activateViewport.bind(layerManager);
      const interrupted = vi
        .spyOn(layerManager, 'activateViewport')
        .mockImplementation(viewport => {
          if (viewport.id === 'center') throw new Error('interrupted viewport');
          activateViewport(viewport);
        });
      try {
        expect(() => deck._drawLayers('interrupted')).toThrow('interrupted viewport');
        expect(gl.getQuery(extension.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)).toBeNull();
        expect(gl.getError()).toBe(gl.NO_ERROR);
      } finally {
        interrupted.mockRestore();
      }

      const previousCount = timings.length;
      expect(() => deck._drawLayers('recovered')).not.toThrow();
      await waitForFrames(() => timings.length > previousCount, 'missing recovered WebGL timing');
      expect(gl.getError()).toBe(gl.NO_ERROR);
      expect(errors).toEqual([]);
      for (const timing of timings) {
        expect(timing.cpuTime).toBeGreaterThanOrEqual(0);
        if (debugGPUTime) {
          expect(timing.gpuTime).toBeUndefined();
        } else {
          expect(timing.gpuTime).toBeGreaterThanOrEqual(0);
        }
      }
      expect(device._isDebugGPUTimeEnabled()).toBe(debugGPUTime);
    } finally {
      deck.finalize();
      framebuffer.destroy();
      device.destroy();
    }
  }
);
