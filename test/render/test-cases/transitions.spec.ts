// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// This spec uses a shared Deck instance across tests to keep the animation loop running.
// This is required for timeline/transition tests where timeline.setTime() needs to
// trigger re-renders between onAfterRender callbacks.

import {describe} from 'vitest';
import {runPersistentRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';
import testCases from './transitions';

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runPersistentRenderTestSuite(testCases as TestCase[], deviceType);
});
