var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var defaultGetValue = function defaultGetValue(points) {
  return points.length;
};

var BinSorter = function () {
  function BinSorter() {
    var bins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var getValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultGetValue;

    _classCallCheck(this, BinSorter);

    this.sortedBins = this.getSortedBins(bins, getValue);
    this.maxCount = this.getMaxCount();
    this.binMap = this.getBinMap();
  }

  /**
   * Get an array of object with sorted values and index of bins
   * @param {Array} bins
   * @param {Function} getValue
   * @return {Array} array of values and index lookup
   */


  _createClass(BinSorter, [{
    key: "getSortedBins",
    value: function getSortedBins(bins, getValue) {
      return bins.reduce(function (accu, h, i) {
        var value = getValue(h.points);

        if (value !== null && value !== undefined) {
          // filter bins if value is null or undefined
          accu.push({
            i: Number.isFinite(h.index) ? h.index : i,
            value: value,
            counts: h.points.length
          });
        }

        return accu;
      }, []).sort(function (a, b) {
        return a.value - b.value;
      });
    }

    /**
     * Get range of values of all bins
     * @param {Number[]} range
     * @param {Number} range[0] - lower bound
     * @param {Number} range[1] - upper bound
     * @return {Array} array of new value range
     */

  }, {
    key: "getValueRange",
    value: function getValueRange(_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          lower = _ref2[0],
          upper = _ref2[1];

      var len = this.sortedBins.length;
      if (!len) {
        return [0, 0];
      }
      var lowerIdx = Math.ceil(lower / 100 * (len - 1));
      var upperIdx = Math.floor(upper / 100 * (len - 1));

      return [this.sortedBins[lowerIdx].value, this.sortedBins[upperIdx].value];
    }

    /**
     * Get ths max count of all bins
     * @return {Number | Boolean} max count
     */

  }, {
    key: "getMaxCount",
    value: function getMaxCount() {
      return Math.max.apply(Math, _toConsumableArray(this.sortedBins.map(function (b) {
        return b.counts;
      })));
    }

    /**
     * Get a mapping from cell/hexagon index to sorted bin
     * This is used to retrieve bin value for color calculation
     * @return {Object} bin index to sortedBins
     */

  }, {
    key: "getBinMap",
    value: function getBinMap() {
      return this.sortedBins.reduce(function (mapper, curr) {
        return Object.assign(mapper, _defineProperty({}, curr.i, curr));
      }, {});
    }
  }]);

  return BinSorter;
}();

export default BinSorter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3V0aWxzL2Jpbi1zb3J0ZXIuanMiXSwibmFtZXMiOlsiZGVmYXVsdEdldFZhbHVlIiwicG9pbnRzIiwibGVuZ3RoIiwiQmluU29ydGVyIiwiYmlucyIsImdldFZhbHVlIiwic29ydGVkQmlucyIsImdldFNvcnRlZEJpbnMiLCJtYXhDb3VudCIsImdldE1heENvdW50IiwiYmluTWFwIiwiZ2V0QmluTWFwIiwicmVkdWNlIiwiYWNjdSIsImgiLCJpIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJwdXNoIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJpbmRleCIsImNvdW50cyIsInNvcnQiLCJhIiwiYiIsImxvd2VyIiwidXBwZXIiLCJsZW4iLCJsb3dlcklkeCIsIk1hdGgiLCJjZWlsIiwidXBwZXJJZHgiLCJmbG9vciIsIm1heCIsIm1hcCIsIm1hcHBlciIsImN1cnIiLCJPYmplY3QiLCJhc3NpZ24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQU1BLGtCQUFrQixTQUFsQkEsZUFBa0I7QUFBQSxTQUFVQyxPQUFPQyxNQUFqQjtBQUFBLENBQXhCOztJQUVxQkMsUztBQUNuQix1QkFBbUQ7QUFBQSxRQUF2Q0MsSUFBdUMsdUVBQWhDLEVBQWdDO0FBQUEsUUFBNUJDLFFBQTRCLHVFQUFqQkwsZUFBaUI7O0FBQUE7O0FBQ2pELFNBQUtNLFVBQUwsR0FBa0IsS0FBS0MsYUFBTCxDQUFtQkgsSUFBbkIsRUFBeUJDLFFBQXpCLENBQWxCO0FBQ0EsU0FBS0csUUFBTCxHQUFnQixLQUFLQyxXQUFMLEVBQWhCO0FBQ0EsU0FBS0MsTUFBTCxHQUFjLEtBQUtDLFNBQUwsRUFBZDtBQUNEOztBQUVEOzs7Ozs7Ozs7O2tDQU1jUCxJLEVBQU1DLFEsRUFBVTtBQUM1QixhQUFPRCxLQUNKUSxNQURJLENBQ0csVUFBQ0MsSUFBRCxFQUFPQyxDQUFQLEVBQVVDLENBQVYsRUFBZ0I7QUFDdEIsWUFBTUMsUUFBUVgsU0FBU1MsRUFBRWIsTUFBWCxDQUFkOztBQUVBLFlBQUllLFVBQVUsSUFBVixJQUFrQkEsVUFBVUMsU0FBaEMsRUFBMkM7QUFDekM7QUFDQUosZUFBS0ssSUFBTCxDQUFVO0FBQ1JILGVBQUdJLE9BQU9DLFFBQVAsQ0FBZ0JOLEVBQUVPLEtBQWxCLElBQTJCUCxFQUFFTyxLQUE3QixHQUFxQ04sQ0FEaEM7QUFFUkMsd0JBRlE7QUFHUk0sb0JBQVFSLEVBQUViLE1BQUYsQ0FBU0M7QUFIVCxXQUFWO0FBS0Q7O0FBRUQsZUFBT1csSUFBUDtBQUNELE9BZEksRUFjRixFQWRFLEVBZUpVLElBZkksQ0FlQyxVQUFDQyxDQUFELEVBQUlDLENBQUo7QUFBQSxlQUFVRCxFQUFFUixLQUFGLEdBQVVTLEVBQUVULEtBQXRCO0FBQUEsT0FmRCxDQUFQO0FBZ0JEOztBQUVEOzs7Ozs7Ozs7O3dDQU84QjtBQUFBO0FBQUEsVUFBZlUsS0FBZTtBQUFBLFVBQVJDLEtBQVE7O0FBQzVCLFVBQU1DLE1BQU0sS0FBS3RCLFVBQUwsQ0FBZ0JKLE1BQTVCO0FBQ0EsVUFBSSxDQUFDMEIsR0FBTCxFQUFVO0FBQ1IsZUFBTyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVA7QUFDRDtBQUNELFVBQU1DLFdBQVdDLEtBQUtDLElBQUwsQ0FBVUwsUUFBUSxHQUFSLElBQWVFLE1BQU0sQ0FBckIsQ0FBVixDQUFqQjtBQUNBLFVBQU1JLFdBQVdGLEtBQUtHLEtBQUwsQ0FBV04sUUFBUSxHQUFSLElBQWVDLE1BQU0sQ0FBckIsQ0FBWCxDQUFqQjs7QUFFQSxhQUFPLENBQUMsS0FBS3RCLFVBQUwsQ0FBZ0J1QixRQUFoQixFQUEwQmIsS0FBM0IsRUFBa0MsS0FBS1YsVUFBTCxDQUFnQjBCLFFBQWhCLEVBQTBCaEIsS0FBNUQsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7O2tDQUljO0FBQ1osYUFBT2MsS0FBS0ksR0FBTCxnQ0FBWSxLQUFLNUIsVUFBTCxDQUFnQjZCLEdBQWhCLENBQW9CO0FBQUEsZUFBS1YsRUFBRUgsTUFBUDtBQUFBLE9BQXBCLENBQVosRUFBUDtBQUNEOztBQUVEOzs7Ozs7OztnQ0FLWTtBQUNWLGFBQU8sS0FBS2hCLFVBQUwsQ0FBZ0JNLE1BQWhCLENBQXVCLFVBQUN3QixNQUFELEVBQVNDLElBQVQ7QUFBQSxlQUFrQkMsT0FBT0MsTUFBUCxDQUFjSCxNQUFkLHNCQUM3Q0MsS0FBS3RCLENBRHdDLEVBQ3BDc0IsSUFEb0MsRUFBbEI7QUFBQSxPQUF2QixFQUVILEVBRkcsQ0FBUDtBQUdEOzs7Ozs7ZUFuRWtCbEMsUyIsImZpbGUiOiJiaW4tc29ydGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIGdldFZhbHVlIHRha2VzIGFuIGFycmF5IG9mIHBvaW50cyByZXR1cm5zIGEgdmFsdWUgdG8gc29ydCB0aGUgYmlucyBvbi5cbi8vIGJ5IGRlZmF1bHQgaXQgcmV0dXJucyB0aGUgbnVtYmVyIG9mIHBvaW50c1xuLy8gdGhpcyBpcyB3aGVyZSB0byBwYXNzIGluIGEgZnVuY3Rpb24gdG8gY29sb3IgdGhlIGJpbnMgYnlcbi8vIGF2Zy9tZWFuL21heCBvZiBzcGVjaWZpYyB2YWx1ZSBvZiB0aGUgcG9pbnRcbmNvbnN0IGRlZmF1bHRHZXRWYWx1ZSA9IHBvaW50cyA9PiBwb2ludHMubGVuZ3RoO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCaW5Tb3J0ZXIge1xuICBjb25zdHJ1Y3RvcihiaW5zID0gW10sIGdldFZhbHVlID0gZGVmYXVsdEdldFZhbHVlKSB7XG4gICAgdGhpcy5zb3J0ZWRCaW5zID0gdGhpcy5nZXRTb3J0ZWRCaW5zKGJpbnMsIGdldFZhbHVlKTtcbiAgICB0aGlzLm1heENvdW50ID0gdGhpcy5nZXRNYXhDb3VudCgpO1xuICAgIHRoaXMuYmluTWFwID0gdGhpcy5nZXRCaW5NYXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYW4gYXJyYXkgb2Ygb2JqZWN0IHdpdGggc29ydGVkIHZhbHVlcyBhbmQgaW5kZXggb2YgYmluc1xuICAgKiBAcGFyYW0ge0FycmF5fSBiaW5zXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFZhbHVlXG4gICAqIEByZXR1cm4ge0FycmF5fSBhcnJheSBvZiB2YWx1ZXMgYW5kIGluZGV4IGxvb2t1cFxuICAgKi9cbiAgZ2V0U29ydGVkQmlucyhiaW5zLCBnZXRWYWx1ZSkge1xuICAgIHJldHVybiBiaW5zXG4gICAgICAucmVkdWNlKChhY2N1LCBoLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZ2V0VmFsdWUoaC5wb2ludHMpO1xuXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gZmlsdGVyIGJpbnMgaWYgdmFsdWUgaXMgbnVsbCBvciB1bmRlZmluZWRcbiAgICAgICAgICBhY2N1LnB1c2goe1xuICAgICAgICAgICAgaTogTnVtYmVyLmlzRmluaXRlKGguaW5kZXgpID8gaC5pbmRleCA6IGksXG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGNvdW50czogaC5wb2ludHMubGVuZ3RoXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWNjdTtcbiAgICAgIH0sIFtdKVxuICAgICAgLnNvcnQoKGEsIGIpID0+IGEudmFsdWUgLSBiLnZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcmFuZ2Ugb2YgdmFsdWVzIG9mIGFsbCBiaW5zXG4gICAqIEBwYXJhbSB7TnVtYmVyW119IHJhbmdlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSByYW5nZVswXSAtIGxvd2VyIGJvdW5kXG4gICAqIEBwYXJhbSB7TnVtYmVyfSByYW5nZVsxXSAtIHVwcGVyIGJvdW5kXG4gICAqIEByZXR1cm4ge0FycmF5fSBhcnJheSBvZiBuZXcgdmFsdWUgcmFuZ2VcbiAgICovXG4gIGdldFZhbHVlUmFuZ2UoW2xvd2VyLCB1cHBlcl0pIHtcbiAgICBjb25zdCBsZW4gPSB0aGlzLnNvcnRlZEJpbnMubGVuZ3RoO1xuICAgIGlmICghbGVuKSB7XG4gICAgICByZXR1cm4gWzAsIDBdO1xuICAgIH1cbiAgICBjb25zdCBsb3dlcklkeCA9IE1hdGguY2VpbChsb3dlciAvIDEwMCAqIChsZW4gLSAxKSk7XG4gICAgY29uc3QgdXBwZXJJZHggPSBNYXRoLmZsb29yKHVwcGVyIC8gMTAwICogKGxlbiAtIDEpKTtcblxuICAgIHJldHVybiBbdGhpcy5zb3J0ZWRCaW5zW2xvd2VySWR4XS52YWx1ZSwgdGhpcy5zb3J0ZWRCaW5zW3VwcGVySWR4XS52YWx1ZV07XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRocyBtYXggY291bnQgb2YgYWxsIGJpbnNcbiAgICogQHJldHVybiB7TnVtYmVyIHwgQm9vbGVhbn0gbWF4IGNvdW50XG4gICAqL1xuICBnZXRNYXhDb3VudCgpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoLi4udGhpcy5zb3J0ZWRCaW5zLm1hcChiID0+IGIuY291bnRzKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbWFwcGluZyBmcm9tIGNlbGwvaGV4YWdvbiBpbmRleCB0byBzb3J0ZWQgYmluXG4gICAqIFRoaXMgaXMgdXNlZCB0byByZXRyaWV2ZSBiaW4gdmFsdWUgZm9yIGNvbG9yIGNhbGN1bGF0aW9uXG4gICAqIEByZXR1cm4ge09iamVjdH0gYmluIGluZGV4IHRvIHNvcnRlZEJpbnNcbiAgICovXG4gIGdldEJpbk1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5zb3J0ZWRCaW5zLnJlZHVjZSgobWFwcGVyLCBjdXJyKSA9PiBPYmplY3QuYXNzaWduKG1hcHBlciwge1xuICAgICAgW2N1cnIuaV06IGN1cnJcbiAgICB9KSwge30pO1xuICB9XG59XG4iXX0=