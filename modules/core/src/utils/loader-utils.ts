// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {isArrowTable} from '../arrow/upstream-math/is-arrow-table';

/** Normalizes the loaders.gl Arrow result at the layer data boundary. */
export function unwrapLoaderArrowResult(value: unknown): unknown {
  const result = value as {shape?: unknown; data?: unknown} | null | undefined;
  return result?.shape === 'arrow-table' && isArrowTable(result.data) ? result.data : value;
}

/**
 * Compares loader request options across layer instances. Plain objects and
 * arrays can be rebuilt each render. Runtime objects, such as Headers and
 * AbortSignal, are compared by identity because they can hold hidden state.
 */
export function equalLoaderOptions(a: unknown, b: unknown): boolean {
  return compareOptions(a, b, new WeakMap());
}

function compareOptions(a: unknown, b: unknown, seen: WeakMap<object, object>): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (!isOptionContainer(a) || !isOptionContainer(b)) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b) || (Array.isArray(a) && a.length !== b.length)) {
    return false;
  }
  if (seen.has(a)) {
    return seen.get(a) === b;
  }
  seen.set(a, b);
  const keys = Object.keys(a);
  const equal =
    keys.length === Object.keys(b).length &&
    keys.every(
      key => Object.prototype.hasOwnProperty.call(b, key) && compareOptions(a[key], b[key], seen)
    );
  seen.delete(a);
  return equal;
}

function isOptionContainer(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return Array.isArray(value) || prototype === Object.prototype || prototype === null;
}
