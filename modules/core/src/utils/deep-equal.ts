// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Fast partial deep equal for prop.
 *
 * @param a Prop
 * @param b Prop to compare against `a`
 * @param depth Depth to which to recurse in nested Objects/Arrays. Use 0 (default) for shallow comparison, -1 for infinite depth
 */
/* eslint-disable complexity */
export function deepEqual(a: any, b: any, depth: number): boolean {
  if (a === b) {
    return true;
  }
  if (!depth || !a || !b) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], depth - 1)) {
        return false;
      }
    }
    return true;
  }
  if (Array.isArray(b)) {
    return false;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!b.hasOwnProperty(key)) {
        return false;
      }
      if (!deepEqual(a[key], b[key], depth - 1)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Compare the own keys of two objects with `deepEqual`, skipping `ignoreKeys`.
 *
 * @param a Object
 * @param b Object to compare against `a`
 * @param depth Depth used for `a` and `b`, as in `deepEqual`
 * @param ignoreKeys Keys to leave out of the comparison
 */
export function deepEqualExcept(
  a: Record<string, any>,
  b: Record<string, any>,
  depth: number,
  ignoreKeys: readonly string[]
): boolean {
  if (a === b) {
    return true;
  }
  let keyCount = 0;
  for (const key of Object.keys(a)) {
    if (ignoreKeys.includes(key)) {
      continue;
    }
    keyCount++;
    if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key], depth - 1)) {
      return false;
    }
  }
  for (const key of Object.keys(b)) {
    if (!ignoreKeys.includes(key)) {
      keyCount--;
    }
  }
  return keyCount === 0;
}
