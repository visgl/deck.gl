// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Vitest-specific entry point that doesn't import @probe.gl/test-utils
// Use: import { testLayer } from '@deck.gl/test-utils/vitest'

export {getLayerUniforms} from './utils/layer';
export {toLowPrecision} from './utils/precision';
export {gl, device} from './utils/setup-gl';

export {
  testLayer,
  testLayerAsync,
  testInitializeLayer,
  testInitializeLayerAsync
} from './lifecycle-test';
export {generateLayerTests} from './generate-layer-tests';

export {TestRunner} from './test-runner';
export {SnapshotTestRunner} from './snapshot-test-runner';
export {InteractionTestRunner} from './interaction-test-runner';

export type {LayerTestCase, SpyFactory} from './lifecycle-test';
export type {SnapshotTestCase} from './snapshot-test-runner';
export type {InteractionTestCase} from './interaction-test-runner';
