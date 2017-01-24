/**
 * Flattens a nested array into a single level array
 * @example flatten([[1, [2]], [3], 4]) => [1, 2, 3, 4]
 * @param {Array} array The array to flatten.
 * @return {Array} Returns the new flattened array.
 */
export function flatten(array, result = []) {
  let index = -1;
  while (++index < array.length) {
    const value = array[index];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}

export function countVertices(nestedArray) {
  let count = 0;
  let index = -1;
  while (++index < nestedArray.length) {
    const value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      count += countVertices(value);
    } else {
      count++;
    }
  }
  return count;
}

// Flattens nested array of vertices, padding third coordinate as needed
export function flattenVertices(nestedArray, {result = [], dimensions = 3} = {}) {
  let index = -1;
  let vertexLength = 0;
  while (++index < nestedArray.length) {
    const value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      flattenVertices(value, {result, dimensions});
    } else {
      if (vertexLength < dimensions) { // eslint-disable-line
        result.push(value);
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result.push(0);
  }
  return result;
}

// Uses copyWithin to significantly speed up typed array value filling
export function fillArray({target, source, start = 0, count = 1}) {
  const total = count * source.length;
  let copied = 0;
  for (let i = 0; i < source.length; ++i) {
    target[start + copied++] = source[i];
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

// Flattens nested array of vertices, padding third coordinate as needed
/*
export function flattenTypedVertices(nestedArray, {
  result = [],
  Type = Float32Array,
  start = 0,
  dimensions = 3
} = {}) {
  let index = -1;
  let vertexLength = 0;
  while (++index < nestedArray.length) {
    const value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      start = flattenTypedVertices(value, {result, start, dimensions});
    } else {
      if (vertexLength < dimensions) { // eslint-disable-line
        result[start++] = value;
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result[start++] = 0;
  }
  return start;
}
*/
