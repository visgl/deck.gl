// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Vitest-specific entry point with vi.spyOn default
// Use: import { testLayer } from '@deck.gl/test-utils/vitest'

import {vi} from 'vitest';
import {testLayer as testLayerCore, testLayerAsync as testLayerAsyncCore} from './lifecycle-test';
import type {Layer} from '@deck.gl/core';
import type {ResetSpy, SpyFactory, TestLayerOptions} from './lifecycle-test';

/** Default spy factory using vi.spyOn */
const defaultSpyFactory: SpyFactory = (obj, method) => vi.spyOn(obj, method as never);

/** Default reset for vitest spies - restores original implementation */
const defaultResetSpy: ResetSpy = spy => spy.mockRestore?.();

export function testLayer<LayerT extends Layer>(
  opts: Omit<TestLayerOptions<LayerT>, 'createSpy' | 'resetSpy'> & {
    createSpy?: SpyFactory;
    resetSpy?: ResetSpy;
  }
) {
  const createSpy = opts.createSpy || defaultSpyFactory;
  const resetSpy = opts.resetSpy || defaultResetSpy;
  return testLayerCore({...opts, createSpy, resetSpy});
}

export function testLayerAsync<LayerT extends Layer>(
  opts: Omit<TestLayerOptions<LayerT>, 'createSpy' | 'resetSpy'> & {
    createSpy?: SpyFactory;
    resetSpy?: ResetSpy;
  }
) {
  const createSpy = opts.createSpy || defaultSpyFactory;
  const resetSpy = opts.resetSpy || defaultResetSpy;
  return testLayerAsyncCore({...opts, createSpy, resetSpy});
}

// Re-export non-spy utilities
export {testInitializeLayer, testInitializeLayerAsync} from './lifecycle-test';
export {getLayerUniforms} from './utils/layer';
export {toLowPrecision} from './utils/precision';
export {gl, device} from './utils/setup-gl';
export {generateLayerTests} from './generate-layer-tests';

// Types
export type {LayerTestCase, ResetSpy, SpyFactory, TestLayerOptions} from './lifecycle-test';
