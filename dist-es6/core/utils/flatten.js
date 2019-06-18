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

/**
 * Flattens a nested array into a single level array,
 * or a single value into an array with one value
 * @example flatten([[1, [2]], [3], 4]) => [1, 2, 3, 4]
 * @example flatten(1) => [1]
 * @param {Array} array The array to flatten.
 * @param {Function} filter= - Optional predicate called on each `value` to
 *   determine if it should be included (pushed onto) the resulting array.
 * @param {Function} map= - Optional transform applied to each array elements.
 * @param {Array} result=[] - Optional array to push value into
 * @return {Array} Returns the new flattened array (new array or `result` if provided)
 */
export function flatten(array) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$filter = _ref.filter,
      filter = _ref$filter === undefined ? function () {
    return true;
  } : _ref$filter,
      _ref$map = _ref.map,
      map = _ref$map === undefined ? function (x) {
    return x;
  } : _ref$map,
      _ref$result = _ref.result,
      result = _ref$result === undefined ? [] : _ref$result;

  // Wrap single object in array
  if (!Array.isArray(array)) {
    return filter(array) ? [map(array)] : [];
  }
  // Deep flatten and filter the array
  return flattenArray(array, filter, map, result);
}

// Deep flattens an array. Helper to `flatten`, see its parameters
function flattenArray(array, filter, map, result) {
  var index = -1;
  while (++index < array.length) {
    var value = array[index];
    if (Array.isArray(value)) {
      flattenArray(value, filter, map, result);
    } else if (filter(value)) {
      result.push(map(value));
    }
  }
  return result;
}

export function countVertices(nestedArray) {
  var count = 0;
  var index = -1;
  while (++index < nestedArray.length) {
    var value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      count += countVertices(value);
    } else {
      count++;
    }
  }
  return count;
}

// Flattens nested array of vertices, padding third coordinate as needed
export function flattenVertices(nestedArray) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$result = _ref2.result,
      result = _ref2$result === undefined ? [] : _ref2$result,
      _ref2$dimensions = _ref2.dimensions,
      dimensions = _ref2$dimensions === undefined ? 3 : _ref2$dimensions;

  var index = -1;
  var vertexLength = 0;
  while (++index < nestedArray.length) {
    var value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      flattenVertices(value, { result: result, dimensions: dimensions });
    } else {
      if (vertexLength < dimensions) {
        // eslint-disable-line
        result.push(value);
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result.push(0);
  }
  return result;
}

// Uses copyWithin to significantly speed up typed array value filling
export function fillArray(_ref3) {
  var target = _ref3.target,
      source = _ref3.source,
      _ref3$start = _ref3.start,
      start = _ref3$start === undefined ? 0 : _ref3$start,
      _ref3$count = _ref3.count,
      count = _ref3$count === undefined ? 1 : _ref3$count;

  var length = source.length;
  var total = count * length;
  var copied = 0;
  for (var i = start; copied < length; copied++) {
    target[i++] = source[copied];
  }

  while (copied < total) {
    // If we have copied less than half, copy everything we got
    // else copy remaining in one operation
    if (copied < total - copied) {
      target.copyWithin(start + copied, start, start + copied);
      copied *= 2;
    } else {
      target.copyWithin(start + copied, start, start + total - copied);
      copied = total;
    }
  }

  return target;
}

// Flattens nested array of vertices, padding third coordinate as needed
/*
export function flattenTypedVertices(nestedArray, {
  result = [],
  Type = Float32Array,
  start = 0,
  dimensions = 3
} = {}) {
  let index = -1;
  let vertexLength = 0;
  while (++index < nestedArray.length) {
    const value = nestedArray[index];
    if (Array.isArray(value) || ArrayBuffer.isView(value)) {
      start = flattenTypedVertices(value, {result, start, dimensions});
    } else {
      if (vertexLength < dimensions) { // eslint-disable-line
        result[start++] = value;
        vertexLength++;
      }
    }
  }
  // Add a third coordinate if needed
  if (vertexLength > 0 && vertexLength < dimensions) {
    result[start++] = 0;
  }
  return start;
}
*/
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3V0aWxzL2ZsYXR0ZW4uanMiXSwibmFtZXMiOlsiZmxhdHRlbiIsImFycmF5IiwiZmlsdGVyIiwibWFwIiwieCIsInJlc3VsdCIsIkFycmF5IiwiaXNBcnJheSIsImZsYXR0ZW5BcnJheSIsImluZGV4IiwibGVuZ3RoIiwidmFsdWUiLCJwdXNoIiwiY291bnRWZXJ0aWNlcyIsIm5lc3RlZEFycmF5IiwiY291bnQiLCJBcnJheUJ1ZmZlciIsImlzVmlldyIsImZsYXR0ZW5WZXJ0aWNlcyIsImRpbWVuc2lvbnMiLCJ2ZXJ0ZXhMZW5ndGgiLCJmaWxsQXJyYXkiLCJ0YXJnZXQiLCJzb3VyY2UiLCJzdGFydCIsInRvdGFsIiwiY29waWVkIiwiaSIsImNvcHlXaXRoaW4iXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUFZQSxPQUFPLFNBQVNBLE9BQVQsQ0FBaUJDLEtBQWpCLEVBSUM7QUFBQSxpRkFBSixFQUFJO0FBQUEseUJBSE5DLE1BR007QUFBQSxNQUhOQSxNQUdNLCtCQUhHO0FBQUEsV0FBTSxJQUFOO0FBQUEsR0FHSDtBQUFBLHNCQUZOQyxHQUVNO0FBQUEsTUFGTkEsR0FFTSw0QkFGQTtBQUFBLFdBQUtDLENBQUw7QUFBQSxHQUVBO0FBQUEseUJBRE5DLE1BQ007QUFBQSxNQUROQSxNQUNNLCtCQURHLEVBQ0g7O0FBQ047QUFDQSxNQUFJLENBQUNDLE1BQU1DLE9BQU4sQ0FBY04sS0FBZCxDQUFMLEVBQTJCO0FBQ3pCLFdBQU9DLE9BQU9ELEtBQVAsSUFBZ0IsQ0FBQ0UsSUFBSUYsS0FBSixDQUFELENBQWhCLEdBQStCLEVBQXRDO0FBQ0Q7QUFDRDtBQUNBLFNBQU9PLGFBQWFQLEtBQWIsRUFBb0JDLE1BQXBCLEVBQTRCQyxHQUE1QixFQUFp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QUFJQyxTQUFTRCxRQUFRQyxNQUFyQixFQUE2QjtBQUMzQkosYUFBT00sVUFBUCxDQUFrQkosUUFBUUUsTUFBMUIsRUFBa0NGLEtBQWxDLEVBQXlDQSxRQUFRRSxNQUFqRDtBQUNBQSxnQkFBVSxDQUFWO0FBQ0QsS0FIRCxNQUdPO0FBQ0xKLGFBQU9NLFVBQVAsQ0FBa0JKLFFBQVFFLE1BQTFCLEVBQWtDRixLQUFsQyxFQUF5Q0EsUUFBUUMsS0FBUixHQUFnQkMsTUFBekQ7QUFDQUEsZUFBU0QsS0FBVDtBQUNEO0FBQ0Y7O0FBRUQsU0FBT0gsTUFBUDtBQUNEOztBQUVEO0FBQ0EiLCJmaWxlIjoiZmxhdHRlbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKipcbiAqIEZsYXR0ZW5zIGEgbmVzdGVkIGFycmF5IGludG8gYSBzaW5nbGUgbGV2ZWwgYXJyYXksXG4gKiBvciBhIHNpbmdsZSB2YWx1ZSBpbnRvIGFuIGFycmF5IHdpdGggb25lIHZhbHVlXG4gKiBAZXhhbXBsZSBmbGF0dGVuKFtbMSwgWzJdXSwgWzNdLCA0XSkgPT4gWzEsIDIsIDMsIDRdXG4gKiBAZXhhbXBsZSBmbGF0dGVuKDEpID0+IFsxXVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGZsYXR0ZW4uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmaWx0ZXI9IC0gT3B0aW9uYWwgcHJlZGljYXRlIGNhbGxlZCBvbiBlYWNoIGB2YWx1ZWAgdG9cbiAqICAgZGV0ZXJtaW5lIGlmIGl0IHNob3VsZCBiZSBpbmNsdWRlZCAocHVzaGVkIG9udG8pIHRoZSByZXN1bHRpbmcgYXJyYXkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBtYXA9IC0gT3B0aW9uYWwgdHJhbnNmb3JtIGFwcGxpZWQgdG8gZWFjaCBhcnJheSBlbGVtZW50cy5cbiAqIEBwYXJhbSB7QXJyYXl9IHJlc3VsdD1bXSAtIE9wdGlvbmFsIGFycmF5IHRvIHB1c2ggdmFsdWUgaW50b1xuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmbGF0dGVuZWQgYXJyYXkgKG5ldyBhcnJheSBvciBgcmVzdWx0YCBpZiBwcm92aWRlZClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXksIHtcbiAgZmlsdGVyID0gKCkgPT4gdHJ1ZSxcbiAgbWFwID0geCA9PiB4LFxuICByZXN1bHQgPSBbXVxufSA9IHt9KSB7XG4gIC8vIFdyYXAgc2luZ2xlIG9iamVjdCBpbiBhcnJheVxuICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyYXkpKSB7XG4gICAgcmV0dXJuIGZpbHRlcihhcnJheSkgPyBbbWFwKGFycmF5KV0gOiBbXTtcbiAgfVxuICAvLyBEZWVwIGZsYXR0ZW4gYW5kIGZpbHRlciB0aGUgYXJyYXlcbiAgcmV0dXJuIGZsYXR0ZW5BcnJheShhcnJheSwgZmlsdGVyLCBtYXAsIHJlc3VsdCk7XG59XG5cbi8vIERlZXAgZmxhdHRlbnMgYW4gYXJyYXkuIEhlbHBlciB0byBgZmxhdHRlbmAsIHNlZSBpdHMgcGFyYW1ldGVyc1xuZnVuY3Rpb24gZmxhdHRlbkFycmF5KGFycmF5LCBmaWx0ZXIsIG1hcCwgcmVzdWx0KSB7XG4gIGxldCBpbmRleCA9IC0xO1xuICB3aGlsZSAoKytpbmRleCA8IGFycmF5Lmxlbmd0aCkge1xuICAgIGNvbnN0IHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgZmxhdHRlbkFycmF5KHZhbHVlLCBmaWx0ZXIsIG1hcCwgcmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGZpbHRlcih2YWx1ZSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKG1hcCh2YWx1ZSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY291bnRWZXJ0aWNlcyhuZXN0ZWRBcnJheSkge1xuICBsZXQgY291bnQgPSAwO1xuICBsZXQgaW5kZXggPSAtMTtcbiAgd2hpbGUgKCsraW5kZXggPCBuZXN0ZWRBcnJheS5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5lc3RlZEFycmF5W2luZGV4XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgICAgY291bnQgKz0gY291bnRWZXJ0aWNlcyh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb3VudDtcbn1cblxuLy8gRmxhdHRlbnMgbmVzdGVkIGFycmF5IG9mIHZlcnRpY2VzLCBwYWRkaW5nIHRoaXJkIGNvb3JkaW5hdGUgYXMgbmVlZGVkXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlblZlcnRpY2VzKG5lc3RlZEFycmF5LCB7cmVzdWx0ID0gW10sIGRpbWVuc2lvbnMgPSAzfSA9IHt9KSB7XG4gIGxldCBpbmRleCA9IC0xO1xuICBsZXQgdmVydGV4TGVuZ3RoID0gMDtcbiAgd2hpbGUgKCsraW5kZXggPCBuZXN0ZWRBcnJheS5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5lc3RlZEFycmF5W2luZGV4XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgICAgZmxhdHRlblZlcnRpY2VzKHZhbHVlLCB7cmVzdWx0LCBkaW1lbnNpb25zfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2ZXJ0ZXhMZW5ndGggPCBkaW1lbnNpb25zKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB2ZXJ0ZXhMZW5ndGgrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gQWRkIGEgdGhpcmQgY29vcmRpbmF0ZSBpZiBuZWVkZWRcbiAgaWYgKHZlcnRleExlbmd0aCA+IDAgJiYgdmVydGV4TGVuZ3RoIDwgZGltZW5zaW9ucykge1xuICAgIHJlc3VsdC5wdXNoKDApO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFVzZXMgY29weVdpdGhpbiB0byBzaWduaWZpY2FudGx5IHNwZWVkIHVwIHR5cGVkIGFycmF5IHZhbHVlIGZpbGxpbmdcbmV4cG9ydCBmdW5jdGlvbiBmaWxsQXJyYXkoe3RhcmdldCwgc291cmNlLCBzdGFydCA9IDAsIGNvdW50ID0gMX0pIHtcbiAgY29uc3QgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcbiAgY29uc3QgdG90YWwgPSBjb3VudCAqIGxlbmd0aDtcbiAgbGV0IGNvcGllZCA9IDA7XG4gIGZvciAobGV0IGkgPSBzdGFydDsgY29waWVkIDwgbGVuZ3RoOyBjb3BpZWQrKykge1xuICAgIHRhcmdldFtpKytdID0gc291cmNlW2NvcGllZF07XG4gIH1cblxuICB3aGlsZSAoY29waWVkIDwgdG90YWwpIHtcbiAgICAvLyBJZiB3ZSBoYXZlIGNvcGllZCBsZXNzIHRoYW4gaGFsZiwgY29weSBldmVyeXRoaW5nIHdlIGdvdFxuICAgIC8vIGVsc2UgY29weSByZW1haW5pbmcgaW4gb25lIG9wZXJhdGlvblxuICAgIGlmIChjb3BpZWQgPCB0b3RhbCAtIGNvcGllZCkge1xuICAgICAgdGFyZ2V0LmNvcHlXaXRoaW4oc3RhcnQgKyBjb3BpZWQsIHN0YXJ0LCBzdGFydCArIGNvcGllZCk7XG4gICAgICBjb3BpZWQgKj0gMjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0LmNvcHlXaXRoaW4oc3RhcnQgKyBjb3BpZWQsIHN0YXJ0LCBzdGFydCArIHRvdGFsIC0gY29waWVkKTtcbiAgICAgIGNvcGllZCA9IHRvdGFsO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbi8vIEZsYXR0ZW5zIG5lc3RlZCBhcnJheSBvZiB2ZXJ0aWNlcywgcGFkZGluZyB0aGlyZCBjb29yZGluYXRlIGFzIG5lZWRlZFxuLypcbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuVHlwZWRWZXJ0aWNlcyhuZXN0ZWRBcnJheSwge1xuICByZXN1bHQgPSBbXSxcbiAgVHlwZSA9IEZsb2F0MzJBcnJheSxcbiAgc3RhcnQgPSAwLFxuICBkaW1lbnNpb25zID0gM1xufSA9IHt9KSB7XG4gIGxldCBpbmRleCA9IC0xO1xuICBsZXQgdmVydGV4TGVuZ3RoID0gMDtcbiAgd2hpbGUgKCsraW5kZXggPCBuZXN0ZWRBcnJheS5sZW5ndGgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5lc3RlZEFycmF5W2luZGV4XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgICAgc3RhcnQgPSBmbGF0dGVuVHlwZWRWZXJ0aWNlcyh2YWx1ZSwge3Jlc3VsdCwgc3RhcnQsIGRpbWVuc2lvbnN9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZlcnRleExlbmd0aCA8IGRpbWVuc2lvbnMpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICByZXN1bHRbc3RhcnQrK10gPSB2YWx1ZTtcbiAgICAgICAgdmVydGV4TGVuZ3RoKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIEFkZCBhIHRoaXJkIGNvb3JkaW5hdGUgaWYgbmVlZGVkXG4gIGlmICh2ZXJ0ZXhMZW5ndGggPiAwICYmIHZlcnRleExlbmd0aCA8IGRpbWVuc2lvbnMpIHtcbiAgICByZXN1bHRbc3RhcnQrK10gPSAwO1xuICB9XG4gIHJldHVybiBzdGFydDtcbn1cbiovXG4iXX0=