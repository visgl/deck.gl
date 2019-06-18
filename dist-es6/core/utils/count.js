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

var ERR_NOT_OBJECT = 'count(): argument not an object';
var ERR_NOT_CONTAINER = 'count(): argument not a container';

/**
 * Deduces numer of elements in a JavaScript container.
 * - Auto-deduction for ES6 containers that define a count() method
 * - Auto-deduction for ES6 containers that define a size member
 * - Auto-deduction for Classic Arrays via the built-in length attribute
 * - Also handles objects, although note that this an O(N) operation
 */
export function count(container) {
  if (!isObject(container)) {
    throw new Error(ERR_NOT_OBJECT);
  }

  // Check if ES6 collection "count" function is available
  if (typeof container.count === 'function') {
    return container.count();
  }

  // Check if ES6 collection "size" attribute is set
  if (Number.isFinite(container.size)) {
    return container.size;
  }

  // Check if array length attribute is set
  // Note: checking this last since some ES6 collections (Immutable.js)
  // emit profuse warnings when trying to access `length` attribute
  if (Number.isFinite(container.length)) {
    return container.length;
  }

  // Note that getting the count of an object is O(N)
  if (isPlainObject(container)) {
    var counter = 0;
    for (var key in container) {
      // eslint-disable-line
      counter++;
    }
    return counter;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

/**
 * Checks if argument is a plain object (not a class or array etc)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a plain JavaScript object
 */
function isPlainObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === Object;
}

/**
 * Checks if argument is an indexable object (not a primitive value, nor null)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a JavaScript object
 */
function isObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3V0aWxzL2NvdW50LmpzIl0sIm5hbWVzIjpbIkVSUl9OT1RfT0JKRUNUIiwiRVJSX05PVF9DT05UQUlORVIiLCJjb3VudCIsImNvbnRhaW5lciIsImlzT2JqZWN0IiwiRXJyb3IiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInNpemUiLCJsZW5ndGgiLCJpc1BsYWluT2JqZWN0IiwiY291bnRlciIsImtleSIsInZhbHVlIiwiY29uc3RydWN0b3IiLCJPYmplY3QiXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBTUEsaUJBQWlCLGlDQUF2QjtBQUNBLElBQU1DLG9CQUFvQixtQ0FBMUI7O0FBRUE7Ozs7Ozs7QUFPQSxPQUFPLFNBQVNDLEtBQVQsQ0FBZUMsU0FBZixFQUEwQjtBQUMvQixNQUFJLENBQUNDLFNBQVNELFNBQVQsQ0FBTCxFQUEwQjtBQUN4QixVQUFNLElBQUlFLEtBQUosQ0FBVUwsY0FBVixDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJLE9BQU9HLFVBQVVELEtBQWpCLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ3pDLFdBQU9DLFVBQVVELEtBQVYsRUFBUDtBQUNEOztBQUVEO0FBQ0EsTUFBSUksT0FBT0MsUUFBUCxDQUFnQkosVUFBVUssSUFBMUIsQ0FBSixFQUFxQztBQUNuQyxXQUFPTCxVQUFVSyxJQUFqQjtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBLE1BQUlGLE9BQU9DLFFBQVAsQ0FBZ0JKLFVBQVVNLE1BQTFCLENBQUosRUFBdUM7QUFDckMsV0FBT04sVUFBVU0sTUFBakI7QUFDRDs7QUFFRDtBQUNBLE1BQUlDLGNBQWNQLFNBQWQsQ0FBSixFQUE4QjtBQUM1QixRQUFJUSxVQUFVLENBQWQ7QUFDQSxTQUFLLElBQU1DLEdBQVgsSUFBa0JULFNBQWxCLEVBQTZCO0FBQUU7QUFDN0JRO0FBQ0Q7QUFDRCxXQUFPQSxPQUFQO0FBQ0Q7O0FBRUQsUUFBTSxJQUFJTixLQUFKLENBQVVKLGlCQUFWLENBQU47QUFDRDs7QUFFRDs7Ozs7QUFLQSxTQUFTUyxhQUFULENBQXVCRyxLQUF2QixFQUE4QjtBQUM1QixTQUFPQSxVQUFVLElBQVYsSUFBa0IsUUFBT0EsS0FBUCx5Q0FBT0EsS0FBUCxPQUFpQixRQUFuQyxJQUErQ0EsTUFBTUMsV0FBTixLQUFzQkMsTUFBNUU7QUFDRDs7QUFFRDs7Ozs7QUFLQSxTQUFTWCxRQUFULENBQWtCUyxLQUFsQixFQUF5QjtBQUN2QixTQUFPQSxVQUFVLElBQVYsSUFBa0IsUUFBT0EsS0FBUCx5Q0FBT0EsS0FBUCxPQUFpQixRQUExQztBQUNEIiwiZmlsZSI6ImNvdW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmNvbnN0IEVSUl9OT1RfT0JKRUNUID0gJ2NvdW50KCk6IGFyZ3VtZW50IG5vdCBhbiBvYmplY3QnO1xuY29uc3QgRVJSX05PVF9DT05UQUlORVIgPSAnY291bnQoKTogYXJndW1lbnQgbm90IGEgY29udGFpbmVyJztcblxuLyoqXG4gKiBEZWR1Y2VzIG51bWVyIG9mIGVsZW1lbnRzIGluIGEgSmF2YVNjcmlwdCBjb250YWluZXIuXG4gKiAtIEF1dG8tZGVkdWN0aW9uIGZvciBFUzYgY29udGFpbmVycyB0aGF0IGRlZmluZSBhIGNvdW50KCkgbWV0aG9kXG4gKiAtIEF1dG8tZGVkdWN0aW9uIGZvciBFUzYgY29udGFpbmVycyB0aGF0IGRlZmluZSBhIHNpemUgbWVtYmVyXG4gKiAtIEF1dG8tZGVkdWN0aW9uIGZvciBDbGFzc2ljIEFycmF5cyB2aWEgdGhlIGJ1aWx0LWluIGxlbmd0aCBhdHRyaWJ1dGVcbiAqIC0gQWxzbyBoYW5kbGVzIG9iamVjdHMsIGFsdGhvdWdoIG5vdGUgdGhhdCB0aGlzIGFuIE8oTikgb3BlcmF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3VudChjb250YWluZXIpIHtcbiAgaWYgKCFpc09iamVjdChjb250YWluZXIpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEVSUl9OT1RfT0JKRUNUKTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIEVTNiBjb2xsZWN0aW9uIFwiY291bnRcIiBmdW5jdGlvbiBpcyBhdmFpbGFibGVcbiAgaWYgKHR5cGVvZiBjb250YWluZXIuY291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmNvdW50KCk7XG4gIH1cblxuICAvLyBDaGVjayBpZiBFUzYgY29sbGVjdGlvbiBcInNpemVcIiBhdHRyaWJ1dGUgaXMgc2V0XG4gIGlmIChOdW1iZXIuaXNGaW5pdGUoY29udGFpbmVyLnNpemUpKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5zaXplO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgYXJyYXkgbGVuZ3RoIGF0dHJpYnV0ZSBpcyBzZXRcbiAgLy8gTm90ZTogY2hlY2tpbmcgdGhpcyBsYXN0IHNpbmNlIHNvbWUgRVM2IGNvbGxlY3Rpb25zIChJbW11dGFibGUuanMpXG4gIC8vIGVtaXQgcHJvZnVzZSB3YXJuaW5ncyB3aGVuIHRyeWluZyB0byBhY2Nlc3MgYGxlbmd0aGAgYXR0cmlidXRlXG4gIGlmIChOdW1iZXIuaXNGaW5pdGUoY29udGFpbmVyLmxlbmd0aCkpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmxlbmd0aDtcbiAgfVxuXG4gIC8vIE5vdGUgdGhhdCBnZXR0aW5nIHRoZSBjb3VudCBvZiBhbiBvYmplY3QgaXMgTyhOKVxuICBpZiAoaXNQbGFpbk9iamVjdChjb250YWluZXIpKSB7XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIGZvciAoY29uc3Qga2V5IGluIGNvbnRhaW5lcikgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBjb3VudGVyKys7XG4gICAgfVxuICAgIHJldHVybiBjb3VudGVyO1xuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKEVSUl9OT1RfQ09OVEFJTkVSKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYXJndW1lbnQgaXMgYSBwbGFpbiBvYmplY3QgKG5vdCBhIGNsYXNzIG9yIGFycmF5IGV0YylcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgLSBKYXZhU2NyaXB0IHZhbHVlIHRvIGJlIHRlc3RlZFxuICogQHJldHVybiB7Qm9vbGVhbn0gLSB0cnVlIGlmIGFyZ3VtZW50IGlzIGEgcGxhaW4gSmF2YVNjcmlwdCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhcmd1bWVudCBpcyBhbiBpbmRleGFibGUgb2JqZWN0IChub3QgYSBwcmltaXRpdmUgdmFsdWUsIG5vciBudWxsKVxuICogQHBhcmFtIHsqfSB2YWx1ZSAtIEphdmFTY3JpcHQgdmFsdWUgdG8gYmUgdGVzdGVkXG4gKiBAcmV0dXJuIHtCb29sZWFufSAtIHRydWUgaWYgYXJndW1lbnQgaXMgYSBKYXZhU2NyaXB0IG9iamVjdFxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn1cblxuIl19