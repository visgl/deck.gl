// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import type {Device, QuerySet} from '@luma.gl/core';
import {FrameTimer} from '../../../../modules/core/src/lib/frame-timer';

function createTimer({type = 'webgpu', debugGPUTime = false} = {}) {
  const queries: {
    destroy: ReturnType<typeof vi.fn>;
    readTimestampDuration: ReturnType<typeof vi.fn>;
    resolve: (duration: number) => void;
    reject: (error: Error) => void;
  }[] = [];
  const createQuerySet = vi.fn(() => {
    let resolve!: (duration: number) => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<number>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const query = {destroy: vi.fn(), readTimestampDuration: vi.fn(() => promise), resolve, reject};
    queries.push(query);
    return query as unknown as QuerySet;
  });
  const device = {
    type,
    features: new Set(['timestamp-query']),
    _isDebugGPUTimeEnabled: () => debugGPUTime,
    createQuerySet
  } as unknown as Device;
  return {timer: new FrameTimer(device), queries, createQuerySet};
}

async function flushReadbacks() {
  // Drain both the result callback and the query-release finally handler.
  await Promise.resolve();
  await Promise.resolve();
}

test('FrameTimer#preserves WebGL debug profiling with a CPU-only sample', () => {
  const {timer, createQuerySet} = createTimer({type: 'webgl', debugGPUTime: true});
  const callback = vi.fn();
  expect(timer.beginFrame()).toBeNull();
  timer.endFrame(callback);
  expect(createQuerySet).not.toHaveBeenCalled();
  expect(callback).toHaveBeenCalledWith({cpuMs: expect.any(Number)});
  timer.destroy();
});

test('FrameTimer#discards interrupted queries without exhausting the pool', () => {
  const {timer, queries} = createTimer();
  for (let index = 0; index < 6; index++) {
    expect(timer.beginFrame()).not.toBeNull();
    timer.abortFrame();
    expect(queries[index].destroy).toHaveBeenCalledOnce();
    expect(queries[index].readTimestampDuration).not.toHaveBeenCalled();
  }
  expect(timer.beginFrame()).not.toBeNull();
  timer.destroy();
  expect(queries[6].destroy).toHaveBeenCalledOnce();
});

test('FrameTimer#discards an abandoned query before starting another draw', () => {
  const {timer, queries} = createTimer();
  const first = timer.beginFrame();
  expect(timer.beginFrame()).not.toBe(first);
  expect(queries[0].destroy).toHaveBeenCalledOnce();
  timer.destroy();
  expect(queries[1].destroy).toHaveBeenCalledOnce();
});

test('FrameTimer#limits pending readbacks and reuses completed queries', async () => {
  const {timer, queries, createQuerySet} = createTimer();
  const callback = vi.fn();
  for (let index = 0; index < 4; index++) {
    expect(timer.beginFrame()).not.toBeNull();
    timer.endFrame(callback);
  }
  expect(timer.beginFrame()).toBeNull();
  timer.endFrame(callback);
  expect(callback).toHaveBeenCalledExactlyOnceWith({cpuMs: expect.any(Number)});
  queries[0].resolve(2);
  await flushReadbacks();
  expect(callback).toHaveBeenLastCalledWith({cpuMs: expect.any(Number), gpuMs: 2});
  expect(timer.beginFrame()).toBe(queries[0]);
  expect(createQuerySet).toHaveBeenCalledTimes(4);
  timer.abortFrame();
  timer.destroy();
  for (const query of queries.slice(1)) query.resolve(1);
  await flushReadbacks();
  expect(callback).toHaveBeenCalledTimes(2);
  for (const query of queries) expect(query.destroy).toHaveBeenCalledOnce();
});

test('FrameTimer#reports rejected readbacks asynchronously without gpuMs', async () => {
  const {timer, queries} = createTimer();
  const callback = vi.fn();
  timer.beginFrame();
  timer.endFrame(callback);
  queries[0].reject(new Error('disjoint'));
  expect(callback).not.toHaveBeenCalled();
  await flushReadbacks();
  expect(callback).toHaveBeenCalledExactlyOnceWith({cpuMs: expect.any(Number)});
  timer.destroy();
  expect(queries[0].destroy).toHaveBeenCalledOnce();
});

test('FrameTimer#destroys free and active queries and suppresses pending callbacks', async () => {
  const {timer, queries} = createTimer();
  const callback = vi.fn();
  timer.beginFrame();
  timer.endFrame(callback);
  timer.beginFrame();
  timer.endFrame(callback);
  timer.beginFrame();
  queries[0].resolve(1);
  await flushReadbacks();
  callback.mockClear();
  timer.destroy();
  timer.destroy();
  expect(queries[0].destroy).toHaveBeenCalledOnce();
  expect(queries[2].destroy).toHaveBeenCalledOnce();
  queries[1].reject(new Error('device lost'));
  await flushReadbacks();
  expect(queries[1].destroy).toHaveBeenCalledOnce();
  expect(callback).not.toHaveBeenCalled();
  expect(timer.beginFrame()).toBeNull();
  timer.endFrame(callback);
  expect(callback).not.toHaveBeenCalled();
});
