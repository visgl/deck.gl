function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

import Viewport from './viewport';
import mat4_lookAt from 'gl-mat4/lookAt';
import mat4_perspective from 'gl-mat4/perspective';

var DEGREES_TO_RADIANS = Math.PI / 180;

var PerspectiveViewport = function (_Viewport) {
  _inherits(PerspectiveViewport, _Viewport);

  function PerspectiveViewport(_ref) {
    var width = _ref.width,
        height = _ref.height,
        eye = _ref.eye,
        _ref$lookAt = _ref.lookAt,
        lookAt = _ref$lookAt === undefined ? [0, 0, 0] : _ref$lookAt,
        _ref$up = _ref.up,
        up = _ref$up === undefined ? [0, 1, 0] : _ref$up,
        _ref$fovy = _ref.fovy,
        fovy = _ref$fovy === undefined ? 75 : _ref$fovy,
        _ref$near = _ref.near,
        near = _ref$near === undefined ? 1 : _ref$near,
        _ref$far = _ref.far,
        far = _ref$far === undefined ? 100 : _ref$far,
        _ref$aspect = _ref.aspect,
        aspect = _ref$aspect === undefined ? null : _ref$aspect;

    _classCallCheck(this, PerspectiveViewport);

    var fovyRadians = fovy * DEGREES_TO_RADIANS;
    aspect = Number.isFinite(aspect) ? aspect : width / height;
    return _possibleConstructorReturn(this, (PerspectiveViewport.__proto__ || Object.getPrototypeOf(PerspectiveViewport)).call(this, {
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_perspective([], fovyRadians, aspect, near, far),
      width: width,
      height: height
    }));
  }

  return PerspectiveViewport;
}(Viewport);

export default PerspectiveViewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZpZXdwb3J0cy9wZXJzcGVjdGl2ZS12aWV3cG9ydC5qcyJdLCJuYW1lcyI6WyJWaWV3cG9ydCIsIm1hdDRfbG9va0F0IiwibWF0NF9wZXJzcGVjdGl2ZSIsIkRFR1JFRVNfVE9fUkFESUFOUyIsIk1hdGgiLCJQSSIsIlBlcnNwZWN0aXZlVmlld3BvcnQiLCJ3aWR0aCIsImhlaWdodCIsImV5ZSIsImxvb2tBdCIsInVwIiwiZm92eSIsIm5lYXIiLCJmYXIiLCJhc3BlY3QiLCJmb3Z5UmFkaWFucyIsIk51bWJlciIsImlzRmluaXRlIiwidmlld01hdHJpeCIsInByb2plY3Rpb25NYXRyaXgiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVAsTUFBcUIsWUFBckI7QUFDQSxPQUFPQyxXQUFQLE1BQXdCLGdCQUF4QjtBQUNBLE9BQU9DLGdCQUFQLE1BQTZCLHFCQUE3Qjs7QUFFQSxJQUFNQyxxQkFBcUJDLEtBQUtDLEVBQUwsR0FBVSxHQUFyQzs7SUFFcUJDLG1COzs7QUFDbkIscUNBY0c7QUFBQSxRQVpEQyxLQVlDLFFBWkRBLEtBWUM7QUFBQSxRQVhEQyxNQVdDLFFBWERBLE1BV0M7QUFBQSxRQVREQyxHQVNDLFFBVERBLEdBU0M7QUFBQSwyQkFSREMsTUFRQztBQUFBLFFBUkRBLE1BUUMsK0JBUlEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FRUjtBQUFBLHVCQVBEQyxFQU9DO0FBQUEsUUFQREEsRUFPQywyQkFQSSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQU9KO0FBQUEseUJBTERDLElBS0M7QUFBQSxRQUxEQSxJQUtDLDZCQUxNLEVBS047QUFBQSx5QkFKREMsSUFJQztBQUFBLFFBSkRBLElBSUMsNkJBSk0sQ0FJTjtBQUFBLHdCQUhEQyxHQUdDO0FBQUEsUUFIREEsR0FHQyw0QkFISyxHQUdMO0FBQUEsMkJBRERDLE1BQ0M7QUFBQSxRQUREQSxNQUNDLCtCQURRLElBQ1I7O0FBQUE7O0FBQ0QsUUFBTUMsY0FBY0osT0FBT1Qsa0JBQTNCO0FBQ0FZLGFBQVNFLE9BQU9DLFFBQVAsQ0FBZ0JILE1BQWhCLElBQTBCQSxNQUExQixHQUFtQ1IsUUFBUUMsTUFBcEQ7QUFGQyxxSUFHSztBQUNKVyxrQkFBWWxCLFlBQVksRUFBWixFQUFnQlEsR0FBaEIsRUFBcUJDLE1BQXJCLEVBQTZCQyxFQUE3QixDQURSO0FBRUpTLHdCQUFrQmxCLGlCQUFpQixFQUFqQixFQUFxQmMsV0FBckIsRUFBa0NELE1BQWxDLEVBQTBDRixJQUExQyxFQUFnREMsR0FBaEQsQ0FGZDtBQUdKUCxrQkFISTtBQUlKQztBQUpJLEtBSEw7QUFTRjs7O0VBeEI4Q1IsUTs7ZUFBNUJNLG1CIiwiZmlsZSI6InBlcnNwZWN0aXZlLXZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBWaWV3cG9ydCBmcm9tICcuL3ZpZXdwb3J0JztcbmltcG9ydCBtYXQ0X2xvb2tBdCBmcm9tICdnbC1tYXQ0L2xvb2tBdCc7XG5pbXBvcnQgbWF0NF9wZXJzcGVjdGl2ZSBmcm9tICdnbC1tYXQ0L3BlcnNwZWN0aXZlJztcblxuY29uc3QgREVHUkVFU19UT19SQURJQU5TID0gTWF0aC5QSSAvIDE4MDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGVyc3BlY3RpdmVWaWV3cG9ydCBleHRlbmRzIFZpZXdwb3J0IHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIC8vIHZpZXdwb3J0IGFyZ3VtZW50c1xuICAgIHdpZHRoLCAvLyBXaWR0aCBvZiB2aWV3cG9ydFxuICAgIGhlaWdodCwgLy8gSGVpZ2h0IG9mIHZpZXdwb3J0XG4gICAgLy8gdmlldyBtYXRyaXggYXJndW1lbnRzXG4gICAgZXllLCAvLyBEZWZpbmVzIGV5ZSBwb3NpdGlvblxuICAgIGxvb2tBdCA9IFswLCAwLCAwXSwgLy8gV2hpY2ggcG9pbnQgaXMgY2FtZXJhIGxvb2tpbmcgYXQsIGRlZmF1bHQgb3JpZ2luXG4gICAgdXAgPSBbMCwgMSwgMF0sIC8vIERlZmluZXMgdXAgZGlyZWN0aW9uLCBkZWZhdWx0IHBvc2l0aXZlIHkgYXhpc1xuICAgIC8vIHByb2plY3Rpb24gbWF0cml4IGFyZ3VtZW50c1xuICAgIGZvdnkgPSA3NSwgLy8gRmllbGQgb2YgdmlldyBjb3ZlcmVkIGJ5IGNhbWVyYVxuICAgIG5lYXIgPSAxLCAvLyBEaXN0YW5jZSBvZiBuZWFyIGNsaXBwaW5nIHBsYW5lXG4gICAgZmFyID0gMTAwLCAvLyBEaXN0YW5jZSBvZiBmYXIgY2xpcHBpbmcgcGxhbmVcbiAgICAvLyBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWRcbiAgICBhc3BlY3QgPSBudWxsIC8vIEFzcGVjdCByYXRpbyAoc2V0IHRvIHZpZXdwb3J0IHdpZGh0L2hlaWdodClcbiAgfSkge1xuICAgIGNvbnN0IGZvdnlSYWRpYW5zID0gZm92eSAqIERFR1JFRVNfVE9fUkFESUFOUztcbiAgICBhc3BlY3QgPSBOdW1iZXIuaXNGaW5pdGUoYXNwZWN0KSA/IGFzcGVjdCA6IHdpZHRoIC8gaGVpZ2h0O1xuICAgIHN1cGVyKHtcbiAgICAgIHZpZXdNYXRyaXg6IG1hdDRfbG9va0F0KFtdLCBleWUsIGxvb2tBdCwgdXApLFxuICAgICAgcHJvamVjdGlvbk1hdHJpeDogbWF0NF9wZXJzcGVjdGl2ZShbXSwgZm92eVJhZGlhbnMsIGFzcGVjdCwgbmVhciwgZmFyKSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==