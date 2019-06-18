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

// Shallow compare
/* eslint-disable complexity */
export function shallowEqual(a, b) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$ignore = _ref.ignore,
      ignore = _ref$ignore === undefined ? {} : _ref$ignore;

  if (a === b) {
    return true;
  }

  if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' || a === null || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' || b === null) {
    return false;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (var key in a) {
    if (!(key in ignore) && (!(key in b) || a[key] !== b[key])) {
      return false;
    }
  }
  for (var _key in b) {
    if (!(_key in ignore) && !(_key in a)) {
      return false;
    }
  }
  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZWFjdC91dGlscy9zaGFsbG93LWVxdWFsLmpzIl0sIm5hbWVzIjpbInNoYWxsb3dFcXVhbCIsImEiLCJiIiwiaWdub3JlIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsImtleSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTyxTQUFTQSxZQUFULENBQXNCQyxDQUF0QixFQUF5QkMsQ0FBekIsRUFBZ0Q7QUFBQSxpRkFBSixFQUFJO0FBQUEseUJBQW5CQyxNQUFtQjtBQUFBLE1BQW5CQSxNQUFtQiwrQkFBVixFQUFVOztBQUVyRCxNQUFJRixNQUFNQyxDQUFWLEVBQWE7QUFDWCxXQUFPLElBQVA7QUFDRDs7QUFFRCxNQUFJLFFBQU9ELENBQVAseUNBQU9BLENBQVAsT0FBYSxRQUFiLElBQXlCQSxNQUFNLElBQS9CLElBQ0YsUUFBT0MsQ0FBUCx5Q0FBT0EsQ0FBUCxPQUFhLFFBRFgsSUFDdUJBLE1BQU0sSUFEakMsRUFDdUM7QUFDckMsV0FBTyxLQUFQO0FBQ0Q7O0FBRUQsTUFBSUUsT0FBT0MsSUFBUCxDQUFZSixDQUFaLEVBQWVLLE1BQWYsS0FBMEJGLE9BQU9DLElBQVAsQ0FBWUgsQ0FBWixFQUFlSSxNQUE3QyxFQUFxRDtBQUNuRCxXQUFPLEtBQVA7QUFDRDs7QUFFRCxPQUFLLElBQU1DLEdBQVgsSUFBa0JOLENBQWxCLEVBQXFCO0FBQ25CLFFBQUksRUFBRU0sT0FBT0osTUFBVCxNQUFxQixFQUFFSSxPQUFPTCxDQUFULEtBQWVELEVBQUVNLEdBQUYsTUFBV0wsRUFBRUssR0FBRixDQUEvQyxDQUFKLEVBQTREO0FBQzFELGFBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFDRCxPQUFLLElBQU1BLElBQVgsSUFBa0JMLENBQWxCLEVBQXFCO0FBQ25CLFFBQUksRUFBRUssUUFBT0osTUFBVCxLQUFxQixFQUFFSSxRQUFPTixDQUFULENBQXpCLEVBQXVDO0FBQ3JDLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7QUFDRCxTQUFPLElBQVA7QUFDRCIsImZpbGUiOiJzaGFsbG93LWVxdWFsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIFNoYWxsb3cgY29tcGFyZVxuLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNoYWxsb3dFcXVhbChhLCBiLCB7aWdub3JlID0ge319ID0ge30pIHtcblxuICBpZiAoYSA9PT0gYikge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhICE9PSAnb2JqZWN0JyB8fCBhID09PSBudWxsIHx8XG4gICAgdHlwZW9mIGIgIT09ICdvYmplY3QnIHx8IGIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LmtleXMoYSkubGVuZ3RoICE9PSBPYmplY3Qua2V5cyhiKS5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKGNvbnN0IGtleSBpbiBhKSB7XG4gICAgaWYgKCEoa2V5IGluIGlnbm9yZSkgJiYgKCEoa2V5IGluIGIpIHx8IGFba2V5XSAhPT0gYltrZXldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGtleSBpbiBiKSB7XG4gICAgaWYgKCEoa2V5IGluIGlnbm9yZSkgJiYgKCEoa2V5IGluIGEpKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==