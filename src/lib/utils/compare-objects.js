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
