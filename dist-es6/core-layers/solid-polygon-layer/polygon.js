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

// Basic polygon support
//
// Handles simple and complex polygons
// Simple polygons are arrays of vertices, implicitly "closed"
// Complex polygons are arrays of simple polygons, with the first polygon
// representing the outer hull and other polygons representing holes

/**
 * Check if this is a non-nested polygon (i.e. the first element of the first element is a number)
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
export function isSimple(polygon) {
  return polygon.length >= 1 && polygon[0].length >= 2 && Number.isFinite(polygon[0][0]);
}

/**
 * Normalize to ensure that all polygons in a list are complex - simplifies processing
 * @param {Array} polygon - either a complex or a simple polygon
 * @param {Object} opts
 * @param {Object} opts.dimensions - if 3, the coords will be padded with 0's if needed
 * @return {Array} - returns a complex polygons
 */
export function normalize(polygon) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$dimensions = _ref.dimensions,
      dimensions = _ref$dimensions === undefined ? 3 : _ref$dimensions;

  return isSimple(polygon) ? [polygon] : polygon;
}

/**
 * Check if this is a non-nested polygon (i.e. the first element of the first element is a number)
 * @param {Array} polygon - either a complex or simple polygon
 * @return {Boolean} - true if the polygon is a simple polygon (i.e. not an array of polygons)
 */
export function getVertexCount(polygon) {
  return isSimple(polygon) ? polygon.length : polygon.reduce(function (length, simplePolygon) {
    return length + simplePolygon.length;
  }, 0);
}

// Return number of triangles needed to tesselate the polygon
export function getTriangleCount(polygon) {
  var triangleCount = 0;
  var first = true;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = normalize(polygon)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var simplePolygon = _step.value;

      var size = simplePolygon.length;
      if (first) {
        triangleCount += size >= 3 ? size - 2 : 0;
      } else {
        triangleCount += size + 1;
      }
      first = false;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return triangleCount;
}

export function forEachVertex(polygon, visitor) {
  if (isSimple(polygon)) {
    polygon.forEach(visitor);
    return;
  }

  var vertexIndex = 0;
  polygon.forEach(function (simplePolygon) {
    simplePolygon.forEach(function (v, i, p) {
      return visitor(v, vertexIndex, polygon);
    });
    vertexIndex++;
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9zb2xpZC1wb2x5Z29uLWxheWVyL3BvbHlnb24uanMiXSwibmFtZXMiOlsiaXNTaW1wbGUiLCJwb2x5Z29uIiwibGVuZ3RoIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJub3JtYWxpemUiLCJkaW1lbnNpb25zIiwiZ2V0VmVydGV4Q291bnQiLCJyZWR1Y2UiLCJzaW1wbGVQb2x5Z29uIiwiZ2V0VHJpYW5nbGVDb3VudCIsInRyaWFuZ2xlQ291bnQiLCJmaXJzdCIsInNpemUiLCJmb3JFYWNoVmVydGV4IiwidmlzaXRvciIsImZvckVhY2giLCJ2ZXJ0ZXhJbmRleCIsInYiLCJpIiwicCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7OztBQUtBLE9BQU8sU0FBU0EsUUFBVCxDQUFrQkMsT0FBbEIsRUFBMkI7QUFDaEMsU0FBT0EsUUFBUUMsTUFBUixJQUFrQixDQUFsQixJQUNMRCxRQUFRLENBQVIsRUFBV0MsTUFBWCxJQUFxQixDQURoQixJQUVMQyxPQUFPQyxRQUFQLENBQWdCSCxRQUFRLENBQVIsRUFBVyxDQUFYLENBQWhCLENBRkY7QUFHRDs7QUFFRDs7Ozs7OztBQU9BLE9BQU8sU0FBU0ksU0FBVCxDQUFtQkosT0FBbkIsRUFBbUQ7QUFBQSxpRkFBSixFQUFJO0FBQUEsNkJBQXRCSyxVQUFzQjtBQUFBLE1BQXRCQSxVQUFzQixtQ0FBVCxDQUFTOztBQUN4RCxTQUFPTixTQUFTQyxPQUFULElBQW9CLENBQUNBLE9BQUQsQ0FBcEIsR0FBZ0NBLE9BQXZDO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0EsT0FBTyxTQUFTTSxjQUFULENBQXdCTixPQUF4QixFQUFpQztBQUN0QyxTQUFPRCxTQUFTQyxPQUFULElBQ0xBLFFBQVFDLE1BREgsR0FFTEQsUUFBUU8sTUFBUixDQUFlLFVBQUNOLE1BQUQsRUFBU08sYUFBVDtBQUFBLFdBQTJCUCxTQUFTTyxjQUFjUCxNQUFsRDtBQUFBLEdBQWYsRUFBeUUsQ0FBekUsQ0FGRjtBQUdEOztBQUVEO0FBQ0EsT0FBTyxTQUFTUSxnQkFBVCxDQUEwQlQsT0FBMUIsRUFBbUM7QUFDeEMsTUFBSVUsZ0JBQWdCLENBQXBCO0FBQ0EsTUFBSUMsUUFBUSxJQUFaO0FBRndDO0FBQUE7QUFBQTs7QUFBQTtBQUd4Qyx5QkFBNEJQLFVBQVVKLE9BQVYsQ0FBNUIsOEhBQWdEO0FBQUEsVUFBckNRLGFBQXFDOztBQUM5QyxVQUFNSSxPQUFPSixjQUFjUCxNQUEzQjtBQUNBLFVBQUlVLEtBQUosRUFBVztBQUNURCx5QkFBaUJFLFFBQVEsQ0FBUixHQUFZQSxPQUFPLENBQW5CLEdBQXVCLENBQXhDO0FBQ0QsT0FGRCxNQUVPO0FBQ0xGLHlCQUFpQkUsT0FBTyxDQUF4QjtBQUNEO0FBQ0RELGNBQVEsS0FBUjtBQUNEO0FBWHVDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBWXhDLFNBQU9ELGFBQVA7QUFDRDs7QUFFRCxPQUFPLFNBQVNHLGFBQVQsQ0FBdUJiLE9BQXZCLEVBQWdDYyxPQUFoQyxFQUF5QztBQUM5QyxNQUFJZixTQUFTQyxPQUFULENBQUosRUFBdUI7QUFDckJBLFlBQVFlLE9BQVIsQ0FBZ0JELE9BQWhCO0FBQ0E7QUFDRDs7QUFFRCxNQUFJRSxjQUFjLENBQWxCO0FBQ0FoQixVQUFRZSxPQUFSLENBQWdCLHlCQUFpQjtBQUMvQlAsa0JBQWNPLE9BQWQsQ0FBc0IsVUFBQ0UsQ0FBRCxFQUFJQyxDQUFKLEVBQU9DLENBQVA7QUFBQSxhQUFhTCxRQUFRRyxDQUFSLEVBQVdELFdBQVgsRUFBd0JoQixPQUF4QixDQUFiO0FBQUEsS0FBdEI7QUFDQWdCO0FBQ0QsR0FIRDtBQUlEIiwiZmlsZSI6InBvbHlnb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gQmFzaWMgcG9seWdvbiBzdXBwb3J0XG4vL1xuLy8gSGFuZGxlcyBzaW1wbGUgYW5kIGNvbXBsZXggcG9seWdvbnNcbi8vIFNpbXBsZSBwb2x5Z29ucyBhcmUgYXJyYXlzIG9mIHZlcnRpY2VzLCBpbXBsaWNpdGx5IFwiY2xvc2VkXCJcbi8vIENvbXBsZXggcG9seWdvbnMgYXJlIGFycmF5cyBvZiBzaW1wbGUgcG9seWdvbnMsIHdpdGggdGhlIGZpcnN0IHBvbHlnb25cbi8vIHJlcHJlc2VudGluZyB0aGUgb3V0ZXIgaHVsbCBhbmQgb3RoZXIgcG9seWdvbnMgcmVwcmVzZW50aW5nIGhvbGVzXG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBpcyBhIG5vbi1uZXN0ZWQgcG9seWdvbiAoaS5lLiB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgZmlyc3QgZWxlbWVudCBpcyBhIG51bWJlcilcbiAqIEBwYXJhbSB7QXJyYXl9IHBvbHlnb24gLSBlaXRoZXIgYSBjb21wbGV4IG9yIHNpbXBsZSBwb2x5Z29uXG4gKiBAcmV0dXJuIHtCb29sZWFufSAtIHRydWUgaWYgdGhlIHBvbHlnb24gaXMgYSBzaW1wbGUgcG9seWdvbiAoaS5lLiBub3QgYW4gYXJyYXkgb2YgcG9seWdvbnMpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NpbXBsZShwb2x5Z29uKSB7XG4gIHJldHVybiBwb2x5Z29uLmxlbmd0aCA+PSAxICYmXG4gICAgcG9seWdvblswXS5sZW5ndGggPj0gMiAmJlxuICAgIE51bWJlci5pc0Zpbml0ZShwb2x5Z29uWzBdWzBdKTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgdG8gZW5zdXJlIHRoYXQgYWxsIHBvbHlnb25zIGluIGEgbGlzdCBhcmUgY29tcGxleCAtIHNpbXBsaWZpZXMgcHJvY2Vzc2luZ1xuICogQHBhcmFtIHtBcnJheX0gcG9seWdvbiAtIGVpdGhlciBhIGNvbXBsZXggb3IgYSBzaW1wbGUgcG9seWdvblxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzLmRpbWVuc2lvbnMgLSBpZiAzLCB0aGUgY29vcmRzIHdpbGwgYmUgcGFkZGVkIHdpdGggMCdzIGlmIG5lZWRlZFxuICogQHJldHVybiB7QXJyYXl9IC0gcmV0dXJucyBhIGNvbXBsZXggcG9seWdvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShwb2x5Z29uLCB7ZGltZW5zaW9ucyA9IDN9ID0ge30pIHtcbiAgcmV0dXJuIGlzU2ltcGxlKHBvbHlnb24pID8gW3BvbHlnb25dIDogcG9seWdvbjtcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGlzIGEgbm9uLW5lc3RlZCBwb2x5Z29uIChpLmUuIHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBmaXJzdCBlbGVtZW50IGlzIGEgbnVtYmVyKVxuICogQHBhcmFtIHtBcnJheX0gcG9seWdvbiAtIGVpdGhlciBhIGNvbXBsZXggb3Igc2ltcGxlIHBvbHlnb25cbiAqIEByZXR1cm4ge0Jvb2xlYW59IC0gdHJ1ZSBpZiB0aGUgcG9seWdvbiBpcyBhIHNpbXBsZSBwb2x5Z29uIChpLmUuIG5vdCBhbiBhcnJheSBvZiBwb2x5Z29ucylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZlcnRleENvdW50KHBvbHlnb24pIHtcbiAgcmV0dXJuIGlzU2ltcGxlKHBvbHlnb24pID9cbiAgICBwb2x5Z29uLmxlbmd0aCA6XG4gICAgcG9seWdvbi5yZWR1Y2UoKGxlbmd0aCwgc2ltcGxlUG9seWdvbikgPT4gbGVuZ3RoICsgc2ltcGxlUG9seWdvbi5sZW5ndGgsIDApO1xufVxuXG4vLyBSZXR1cm4gbnVtYmVyIG9mIHRyaWFuZ2xlcyBuZWVkZWQgdG8gdGVzc2VsYXRlIHRoZSBwb2x5Z29uXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJpYW5nbGVDb3VudChwb2x5Z29uKSB7XG4gIGxldCB0cmlhbmdsZUNvdW50ID0gMDtcbiAgbGV0IGZpcnN0ID0gdHJ1ZTtcbiAgZm9yIChjb25zdCBzaW1wbGVQb2x5Z29uIG9mIG5vcm1hbGl6ZShwb2x5Z29uKSkge1xuICAgIGNvbnN0IHNpemUgPSBzaW1wbGVQb2x5Z29uLmxlbmd0aDtcbiAgICBpZiAoZmlyc3QpIHtcbiAgICAgIHRyaWFuZ2xlQ291bnQgKz0gc2l6ZSA+PSAzID8gc2l6ZSAtIDIgOiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmlhbmdsZUNvdW50ICs9IHNpemUgKyAxO1xuICAgIH1cbiAgICBmaXJzdCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiB0cmlhbmdsZUNvdW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9yRWFjaFZlcnRleChwb2x5Z29uLCB2aXNpdG9yKSB7XG4gIGlmIChpc1NpbXBsZShwb2x5Z29uKSkge1xuICAgIHBvbHlnb24uZm9yRWFjaCh2aXNpdG9yKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgdmVydGV4SW5kZXggPSAwO1xuICBwb2x5Z29uLmZvckVhY2goc2ltcGxlUG9seWdvbiA9PiB7XG4gICAgc2ltcGxlUG9seWdvbi5mb3JFYWNoKCh2LCBpLCBwKSA9PiB2aXNpdG9yKHYsIHZlcnRleEluZGV4LCBwb2x5Z29uKSk7XG4gICAgdmVydGV4SW5kZXgrKztcbiAgfSk7XG59XG4iXX0=