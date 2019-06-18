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

/* eslint-disable no-try-catch */

var EffectManager = function () {
  function EffectManager(_ref) {
    var gl = _ref.gl,
        layerManager = _ref.layerManager;

    _classCallCheck(this, EffectManager);

    this.gl = gl;
    this.layerManager = layerManager;
    this._effects = [];
  }

  /**
   * Adds an effect to be managed.  That effect's initialize function will
   * be called, and the effect's preDraw and draw callbacks will be
   * called at the appropriate times in the render loop
   * @param {Effect} effect - the effect to be added
   */


  _createClass(EffectManager, [{
    key: "addEffect",
    value: function addEffect(effect) {
      this._effects.push(effect);
      this._sortEffects();
      effect.initialize({ gl: this.gl, layerManager: this.layerManager });
    }

    /**
     * Removes an effect that is already being managed.  That effect's
     * finalize function will be called, and its callbacks will no longer
     * be envoked in the render loop
     * @param {Effect} effect - the effect to be removed
     * @return {bool} - True if the effect was already being managed, and
     * thus successfully removed; false otherwise
     */

  }, {
    key: "removeEffect",
    value: function removeEffect(effect) {
      var i = this._effects.indexOf(effect);
      if (i >= 0) {
        effect.finalize({ gl: this.gl, layerManager: this.layerManager });
        this._effects.splice(i, 1);
        return true;
      }
      return false;
    }

    /**
     * Envoke the preDraw callback of all managed events, in order of
     * decreasing priority
     */

  }, {
    key: "preDraw",
    value: function preDraw() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._effects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var effect = _step.value;

          if (effect.needsRedraw) {
            effect.preDraw({ gl: this.gl, layerManager: this.layerManager });
          }
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
    }

    /**
     * Envoke the draw callback of all managed events, in order of
     * decreasing priority
     */

  }, {
    key: "draw",
    value: function draw() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._effects[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var effect = _step2.value;

          if (effect.needsRedraw) {
            effect.draw({ gl: this.gl, layerManager: this.layerManager });
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: "_sortEffects",
    value: function _sortEffects() {
      this._effects.sort(function (a, b) {
        if (a.priority > b.priority) {
          return -1;
        } else if (a.priority < b.priority) {
          return 1;
        }
        return a.count - b.count;
      });
    }
  }]);

  return EffectManager;
}();

export default EffectManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb3JlL2V4cGVyaW1lbnRhbC9saWIvZWZmZWN0LW1hbmFnZXIuanMiXSwibmFtZXMiOlsiRWZmZWN0TWFuYWdlciIsImdsIiwibGF5ZXJNYW5hZ2VyIiwiX2VmZmVjdHMiLCJlZmZlY3QiLCJwdXNoIiwiX3NvcnRFZmZlY3RzIiwiaW5pdGlhbGl6ZSIsImkiLCJpbmRleE9mIiwiZmluYWxpemUiLCJzcGxpY2UiLCJuZWVkc1JlZHJhdyIsInByZURyYXciLCJkcmF3Iiwic29ydCIsImEiLCJiIiwicHJpb3JpdHkiLCJjb3VudCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztJQUVxQkEsYTtBQUNuQiwrQkFBZ0M7QUFBQSxRQUFuQkMsRUFBbUIsUUFBbkJBLEVBQW1CO0FBQUEsUUFBZkMsWUFBZSxRQUFmQSxZQUFlOztBQUFBOztBQUM5QixTQUFLRCxFQUFMLEdBQVVBLEVBQVY7QUFDQSxTQUFLQyxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs4QkFNVUMsTSxFQUFRO0FBQ2hCLFdBQUtELFFBQUwsQ0FBY0UsSUFBZCxDQUFtQkQsTUFBbkI7QUFDQSxXQUFLRSxZQUFMO0FBQ0FGLGFBQU9HLFVBQVAsQ0FBa0IsRUFBQ04sSUFBSSxLQUFLQSxFQUFWLEVBQWNDLGNBQWMsS0FBS0EsWUFBakMsRUFBbEI7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7aUNBUWFFLE0sRUFBUTtBQUNuQixVQUFNSSxJQUFJLEtBQUtMLFFBQUwsQ0FBY00sT0FBZCxDQUFzQkwsTUFBdEIsQ0FBVjtBQUNBLFVBQUlJLEtBQUssQ0FBVCxFQUFZO0FBQ1ZKLGVBQU9NLFFBQVAsQ0FBZ0IsRUFBQ1QsSUFBSSxLQUFLQSxFQUFWLEVBQWNDLGNBQWMsS0FBS0EsWUFBakMsRUFBaEI7QUFDQSxhQUFLQyxRQUFMLENBQWNRLE1BQWQsQ0FBcUJILENBQXJCLEVBQXdCLENBQXhCO0FBQ0EsZUFBTyxJQUFQO0FBQ0Q7QUFDRCxhQUFPLEtBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs4QkFJVTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUNSLDZCQUFxQixLQUFLTCxRQUExQiw4SEFBb0M7QUFBQSxjQUF6QkMsTUFBeUI7O0FBQ2xDLGNBQUlBLE9BQU9RLFdBQVgsRUFBd0I7QUFDdEJSLG1CQUFPUyxPQUFQLENBQWUsRUFBQ1osSUFBSSxLQUFLQSxFQUFWLEVBQWNDLGNBQWMsS0FBS0EsWUFBakMsRUFBZjtBQUNEO0FBQ0Y7QUFMTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTVQ7O0FBRUQ7Ozs7Ozs7MkJBSU87QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDTCw4QkFBcUIsS0FBS0MsUUFBMUIsbUlBQW9DO0FBQUEsY0FBekJDLE1BQXlCOztBQUNsQyxjQUFJQSxPQUFPUSxXQUFYLEVBQXdCO0FBQ3RCUixtQkFBT1UsSUFBUCxDQUFZLEVBQUNiLElBQUksS0FBS0EsRUFBVixFQUFjQyxjQUFjLEtBQUtBLFlBQWpDLEVBQVo7QUFDRDtBQUNGO0FBTEk7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU1OOzs7bUNBRWM7QUFDYixXQUFLQyxRQUFMLENBQWNZLElBQWQsQ0FBbUIsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFDM0IsWUFBSUQsRUFBRUUsUUFBRixHQUFhRCxFQUFFQyxRQUFuQixFQUE2QjtBQUMzQixpQkFBTyxDQUFDLENBQVI7QUFDRCxTQUZELE1BRU8sSUFBSUYsRUFBRUUsUUFBRixHQUFhRCxFQUFFQyxRQUFuQixFQUE2QjtBQUNsQyxpQkFBTyxDQUFQO0FBQ0Q7QUFDRCxlQUFPRixFQUFFRyxLQUFGLEdBQVVGLEVBQUVFLEtBQW5CO0FBQ0QsT0FQRDtBQVFEOzs7Ozs7ZUF0RWtCbkIsYSIsImZpbGUiOiJlZmZlY3QtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby10cnktY2F0Y2ggKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWZmZWN0TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKHtnbCwgbGF5ZXJNYW5hZ2VyfSkge1xuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLmxheWVyTWFuYWdlciA9IGxheWVyTWFuYWdlcjtcbiAgICB0aGlzLl9lZmZlY3RzID0gW107XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBlZmZlY3QgdG8gYmUgbWFuYWdlZC4gIFRoYXQgZWZmZWN0J3MgaW5pdGlhbGl6ZSBmdW5jdGlvbiB3aWxsXG4gICAqIGJlIGNhbGxlZCwgYW5kIHRoZSBlZmZlY3QncyBwcmVEcmF3IGFuZCBkcmF3IGNhbGxiYWNrcyB3aWxsIGJlXG4gICAqIGNhbGxlZCBhdCB0aGUgYXBwcm9wcmlhdGUgdGltZXMgaW4gdGhlIHJlbmRlciBsb29wXG4gICAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3QgLSB0aGUgZWZmZWN0IHRvIGJlIGFkZGVkXG4gICAqL1xuICBhZGRFZmZlY3QoZWZmZWN0KSB7XG4gICAgdGhpcy5fZWZmZWN0cy5wdXNoKGVmZmVjdCk7XG4gICAgdGhpcy5fc29ydEVmZmVjdHMoKTtcbiAgICBlZmZlY3QuaW5pdGlhbGl6ZSh7Z2w6IHRoaXMuZ2wsIGxheWVyTWFuYWdlcjogdGhpcy5sYXllck1hbmFnZXJ9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGVmZmVjdCB0aGF0IGlzIGFscmVhZHkgYmVpbmcgbWFuYWdlZC4gIFRoYXQgZWZmZWN0J3NcbiAgICogZmluYWxpemUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQsIGFuZCBpdHMgY2FsbGJhY2tzIHdpbGwgbm8gbG9uZ2VyXG4gICAqIGJlIGVudm9rZWQgaW4gdGhlIHJlbmRlciBsb29wXG4gICAqIEBwYXJhbSB7RWZmZWN0fSBlZmZlY3QgLSB0aGUgZWZmZWN0IHRvIGJlIHJlbW92ZWRcbiAgICogQHJldHVybiB7Ym9vbH0gLSBUcnVlIGlmIHRoZSBlZmZlY3Qgd2FzIGFscmVhZHkgYmVpbmcgbWFuYWdlZCwgYW5kXG4gICAqIHRodXMgc3VjY2Vzc2Z1bGx5IHJlbW92ZWQ7IGZhbHNlIG90aGVyd2lzZVxuICAgKi9cbiAgcmVtb3ZlRWZmZWN0KGVmZmVjdCkge1xuICAgIGNvbnN0IGkgPSB0aGlzLl9lZmZlY3RzLmluZGV4T2YoZWZmZWN0KTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICBlZmZlY3QuZmluYWxpemUoe2dsOiB0aGlzLmdsLCBsYXllck1hbmFnZXI6IHRoaXMubGF5ZXJNYW5hZ2VyfSk7XG4gICAgICB0aGlzLl9lZmZlY3RzLnNwbGljZShpLCAxKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRW52b2tlIHRoZSBwcmVEcmF3IGNhbGxiYWNrIG9mIGFsbCBtYW5hZ2VkIGV2ZW50cywgaW4gb3JkZXIgb2ZcbiAgICogZGVjcmVhc2luZyBwcmlvcml0eVxuICAgKi9cbiAgcHJlRHJhdygpIHtcbiAgICBmb3IgKGNvbnN0IGVmZmVjdCBvZiB0aGlzLl9lZmZlY3RzKSB7XG4gICAgICBpZiAoZWZmZWN0Lm5lZWRzUmVkcmF3KSB7XG4gICAgICAgIGVmZmVjdC5wcmVEcmF3KHtnbDogdGhpcy5nbCwgbGF5ZXJNYW5hZ2VyOiB0aGlzLmxheWVyTWFuYWdlcn0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbnZva2UgdGhlIGRyYXcgY2FsbGJhY2sgb2YgYWxsIG1hbmFnZWQgZXZlbnRzLCBpbiBvcmRlciBvZlxuICAgKiBkZWNyZWFzaW5nIHByaW9yaXR5XG4gICAqL1xuICBkcmF3KCkge1xuICAgIGZvciAoY29uc3QgZWZmZWN0IG9mIHRoaXMuX2VmZmVjdHMpIHtcbiAgICAgIGlmIChlZmZlY3QubmVlZHNSZWRyYXcpIHtcbiAgICAgICAgZWZmZWN0LmRyYXcoe2dsOiB0aGlzLmdsLCBsYXllck1hbmFnZXI6IHRoaXMubGF5ZXJNYW5hZ2VyfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3NvcnRFZmZlY3RzKCkge1xuICAgIHRoaXMuX2VmZmVjdHMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgaWYgKGEucHJpb3JpdHkgPiBiLnByaW9yaXR5KSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICAgIH0gZWxzZSBpZiAoYS5wcmlvcml0eSA8IGIucHJpb3JpdHkpIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gYS5jb3VudCAtIGIuY291bnQ7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==