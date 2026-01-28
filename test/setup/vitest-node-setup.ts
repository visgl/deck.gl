// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect} from 'vitest';

// Add custom equality tester for typed arrays
// This makes toEqual work like tape's deepEqual for typed arrays
// TODO: Remove this custom equality tester once tests are updated to use explicit
// typed array comparisons (e.g., expect(Array.from(typedArray)).toEqual([...]))
// This is a temporary measure to maintain tape compatibility during migration.
expect.addEqualityTesters([
  function typedArrayEquality(a: unknown, b: unknown): boolean | undefined {
    const isTypedArray = (val: unknown): val is ArrayBufferView =>
      ArrayBuffer.isView(val) && !(val instanceof DataView);

    // Helper to compare two values, handling NaN properly
    // Object.is(NaN, NaN) returns true, unlike NaN === NaN which is false
    const valuesEqual = (x: number, y: number): boolean => Object.is(x, y);

    // Only handle cases where at least one is a typed array and the other is an array
    if (isTypedArray(a) && Array.isArray(b)) {
      const aArray = Array.from(a as ArrayLike<number>);
      if (aArray.length !== b.length) return false;
      for (let i = 0; i < aArray.length; i++) {
        if (!valuesEqual(aArray[i], b[i])) return false;
      }
      return true;
    }

    if (Array.isArray(a) && isTypedArray(b)) {
      const bArray = Array.from(b as ArrayLike<number>);
      if (a.length !== bArray.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!valuesEqual(a[i], bArray[i])) return false;
      }
      return true;
    }

    // Both are typed arrays of the same type - compare element by element
    if (isTypedArray(a) && isTypedArray(b)) {
      const aArray = Array.from(a as ArrayLike<number>);
      const bArray = Array.from(b as ArrayLike<number>);
      if (aArray.length !== bArray.length) return false;
      for (let i = 0; i < aArray.length; i++) {
        if (!valuesEqual(aArray[i], bArray[i])) return false;
      }
      return true;
    }

    // Not a typed array comparison - let vitest handle it
    return undefined;
  }
]);

// Polyfill for loaders
import '@loaders.gl/polyfills';

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
