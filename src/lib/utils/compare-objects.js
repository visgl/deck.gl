// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import assert from 'assert';

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * @param {Object} opt.oldProps - object with old key/value pairs
 * @param {Object} opt.newProps - object with new key/value pairs
 * @param {Object} opt.ignoreProps={} - object, keys that should not be compared
 * @returns {null|String} - null when values of all keys are strictly equal.
 *   if unequal, returns a string explaining what changed.
 */
/* eslint-disable max-statements, complexity */
export function compareProps({oldProps, newProps, ignoreProps = {}} = {}) {
  assert(oldProps !== undefined && newProps !== undefined, 'compareProps args');

  if (oldProps === newProps) {
    return null;
  }

  if (typeof oldProps !== 'object' || oldProps === null) {
    return 'old props is not an object';
  }
  if (typeof newProps !== 'object' || newProps === null) {
    return 'new props is not an object';
  }

  // Test if new props different from old props
  for (const key in oldProps) {
    if (!(key in ignoreProps)) {
      if (!newProps.hasOwnProperty(key)) {
        return `prop ${key} dropped: ${oldProps[key]} -> (undefined)`;
      } else if (oldProps[key] !== newProps[key]) {
        return `prop ${key} changed: ${oldProps[key]} -> ${newProps[key]}`;
      }
    }
  }

  // Test if any new props have been added
  for (const key in newProps) {
    if (!(key in ignoreProps)) {
      if (!oldProps.hasOwnProperty(key)) {
        return `prop ${key} added: (undefined) -> ${newProps[key]}`;
      }
    }
  }

  return null;
}
/* eslint-enable max-statements, complexity */

// Shallow compare
/* eslint-disable complexity */
export function areEqualShallow(a, b, {ignore = {}} = {}) {

  if (a === b) {
    return true;
  }

  if (typeof a !== 'object' || a === null ||
    typeof b !== 'object' || b === null) {
    return false;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (const key in a) {
    if (!(key in ignore) && (!(key in b) || a[key] !== b[key])) {
      return false;
    }
  }
  for (const key in b) {
    if (!(key in ignore) && (!(key in a))) {
      return false;
    }
  }
  return true;
}
