var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import ViewportControls from './viewport-controls';
import MapState from './map-state';

// EVENT HANDLING PARAMETERS
var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;

var MapControls = function (_ViewportControls) {
  _inherits(MapControls, _ViewportControls);

  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  function MapControls(options) {
    _classCallCheck(this, MapControls);

    return _possibleConstructorReturn(this, (MapControls.__proto__ || Object.getPrototypeOf(MapControls)).call(this, MapState, options));
  }

  // Default handler for the `panmove` event.


  _createClass(MapControls, [{
    key: '_onPan',
    value: function _onPan(event) {
      return this.isFunctionKeyPressed(event) ? this._onPanRotate(event) : this._onPanMove(event);
    }

    // Default handler for panning to rotate.
    // Called by `_onPan` when panning with function key pressed.

  }, {
    key: '_onPanRotate',
    value: function _onPanRotate(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _getCenter = this.getCenter(event),
          _getCenter2 = _slicedToArray(_getCenter, 2),
          centerY = _getCenter2[1];

      var startY = centerY - deltaY;

      var _viewportState$getVie = this.viewportState.getViewportProps(),
          width = _viewportState$getVie.width,
          height = _viewportState$getVie.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = 0;

      if (deltaY > 0) {
        if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to -1 as we drag upwards
          deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
        }
      } else if (deltaY < 0) {
        if (startY > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to 1 as we drag upwards
          deltaScaleY = 1 - centerY / startY;
        }
      }
      deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));

      var newMapState = this.viewportState.rotate({ deltaScaleX: deltaScaleX, deltaScaleY: deltaScaleY });
      return this.updateViewport(newMapState);
    }
  }]);

  return MapControls;
}(ViewportControls);

export default MapControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRyb2xsZXJzL21hcC1jb250cm9scy5qcyJdLCJuYW1lcyI6WyJWaWV3cG9ydENvbnRyb2xzIiwiTWFwU3RhdGUiLCJQSVRDSF9NT1VTRV9USFJFU0hPTEQiLCJQSVRDSF9BQ0NFTCIsIk1hcENvbnRyb2xzIiwib3B0aW9ucyIsImV2ZW50IiwiaXNGdW5jdGlvbktleVByZXNzZWQiLCJfb25QYW5Sb3RhdGUiLCJfb25QYW5Nb3ZlIiwiZHJhZ1JvdGF0ZSIsImRlbHRhWCIsImRlbHRhWSIsImdldENlbnRlciIsImNlbnRlclkiLCJzdGFydFkiLCJ2aWV3cG9ydFN0YXRlIiwiZ2V0Vmlld3BvcnRQcm9wcyIsIndpZHRoIiwiaGVpZ2h0IiwiZGVsdGFTY2FsZVgiLCJkZWx0YVNjYWxlWSIsIk1hdGgiLCJhYnMiLCJtaW4iLCJtYXgiLCJuZXdNYXBTdGF0ZSIsInJvdGF0ZSIsInVwZGF0ZVZpZXdwb3J0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZ0JBQVAsTUFBNkIscUJBQTdCO0FBQ0EsT0FBT0MsUUFBUCxNQUFxQixhQUFyQjs7QUFFQTtBQUNBLElBQU1DLHdCQUF3QixDQUE5QjtBQUNBLElBQU1DLGNBQWMsR0FBcEI7O0lBRXFCQyxXOzs7QUFDbkI7Ozs7QUFJQSx1QkFBWUMsT0FBWixFQUFxQjtBQUFBOztBQUFBLHFIQUNiSixRQURhLEVBQ0hJLE9BREc7QUFFcEI7O0FBRUQ7Ozs7OzJCQUNPQyxLLEVBQU87QUFDWixhQUFPLEtBQUtDLG9CQUFMLENBQTBCRCxLQUExQixJQUFtQyxLQUFLRSxZQUFMLENBQWtCRixLQUFsQixDQUFuQyxHQUE4RCxLQUFLRyxVQUFMLENBQWdCSCxLQUFoQixDQUFyRTtBQUNEOztBQUVEO0FBQ0E7Ozs7aUNBQ2FBLEssRUFBTztBQUNsQixVQUFJLENBQUMsS0FBS0ksVUFBVixFQUFzQjtBQUNwQixlQUFPLEtBQVA7QUFDRDs7QUFIaUIsVUFLWEMsTUFMVyxHQUtPTCxLQUxQLENBS1hLLE1BTFc7QUFBQSxVQUtIQyxNQUxHLEdBS09OLEtBTFAsQ0FLSE0sTUFMRzs7QUFBQSx1QkFNRSxLQUFLQyxTQUFMLENBQWVQLEtBQWYsQ0FORjtBQUFBO0FBQUEsVUFNVFEsT0FOUzs7QUFPbEIsVUFBTUMsU0FBU0QsVUFBVUYsTUFBekI7O0FBUGtCLGtDQVFNLEtBQUtJLGFBQUwsQ0FBbUJDLGdCQUFuQixFQVJOO0FBQUEsVUFRWEMsS0FSVyx5QkFRWEEsS0FSVztBQUFBLFVBUUpDLE1BUkkseUJBUUpBLE1BUkk7O0FBVWxCLFVBQU1DLGNBQWNULFNBQVNPLEtBQTdCO0FBQ0EsVUFBSUcsY0FBYyxDQUFsQjs7QUFFQSxVQUFJVCxTQUFTLENBQWIsRUFBZ0I7QUFDZCxZQUFJVSxLQUFLQyxHQUFMLENBQVNKLFNBQVNKLE1BQWxCLElBQTRCYixxQkFBaEMsRUFBdUQ7QUFDckQ7QUFDQW1CLHdCQUFjVCxVQUFVRyxTQUFTSSxNQUFuQixJQUE2QmhCLFdBQTNDO0FBQ0Q7QUFDRixPQUxELE1BS08sSUFBSVMsU0FBUyxDQUFiLEVBQWdCO0FBQ3JCLFlBQUlHLFNBQVNiLHFCQUFiLEVBQW9DO0FBQ2xDO0FBQ0FtQix3QkFBYyxJQUFJUCxVQUFVQyxNQUE1QjtBQUNEO0FBQ0Y7QUFDRE0sb0JBQWNDLEtBQUtFLEdBQUwsQ0FBUyxDQUFULEVBQVlGLEtBQUtHLEdBQUwsQ0FBUyxDQUFDLENBQVYsRUFBYUosV0FBYixDQUFaLENBQWQ7O0FBRUEsVUFBTUssY0FBYyxLQUFLVixhQUFMLENBQW1CVyxNQUFuQixDQUEwQixFQUFDUCx3QkFBRCxFQUFjQyx3QkFBZCxFQUExQixDQUFwQjtBQUNBLGFBQU8sS0FBS08sY0FBTCxDQUFvQkYsV0FBcEIsQ0FBUDtBQUNEOzs7O0VBNUNzQzFCLGdCOztlQUFwQkksVyIsImZpbGUiOiJtYXAtY29udHJvbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgVmlld3BvcnRDb250cm9scyBmcm9tICcuL3ZpZXdwb3J0LWNvbnRyb2xzJztcbmltcG9ydCBNYXBTdGF0ZSBmcm9tICcuL21hcC1zdGF0ZSc7XG5cbi8vIEVWRU5UIEhBTkRMSU5HIFBBUkFNRVRFUlNcbmNvbnN0IFBJVENIX01PVVNFX1RIUkVTSE9MRCA9IDU7XG5jb25zdCBQSVRDSF9BQ0NFTCA9IDEuMjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFwQ29udHJvbHMgZXh0ZW5kcyBWaWV3cG9ydENvbnRyb2xzIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQSBjbGFzcyB0aGF0IGhhbmRsZXMgZXZlbnRzIGFuZCB1cGRhdGVzIG1lcmNhdG9yIHN0eWxlIHZpZXdwb3J0IHBhcmFtZXRlcnNcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcihNYXBTdGF0ZSwgb3B0aW9ucyk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGFubW92ZWAgZXZlbnQuXG4gIF9vblBhbihldmVudCkge1xuICAgIHJldHVybiB0aGlzLmlzRnVuY3Rpb25LZXlQcmVzc2VkKGV2ZW50KSA/IHRoaXMuX29uUGFuUm90YXRlKGV2ZW50KSA6IHRoaXMuX29uUGFuTW92ZShldmVudCk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHBhbm5pbmcgdG8gcm90YXRlLlxuICAvLyBDYWxsZWQgYnkgYF9vblBhbmAgd2hlbiBwYW5uaW5nIHdpdGggZnVuY3Rpb24ga2V5IHByZXNzZWQuXG4gIF9vblBhblJvdGF0ZShldmVudCkge1xuICAgIGlmICghdGhpcy5kcmFnUm90YXRlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qge2RlbHRhWCwgZGVsdGFZfSA9IGV2ZW50O1xuICAgIGNvbnN0IFssIGNlbnRlclldID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHN0YXJ0WSA9IGNlbnRlclkgLSBkZWx0YVk7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy52aWV3cG9ydFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcblxuICAgIGNvbnN0IGRlbHRhU2NhbGVYID0gZGVsdGFYIC8gd2lkdGg7XG4gICAgbGV0IGRlbHRhU2NhbGVZID0gMDtcblxuICAgIGlmIChkZWx0YVkgPiAwKSB7XG4gICAgICBpZiAoTWF0aC5hYnMoaGVpZ2h0IC0gc3RhcnRZKSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICAvLyBNb3ZlIGZyb20gMCB0byAtMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgZGVsdGFTY2FsZVkgPSBkZWx0YVkgLyAoc3RhcnRZIC0gaGVpZ2h0KSAqIFBJVENIX0FDQ0VMO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGVsdGFZIDwgMCkge1xuICAgICAgaWYgKHN0YXJ0WSA+IFBJVENIX01PVVNFX1RIUkVTSE9MRCkge1xuICAgICAgICAvLyBNb3ZlIGZyb20gMCB0byAxIGFzIHdlIGRyYWcgdXB3YXJkc1xuICAgICAgICBkZWx0YVNjYWxlWSA9IDEgLSBjZW50ZXJZIC8gc3RhcnRZO1xuICAgICAgfVxuICAgIH1cbiAgICBkZWx0YVNjYWxlWSA9IE1hdGgubWluKDEsIE1hdGgubWF4KC0xLCBkZWx0YVNjYWxlWSkpO1xuXG4gICAgY29uc3QgbmV3TWFwU3RhdGUgPSB0aGlzLnZpZXdwb3J0U3RhdGUucm90YXRlKHtkZWx0YVNjYWxlWCwgZGVsdGFTY2FsZVl9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdNYXBTdGF0ZSk7XG4gIH1cbn1cbiJdfQ==