
export default class SortedBins {
  constructor(bins) {
    this.sortedBins = this.getSortedCounts(bins);
  }

  /**
   * Get an array of object with sorted count and index of bins
   * @param {Array} bins
   * @return {Array} array of count and index lookup
   */
  getSortedCounts(bins) {
    return bins
      .map((h, i) => ({i, counts: h.points.length}))
      .sort((a, b) => a.counts - b.counts);
  }

  /**
   * Get an array of object with sorted count and index of bins
   * @param {Number} lower
   * @param {Number} upper
   * @return {Array} array of nuw count range
   */
  getCountRange([lower, upper]) {
    const len = this.sortedBins.length;
    const lowerIdx = Math.ceil(lower / 100 * (len - 1));
    const upperIdx = Math.floor(upper / 100 * (len - 1));

    return [this.sortedBins[lowerIdx].counts, this.sortedBins[upperIdx].counts];
  }

  /**
   * Get ths max count of all bins
   * @return {Number | Boolean} max count
   */
  getMaxCount() {
    return this.sortedBins.length && this.sortedBins[this.sortedBins.length - 1].counts;
  }
}
