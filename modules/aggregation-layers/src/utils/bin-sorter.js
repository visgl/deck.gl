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

import {clamp, getQuantileDomain, getOrdinalDomain} from './scale-utils';

const MAX_32_BIT_FLOAT = 3.402823466e38;

// access array of points in each bin
const defaultGetPoints = bin => bin.points;
// access index of each bin
const defaultGetIndex = bin => bin.index;

// d3-scending
const ascending = (a, b) => (a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN);

const defaultProps = {
  getValue: defaultGetValue,
  getPoints: defaultGetPoints,
  getIndex: defaultGetIndex,
  filterData: null
};

export default class BinSorter {
  constructor(bins = [], props = defaultProps) {
    this.aggregatedBins = this.getAggregatedBins(bins, props);
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
  getAggregatedBins(bins, props) {
    const {
      getValue = defaultGetValue,
      getPoints = defaultGetPoints,
      getIndex = defaultGetIndex,
      filterData
    } = props;

    const hasFilter = typeof filterData === 'function';
    const binCount = bins.length;
    const aggregatedBins = [];
    let index = 0;

    for (let binIndex = 0; binIndex < binCount; binIndex++) {
      const bin = bins[binIndex];
      const points = getPoints(bin);
      const i = getIndex(bin);

      const filteredPoints = hasFilter ? points.filter(filterData) : points;

      bin.filteredPoints = hasFilter ? filteredPoints : null;

      const value = filteredPoints.length ? getValue(filteredPoints) : null;

      if (value !== null && value !== undefined) {
        // filter bins if value is null or undefined
        aggregatedBins[index] = {
          i: Number.isFinite(i) ? i : binIndex,
          value,
          counts: filteredPoints.length
        };
        index++;
      }
    }
    return aggregatedBins;
  }

  _percentileToIndex(percentileRange) {
    const len = this.sortedBins.length;
    if (len < 2) {
      return [0, 0];
    }

    const [lower, upper] = percentileRange.map(n => clamp(n, 0, 100));

    const lowerIdx = Math.ceil((lower / 100) * (len - 1));
    const upperIdx = Math.floor((upper / 100) * (len - 1));

    return [lowerIdx, upperIdx];
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

  /**
   * Get range of values of all bins
   * @param {Number[]} range
   * @param {Number} range[0] - lower bound
   * @param {Number} range[1] - upper bound
   * @return {Array} array of new value range
   */
  getValueRange(percentileRange) {
    if (!this.sortedBins) {
      this.sortedBins = this.aggregatedBins.sort((a, b) => ascending(a.value, b.value));
    }
    if (!this.sortedBins.length) {
      return [];
    }
    let lowerIdx = 0;
    let upperIdx = this.sortedBins.length - 1;

    if (Array.isArray(percentileRange)) {
      const idxRange = this._percentileToIndex(percentileRange);
      lowerIdx = idxRange[0];
      upperIdx = idxRange[1];
    }

    return [this.sortedBins[lowerIdx].value, this.sortedBins[upperIdx].value];
  }

  getValueDomainByScale(scale, [lower = 0, upper = 100] = []) {
    if (!this.sortedBins) {
      this.sortedBins = this.aggregatedBins.sort((a, b) => ascending(a.value, b.value));
    }
    if (!this.sortedBins.length) {
      return [];
    }
    const indexEdge = this._percentileToIndex([lower, upper]);

    return this._getScaleDomain(scale, indexEdge);
  }

  _getScaleDomain(scaleType, [lowerIdx, upperIdx]) {
    const bins = this.sortedBins;

    switch (scaleType) {
      case 'quantize':
      case 'linear':
        return [bins[lowerIdx].value, bins[upperIdx].value];

      case 'quantile':
        return getQuantileDomain(bins.slice(lowerIdx, upperIdx + 1), d => d.value);

      case 'ordinal':
        return getOrdinalDomain(bins, d => d.value);

      default:
        return [bins[lowerIdx].value, bins[upperIdx].value];
    }
  }
}
