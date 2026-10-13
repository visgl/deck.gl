// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {ArrowPolygonDataSource} from '../../../../examples/arrow/arrow-polygons/arrow-polygon-data-source';
import {GPUTraceCullingEffect} from '../../../../examples/deck/gpu-culled-trace/gpu-trace-culling-effect';

function makeTraceEffect(readAsync: () => Promise<Uint8Array>) {
  const effect = Object.create(GPUTraceCullingEffect.prototype);
  const buffer = {readAsync, destroy: vi.fn()};
  Object.assign(effect, {
    resources: {
      blockDrawCommands: {buffer, getInstanceCountByteOffset: () => 0, destroy: vi.fn()},
      spans: buffer,
      visibleIds: buffer,
      rowFlags: buffer,
      cullingCounts: buffer,
      viewUniforms: buffer
    },
    compiled: null,
    textSelection: null,
    onStats: vi.fn()
  });
  return effect;
}

test('optional GPU trace readback rejection is handled and permits retry', async () => {
  const readAsync = vi.fn().mockRejectedValue(new Error('device lost'));
  const effect = makeTraceEffect(readAsync);
  await expect(effect.sampleStats()).resolves.toBeUndefined();
  await expect(effect.sampleStats()).resolves.toBeUndefined();
  expect(readAsync).toHaveBeenCalledTimes(2);
  expect(effect.onStats).not.toHaveBeenCalled();
});

for (const rejects of [false, true]) {
  test(`GPU trace readback settles after cleanup without publishing (rejects=${rejects})`, async () => {
    let settle: () => void;
    const pending = new Promise<Uint8Array>((resolve, reject) => {
      settle = () => (rejects ? reject(new Error('buffer destroyed')) : resolve(new Uint8Array(4)));
    });
    const readAsync = vi.fn(() => pending);
    const effect = makeTraceEffect(readAsync);
    const sample = effect.sampleStats();
    effect.cleanup({});
    settle!();
    await expect(sample).resolves.toBeUndefined();
    await effect.sampleStats();
    expect(readAsync).toHaveBeenCalledOnce();
    expect(effect.onStats).not.toHaveBeenCalled();
  });
}

test('direct polygon vectors populate the complete table inspector immediately', () => {
  const onDataUpdated = vi.fn();
  const source = new ArrowPolygonDataSource({onDataUpdated, onRendererPropsUpdated: vi.fn()});
  const loaded = vi.fn();
  let batchCount = 0;
  source.panels = {
    beginLoadedTableStream: ({recordBatches}: {recordBatches: unknown[]}) => {
      batchCount = recordBatches.length;
      return {setLoadedBatchCount: loaded};
    }
  } as never;
  const progress = vi.fn();
  source.controlPanel = {
    syncControls: vi.fn(),
    setPickedLabel: vi.fn(),
    setStreamingBatchStatus: progress
  } as never;
  (source as any).setPolygonInput('vectors', '10k-stream', 'polygon', 'constant');
  expect(batchCount).toBeGreaterThan(0);
  expect(loaded).toHaveBeenLastCalledWith(batchCount);
  expect(progress).toHaveBeenLastCalledWith(batchCount, batchCount);
  expect(onDataUpdated.mock.calls[0][0].polygons.length).toBe(10000);
});
