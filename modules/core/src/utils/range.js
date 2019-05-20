/* 
 * range (Array)
 *   + start (Number) - the start index (incl.)
 *   + end (Number) - the end index (excl.)
 * rangeCollection (Array) - array of sorted, combined ranges
 */
export const EMPTY = [];
export const FULL = [[0, Infinity]];

// Insert a range into a range collection
export function add(rangeCollection, range) {
  // Noop if range collection already covers all
  if (rangeCollection === FULL) {
    return rangeCollection;
  }

  // Validate the input range
  if (range[0] < 0) {
    range[0] = 0;
  }
  if (range[0] >= range[1]) {
    return rangeCollection;
  }

  const newRangeCollection = [];
  const len = rangeCollection.length;
  let insertPosition = 0;

  for (let i = 0; i < len; i++) {
    const range0 = rangeCollection[i];

    if (range0[1] < range[0]) {
      // the current range is to the left of the new range
      newRangeCollection.push(range0);
      insertPosition = i + 1;
    } else if (range0[0] > range[1]) {
      // the current range is to the right of the new range
      newRangeCollection.push(range0);
    } else {
      range = [Math.min(range0[0], range[0]), Math.max(range0[1], range[1])];
    }
  }
  newRangeCollection.splice(insertPosition, 0, range);
  return newRangeCollection;
}
