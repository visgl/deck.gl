// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Fast partial deep equal for prop.
 *
 * @param a Prop
 * @param b Prop to compare against `a`
 * @param depth Depth to which to recurse in nested Objects/Arrays. Use 0 (default) for shallow comparison, -1 for infinite depth
 * @param plainObjectsOnly Compare non-plain objects by identity.
 */
/* eslint-disable complexity */
export function deepEqual(a: any, b: any, depth: number, plainObjectsOnly = false): boolean {
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
      if (!deepEqual(a[i], b[i], depth - 1, plainObjectsOnly)) {
        return false;
      }
    }
    return true;
  }
  if (Array.isArray(b)) {
    return false;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    if (plainObjectsOnly && (!isPlainObject(a) || !isPlainObject(b))) {
      return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
      return false;
    }
    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      if (!deepEqual(a[key], b[key], depth - 1, plainObjectsOnly)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
