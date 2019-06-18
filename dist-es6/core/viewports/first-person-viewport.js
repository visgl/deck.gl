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
import { Matrix4, experimental } from 'math.gl';
var SphericalCoordinates = experimental.SphericalCoordinates;


function getDirectionFromBearingAndPitch(_ref) {
  var bearing = _ref.bearing,
      pitch = _ref.pitch;

  var spherical = new SphericalCoordinates({ bearing: bearing, pitch: pitch });
  var direction = spherical.toVector3().normalize();
  return direction;
}

var FirstPersonViewport = function (_Viewport) {
  _inherits(FirstPersonViewport, _Viewport);

  function FirstPersonViewport() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, FirstPersonViewport);

    // TODO - push direction handling into Matrix4.lookAt
    var _opts$modelMatrix = opts.modelMatrix,
        modelMatrix = _opts$modelMatrix === undefined ? null : _opts$modelMatrix,
        bearing = opts.bearing,
        _opts$up = opts.up,
        up = _opts$up === undefined ? [0, 0, 1] : _opts$up;

    // Always calculate direction from bearing and pitch

    var dir = getDirectionFromBearingAndPitch({
      bearing: bearing,
      pitch: 89
    });

    // Direction is relative to model coordinates, of course
    var center = modelMatrix ? modelMatrix.transformDirection(dir) : dir;

    // Just the direction. All the positioning is done in viewport.js
    var viewMatrix = new Matrix4().lookAt({ eye: [0, 0, 0], center: center, up: up });

    return _possibleConstructorReturn(this, (FirstPersonViewport.__proto__ || Object.getPrototypeOf(FirstPersonViewport)).call(this, Object.assign({}, opts, {
      zoom: null, // triggers meter level zoom
      viewMatrix: viewMatrix
    })));
  }

  return FirstPersonViewport;
}(Viewport);

export default FirstPersonViewport;


FirstPersonViewport.displayName = 'FirstPersonViewport';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZpZXdwb3J0cy9maXJzdC1wZXJzb24tdmlld3BvcnQuanMiXSwibmFtZXMiOlsiVmlld3BvcnQiLCJNYXRyaXg0IiwiZXhwZXJpbWVudGFsIiwiU3BoZXJpY2FsQ29vcmRpbmF0ZXMiLCJnZXREaXJlY3Rpb25Gcm9tQmVhcmluZ0FuZFBpdGNoIiwiYmVhcmluZyIsInBpdGNoIiwic3BoZXJpY2FsIiwiZGlyZWN0aW9uIiwidG9WZWN0b3IzIiwibm9ybWFsaXplIiwiRmlyc3RQZXJzb25WaWV3cG9ydCIsIm9wdHMiLCJtb2RlbE1hdHJpeCIsInVwIiwiZGlyIiwiY2VudGVyIiwidHJhbnNmb3JtRGlyZWN0aW9uIiwidmlld01hdHJpeCIsImxvb2tBdCIsImV5ZSIsIk9iamVjdCIsImFzc2lnbiIsInpvb20iLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUCxNQUFxQixZQUFyQjtBQUNBLFNBQVFDLE9BQVIsRUFBaUJDLFlBQWpCLFFBQW9DLFNBQXBDO0lBQ09DLG9CLEdBQXdCRCxZLENBQXhCQyxvQjs7O0FBRVAsU0FBU0MsK0JBQVQsT0FBMkQ7QUFBQSxNQUFqQkMsT0FBaUIsUUFBakJBLE9BQWlCO0FBQUEsTUFBUkMsS0FBUSxRQUFSQSxLQUFROztBQUN6RCxNQUFNQyxZQUFZLElBQUlKLG9CQUFKLENBQXlCLEVBQUNFLGdCQUFELEVBQVVDLFlBQVYsRUFBekIsQ0FBbEI7QUFDQSxNQUFNRSxZQUFZRCxVQUFVRSxTQUFWLEdBQXNCQyxTQUF0QixFQUFsQjtBQUNBLFNBQU9GLFNBQVA7QUFDRDs7SUFFb0JHLG1COzs7QUFDbkIsaUNBQXVCO0FBQUEsUUFBWEMsSUFBVyx1RUFBSixFQUFJOztBQUFBOztBQUNyQjtBQURxQiw0QkFPakJBLElBUGlCLENBSW5CQyxXQUptQjtBQUFBLFFBSW5CQSxXQUptQixxQ0FJTCxJQUpLO0FBQUEsUUFLbkJSLE9BTG1CLEdBT2pCTyxJQVBpQixDQUtuQlAsT0FMbUI7QUFBQSxtQkFPakJPLElBUGlCLENBTW5CRSxFQU5tQjtBQUFBLFFBTW5CQSxFQU5tQiw0QkFNZCxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQU5jOztBQVNyQjs7QUFDQSxRQUFNQyxNQUFNWCxnQ0FBZ0M7QUFDMUNDLHNCQUQwQztBQUUxQ0MsYUFBTztBQUZtQyxLQUFoQyxDQUFaOztBQUtBO0FBQ0EsUUFBTVUsU0FBU0gsY0FBY0EsWUFBWUksa0JBQVosQ0FBK0JGLEdBQS9CLENBQWQsR0FBb0RBLEdBQW5FOztBQUVBO0FBQ0EsUUFBTUcsYUFBYSxJQUFJakIsT0FBSixHQUFja0IsTUFBZCxDQUFxQixFQUFDQyxLQUFLLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQU4sRUFBaUJKLGNBQWpCLEVBQXlCRixNQUF6QixFQUFyQixDQUFuQjs7QUFuQnFCLHFJQXNCbkJPLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCVixJQUFsQixFQUF3QjtBQUN0QlcsWUFBTSxJQURnQixFQUNWO0FBQ1pMO0FBRnNCLEtBQXhCLENBdEJtQjtBQTJCdEI7OztFQTVCOENsQixROztlQUE1QlcsbUI7OztBQStCckJBLG9CQUFvQmEsV0FBcEIsR0FBa0MscUJBQWxDIiwiZmlsZSI6ImZpcnN0LXBlcnNvbi12aWV3cG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgVmlld3BvcnQgZnJvbSAnLi92aWV3cG9ydCc7XG5pbXBvcnQge01hdHJpeDQsIGV4cGVyaW1lbnRhbH0gZnJvbSAnbWF0aC5nbCc7XG5jb25zdCB7U3BoZXJpY2FsQ29vcmRpbmF0ZXN9ID0gZXhwZXJpbWVudGFsO1xuXG5mdW5jdGlvbiBnZXREaXJlY3Rpb25Gcm9tQmVhcmluZ0FuZFBpdGNoKHtiZWFyaW5nLCBwaXRjaH0pIHtcbiAgY29uc3Qgc3BoZXJpY2FsID0gbmV3IFNwaGVyaWNhbENvb3JkaW5hdGVzKHtiZWFyaW5nLCBwaXRjaH0pO1xuICBjb25zdCBkaXJlY3Rpb24gPSBzcGhlcmljYWwudG9WZWN0b3IzKCkubm9ybWFsaXplKCk7XG4gIHJldHVybiBkaXJlY3Rpb247XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpcnN0UGVyc29uVmlld3BvcnQgZXh0ZW5kcyBWaWV3cG9ydCB7XG4gIGNvbnN0cnVjdG9yKG9wdHMgPSB7fSkge1xuICAgIC8vIFRPRE8gLSBwdXNoIGRpcmVjdGlvbiBoYW5kbGluZyBpbnRvIE1hdHJpeDQubG9va0F0XG4gICAgY29uc3Qge1xuICAgICAgLy8gdmlldyBtYXRyaXggYXJndW1lbnRzXG4gICAgICBtb2RlbE1hdHJpeCA9IG51bGwsXG4gICAgICBiZWFyaW5nLFxuICAgICAgdXAgPSBbMCwgMCwgMV0gLy8gRGVmaW5lcyB1cCBkaXJlY3Rpb24sIGRlZmF1bHQgcG9zaXRpdmUgeiBheGlzLFxuICAgIH0gPSBvcHRzO1xuXG4gICAgLy8gQWx3YXlzIGNhbGN1bGF0ZSBkaXJlY3Rpb24gZnJvbSBiZWFyaW5nIGFuZCBwaXRjaFxuICAgIGNvbnN0IGRpciA9IGdldERpcmVjdGlvbkZyb21CZWFyaW5nQW5kUGl0Y2goe1xuICAgICAgYmVhcmluZyxcbiAgICAgIHBpdGNoOiA4OVxuICAgIH0pO1xuXG4gICAgLy8gRGlyZWN0aW9uIGlzIHJlbGF0aXZlIHRvIG1vZGVsIGNvb3JkaW5hdGVzLCBvZiBjb3Vyc2VcbiAgICBjb25zdCBjZW50ZXIgPSBtb2RlbE1hdHJpeCA/IG1vZGVsTWF0cml4LnRyYW5zZm9ybURpcmVjdGlvbihkaXIpIDogZGlyO1xuXG4gICAgLy8gSnVzdCB0aGUgZGlyZWN0aW9uLiBBbGwgdGhlIHBvc2l0aW9uaW5nIGlzIGRvbmUgaW4gdmlld3BvcnQuanNcbiAgICBjb25zdCB2aWV3TWF0cml4ID0gbmV3IE1hdHJpeDQoKS5sb29rQXQoe2V5ZTogWzAsIDAsIDBdLCBjZW50ZXIsIHVwfSk7XG5cbiAgICBzdXBlcihcbiAgICAgIE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHtcbiAgICAgICAgem9vbTogbnVsbCwgLy8gdHJpZ2dlcnMgbWV0ZXIgbGV2ZWwgem9vbVxuICAgICAgICB2aWV3TWF0cml4XG4gICAgICB9KVxuICAgICk7XG4gIH1cbn1cblxuRmlyc3RQZXJzb25WaWV3cG9ydC5kaXNwbGF5TmFtZSA9ICdGaXJzdFBlcnNvblZpZXdwb3J0JztcbiJdfQ==