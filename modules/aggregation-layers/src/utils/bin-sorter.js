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

// access array of points in each bin
const defaultGetPoints = bin => bin.points;
// access index of each bin
const defaultGetIndex = bin => bin.index;

const defaultProps = {
  getValue: defaultGetValue,
  getPoints: defaultGetPoints,
  getIndex: defaultGetIndex,
  filterData: null
};

export default class BinSorter {
  constructor(bins = [], props = defaultProps) {
    this.sortedBins = this._getSortedBins(bins, props);
    this.binMap = this._getBinMap();
  }

  /**
   * Get an array of object with sorted values and index of bins
   * @param {Array} bins
   * @param {Function} getValue
   * @return {Array} array of values and index lookup
   */
  _getSortedBins(bins, props) {
    const {
      getValue = defaultGetValue,
      getPoints = defaultGetPoints,
      getIndex = defaultGetIndex,
      filterData
    } = props;

    const hasFilter = typeof filterData === 'function';

    return bins
      .reduce((accu, h, i) => {
        const points = getPoints(h);
        const index = getIndex(h);

        const filteredPoints = hasFilter ? points.filter(filterData) : points;

        h.filteredPoints = hasFilter ? filteredPoints : null;

        const value = filteredPoints.length ? getValue(filteredPoints) : null;

        if (value !== null && value !== undefined) {
          // filter bins if value is null or undefined
          accu.push({
            i: Number.isFinite(index) ? index : i,
            value,
            counts: filteredPoints.length
          });
        }

        return accu;
      }, [])
      .sort((a, b) => a.value - b.value);
  }

  percentileToIndex([lowerPercentile, upperPercentile]) {
    const len = this.sortedBins.length;
    if (!len) {
      return [0, 0];
    }
    const lowerIdx = Math.ceil((lowerPercentile / 100) * (len - 1));
    const upperIdx = Math.floor((upperPercentile / 100) * (len - 1));

    return [lowerIdx, upperIdx];
  }
  /**
   * Get a mapping from cell/hexagon index to sorted bin
   * This is used to retrieve bin value for color calculation
   * @return {Object} bin index to sortedBins
   */
  _getBinMap() {
    return this.sortedBins.reduce(
      (mapper, curr) =>
        Object.assign(mapper, {
          [curr.i]: curr
        }),
      {}
    );
  }

  /**
   * Get range of values of all bins
   * @param {Number[]} range
   * @param {Number} range[0] - lower bound
   * @param {Number} range[1] - upper bound
   * @return {Array} array of new value range
   */
  getValueRange([lower, upper]) {
    const [lowerIdx, upperIdx] = this.percentileToIndex([lower, upper]);
    return [this.sortedBins[lowerIdx].value, this.sortedBins[upperIdx].value];
  }

  getValueDomainByScale(scale, [lower, upper]) {
    const indexEdge = this.percentileToIndex([lower, upper]);
    return this.getScaleDomain(scale, indexEdge);
  }

  getScaleDomain(scaleType, [lowerIdx, upperIdx]) {
    const bins = this.sortedBins;

    switch (scaleType) {
      case 'quantize':
      case 'linear':
        return [bins[lowerIdx].value, bins[upperIdx].value];

      case 'quantile':
        return bins.slice(lowerIdx, upperIdx + 1).map(d => d.value);

      case 'ordinal':
        return bins.map(b => b.value).sort();

      default:
        return [bins[lowerIdx].value, bins[upperIdx].value];
    }
  }
}
