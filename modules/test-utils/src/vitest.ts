// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Vitest-specific entry point with vi.spyOn default
// Use: import { testLayer } from '@deck.gl/test-utils/vitest'

import {vi} from 'vitest';
import {testLayer as testLayerCore, testLayerAsync as testLayerAsyncCore} from './lifecycle-test';
import type {Layer} from '@deck.gl/core';
import type {SpyFactory, TestLayerOptions} from './lifecycle-test';

// Default spy factory using vi.spyOn
const defaultSpyFactory: SpyFactory = (obj, method) => vi.spyOn(obj, method as never);

export function testLayer<LayerT extends Layer>(
  opts: Omit<TestLayerOptions<LayerT>, 'createSpy'> & {createSpy?: SpyFactory}
) {
  const createSpy = opts.createSpy || defaultSpyFactory;
  return testLayerCore({...opts, createSpy});
}

export function testLayerAsync<LayerT extends Layer>(
  opts: Omit<TestLayerOptions<LayerT>, 'createSpy'> & {createSpy?: SpyFactory}
) {
  const createSpy = opts.createSpy || defaultSpyFactory;
  return testLayerAsyncCore({...opts, createSpy});
}

// Re-export non-spy utilities
export {testInitializeLayer, testInitializeLayerAsync} from './lifecycle-test';
export {getLayerUniforms} from './utils/layer';
export {toLowPrecision} from './utils/precision';
export {gl, device} from './utils/setup-gl';
export {generateLayerTests} from './generate-layer-tests';

// Types
export type {LayerTestCase, SpyFactory, TestLayerOptions} from './lifecycle-test';
