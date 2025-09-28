// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

type NestedArray<T> = (T | NestedArray<T>)[];

/**
 * Flattens a nested array into a single level array,
 * or a single value into an array with one value
 * @example flatten([[1, [2]], [3], 4]) => [1, 2, 3, 4]
 * @example flatten(1) => [1]
 * @param array The array to flatten.
 * @param filter= - Optional predicate called on each `value` to
 *   determine if it should be included (pushed onto) the resulting array.
 * @return Returns the new flattened array (new array or `result` if provided)
 */
export function flatten<T>(
  array: T | NestedArray<T>,
  filter: (element: T) => boolean = () => true
): T[] {
  // Wrap single object in array
  if (!Array.isArray(array)) {
    return filter(array) ? [array] : [];
  }
  // Deep flatten and filter the array
  return flattenArray(array, filter, []);
}

/** Deep flattens an array. Helper to `flatten`, see its parameters */
function flattenArray<T>(array: NestedArray<T>, filter: (element: T) => boolean, result: T[]): T[] {
  let index = -1;
  while (++index < array.length) {
    const value = array[index];
    if (Array.isArray(value)) {
      flattenArray(value, filter, result);
    } else if (filter(value)) {
      result.push(value);
    }
  }
  return result;
}

/** Uses copyWithin to significantly speed up typed array value filling */
export function fillArray({target, source, start = 0, count = 1}) {
  const length = source.length;
  const total = count * length;
  let copied = 0;
  for (let i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    // If we have copied less than half, copy everything we got
    // else copy remaining in one operation
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}
