var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

// Linear scale maps continuous domain to continuous range
export function linearScale(domain, range, value) {

  return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
}

// Quantize scale is similar to linear scales,
// except it uses a discrete rather than continuous range
export function quantizeScale(domain, range, value) {
  var step = (domain[1] - domain[0]) / range.length;
  var idx = Math.floor((value - domain[0]) / step);
  var clampIdx = Math.max(Math.min(idx, range.length - 1), 0);

  return range[clampIdx];
}

// return a quantize scale function
export function getQuantizeScale(domain, range) {
  return function (value) {
    var step = (domain[1] - domain[0]) / range.length;
    var idx = Math.floor((value - domain[0]) / step);
    var clampIdx = Math.max(Math.min(idx, range.length - 1), 0);

    return range[clampIdx];
  };
}

// return a linear scale funciton
export function getLinearScale(domain, range) {
  return function (value) {
    return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
  };
}

export function clamp(_ref, value) {
  var _ref2 = _slicedToArray(_ref, 2),
      min = _ref2[0],
      max = _ref2[1];

  return Math.min(max, Math.max(min, value));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3V0aWxzL3NjYWxlLXV0aWxzLmpzIl0sIm5hbWVzIjpbImxpbmVhclNjYWxlIiwiZG9tYWluIiwicmFuZ2UiLCJ2YWx1ZSIsInF1YW50aXplU2NhbGUiLCJzdGVwIiwibGVuZ3RoIiwiaWR4IiwiTWF0aCIsImZsb29yIiwiY2xhbXBJZHgiLCJtYXgiLCJtaW4iLCJnZXRRdWFudGl6ZVNjYWxlIiwiZ2V0TGluZWFyU2NhbGUiLCJjbGFtcCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU8sU0FBU0EsV0FBVCxDQUFxQkMsTUFBckIsRUFBNkJDLEtBQTdCLEVBQW9DQyxLQUFwQyxFQUEyQzs7QUFFaEQsU0FBTyxDQUFDQSxRQUFRRixPQUFPLENBQVAsQ0FBVCxLQUF1QkEsT0FBTyxDQUFQLElBQVlBLE9BQU8sQ0FBUCxDQUFuQyxLQUFpREMsTUFBTSxDQUFOLElBQVdBLE1BQU0sQ0FBTixDQUE1RCxJQUF3RUEsTUFBTSxDQUFOLENBQS9FO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLE9BQU8sU0FBU0UsYUFBVCxDQUF1QkgsTUFBdkIsRUFBK0JDLEtBQS9CLEVBQXNDQyxLQUF0QyxFQUE2QztBQUNsRCxNQUFNRSxPQUFPLENBQUNKLE9BQU8sQ0FBUCxJQUFZQSxPQUFPLENBQVAsQ0FBYixJQUEwQkMsTUFBTUksTUFBN0M7QUFDQSxNQUFNQyxNQUFNQyxLQUFLQyxLQUFMLENBQVcsQ0FBQ04sUUFBUUYsT0FBTyxDQUFQLENBQVQsSUFBc0JJLElBQWpDLENBQVo7QUFDQSxNQUFNSyxXQUFXRixLQUFLRyxHQUFMLENBQVNILEtBQUtJLEdBQUwsQ0FBU0wsR0FBVCxFQUFjTCxNQUFNSSxNQUFOLEdBQWUsQ0FBN0IsQ0FBVCxFQUEwQyxDQUExQyxDQUFqQjs7QUFFQSxTQUFPSixNQUFNUSxRQUFOLENBQVA7QUFDRDs7QUFFRDtBQUNBLE9BQU8sU0FBU0csZ0JBQVQsQ0FBMEJaLE1BQTFCLEVBQWtDQyxLQUFsQyxFQUF5QztBQUM5QyxTQUFPLGlCQUFTO0FBQ2QsUUFBTUcsT0FBTyxDQUFDSixPQUFPLENBQVAsSUFBWUEsT0FBTyxDQUFQLENBQWIsSUFBMEJDLE1BQU1JLE1BQTdDO0FBQ0EsUUFBTUMsTUFBTUMsS0FBS0MsS0FBTCxDQUFXLENBQUNOLFFBQVFGLE9BQU8sQ0FBUCxDQUFULElBQXNCSSxJQUFqQyxDQUFaO0FBQ0EsUUFBTUssV0FBV0YsS0FBS0csR0FBTCxDQUFTSCxLQUFLSSxHQUFMLENBQVNMLEdBQVQsRUFBY0wsTUFBTUksTUFBTixHQUFlLENBQTdCLENBQVQsRUFBMEMsQ0FBMUMsQ0FBakI7O0FBRUEsV0FBT0osTUFBTVEsUUFBTixDQUFQO0FBQ0QsR0FORDtBQU9EOztBQUVEO0FBQ0EsT0FBTyxTQUFTSSxjQUFULENBQXdCYixNQUF4QixFQUFnQ0MsS0FBaEMsRUFBdUM7QUFDNUMsU0FBTztBQUFBLFdBQVMsQ0FBQ0MsUUFBUUYsT0FBTyxDQUFQLENBQVQsS0FBdUJBLE9BQU8sQ0FBUCxJQUFZQSxPQUFPLENBQVAsQ0FBbkMsS0FBaURDLE1BQU0sQ0FBTixJQUFXQSxNQUFNLENBQU4sQ0FBNUQsSUFBd0VBLE1BQU0sQ0FBTixDQUFqRjtBQUFBLEdBQVA7QUFDRDs7QUFFRCxPQUFPLFNBQVNhLEtBQVQsT0FBMkJaLEtBQTNCLEVBQWtDO0FBQUE7QUFBQSxNQUFsQlMsR0FBa0I7QUFBQSxNQUFiRCxHQUFhOztBQUN2QyxTQUFPSCxLQUFLSSxHQUFMLENBQVNELEdBQVQsRUFBY0gsS0FBS0csR0FBTCxDQUFTQyxHQUFULEVBQWNULEtBQWQsQ0FBZCxDQUFQO0FBQ0QiLCJmaWxlIjoic2NhbGUtdXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gTGluZWFyIHNjYWxlIG1hcHMgY29udGludW91cyBkb21haW4gdG8gY29udGludW91cyByYW5nZVxuZXhwb3J0IGZ1bmN0aW9uIGxpbmVhclNjYWxlKGRvbWFpbiwgcmFuZ2UsIHZhbHVlKSB7XG5cbiAgcmV0dXJuICh2YWx1ZSAtIGRvbWFpblswXSkgLyAoZG9tYWluWzFdIC0gZG9tYWluWzBdKSAqIChyYW5nZVsxXSAtIHJhbmdlWzBdKSArIHJhbmdlWzBdO1xufVxuXG4vLyBRdWFudGl6ZSBzY2FsZSBpcyBzaW1pbGFyIHRvIGxpbmVhciBzY2FsZXMsXG4vLyBleGNlcHQgaXQgdXNlcyBhIGRpc2NyZXRlIHJhdGhlciB0aGFuIGNvbnRpbnVvdXMgcmFuZ2VcbmV4cG9ydCBmdW5jdGlvbiBxdWFudGl6ZVNjYWxlKGRvbWFpbiwgcmFuZ2UsIHZhbHVlKSB7XG4gIGNvbnN0IHN0ZXAgPSAoZG9tYWluWzFdIC0gZG9tYWluWzBdKSAvIHJhbmdlLmxlbmd0aDtcbiAgY29uc3QgaWR4ID0gTWF0aC5mbG9vcigodmFsdWUgLSBkb21haW5bMF0pIC8gc3RlcCk7XG4gIGNvbnN0IGNsYW1wSWR4ID0gTWF0aC5tYXgoTWF0aC5taW4oaWR4LCByYW5nZS5sZW5ndGggLSAxKSwgMCk7XG5cbiAgcmV0dXJuIHJhbmdlW2NsYW1wSWR4XTtcbn1cblxuLy8gcmV0dXJuIGEgcXVhbnRpemUgc2NhbGUgZnVuY3Rpb25cbmV4cG9ydCBmdW5jdGlvbiBnZXRRdWFudGl6ZVNjYWxlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgcmV0dXJuIHZhbHVlID0+IHtcbiAgICBjb25zdCBzdGVwID0gKGRvbWFpblsxXSAtIGRvbWFpblswXSkgLyByYW5nZS5sZW5ndGg7XG4gICAgY29uc3QgaWR4ID0gTWF0aC5mbG9vcigodmFsdWUgLSBkb21haW5bMF0pIC8gc3RlcCk7XG4gICAgY29uc3QgY2xhbXBJZHggPSBNYXRoLm1heChNYXRoLm1pbihpZHgsIHJhbmdlLmxlbmd0aCAtIDEpLCAwKTtcblxuICAgIHJldHVybiByYW5nZVtjbGFtcElkeF07XG4gIH07XG59XG5cbi8vIHJldHVybiBhIGxpbmVhciBzY2FsZSBmdW5jaXRvblxuZXhwb3J0IGZ1bmN0aW9uIGdldExpbmVhclNjYWxlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgcmV0dXJuIHZhbHVlID0+ICh2YWx1ZSAtIGRvbWFpblswXSkgLyAoZG9tYWluWzFdIC0gZG9tYWluWzBdKSAqIChyYW5nZVsxXSAtIHJhbmdlWzBdKSArIHJhbmdlWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xhbXAoW21pbiwgbWF4XSwgdmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCB2YWx1ZSkpO1xufVxuIl19