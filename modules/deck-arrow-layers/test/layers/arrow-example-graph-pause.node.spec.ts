// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {GPUGraphDeckEffect} from '../../src/gpu-graph/gpu-graph-effect';

test('paused graph draws do not advance layout while selection still updates', () => {
  const effect = Object.create(GPUGraphDeckEffect.prototype);
  Object.assign(effect, {
    destroyed: false,
    layoutPaused: true,
    completedAnalysisStages: 1,
    analysisStages: [],
    device: {commandEncoder: {}},
    frameGraph: {encode: vi.fn(() => ({stats: {cpuEncodeTimeMilliseconds: 0}}))},
    searchGraph: {encode: vi.fn()},
    searchPending: true,
    getVectorBuffer: vi.fn(() => ({write: vi.fn()})),
    frameCount: 0,
    previousFrameTime: 0,
    publishStats: vi.fn()
  });
  effect.preRender({viewports: [{}]} as any);
  expect(effect.frameGraph.encode).not.toHaveBeenCalled();
  expect(effect.searchGraph.encode).toHaveBeenCalledTimes(1);
  effect.setSelectedVertex(null);
  expect(effect.currentSelection).toBeNull();
  effect.layoutPaused = false;
  effect.preRender({viewports: [{}]} as any);
  expect(effect.frameGraph.encode).toHaveBeenCalledTimes(1);
});
