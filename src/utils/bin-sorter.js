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

export default class BinSorter {
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
   * @param {Number[]} range
   * @param {Number} range[0] - lower bound
   * @param {Number} range[1] - upper bound
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
