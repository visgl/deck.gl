// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export {getLayerUniforms} from './utils/layer';
export {toLowPrecision} from './utils/precision';
export {gl, device} from './utils/setup-gl';

// Utilities for update tests (lifecycle tests)
// Re-export from tape.ts which provides default spy factory for backward compat
export {testLayer, testLayerAsync, testInitializeLayer, testInitializeLayerAsync} from './tape';
export {generateLayerTests} from './generate-layer-tests';

// Basic utility for rendering multiple scenes (could go into "deck.gl/core")
export {TestRunner} from './test-runner';

// A utility that renders a list of scenes and compares against golden images
export {SnapshotTestRunner} from './snapshot-test-runner';
// A utility that emulates input events
export {InteractionTestRunner} from './interaction-test-runner';

export type {LayerTestCase, ResetSpy, SpyFactory} from './tape';
export type {SnapshotTestCase} from './snapshot-test-runner';
export type {InteractionTestCase} from './interaction-test-runner';
