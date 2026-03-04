// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Tape entry point - wraps lifecycle-test and adds @probe.gl/test-utils as the default spy factory
// For vitest users, use @deck.gl/test-utils/vitest which doesn't import probe.gl

import {makeSpy} from '@probe.gl/test-utils';
import {
  testLayer as testLayerCore,
  testLayerAsync as testLayerAsyncCore,
  testInitializeLayer,
  testInitializeLayerAsync
} from './lifecycle-test';
import type {Layer} from '@deck.gl/core';
import type {
  LayerClass,
  LayerTestCase,
  ResetSpy,
  SpyFactory,
  TestLayerOptions
} from './lifecycle-test';

export {testInitializeLayer, testInitializeLayerAsync};
export type {LayerClass, LayerTestCase, ResetSpy, SpyFactory};

let _hasWarnedCreateSpy = false;
let _hasWarnedResetSpy = false;

function getDefaultSpyFactory(): SpyFactory {
  if (!_hasWarnedCreateSpy) {
    _hasWarnedCreateSpy = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[@deck.gl/test-utils] Implicit @probe.gl/test-utils usage is deprecated. ' +
        'Pass createSpy option: createSpy: (obj, method) => vi.spyOn(obj, method) for vitest, ' +
        'or createSpy: makeSpy for probe.gl.'
    );
  }
  return makeSpy;
}

/** Default reset for probe.gl spies - clears call tracking but keeps spy active */
function getDefaultResetSpy(): ResetSpy {
  if (!_hasWarnedResetSpy) {
    _hasWarnedResetSpy = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[@deck.gl/test-utils] Implicit spy reset is deprecated. ' +
        'Pass resetSpy option: resetSpy: (spy) => spy.mockRestore() for vitest, ' +
        'or resetSpy: (spy) => spy.reset() for probe.gl.'
    );
  }
  return spy => (spy as ReturnType<typeof makeSpy>).reset();
}

/**
 * Initialize and updates a layer over a sequence of scenarios (test cases).
 * Use `testLayerAsync` if the layer's update flow contains async operations.
 */
export function testLayer<LayerT extends Layer>(
  opts: Omit<TestLayerOptions<LayerT>, 'createSpy' | 'resetSpy'> & {
    createSpy?: SpyFactory;
    resetSpy?: ResetSpy;
  }
): void {
  const createSpy = opts.createSpy || getDefaultSpyFactory();
  const resetSpy = opts.resetSpy || getDefaultResetSpy();
  testLayerCore({...opts, createSpy, resetSpy});
}

/**
 * Initialize and updates a layer over a sequence of scenarios (test cases).
 * Each test case is awaited until the layer's isLoaded flag is true.
 */
export async function testLayerAsync<LayerT extends Layer>(
  opts: Omit<TestLayerOptions<LayerT>, 'createSpy' | 'resetSpy'> & {
    createSpy?: SpyFactory;
    resetSpy?: ResetSpy;
  }
): Promise<void> {
  const createSpy = opts.createSpy || getDefaultSpyFactory();
  const resetSpy = opts.resetSpy || getDefaultResetSpy();
  await testLayerAsyncCore({...opts, createSpy, resetSpy});
}
