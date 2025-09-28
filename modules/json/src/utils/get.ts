// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Access properties of nested containers using dot-path notation
 * Returns `undefined` if any container is not valid, instead of throwing
 * @param {Object} container - container that supports get
 * @param {String|*} compositeKey - key to access, can be '.'-separated string
 * @return {*} - value in the final key of the nested container, or `undefined`
 */
export function get(container, compositeKey) {
  // Split the key into subkeys
  const keyList = getKeys(compositeKey);
  // Recursively get the value of each key;
  let value = container;
  for (const key of keyList) {
    // If any intermediate subfield is not an object, return undefined
    value = isObject(value) ? value[key] : undefined;
  }
  return value;
}

/**
 * Checks if argument is an "indexable" object (not a primitive value, nor null)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a JavaScript object
 */
function isObject(value) {
  return value !== null && typeof value === 'object';
}

// Cache key to key arrays for speed
const keyMap = {};

// Takes a string of '.' separated keys and returns an array of keys
// - 'feature.geometry.type' => ['feature', 'geometry', 'type']
// - 'feature' => ['feature']
function getKeys(compositeKey) {
  if (typeof compositeKey === 'string') {
    // else assume string and split around dots
    let keyList = keyMap[compositeKey];
    if (!keyList) {
      keyList = compositeKey.split('.');
      keyMap[compositeKey] = keyList;
    }
    return keyList;
  }
  // Wrap in array if needed
  return Array.isArray(compositeKey) ? compositeKey : [compositeKey];
}
