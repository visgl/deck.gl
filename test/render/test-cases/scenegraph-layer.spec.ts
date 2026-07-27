// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// This spec uses a shared Deck instance across tests to keep the animation loop running.
// This is required for animation tests where deck.animationLoop.timeline.setTime()
// needs to trigger re-renders between frames.

import {describe} from 'vitest';
import {runPersistentRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';
import testCases from './scenegraph-layer';

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runPersistentRenderTestSuite(testCases as TestCase[], deviceType);
});
