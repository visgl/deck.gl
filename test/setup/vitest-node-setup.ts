// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {registerTypedArrayEquality} from './typed-array-equality';

// Register custom equality tester for typed arrays (tape compatibility)
registerTypedArrayEquality();

// Note: @loaders.gl/polyfills is NOT imported here because it has .node extension
// files that vitest/ESM cannot resolve. JSDOM already provides the browser APIs
// that polyfills would provide (TextEncoder, TextDecoder, atob, btoa, etc.)

// Polyfill with JSDOM (same as current test/node.ts)
import {JSDOM} from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html>');
const _global: any = globalThis;

// Only set properties that don't already exist or are writable
if (!_global.window) {
  _global.window = dom.window;
}
if (!_global.document) {
  _global.document = dom.window.document;
}
if (!_global.Element) {
  _global.Element = dom.window.Element;
}
if (!_global.HTMLCanvasElement) {
  _global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
}
if (!_global.HTMLVideoElement) {
  _global.HTMLVideoElement = dom.window.HTMLVideoElement;
}

_global.__JSDOM__ = true;

// MutationObserver is required by @arcgis/core
if (!_global.MutationObserver) {
  _global.MutationObserver = dom.window.MutationObserver;
}

// Use Object.defineProperty for potentially read-only properties
try {
  Object.defineProperty(_global, 'navigator', {
    value: dom.window.navigator,
    writable: true,
    configurable: true
  });
} catch {
  // Navigator already defined, skip
}

if (!_global.requestAnimationFrame) {
  _global.requestAnimationFrame = cb => setTimeout(cb, 0);
}
if (!_global.cancelAnimationFrame) {
  _global.cancelAnimationFrame = t => clearTimeout(t);
}
