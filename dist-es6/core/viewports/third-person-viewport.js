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
import { Vector3, Matrix4, experimental } from 'math.gl';
var SphericalCoordinates = experimental.SphericalCoordinates;


function getDirectionFromBearingAndPitch(_ref) {
  var bearing = _ref.bearing,
      pitch = _ref.pitch;

  var spherical = new SphericalCoordinates({ bearing: bearing, pitch: pitch });
  return spherical.toVector3().normalize();
}

var ThirdPersonViewport = function (_Viewport) {
  _inherits(ThirdPersonViewport, _Viewport);

  function ThirdPersonViewport(opts) {
    _classCallCheck(this, ThirdPersonViewport);

    var bearing = opts.bearing,
        pitch = opts.pitch,
        position = opts.position,
        up = opts.up,
        zoom = opts.zoom;


    var direction = getDirectionFromBearingAndPitch({
      bearing: bearing,
      pitch: pitch
    });

    var distance = zoom * 50;

    // TODO somehow need to flip z to make it work
    // check if the position offset is done in the base viewport
    var eye = direction.scale(-distance).multiply(new Vector3(1, 1, -1));

    var viewMatrix = new Matrix4().multiplyRight(new Matrix4().lookAt({ eye: eye, center: position, up: up }));

    return _possibleConstructorReturn(this, (ThirdPersonViewport.__proto__ || Object.getPrototypeOf(ThirdPersonViewport)).call(this, Object.assign({}, opts, {
      // use meter level
      zoom: null,
      viewMatrix: viewMatrix
    })));
  }

  return ThirdPersonViewport;
}(Viewport);

export default ThirdPersonViewport;


ThirdPersonViewport.displayName = 'ThirdPersonViewport';
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3ZpZXdwb3J0cy90aGlyZC1wZXJzb24tdmlld3BvcnQuanMiXSwibmFtZXMiOlsiVmlld3BvcnQiLCJWZWN0b3IzIiwiTWF0cml4NCIsImV4cGVyaW1lbnRhbCIsIlNwaGVyaWNhbENvb3JkaW5hdGVzIiwiZ2V0RGlyZWN0aW9uRnJvbUJlYXJpbmdBbmRQaXRjaCIsImJlYXJpbmciLCJwaXRjaCIsInNwaGVyaWNhbCIsInRvVmVjdG9yMyIsIm5vcm1hbGl6ZSIsIlRoaXJkUGVyc29uVmlld3BvcnQiLCJvcHRzIiwicG9zaXRpb24iLCJ1cCIsInpvb20iLCJkaXJlY3Rpb24iLCJkaXN0YW5jZSIsImV5ZSIsInNjYWxlIiwibXVsdGlwbHkiLCJ2aWV3TWF0cml4IiwibXVsdGlwbHlSaWdodCIsImxvb2tBdCIsImNlbnRlciIsIk9iamVjdCIsImFzc2lnbiIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFQLE1BQXFCLFlBQXJCO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsT0FBakIsRUFBMEJDLFlBQTFCLFFBQTZDLFNBQTdDO0lBQ09DLG9CLEdBQXdCRCxZLENBQXhCQyxvQjs7O0FBRVAsU0FBU0MsK0JBQVQsT0FBMkQ7QUFBQSxNQUFqQkMsT0FBaUIsUUFBakJBLE9BQWlCO0FBQUEsTUFBUkMsS0FBUSxRQUFSQSxLQUFROztBQUN6RCxNQUFNQyxZQUFZLElBQUlKLG9CQUFKLENBQXlCLEVBQUNFLGdCQUFELEVBQVVDLFlBQVYsRUFBekIsQ0FBbEI7QUFDQSxTQUFPQyxVQUFVQyxTQUFWLEdBQXNCQyxTQUF0QixFQUFQO0FBQ0Q7O0lBRW9CQyxtQjs7O0FBQ25CLCtCQUFZQyxJQUFaLEVBQWtCO0FBQUE7O0FBQUEsUUFDVE4sT0FEUyxHQUM2Qk0sSUFEN0IsQ0FDVE4sT0FEUztBQUFBLFFBQ0FDLEtBREEsR0FDNkJLLElBRDdCLENBQ0FMLEtBREE7QUFBQSxRQUNPTSxRQURQLEdBQzZCRCxJQUQ3QixDQUNPQyxRQURQO0FBQUEsUUFDaUJDLEVBRGpCLEdBQzZCRixJQUQ3QixDQUNpQkUsRUFEakI7QUFBQSxRQUNxQkMsSUFEckIsR0FDNkJILElBRDdCLENBQ3FCRyxJQURyQjs7O0FBR2hCLFFBQU1DLFlBQVlYLGdDQUFnQztBQUNoREMsc0JBRGdEO0FBRWhEQztBQUZnRCxLQUFoQyxDQUFsQjs7QUFLQSxRQUFNVSxXQUFXRixPQUFPLEVBQXhCOztBQUVBO0FBQ0E7QUFDQSxRQUFNRyxNQUFNRixVQUFVRyxLQUFWLENBQWdCLENBQUNGLFFBQWpCLEVBQTJCRyxRQUEzQixDQUFvQyxJQUFJbkIsT0FBSixDQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQUMsQ0FBbkIsQ0FBcEMsQ0FBWjs7QUFFQSxRQUFNb0IsYUFBYSxJQUFJbkIsT0FBSixHQUFjb0IsYUFBZCxDQUNqQixJQUFJcEIsT0FBSixHQUFjcUIsTUFBZCxDQUFxQixFQUFDTCxRQUFELEVBQU1NLFFBQVFYLFFBQWQsRUFBd0JDLE1BQXhCLEVBQXJCLENBRGlCLENBQW5COztBQWRnQixxSUFtQmRXLE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCZCxJQUFsQixFQUF3QjtBQUN0QjtBQUNBRyxZQUFNLElBRmdCO0FBR3RCTTtBQUhzQixLQUF4QixDQW5CYztBQXlCakI7OztFQTFCOENyQixROztlQUE1QlcsbUI7OztBQTZCckJBLG9CQUFvQmdCLFdBQXBCLEdBQWtDLHFCQUFsQyIsImZpbGUiOiJ0aGlyZC1wZXJzb24tdmlld3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IFZpZXdwb3J0IGZyb20gJy4vdmlld3BvcnQnO1xuaW1wb3J0IHtWZWN0b3IzLCBNYXRyaXg0LCBleHBlcmltZW50YWx9IGZyb20gJ21hdGguZ2wnO1xuY29uc3Qge1NwaGVyaWNhbENvb3JkaW5hdGVzfSA9IGV4cGVyaW1lbnRhbDtcblxuZnVuY3Rpb24gZ2V0RGlyZWN0aW9uRnJvbUJlYXJpbmdBbmRQaXRjaCh7YmVhcmluZywgcGl0Y2h9KSB7XG4gIGNvbnN0IHNwaGVyaWNhbCA9IG5ldyBTcGhlcmljYWxDb29yZGluYXRlcyh7YmVhcmluZywgcGl0Y2h9KTtcbiAgcmV0dXJuIHNwaGVyaWNhbC50b1ZlY3RvcjMoKS5ub3JtYWxpemUoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGhpcmRQZXJzb25WaWV3cG9ydCBleHRlbmRzIFZpZXdwb3J0IHtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIGNvbnN0IHtiZWFyaW5nLCBwaXRjaCwgcG9zaXRpb24sIHVwLCB6b29tfSA9IG9wdHM7XG5cbiAgICBjb25zdCBkaXJlY3Rpb24gPSBnZXREaXJlY3Rpb25Gcm9tQmVhcmluZ0FuZFBpdGNoKHtcbiAgICAgIGJlYXJpbmcsXG4gICAgICBwaXRjaFxuICAgIH0pO1xuXG4gICAgY29uc3QgZGlzdGFuY2UgPSB6b29tICogNTA7XG5cbiAgICAvLyBUT0RPIHNvbWVob3cgbmVlZCB0byBmbGlwIHogdG8gbWFrZSBpdCB3b3JrXG4gICAgLy8gY2hlY2sgaWYgdGhlIHBvc2l0aW9uIG9mZnNldCBpcyBkb25lIGluIHRoZSBiYXNlIHZpZXdwb3J0XG4gICAgY29uc3QgZXllID0gZGlyZWN0aW9uLnNjYWxlKC1kaXN0YW5jZSkubXVsdGlwbHkobmV3IFZlY3RvcjMoMSwgMSwgLTEpKTtcblxuICAgIGNvbnN0IHZpZXdNYXRyaXggPSBuZXcgTWF0cml4NCgpLm11bHRpcGx5UmlnaHQoXG4gICAgICBuZXcgTWF0cml4NCgpLmxvb2tBdCh7ZXllLCBjZW50ZXI6IHBvc2l0aW9uLCB1cH0pXG4gICAgKTtcblxuICAgIHN1cGVyKFxuICAgICAgT2JqZWN0LmFzc2lnbih7fSwgb3B0cywge1xuICAgICAgICAvLyB1c2UgbWV0ZXIgbGV2ZWxcbiAgICAgICAgem9vbTogbnVsbCxcbiAgICAgICAgdmlld01hdHJpeFxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cblRoaXJkUGVyc29uVmlld3BvcnQuZGlzcGxheU5hbWUgPSAnVGhpcmRQZXJzb25WaWV3cG9ydCc7XG4iXX0=