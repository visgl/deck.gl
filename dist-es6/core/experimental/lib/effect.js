var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var counter = 0;

var Effect = function () {
  function Effect() {
    _classCallCheck(this, Effect);

    this.id = 'effect';
    this.count = counter++;
    this.visible = true;
    this.priority = 0;
    this.needsRedraw = false;
  }

  /**
   * subclasses should override to set up any resources needed
   */


  _createClass(Effect, [{
    key: 'initialize',
    value: function initialize(_ref) {
      var gl = _ref.gl,
          layerManager = _ref.layerManager;
    }
    /**
     * and subclasses should free those resources here
     */

  }, {
    key: 'finalize',
    value: function finalize(_ref2) {
      var gl = _ref2.gl,
          layerManager = _ref2.layerManager;
    }
    /**
     * override for a callback immediately before drawing each frame
     */

  }, {
    key: 'preDraw',
    value: function preDraw(_ref3) {
      var gl = _ref3.gl,
          layerManager = _ref3.layerManager;
    }
    /**
     * override for a callback immediately after drawing a frame's layers
     */

  }, {
    key: 'draw',
    value: function draw(_ref4) {
      var gl = _ref4.gl,
          layerManager = _ref4.layerManager;
    }
  }, {
    key: 'setNeedsRedraw',
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.needsRedraw = redraw;
    }
  }]);

  return Effect;
}();

export default Effect;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2V4cGVyaW1lbnRhbC9saWIvZWZmZWN0LmpzIl0sIm5hbWVzIjpbImNvdW50ZXIiLCJFZmZlY3QiLCJpZCIsImNvdW50IiwidmlzaWJsZSIsInByaW9yaXR5IiwibmVlZHNSZWRyYXciLCJnbCIsImxheWVyTWFuYWdlciIsInJlZHJhdyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQUlBLFVBQVUsQ0FBZDs7SUFFcUJDLE07QUFFbkIsb0JBQWM7QUFBQTs7QUFDWixTQUFLQyxFQUFMLEdBQVUsUUFBVjtBQUNBLFNBQUtDLEtBQUwsR0FBYUgsU0FBYjtBQUNBLFNBQUtJLE9BQUwsR0FBZSxJQUFmO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixDQUFoQjtBQUNBLFNBQUtDLFdBQUwsR0FBbUIsS0FBbkI7QUFDRDs7QUFFRDs7Ozs7OztxQ0FHK0I7QUFBQSxVQUFuQkMsRUFBbUIsUUFBbkJBLEVBQW1CO0FBQUEsVUFBZkMsWUFBZSxRQUFmQSxZQUFlO0FBQzlCO0FBQ0Q7Ozs7OztvQ0FHNkI7QUFBQSxVQUFuQkQsRUFBbUIsU0FBbkJBLEVBQW1CO0FBQUEsVUFBZkMsWUFBZSxTQUFmQSxZQUFlO0FBQzVCO0FBQ0Q7Ozs7OzttQ0FHNEI7QUFBQSxVQUFuQkQsRUFBbUIsU0FBbkJBLEVBQW1CO0FBQUEsVUFBZkMsWUFBZSxTQUFmQSxZQUFlO0FBQzNCO0FBQ0Q7Ozs7OztnQ0FHeUI7QUFBQSxVQUFuQkQsRUFBbUIsU0FBbkJBLEVBQW1CO0FBQUEsVUFBZkMsWUFBZSxTQUFmQSxZQUFlO0FBQ3hCOzs7cUNBRTZCO0FBQUEsVUFBZkMsTUFBZSx1RUFBTixJQUFNOztBQUM1QixXQUFLSCxXQUFMLEdBQW1CRyxNQUFuQjtBQUNEOzs7Ozs7ZUFqQ2tCUixNIiwiZmlsZSI6ImVmZmVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5sZXQgY291bnRlciA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVmZmVjdCB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pZCA9ICdlZmZlY3QnO1xuICAgIHRoaXMuY291bnQgPSBjb3VudGVyKys7XG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICB0aGlzLnByaW9yaXR5ID0gMDtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogc3ViY2xhc3NlcyBzaG91bGQgb3ZlcnJpZGUgdG8gc2V0IHVwIGFueSByZXNvdXJjZXMgbmVlZGVkXG4gICAqL1xuICBpbml0aWFsaXplKHtnbCwgbGF5ZXJNYW5hZ2VyfSkge1xuICB9XG4gIC8qKlxuICAgKiBhbmQgc3ViY2xhc3NlcyBzaG91bGQgZnJlZSB0aG9zZSByZXNvdXJjZXMgaGVyZVxuICAgKi9cbiAgZmluYWxpemUoe2dsLCBsYXllck1hbmFnZXJ9KSB7XG4gIH1cbiAgLyoqXG4gICAqIG92ZXJyaWRlIGZvciBhIGNhbGxiYWNrIGltbWVkaWF0ZWx5IGJlZm9yZSBkcmF3aW5nIGVhY2ggZnJhbWVcbiAgICovXG4gIHByZURyYXcoe2dsLCBsYXllck1hbmFnZXJ9KSB7XG4gIH1cbiAgLyoqXG4gICAqIG92ZXJyaWRlIGZvciBhIGNhbGxiYWNrIGltbWVkaWF0ZWx5IGFmdGVyIGRyYXdpbmcgYSBmcmFtZSdzIGxheWVyc1xuICAgKi9cbiAgZHJhdyh7Z2wsIGxheWVyTWFuYWdlcn0pIHtcbiAgfVxuXG4gIHNldE5lZWRzUmVkcmF3KHJlZHJhdyA9IHRydWUpIHtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gcmVkcmF3O1xuICB9XG59XG4iXX0=