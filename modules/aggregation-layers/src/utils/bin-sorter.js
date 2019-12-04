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

// getValue takes an array of points returns a value to sort the bins on.
// by default it returns the number of points
// this is where to pass in a function to color the bins by
// avg/mean/max of specific value of the point
const defaultGetValue = points => points.length;
const MAX_32_BIT_FLOAT = 3.402823466e38;

export default class BinSorter {
  constructor(bins = [], getValue = defaultGetValue) {
    this.aggregatedBins = this.getAggregatedBins(bins, getValue);
    this._updateMinMaxValues();
    this.binMap = this.getBinMap();
  }

  /**
   * Get an array of object with aggregated values and index of bins
   * Array object will be sorted by value optionally.
   * @param {Array} bins
   * @param {Function} getValue
   * @return {Array} array of values and index lookup
   */
  getAggregatedBins(bins, getValue) {
    const binCount = bins.length;
    const aggregatedBins = [];
    let index = 0;
    for (let binIndex = 0; binIndex < binCount; binIndex++) {
      const bin = bins[binIndex];
      const value = getValue(bin.points);

      if (value !== null && value !== undefined) {
        // filter bins if value is null or undefined
        aggregatedBins[index] = {
          i: Number.isFinite(bin.index) ? bin.index : binIndex,
          value,
          counts: bin.points.length
        };
        index++;
      }
    }

    return aggregatedBins;
  }

  /**
   * Get range of values of all bins
   * @param {Number[]} range
   * @param {Number} range[0] - lower bound
   * @param {Number} range[1] - upper bound
   * @return {Array} array of new value range
   */
  getValueRange([lower, upper]) {
    if (!this.sortedBins) {
      this.sortedBins = this.aggregatedBins.sort((a, b) => a.value - b.value);
    }
    const len = this.sortedBins.length;
    if (!len) {
      return [0, 0];
    }
    const lowerIdx = Math.ceil((lower / 100) * (len - 1));
    const upperIdx = Math.floor((upper / 100) * (len - 1));

    return [this.sortedBins[lowerIdx].value, this.sortedBins[upperIdx].value];
  }

  /**
   * Get a mapping from cell/hexagon index to sorted bin
   * This is used to retrieve bin value for color calculation
   * @return {Object} bin index to aggregatedBins
   */
  getBinMap() {
    const binMap = {};
    for (const bin of this.aggregatedBins) {
      binMap[bin.i] = bin;
    }
    return binMap;
  }

  // Private

  /**
   * Get ths max count of all bins
   * @return {Number | Boolean} max count
   */
  _updateMinMaxValues() {
    let maxCount = 0;
    let maxValue = 0;
    let minValue = MAX_32_BIT_FLOAT;
    let totalCount = 0;
    for (const x of this.aggregatedBins) {
      maxCount = maxCount > x.counts ? maxCount : x.counts;
      maxValue = maxValue > x.value ? maxValue : x.value;
      minValue = minValue < x.value ? minValue : x.value;
      totalCount += x.counts;
    }
    this.maxCount = maxCount;
    this.maxValue = maxValue;
    this.minValue = minValue;
    this.totalCount = totalCount;
  }
}

// Helper methods
