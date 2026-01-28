// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Browser setup - minimal since browser provides real DOM/WebGL
// Unlike node setup, we don't need JSDOM polyfills here

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

// Polyfill for loaders (may still be useful in browser for consistent behavior)
import '@loaders.gl/polyfills';

// Mark that we're running in browser test mode
const _global: any = globalThis;
_global.__BROWSER_TEST__ = true;
