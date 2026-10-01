// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it, vi} from 'vitest';
import {PageScheduler, type PageRequest} from '../splat-layer/page-scheduler';

const drainMicrotasks = async () => {
  for (let index = 0; index < 12; index++) await Promise.resolve();
  await new Promise(resolve => setTimeout(resolve, 10));
  for (let index = 0; index < 12; index++) await Promise.resolve();
};

describe('SplatLayer page admission', () => {
  it('does not admit another page batch until hierarchy retargeting is complete', async () => {
    const load = vi.fn(async () => true);
    const scheduler = new PageScheduler(8, load, vi.fn(), vi.fn());
    const requests = [{pageIndex: 1, priority: 1}];
    scheduler.update(requests, false);
    await drainMicrotasks();
    expect(load).not.toHaveBeenCalled();
    scheduler.update(requests, true);
    await drainMicrotasks();
    expect(load).toHaveBeenCalledTimes(1);
    scheduler.destroy();
  });

  it('does not restart a rejected load from a promise callback or an unchanged frame', async () => {
    const load = vi.fn(async () => false);
    const onChange = vi.fn();
    const scheduler = new PageScheduler(8, load, onChange, vi.fn());
    const requests = [{pageIndex: 1, priority: 1}];
    scheduler.update(requests);
    await drainMicrotasks();
    expect(load).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    scheduler.update(requests);
    await drainMicrotasks();
    expect(load).toHaveBeenCalledTimes(1);
    scheduler.invalidate();
    scheduler.update(requests);
    await drainMicrotasks();
    expect(load).toHaveBeenCalledTimes(2);
    scheduler.destroy();
  });

  it('fills a free slot without waiting for a slow sibling download', async () => {
    const completions: Array<(accepted: boolean) => void> = [];
    const load = vi.fn(
      (_request: PageRequest) => new Promise<boolean>(resolve => completions.push(resolve))
    );
    const scheduler = new PageScheduler(2, load, vi.fn(), vi.fn());
    const requests = [1, 3, 2].map(pageIndex => ({pageIndex, priority: pageIndex}));
    scheduler.update(requests);
    await drainMicrotasks();
    expect(load.mock.calls.map(call => call[0].pageIndex)).toEqual([3, 2]);
    completions[0](true);
    await drainMicrotasks();
    scheduler.update([requests[0], requests[2]]);
    await drainMicrotasks();
    expect(load).toHaveBeenCalledTimes(3);
    completions[1](true);
    await drainMicrotasks();
    expect(load).toHaveBeenCalledTimes(3);
    scheduler.update([requests[0]]);
    await drainMicrotasks();
    expect(load).toHaveBeenCalledTimes(3);
    scheduler.destroy();
    completions[2](false);
    await drainMicrotasks();
  });

  it('aborts obsolete requests and ignores completions after destruction', async () => {
    let finish: (accepted: boolean) => void = () => {};
    const onChange = vi.fn();
    const load = vi.fn(
      (_request: PageRequest, _signal: AbortSignal) =>
        new Promise<boolean>(resolve => {
          finish = resolve;
        })
    );
    const scheduler = new PageScheduler(1, load, onChange, vi.fn());
    scheduler.update([{pageIndex: 1, priority: 1}]);
    await drainMicrotasks();
    scheduler.update([]);
    expect(load.mock.calls[0][1].aborted).toBe(true);
    scheduler.destroy();
    finish(true);
    await drainMicrotasks();
    expect(onChange).not.toHaveBeenCalled();
    scheduler.update([{pageIndex: 2, priority: 1}]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reports thrown loader failures once and yields back to the host', async () => {
    const error = new Error('load failed');
    const onError = vi.fn();
    const scheduler = new PageScheduler(
      1,
      async () => {
        throw error;
      },
      vi.fn(),
      onError
    );
    scheduler.update([{pageIndex: 1, priority: 1}]);
    await drainMicrotasks();
    expect(onError).toHaveBeenCalledWith(error);
    expect(scheduler.active.size).toBe(0);
    expect(scheduler.rejected.has(1)).toBe(true);
    scheduler.destroy();
  });
});
