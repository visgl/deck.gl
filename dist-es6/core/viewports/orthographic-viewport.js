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
import mat4_ortho from 'gl-mat4/ortho';

var OrthographicViewport = function (_Viewport) {
  _inherits(OrthographicViewport, _Viewport);

  function OrthographicViewport(_ref) {
    var width = _ref.width,
        height = _ref.height,
        _ref$eye = _ref.eye,
        eye = _ref$eye === undefined ? [0, 0, 1] : _ref$eye,
        _ref$lookAt = _ref.lookAt,
        lookAt = _ref$lookAt === undefined ? [0, 0, 0] : _ref$lookAt,
        _ref$up = _ref.up,
        up = _ref$up === undefined ? [0, 1, 0] : _ref$up,
        _ref$near = _ref.near,
        near = _ref$near === undefined ? 1 : _ref$near,
        _ref$far = _ref.far,
        far = _ref$far === undefined ? 100 : _ref$far,
        left = _ref.left,
        top = _ref.top,
        _ref$right = _ref.right,
        right = _ref$right === undefined ? null : _ref$right,
        _ref$bottom = _ref.bottom,
        bottom = _ref$bottom === undefined ? null : _ref$bottom;

    _classCallCheck(this, OrthographicViewport);

    right = Number.isFinite(right) ? right : left + width;
    bottom = Number.isFinite(bottom) ? bottom : top + height;
    return _possibleConstructorReturn(this, (OrthographicViewport.__proto__ || Object.getPrototypeOf(OrthographicViewport)).call(this, {
      viewMatrix: mat4_lookAt([], eye, lookAt, up),
      projectionMatrix: mat4_ortho([], left, right, bottom, top, near, far),
      width: width,
      height: height
    }));
  }

  return OrthographicViewport;
}(Viewport);

export default OrthographicViewport;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZpZXdwb3J0cy9vcnRob2dyYXBoaWMtdmlld3BvcnQuanMiXSwibmFtZXMiOlsiVmlld3BvcnQiLCJtYXQ0X2xvb2tBdCIsIm1hdDRfb3J0aG8iLCJPcnRob2dyYXBoaWNWaWV3cG9ydCIsIndpZHRoIiwiaGVpZ2h0IiwiZXllIiwibG9va0F0IiwidXAiLCJuZWFyIiwiZmFyIiwibGVmdCIsInRvcCIsInJpZ2h0IiwiYm90dG9tIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJ2aWV3TWF0cml4IiwicHJvamVjdGlvbk1hdHJpeCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUCxNQUFxQixZQUFyQjtBQUNBLE9BQU9DLFdBQVAsTUFBd0IsZ0JBQXhCO0FBQ0EsT0FBT0MsVUFBUCxNQUF1QixlQUF2Qjs7SUFFcUJDLG9COzs7QUFDbkIsc0NBZ0JHO0FBQUEsUUFkREMsS0FjQyxRQWREQSxLQWNDO0FBQUEsUUFiREMsTUFhQyxRQWJEQSxNQWFDO0FBQUEsd0JBWERDLEdBV0M7QUFBQSxRQVhEQSxHQVdDLDRCQVhLLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBV0w7QUFBQSwyQkFWREMsTUFVQztBQUFBLFFBVkRBLE1BVUMsK0JBVlEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FVUjtBQUFBLHVCQVREQyxFQVNDO0FBQUEsUUFUREEsRUFTQywyQkFUSSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQVNKO0FBQUEseUJBUERDLElBT0M7QUFBQSxRQVBEQSxJQU9DLDZCQVBNLENBT047QUFBQSx3QkFOREMsR0FNQztBQUFBLFFBTkRBLEdBTUMsNEJBTkssR0FNTDtBQUFBLFFBTERDLElBS0MsUUFMREEsSUFLQztBQUFBLFFBSkRDLEdBSUMsUUFKREEsR0FJQztBQUFBLDBCQUZEQyxLQUVDO0FBQUEsUUFGREEsS0FFQyw4QkFGTyxJQUVQO0FBQUEsMkJBRERDLE1BQ0M7QUFBQSxRQUREQSxNQUNDLCtCQURRLElBQ1I7O0FBQUE7O0FBQ0RELFlBQVFFLE9BQU9DLFFBQVAsQ0FBZ0JILEtBQWhCLElBQXlCQSxLQUF6QixHQUFpQ0YsT0FBT1AsS0FBaEQ7QUFDQVUsYUFBU0MsT0FBT0MsUUFBUCxDQUFnQkYsTUFBaEIsSUFBMEJBLE1BQTFCLEdBQW1DRixNQUFNUCxNQUFsRDtBQUZDLHVJQUdLO0FBQ0pZLGtCQUFZaEIsWUFBWSxFQUFaLEVBQWdCSyxHQUFoQixFQUFxQkMsTUFBckIsRUFBNkJDLEVBQTdCLENBRFI7QUFFSlUsd0JBQWtCaEIsV0FBVyxFQUFYLEVBQWVTLElBQWYsRUFBcUJFLEtBQXJCLEVBQTRCQyxNQUE1QixFQUFvQ0YsR0FBcEMsRUFBeUNILElBQXpDLEVBQStDQyxHQUEvQyxDQUZkO0FBR0pOLGtCQUhJO0FBSUpDO0FBSkksS0FITDtBQVNGOzs7RUExQitDTCxROztlQUE3Qkcsb0IiLCJmaWxlIjoib3J0aG9ncmFwaGljLXZpZXdwb3J0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBWaWV3cG9ydCBmcm9tICcuL3ZpZXdwb3J0JztcbmltcG9ydCBtYXQ0X2xvb2tBdCBmcm9tICdnbC1tYXQ0L2xvb2tBdCc7XG5pbXBvcnQgbWF0NF9vcnRobyBmcm9tICdnbC1tYXQ0L29ydGhvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3J0aG9ncmFwaGljVmlld3BvcnQgZXh0ZW5kcyBWaWV3cG9ydCB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICAvLyB2aWV3cG9ydCBhcmd1bWVudHNcbiAgICB3aWR0aCwgLy8gV2lkdGggb2Ygdmlld3BvcnRcbiAgICBoZWlnaHQsIC8vIEhlaWdodCBvZiB2aWV3cG9ydFxuICAgIC8vIHZpZXcgbWF0cml4IGFyZ3VtZW50c1xuICAgIGV5ZSA9IFswLCAwLCAxXSwgLy8gRGVmaW5lcyBleWUgcG9zaXRpb24sIGRlZmF1bHQgdW5pdCBkaXN0YW5jZSBhbG9uZyB6IGF4aXNcbiAgICBsb29rQXQgPSBbMCwgMCwgMF0sIC8vIFdoaWNoIHBvaW50IGlzIGNhbWVyYSBsb29raW5nIGF0LCBkZWZhdWx0IG9yaWdpblxuICAgIHVwID0gWzAsIDEsIDBdLCAvLyBEZWZpbmVzIHVwIGRpcmVjdGlvbiwgZGVmYXVsdCBwb3NpdGl2ZSB5IGF4aXNcbiAgICAvLyBwcm9qZWN0aW9uIG1hdHJpeCBhcmd1bWVudHNcbiAgICBuZWFyID0gMSwgLy8gRGlzdGFuY2Ugb2YgbmVhciBjbGlwcGluZyBwbGFuZVxuICAgIGZhciA9IDEwMCwgLy8gRGlzdGFuY2Ugb2YgZmFyIGNsaXBwaW5nIHBsYW5lXG4gICAgbGVmdCwgLy8gTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICAgIHRvcCwgLy8gVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gICAgLy8gYXV0b21hdGljYWxseSBjYWxjdWxhdGVkXG4gICAgcmlnaHQgPSBudWxsLCAvLyBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICAgIGJvdHRvbSA9IG51bGwgLy8gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gIH0pIHtcbiAgICByaWdodCA9IE51bWJlci5pc0Zpbml0ZShyaWdodCkgPyByaWdodCA6IGxlZnQgKyB3aWR0aDtcbiAgICBib3R0b20gPSBOdW1iZXIuaXNGaW5pdGUoYm90dG9tKSA/IGJvdHRvbSA6IHRvcCArIGhlaWdodDtcbiAgICBzdXBlcih7XG4gICAgICB2aWV3TWF0cml4OiBtYXQ0X2xvb2tBdChbXSwgZXllLCBsb29rQXQsIHVwKSxcbiAgICAgIHByb2plY3Rpb25NYXRyaXg6IG1hdDRfb3J0aG8oW10sIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==