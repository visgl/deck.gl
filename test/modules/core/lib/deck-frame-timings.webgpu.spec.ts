// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Requires a real WebGPU adapter. Run with `yarn test-webgpu-hardware`.

import {test, expect, beforeAll, afterAll, vi} from 'vitest';
import {luma, Buffer, Texture} from '@luma.gl/core';
import type {Device, Framebuffer, QuerySet} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';
import type {WebGPUDevice} from '@luma.gl/webgpu';
import {Deck, MapView} from '@deck.gl/core';
import type {DeckProps} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import * as FIXTURES from 'deck.gl-test/data';

type FrameTimings = {cpuMs: number; gpuMs?: number};

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

function createDeck(device: Device, framebuffer: Framebuffer, props: DeckProps = {}): Deck {
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

/** Collects the QuerySets created on a device and the raw results each one reads back */
function spyOnQuerySets(device: Device) {
  const readbacks: Promise<bigint[]>[] = [];
  const createQuerySet = device.createQuerySet.bind(device);
  const spy = vi.spyOn(device, 'createQuerySet').mockImplementation(props => {
    const querySet: QuerySet = createQuerySet(props);
    const readResults = querySet.readResults.bind(querySet);
    vi.spyOn(querySet, 'readResults').mockImplementation(options => {
      const readback = readResults(options);
      readbacks.push(readback);
      return readback;
    });
    return querySet;
  });
  return {spy, readbacks};
}

test('Deck#_onFrameTimings reports gpuMs with timestamp-query (100k points)', async () => {
  const device = timestampDevice;
  const {spy, readbacks} = spyOnQuerySets(device);
  const timings: FrameTimings[] = [];
  const errors: Error[] = [];
  const framebuffer = createFramebuffer(device);

  device.handle.pushErrorScope('validation');
  const deck = createDeck(device, framebuffer, {
    _onFrameTimings: (frameTimings: FrameTimings) => timings.push(frameTimings),
    onError: error => errors.push(error)
  } as DeckProps);

  await waitForFrames(
    () => timings.some(frameTimings => frameTimings.gpuMs !== undefined),
    'no _onFrameTimings callback with gpuMs'
  );
  await waitForIdle(deck);
  await device.handle.queue.onSubmittedWorkDone();
  const validationError = await device.handle.popErrorScope();

  expect(validationError, validationError?.message).toBeNull();
  expect(errors).toEqual([]);
  expect(spy).toHaveBeenCalled();

  const gpuTimings = timings.filter(frameTimings => frameTimings.gpuMs !== undefined);
  for (const frameTimings of gpuTimings) {
    expect(frameTimings.cpuMs).toBeGreaterThan(0);
    expect(frameTimings.gpuMs).toBeGreaterThan(0);
    // A single frame cannot take a second of GPU time; guards against unwritten timestamps
    expect(frameTimings.gpuMs).toBeLessThan(1000);
  }

  // Readback check: each reported gpuMs matches the CPU reference computed from the raw
  // [begin, end] timestamps (nanoseconds) read back from the QuerySet
  const results = await Promise.all(readbacks);
  expect(results.length).toBe(gpuTimings.length);
  results.forEach(([begin, end], index) => {
    expect(begin > 0n, 'begin timestamp was not written').toBe(true);
    expect(end > begin, `end ${end} <= begin ${begin}`).toBe(true);
    expect(gpuTimings[index].gpuMs).toBe(Number(end - begin) / 1e6);
  });

  deck.finalize();
  framebuffer.destroy();
  spy.mockRestore();
});

test('Deck#_onFrameTimings spans multiple render passes', async () => {
  const device = timestampDevice;
  const {spy, readbacks} = spyOnQuerySets(device);
  const timings: FrameTimings[] = [];
  const errors: Error[] = [];
  const framebuffer = createFramebuffer(device);

  device.handle.pushErrorScope('validation');
  // WebGPU draws each viewport in its own render pass: the first pass writes only the begin
  // timestamp, the middle pass none, and the last pass only the end timestamp
  const deck = createDeck(device, framebuffer, {
    views: [
      new MapView({id: 'left', x: 0, width: '33%'}),
      new MapView({id: 'center', x: '33%', width: '34%'}),
      new MapView({id: 'right', x: '67%', width: '33%'})
    ],
    _onFrameTimings: (frameTimings: FrameTimings) => timings.push(frameTimings),
    onError: error => errors.push(error)
  } as DeckProps);

  await waitForFrames(
    () => timings.some(frameTimings => frameTimings.gpuMs !== undefined),
    'no _onFrameTimings callback with gpuMs'
  );
  await waitForIdle(deck);
  await device.handle.queue.onSubmittedWorkDone();
  const validationError = await device.handle.popErrorScope();

  expect(validationError, validationError?.message).toBeNull();
  expect(errors).toEqual([]);
  expect(spy).toHaveBeenCalled();

  const gpuTimings = timings.filter(frameTimings => frameTimings.gpuMs !== undefined);
  const results = await Promise.all(readbacks);
  expect(results.length).toBe(gpuTimings.length);
  results.forEach(([begin, end], index) => {
    expect(begin > 0n, 'begin timestamp was not written').toBe(true);
    expect(end > begin, `end ${end} <= begin ${begin}`).toBe(true);
    expect(gpuTimings[index].gpuMs).toBe(Number(end - begin) / 1e6);
    expect(gpuTimings[index].gpuMs).toBeLessThan(1000);
  });

  deck.finalize();
  framebuffer.destroy();
  spy.mockRestore();
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

test('Deck#_onFrameTimings omits gpuMs without timestamp-query', async () => {
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
    expect(frameTimings.cpuMs).toBeGreaterThan(0);
    expect(frameTimings.gpuMs).toBeUndefined();
    expect('gpuMs' in frameTimings).toBe(false);
  }

  deck.finalize();
  framebuffer.destroy();
  spy.mockRestore();
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
