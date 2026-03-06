// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Browser setup - minimal since browser provides real DOM/WebGL
// Unlike node setup, we don't need JSDOM polyfills here

import {registerTypedArrayEquality} from './typed-array-equality';

// Register custom equality tester for typed arrays (tape compatibility)
registerTypedArrayEquality();

// Polyfill for loaders (may still be useful in browser for consistent behavior)
import '@loaders.gl/polyfills';

// Mark that we're running in browser test mode
const _global: any = globalThis;
_global.__BROWSER_TEST__ = true;

// Bridge probe.gl window globals to vitest browser commands
// This allows @deck.gl/test-utils (which uses window.browserTestDriver_*)
// to work with vitest's Playwright-based browser commands
import {commands} from 'vitest/browser';

(window as any).browserTestDriver_isHeadless = true;

(window as any).browserTestDriver_captureAndDiffScreen = async (options: any) => {
  return commands.captureAndDiffScreen(options);
};

(window as any).browserTestDriver_emulateInput = async (event: any) => {
  return commands.emulateInput(event);
};
