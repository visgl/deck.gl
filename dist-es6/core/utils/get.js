var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
 * Access properties of nested containers using dot-path notation
 * - Supports plain objects and arrays, as well as classes with `get` methods
 *   such as ES6 Maps, Immutable.js objects etc
 * - Returns undefined if any container is not valid, instead of throwing
 *
 * @param {Object} container - container that supports get
 * @param {String|*} compositeKey - key to access, can be '.'-separated string
 * @return {*} - value in the final key of the nested container
 */
export function get(container, compositeKey) {
  // Split the key into subkeys
  var keyList = getKeys(compositeKey);
  // Recursively get the value of each key;
  var value = container;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keyList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      // If any intermediate subfield is not a container, return undefined
      if (!isObject(value)) {
        return undefined;
      }
      // Get the `getter` for this container
      var getter = getGetter(value);
      // Use the getter to get the value for the key
      value = getter(value, key);
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

  return value;
}

/**
 * Checks if argument is an indexable object (not a primitive value, nor null)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a JavaScript object
 */
function isObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

// Default getter is container indexing
var squareBracketGetter = function squareBracketGetter(container, key) {
  return container[key];
};
var getMethodGetter = function getMethodGetter(obj, key) {
  return obj.get(key);
};
// Cache key to key arrays for speed
var keyMap = {};

// Looks for a `get` function on the prototype
// TODO - follow prototype chain?
// @private
// @return {Function} - get function: (container, key) => value
function getGetter(container) {
  // Check if container has a special get method
  var prototype = Object.getPrototypeOf(container);
  return prototype.get ? getMethodGetter : squareBracketGetter;
}

// Takes a string of '.' separated keys and returns an array of keys
// E.g. 'feature.geometry.type' => 'feature', 'geometry', 'type'
// @private
function getKeys(compositeKey) {
  if (typeof compositeKey === 'string') {
    // else assume string and split around dots
    var keyList = keyMap[compositeKey];
    if (!keyList) {
      keyList = compositeKey.split('.');
      keyMap[compositeKey] = keyList;
    }
    return keyList;
  }
  // Wrap in array if needed
  return Array.isArray(compositeKey) ? compositeKey : [compositeKey];
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3V0aWxzL2dldC5qcyJdLCJuYW1lcyI6WyJnZXQiLCJjb250YWluZXIiLCJjb21wb3NpdGVLZXkiLCJrZXlMaXN0IiwiZ2V0S2V5cyIsInZhbHVlIiwia2V5IiwiaXNPYmplY3QiLCJ1bmRlZmluZWQiLCJnZXR0ZXIiLCJnZXRHZXR0ZXIiLCJzcXVhcmVCcmFja2V0R2V0dGVyIiwiZ2V0TWV0aG9kR2V0dGVyIiwib2JqIiwia2V5TWFwIiwicHJvdG90eXBlIiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJzcGxpdCIsIkFycmF5IiwiaXNBcnJheSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7OztBQVVBLE9BQU8sU0FBU0EsR0FBVCxDQUFhQyxTQUFiLEVBQXdCQyxZQUF4QixFQUFzQztBQUMzQztBQUNBLE1BQU1DLFVBQVVDLFFBQVFGLFlBQVIsQ0FBaEI7QUFDQTtBQUNBLE1BQUlHLFFBQVFKLFNBQVo7QUFKMkM7QUFBQTtBQUFBOztBQUFBO0FBSzNDLHlCQUFrQkUsT0FBbEIsOEhBQTJCO0FBQUEsVUFBaEJHLEdBQWdCOztBQUN6QjtBQUNBLFVBQUksQ0FBQ0MsU0FBU0YsS0FBVCxDQUFMLEVBQXNCO0FBQ3BCLGVBQU9HLFNBQVA7QUFDRDtBQUNEO0FBQ0EsVUFBTUMsU0FBU0MsVUFBVUwsS0FBVixDQUFmO0FBQ0E7QUFDQUEsY0FBUUksT0FBT0osS0FBUCxFQUFjQyxHQUFkLENBQVI7QUFDRDtBQWQwQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWUzQyxTQUFPRCxLQUFQO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0EsU0FBU0UsUUFBVCxDQUFrQkYsS0FBbEIsRUFBeUI7QUFDdkIsU0FBT0EsVUFBVSxJQUFWLElBQWtCLFFBQU9BLEtBQVAseUNBQU9BLEtBQVAsT0FBaUIsUUFBMUM7QUFDRDs7QUFFRDtBQUNBLElBQU1NLHNCQUFzQixTQUF0QkEsbUJBQXNCLENBQUNWLFNBQUQsRUFBWUssR0FBWjtBQUFBLFNBQW9CTCxVQUFVSyxHQUFWLENBQXBCO0FBQUEsQ0FBNUI7QUFDQSxJQUFNTSxrQkFBa0IsU0FBbEJBLGVBQWtCLENBQUNDLEdBQUQsRUFBTVAsR0FBTjtBQUFBLFNBQWNPLElBQUliLEdBQUosQ0FBUU0sR0FBUixDQUFkO0FBQUEsQ0FBeEI7QUFDQTtBQUNBLElBQU1RLFNBQVMsRUFBZjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNKLFNBQVQsQ0FBbUJULFNBQW5CLEVBQThCO0FBQzVCO0FBQ0EsTUFBTWMsWUFBWUMsT0FBT0MsY0FBUCxDQUFzQmhCLFNBQXRCLENBQWxCO0FBQ0EsU0FBT2MsVUFBVWYsR0FBVixHQUFnQlksZUFBaEIsR0FBa0NELG1CQUF6QztBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLFNBQVNQLE9BQVQsQ0FBaUJGLFlBQWpCLEVBQStCO0FBQzdCLE1BQUksT0FBT0EsWUFBUCxLQUF3QixRQUE1QixFQUFzQztBQUNwQztBQUNBLFFBQUlDLFVBQVVXLE9BQU9aLFlBQVAsQ0FBZDtBQUNBLFFBQUksQ0FBQ0MsT0FBTCxFQUFjO0FBQ1pBLGdCQUFVRCxhQUFhZ0IsS0FBYixDQUFtQixHQUFuQixDQUFWO0FBQ0FKLGFBQU9aLFlBQVAsSUFBdUJDLE9BQXZCO0FBQ0Q7QUFDRCxXQUFPQSxPQUFQO0FBQ0Q7QUFDRDtBQUNBLFNBQU9nQixNQUFNQyxPQUFOLENBQWNsQixZQUFkLElBQThCQSxZQUE5QixHQUE2QyxDQUFDQSxZQUFELENBQXBEO0FBQ0QiLCJmaWxlIjoiZ2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qKlxuICogQWNjZXNzIHByb3BlcnRpZXMgb2YgbmVzdGVkIGNvbnRhaW5lcnMgdXNpbmcgZG90LXBhdGggbm90YXRpb25cbiAqIC0gU3VwcG9ydHMgcGxhaW4gb2JqZWN0cyBhbmQgYXJyYXlzLCBhcyB3ZWxsIGFzIGNsYXNzZXMgd2l0aCBgZ2V0YCBtZXRob2RzXG4gKiAgIHN1Y2ggYXMgRVM2IE1hcHMsIEltbXV0YWJsZS5qcyBvYmplY3RzIGV0Y1xuICogLSBSZXR1cm5zIHVuZGVmaW5lZCBpZiBhbnkgY29udGFpbmVyIGlzIG5vdCB2YWxpZCwgaW5zdGVhZCBvZiB0aHJvd2luZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250YWluZXIgLSBjb250YWluZXIgdGhhdCBzdXBwb3J0cyBnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfCp9IGNvbXBvc2l0ZUtleSAtIGtleSB0byBhY2Nlc3MsIGNhbiBiZSAnLictc2VwYXJhdGVkIHN0cmluZ1xuICogQHJldHVybiB7Kn0gLSB2YWx1ZSBpbiB0aGUgZmluYWwga2V5IG9mIHRoZSBuZXN0ZWQgY29udGFpbmVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXQoY29udGFpbmVyLCBjb21wb3NpdGVLZXkpIHtcbiAgLy8gU3BsaXQgdGhlIGtleSBpbnRvIHN1YmtleXNcbiAgY29uc3Qga2V5TGlzdCA9IGdldEtleXMoY29tcG9zaXRlS2V5KTtcbiAgLy8gUmVjdXJzaXZlbHkgZ2V0IHRoZSB2YWx1ZSBvZiBlYWNoIGtleTtcbiAgbGV0IHZhbHVlID0gY29udGFpbmVyO1xuICBmb3IgKGNvbnN0IGtleSBvZiBrZXlMaXN0KSB7XG4gICAgLy8gSWYgYW55IGludGVybWVkaWF0ZSBzdWJmaWVsZCBpcyBub3QgYSBjb250YWluZXIsIHJldHVybiB1bmRlZmluZWRcbiAgICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gR2V0IHRoZSBgZ2V0dGVyYCBmb3IgdGhpcyBjb250YWluZXJcbiAgICBjb25zdCBnZXR0ZXIgPSBnZXRHZXR0ZXIodmFsdWUpO1xuICAgIC8vIFVzZSB0aGUgZ2V0dGVyIHRvIGdldCB0aGUgdmFsdWUgZm9yIHRoZSBrZXlcbiAgICB2YWx1ZSA9IGdldHRlcih2YWx1ZSwga2V5KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGFyZ3VtZW50IGlzIGFuIGluZGV4YWJsZSBvYmplY3QgKG5vdCBhIHByaW1pdGl2ZSB2YWx1ZSwgbm9yIG51bGwpXG4gKiBAcGFyYW0geyp9IHZhbHVlIC0gSmF2YVNjcmlwdCB2YWx1ZSB0byBiZSB0ZXN0ZWRcbiAqIEByZXR1cm4ge0Jvb2xlYW59IC0gdHJ1ZSBpZiBhcmd1bWVudCBpcyBhIEphdmFTY3JpcHQgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG4vLyBEZWZhdWx0IGdldHRlciBpcyBjb250YWluZXIgaW5kZXhpbmdcbmNvbnN0IHNxdWFyZUJyYWNrZXRHZXR0ZXIgPSAoY29udGFpbmVyLCBrZXkpID0+IGNvbnRhaW5lcltrZXldO1xuY29uc3QgZ2V0TWV0aG9kR2V0dGVyID0gKG9iaiwga2V5KSA9PiBvYmouZ2V0KGtleSk7XG4vLyBDYWNoZSBrZXkgdG8ga2V5IGFycmF5cyBmb3Igc3BlZWRcbmNvbnN0IGtleU1hcCA9IHt9O1xuXG4vLyBMb29rcyBmb3IgYSBgZ2V0YCBmdW5jdGlvbiBvbiB0aGUgcHJvdG90eXBlXG4vLyBUT0RPIC0gZm9sbG93IHByb3RvdHlwZSBjaGFpbj9cbi8vIEBwcml2YXRlXG4vLyBAcmV0dXJuIHtGdW5jdGlvbn0gLSBnZXQgZnVuY3Rpb246IChjb250YWluZXIsIGtleSkgPT4gdmFsdWVcbmZ1bmN0aW9uIGdldEdldHRlcihjb250YWluZXIpIHtcbiAgLy8gQ2hlY2sgaWYgY29udGFpbmVyIGhhcyBhIHNwZWNpYWwgZ2V0IG1ldGhvZFxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29udGFpbmVyKTtcbiAgcmV0dXJuIHByb3RvdHlwZS5nZXQgPyBnZXRNZXRob2RHZXR0ZXIgOiBzcXVhcmVCcmFja2V0R2V0dGVyO1xufVxuXG4vLyBUYWtlcyBhIHN0cmluZyBvZiAnLicgc2VwYXJhdGVkIGtleXMgYW5kIHJldHVybnMgYW4gYXJyYXkgb2Yga2V5c1xuLy8gRS5nLiAnZmVhdHVyZS5nZW9tZXRyeS50eXBlJyA9PiAnZmVhdHVyZScsICdnZW9tZXRyeScsICd0eXBlJ1xuLy8gQHByaXZhdGVcbmZ1bmN0aW9uIGdldEtleXMoY29tcG9zaXRlS2V5KSB7XG4gIGlmICh0eXBlb2YgY29tcG9zaXRlS2V5ID09PSAnc3RyaW5nJykge1xuICAgIC8vIGVsc2UgYXNzdW1lIHN0cmluZyBhbmQgc3BsaXQgYXJvdW5kIGRvdHNcbiAgICBsZXQga2V5TGlzdCA9IGtleU1hcFtjb21wb3NpdGVLZXldO1xuICAgIGlmICgha2V5TGlzdCkge1xuICAgICAga2V5TGlzdCA9IGNvbXBvc2l0ZUtleS5zcGxpdCgnLicpO1xuICAgICAga2V5TWFwW2NvbXBvc2l0ZUtleV0gPSBrZXlMaXN0O1xuICAgIH1cbiAgICByZXR1cm4ga2V5TGlzdDtcbiAgfVxuICAvLyBXcmFwIGluIGFycmF5IGlmIG5lZWRlZFxuICByZXR1cm4gQXJyYXkuaXNBcnJheShjb21wb3NpdGVLZXkpID8gY29tcG9zaXRlS2V5IDogW2NvbXBvc2l0ZUtleV07XG59XG4iXX0=