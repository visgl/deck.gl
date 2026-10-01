// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, expect, test, vi} from 'vitest';
import type {Layer} from '@deck.gl/core';
import TileProcessingScheduler from '../../../../modules/geo-layers/src/tile-3d-layer/tile-processing-scheduler';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function createFrameClock() {
  let time = 0;
  const callbacks: FrameRequestCallback[] = [];
  vi.spyOn(performance, 'now').mockImplementation(() => time);
  const requestFrame = vi.fn((callback: FrameRequestCallback) => callbacks.push(callback));
  const cancelFrame = vi.fn();
  vi.stubGlobal('requestAnimationFrame', requestFrame);
  vi.stubGlobal('cancelAnimationFrame', cancelFrame);
  return {
    requestFrame,
    cancelFrame,
    advance: (duration: number) => (time += duration),
    nextFrame: () => callbacks.shift()!(time)
  };
}

function createLayer() {
  const currentLayer = {setNeedsUpdate: vi.fn()};
  const layer = {getCurrentLayer: vi.fn(() => currentLayer)} as unknown as Layer;
  return {layer, currentLayer};
}

test('tile processing shares a frame budget and retries the current layer instance', () => {
  const clock = createFrameClock();
  const scheduler = new TileProcessingScheduler(8);
  const first = createLayer();
  const second = createLayer();
  const createScenegraph = vi.fn();

  expect(scheduler.run(first.layer, () => clock.advance(10))).toBe(true);
  expect(scheduler.run(second.layer, createScenegraph)).toBe(false);
  expect(createScenegraph).not.toHaveBeenCalled();
  expect(clock.requestFrame).toHaveBeenCalledTimes(1);

  clock.nextFrame();
  expect(second.currentLayer.setNeedsUpdate).toHaveBeenCalledOnce();
  expect(first.currentLayer.setNeedsUpdate).not.toHaveBeenCalled();
  expect(scheduler.run(second.layer, createScenegraph)).toBe(true);
  expect(createScenegraph).toHaveBeenCalledOnce();
  scheduler.destroy();
});

test('tile processing cancellation releases deferred work and ignores finalized layers', () => {
  const clock = createFrameClock();
  const scheduler = new TileProcessingScheduler(1);
  const {layer} = createLayer();
  scheduler.run(layer, () => clock.advance(2));
  scheduler.run(layer, () => {});
  vi.mocked(layer.getCurrentLayer).mockReturnValue(null);
  expect(() => clock.nextFrame()).not.toThrow();

  scheduler.run(layer, () => clock.advance(2));
  scheduler.run(layer, () => {});
  scheduler.destroy();
  expect(clock.cancelFrame).toHaveBeenCalledOnce();
});

test('disabled budget runs synchronously without scheduling animation frames', () => {
  const clock = createFrameClock();
  const scheduler = new TileProcessingScheduler(0);
  const {layer} = createLayer();
  const createScenegraph = vi.fn(() => clock.advance(100));
  expect(scheduler.run(layer, createScenegraph)).toBe(true);
  expect(scheduler.run(layer, createScenegraph)).toBe(true);
  expect(createScenegraph).toHaveBeenCalledTimes(2);
  expect(clock.requestFrame).not.toHaveBeenCalled();
});

test('failed creation still consumes its frame budget', () => {
  const clock = createFrameClock();
  const scheduler = new TileProcessingScheduler(8);
  const {layer} = createLayer();
  expect(() =>
    scheduler.run(layer, () => {
      clock.advance(10);
      throw new Error('creation failed');
    })
  ).toThrow('creation failed');
  expect(scheduler.run(layer, () => {})).toBe(false);
  scheduler.destroy();
});
