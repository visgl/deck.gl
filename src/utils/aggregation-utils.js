
/**
 * Get an array of object with sorted count and index of bins
 * @param {Array} bins

 * @return {Array} array of count and index lookup
 */
export function getSortedCounts(bins) {
  return bins
    .map((h, i) => ({i, counts: h.points.length}))
    .sort((a, b) => a.counts - b.counts);
}

/**
 * Get an array of object with sorted count and index of bins
 * @param {Array} sortedCounts
 * @param {Number} percentile

 * @return {Array} array of nuw count range
 */
export function getCountRangeFromPercentile(sortedCounts, percentile) {
  const len = sortedCounts.length;
  const lower = Math.ceil(percentile[0] / 100 * (len - 1));
  const upper = Math.floor(percentile[1] / 100 * (len - 1));

  return [sortedCounts[lower].counts, sortedCounts[upper].counts];
}
