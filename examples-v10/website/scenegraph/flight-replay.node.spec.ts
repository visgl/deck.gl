// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import snapshot from './all.json';
import {watchFlightData, type FlightSnapshot} from './flight-data';

test('flight fallback advances twice, loops, and stops when live polling recovers', async () => {
  vi.useFakeTimers();
  const data = snapshot as FlightSnapshot;
  const fetchData = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(data);
  const frames = vi.fn();
  const stop = watchFlightData(data, fetchData, frames);
  try {
    await vi.advanceTimersByTimeAsync(15000);
    expect(frames.mock.calls.map(([frame]) => frame.time - data.time)).toEqual([0, 60, 120, 0]);
    expect(frames.mock.calls[1][0].states[2][5]).not.toBe(data.states[2][5]);
    await vi.advanceTimersByTimeAsync(45000);
    expect(frames).toHaveBeenLastCalledWith(data, 'live');
    const count = frames.mock.calls.length;
    await vi.advanceTimersByTimeAsync(5000);
    expect(frames).toHaveBeenCalledTimes(count);
    stop();
    await vi.advanceTimersByTimeAsync(60000);
    expect(fetchData).toHaveBeenCalledTimes(2);
  } finally {
    stop();
    vi.useRealTimers();
  }
});
