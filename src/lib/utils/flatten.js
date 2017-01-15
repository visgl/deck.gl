/**
 * Flattens a nested array into a single level array
 * @example flatten([[1, [2]], [3], 4]) => [1, 2, 3, 4]
 * @param {Array} array The array to flatten.
 * @return {Array} Returns the new flattened array.
 */
export default function flatten(array, result = []) {
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
