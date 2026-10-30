// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import type {Device, QuerySet} from '@luma.gl/core';
import {FrameTimer} from '../../../../modules/core/src/lib/frame-timer';
import type {FrameTimings} from '../../../../modules/core/src/lib/frame-timer';

type FakeQuerySet = {
  destroy: ReturnType<typeof vi.fn>;
  readTimestampDuration: ReturnType<typeof vi.fn>;
  /** Settles the reads of all pairs. Each pair resolves to its duration, or rejects with null */
  settle: (durations: (number | null)[]) => void;
};

function createTimer({type = 'webgpu', debugGPUTime = false} = {}) {
  const queries: FakeQuerySet[] = [];
  const createQuerySet = vi.fn(() => {
    const pendingReads: {resolve: (duration: number) => void; reject: (error: Error) => void}[] =
      [];
    const query: FakeQuerySet = {
      destroy: vi.fn(),
      readTimestampDuration: vi.fn(
        () => new Promise<number>((resolve, reject) => pendingReads.push({resolve, reject}))
      ),
      settle: durations => {
        for (const [index, {resolve, reject}] of pendingReads.entries()) {
          const duration = durations[index];
          if (duration === null) {
            reject(new Error('disjoint'));
          } else {
            resolve(duration);
          }
        }
        pendingReads.length = 0;
      }
    };
    queries.push(query);
    return query as unknown as QuerySet;
  });
  const device = {
    type,
    features: new Set(['timestamp-query']),
    _isDebugGPUTimeEnabled: () => debugGPUTime,
    createQuerySet
  } as unknown as Device;
  const callback = vi.fn<(timings: FrameTimings) => void>();
  return {timer: new FrameTimer(device, callback), queries, createQuerySet, callback};
}

async function flushReadbacks() {
  for (let index = 0; index < 4; index++) {
    await Promise.resolve();
  }
}

test.each(['webgl', 'webgpu'])(
  'FrameTimer#reports a CPU-only sample while the %s debug GPU timer is active',
  type => {
    const {timer, createQuerySet, callback} = createTimer({type, debugGPUTime: true});
    timer.beginFrame();
    expect(timer.getRenderPassTimestamps()).toBeNull();
    timer.endFrame();
    expect(createQuerySet).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledExactlyOnceWith({cpuTime: expect.any(Number)});
    timer.destroy();
  }
);

test('FrameTimer#assigns two timestamp slots per render pass and sums their durations', async () => {
  const {timer, queries, callback} = createTimer();
  timer.beginFrame();
  const passes = [
    timer.getRenderPassTimestamps(),
    timer.getRenderPassTimestamps(),
    timer.getRenderPassTimestamps()
  ];
  expect(passes.map(pass => [pass?.beginTimestampIndex, pass?.endTimestampIndex])).toEqual([
    [0, 1],
    [2, 3],
    [4, 5]
  ]);
  expect(passes.every(pass => pass?.timestampQuerySet === passes[0]?.timestampQuerySet)).toBe(true);

  timer.endFrame();
  expect(queries[0].readTimestampDuration.mock.calls).toEqual([
    [0, 1],
    [2, 3],
    [4, 5]
  ]);
  expect(callback).not.toHaveBeenCalled();
  queries[0].settle([1, 2, 4]);
  await flushReadbacks();
  expect(callback).toHaveBeenCalledExactlyOnceWith({cpuTime: expect.any(Number), gpuTime: 7});
  timer.destroy();
});

test('FrameTimer#skips GPU time when a draw exceeds the render pass limit', () => {
  const {timer, queries, callback} = createTimer();
  timer.beginFrame();
  for (let index = 0; index < 32; index++) {
    expect(timer.getRenderPassTimestamps()).not.toBeNull();
  }
  expect(timer.getRenderPassTimestamps()).toBeNull();
  timer.endFrame();
  expect(queries[0].readTimestampDuration).not.toHaveBeenCalled();
  expect(queries[0].destroy).toHaveBeenCalledOnce();
  expect(callback).toHaveBeenCalledExactlyOnceWith({cpuTime: expect.any(Number)});
  timer.destroy();
});

test('FrameTimer#discards interrupted queries without exhausting the pool', () => {
  const {timer, queries} = createTimer();
  for (let index = 0; index < 6; index++) {
    timer.beginFrame();
    expect(timer.getRenderPassTimestamps()).not.toBeNull();
    timer.abortFrame();
    expect(queries[index].destroy).toHaveBeenCalledOnce();
    expect(queries[index].readTimestampDuration).not.toHaveBeenCalled();
  }
  timer.beginFrame();
  expect(timer.getRenderPassTimestamps()).not.toBeNull();
  timer.destroy();
  expect(queries[6].destroy).toHaveBeenCalledOnce();
});

test('FrameTimer#discards an abandoned query before starting another draw', () => {
  const {timer, queries} = createTimer();
  timer.beginFrame();
  const first = timer.getRenderPassTimestamps()?.timestampQuerySet;
  timer.beginFrame();
  expect(timer.getRenderPassTimestamps()?.timestampQuerySet).not.toBe(first);
  expect(queries[0].destroy).toHaveBeenCalledOnce();
  timer.destroy();
  expect(queries[1].destroy).toHaveBeenCalledOnce();
});

test('FrameTimer#limits pending readbacks and reuses completed queries', async () => {
  const {timer, queries, createQuerySet, callback} = createTimer();
  for (let index = 0; index < 4; index++) {
    timer.beginFrame();
    expect(timer.getRenderPassTimestamps()).not.toBeNull();
    timer.endFrame();
  }
  timer.beginFrame();
  expect(timer.getRenderPassTimestamps()).toBeNull();
  timer.endFrame();
  expect(callback).toHaveBeenCalledExactlyOnceWith({cpuTime: expect.any(Number)});

  queries[0].settle([2]);
  await flushReadbacks();
  expect(callback).toHaveBeenLastCalledWith({cpuTime: expect.any(Number), gpuTime: 2});
  timer.beginFrame();
  expect(timer.getRenderPassTimestamps()?.timestampQuerySet).toBe(queries[0]);
  expect(createQuerySet).toHaveBeenCalledTimes(4);

  timer.abortFrame();
  timer.destroy();
  for (const query of queries.slice(1)) query.settle([1]);
  await flushReadbacks();
  expect(callback).toHaveBeenCalledTimes(2);
  for (const query of queries) expect(query.destroy).toHaveBeenCalledOnce();
});

test('FrameTimer#reports failed readbacks asynchronously and does not reuse the query set', async () => {
  const {timer, queries, callback} = createTimer();
  timer.beginFrame();
  timer.getRenderPassTimestamps();
  timer.getRenderPassTimestamps();
  timer.endFrame();
  queries[0].settle([1, null]);
  expect(callback).not.toHaveBeenCalled();
  await flushReadbacks();
  expect(callback).toHaveBeenCalledExactlyOnceWith({cpuTime: expect.any(Number)});
  expect(queries[0].destroy).toHaveBeenCalledOnce();

  timer.beginFrame();
  expect(timer.getRenderPassTimestamps()?.timestampQuerySet).toBe(queries[1]);
  timer.destroy();
});

test('FrameTimer#destroys free and active queries and suppresses pending callbacks', async () => {
  const {timer, queries, callback} = createTimer();
  for (let index = 0; index < 2; index++) {
    timer.beginFrame();
    timer.getRenderPassTimestamps();
    timer.endFrame();
  }
  timer.beginFrame();
  timer.getRenderPassTimestamps();
  queries[0].settle([1]);
  await flushReadbacks();
  callback.mockClear();

  timer.destroy();
  timer.destroy();
  expect(queries[0].destroy).toHaveBeenCalledOnce();
  expect(queries[2].destroy).toHaveBeenCalledOnce();
  queries[1].settle([null]);
  await flushReadbacks();
  expect(queries[1].destroy).toHaveBeenCalledOnce();
  expect(callback).not.toHaveBeenCalled();

  timer.beginFrame();
  expect(timer.getRenderPassTimestamps()).toBeNull();
  timer.endFrame();
  expect(callback).not.toHaveBeenCalled();
});
