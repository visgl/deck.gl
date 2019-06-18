var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stats = function () {
  function Stats(_ref) {
    var id = _ref.id;

    _classCallCheck(this, Stats);

    this.id = id;
    this.time = 0;
    this.total = 0;
    this.average = 0;
    this.count = 0;

    this._time = 0;
  }

  _createClass(Stats, [{
    key: 'timeStart',
    value: function timeStart() {
      this._time = this.timestampMs();
    }
  }, {
    key: 'timeEnd',
    value: function timeEnd() {
      this.time = this.timestampMs() - this._time;
      this.total += this.time;
      this.count++;
      this.average = this.total / this.count;
    }
  }, {
    key: 'timestampMs',
    value: function timestampMs() {
      /* global window */
      return typeof window !== 'undefined' && window.performance ? window.performance.now() : Date.now();
    }
  }, {
    key: 'getTimeString',
    value: function getTimeString() {
      return this.id + ':' + formatTime(this.time) + '(' + this.count + ')';
    }
  }]);

  return Stats;
}();

// TODO: Currently unused, keeping in case we want it later for log formatting


export default Stats;
export function formatTime(ms) {
  var formatted = void 0;
  if (ms < 10) {
    formatted = ms.toFixed(2) + 'ms';
  } else if (ms < 100) {
    formatted = ms.toFixed(1) + 'ms';
  } else if (ms < 1000) {
    formatted = ms.toFixed(0) + 'ms';
  } else {
    formatted = (ms / 1000).toFixed(2) + 's';
  }
  return formatted;
}

export function leftPad(string) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;

  while (string.length < length) {
    string = ' ' + string;
  }
  return string;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9zdGF0cy5qcyJdLCJuYW1lcyI6WyJTdGF0cyIsImlkIiwidGltZSIsInRvdGFsIiwiYXZlcmFnZSIsImNvdW50IiwiX3RpbWUiLCJ0aW1lc3RhbXBNcyIsIndpbmRvdyIsInBlcmZvcm1hbmNlIiwibm93IiwiRGF0ZSIsImZvcm1hdFRpbWUiLCJtcyIsImZvcm1hdHRlZCIsInRvRml4ZWQiLCJsZWZ0UGFkIiwic3RyaW5nIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7O0lBQ3FCQSxLO0FBQ25CLHVCQUFrQjtBQUFBLFFBQUxDLEVBQUssUUFBTEEsRUFBSzs7QUFBQTs7QUFDaEIsU0FBS0EsRUFBTCxHQUFVQSxFQUFWO0FBQ0EsU0FBS0MsSUFBTCxHQUFZLENBQVo7QUFDQSxTQUFLQyxLQUFMLEdBQWEsQ0FBYjtBQUNBLFNBQUtDLE9BQUwsR0FBZSxDQUFmO0FBQ0EsU0FBS0MsS0FBTCxHQUFhLENBQWI7O0FBRUEsU0FBS0MsS0FBTCxHQUFhLENBQWI7QUFDRDs7OztnQ0FFVztBQUNWLFdBQUtBLEtBQUwsR0FBYSxLQUFLQyxXQUFMLEVBQWI7QUFDRDs7OzhCQUVTO0FBQ1IsV0FBS0wsSUFBTCxHQUFZLEtBQUtLLFdBQUwsS0FBcUIsS0FBS0QsS0FBdEM7QUFDQSxXQUFLSCxLQUFMLElBQWMsS0FBS0QsSUFBbkI7QUFDQSxXQUFLRyxLQUFMO0FBQ0EsV0FBS0QsT0FBTCxHQUFlLEtBQUtELEtBQUwsR0FBYSxLQUFLRSxLQUFqQztBQUNEOzs7a0NBRWE7QUFDWjtBQUNBLGFBQU8sT0FBT0csTUFBUCxLQUFrQixXQUFsQixJQUFpQ0EsT0FBT0MsV0FBeEMsR0FDTEQsT0FBT0MsV0FBUCxDQUFtQkMsR0FBbkIsRUFESyxHQUVMQyxLQUFLRCxHQUFMLEVBRkY7QUFHRDs7O29DQUVlO0FBQ2QsYUFBVSxLQUFLVCxFQUFmLFNBQXFCVyxXQUFXLEtBQUtWLElBQWhCLENBQXJCLFNBQThDLEtBQUtHLEtBQW5EO0FBQ0Q7Ozs7OztBQUdIOzs7ZUFsQ3FCTCxLO0FBbUNyQixPQUFPLFNBQVNZLFVBQVQsQ0FBb0JDLEVBQXBCLEVBQXdCO0FBQzdCLE1BQUlDLGtCQUFKO0FBQ0EsTUFBSUQsS0FBSyxFQUFULEVBQWE7QUFDWEMsZ0JBQWVELEdBQUdFLE9BQUgsQ0FBVyxDQUFYLENBQWY7QUFDRCxHQUZELE1BRU8sSUFBSUYsS0FBSyxHQUFULEVBQWM7QUFDbkJDLGdCQUFlRCxHQUFHRSxPQUFILENBQVcsQ0FBWCxDQUFmO0FBQ0QsR0FGTSxNQUVBLElBQUlGLEtBQUssSUFBVCxFQUFlO0FBQ3BCQyxnQkFBZUQsR0FBR0UsT0FBSCxDQUFXLENBQVgsQ0FBZjtBQUNELEdBRk0sTUFFQTtBQUNMRCxnQkFBZSxDQUFDRCxLQUFLLElBQU4sRUFBWUUsT0FBWixDQUFvQixDQUFwQixDQUFmO0FBQ0Q7QUFDRCxTQUFPRCxTQUFQO0FBQ0Q7O0FBRUQsT0FBTyxTQUFTRSxPQUFULENBQWlCQyxNQUFqQixFQUFxQztBQUFBLE1BQVpDLE1BQVksdUVBQUgsQ0FBRzs7QUFDMUMsU0FBT0QsT0FBT0MsTUFBUCxHQUFnQkEsTUFBdkIsRUFBK0I7QUFDN0JELG1CQUFhQSxNQUFiO0FBQ0Q7QUFDRCxTQUFPQSxNQUFQO0FBQ0QiLCJmaWxlIjoic3RhdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXRzIHtcbiAgY29uc3RydWN0b3Ioe2lkfSkge1xuICAgIHRoaXMuaWQgPSBpZDtcbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIHRoaXMudG90YWwgPSAwO1xuICAgIHRoaXMuYXZlcmFnZSA9IDA7XG4gICAgdGhpcy5jb3VudCA9IDA7XG5cbiAgICB0aGlzLl90aW1lID0gMDtcbiAgfVxuXG4gIHRpbWVTdGFydCgpIHtcbiAgICB0aGlzLl90aW1lID0gdGhpcy50aW1lc3RhbXBNcygpO1xuICB9XG5cbiAgdGltZUVuZCgpIHtcbiAgICB0aGlzLnRpbWUgPSB0aGlzLnRpbWVzdGFtcE1zKCkgLSB0aGlzLl90aW1lO1xuICAgIHRoaXMudG90YWwgKz0gdGhpcy50aW1lO1xuICAgIHRoaXMuY291bnQrKztcbiAgICB0aGlzLmF2ZXJhZ2UgPSB0aGlzLnRvdGFsIC8gdGhpcy5jb3VudDtcbiAgfVxuXG4gIHRpbWVzdGFtcE1zKCkge1xuICAgIC8qIGdsb2JhbCB3aW5kb3cgKi9cbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnBlcmZvcm1hbmNlID9cbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSA6XG4gICAgICBEYXRlLm5vdygpO1xuICB9XG5cbiAgZ2V0VGltZVN0cmluZygpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5pZH06JHtmb3JtYXRUaW1lKHRoaXMudGltZSl9KCR7dGhpcy5jb3VudH0pYDtcbiAgfVxufVxuXG4vLyBUT0RPOiBDdXJyZW50bHkgdW51c2VkLCBrZWVwaW5nIGluIGNhc2Ugd2Ugd2FudCBpdCBsYXRlciBmb3IgbG9nIGZvcm1hdHRpbmdcbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRUaW1lKG1zKSB7XG4gIGxldCBmb3JtYXR0ZWQ7XG4gIGlmIChtcyA8IDEwKSB7XG4gICAgZm9ybWF0dGVkID0gYCR7bXMudG9GaXhlZCgyKX1tc2A7XG4gIH0gZWxzZSBpZiAobXMgPCAxMDApIHtcbiAgICBmb3JtYXR0ZWQgPSBgJHttcy50b0ZpeGVkKDEpfW1zYDtcbiAgfSBlbHNlIGlmIChtcyA8IDEwMDApIHtcbiAgICBmb3JtYXR0ZWQgPSBgJHttcy50b0ZpeGVkKDApfW1zYDtcbiAgfSBlbHNlIHtcbiAgICBmb3JtYXR0ZWQgPSBgJHsobXMgLyAxMDAwKS50b0ZpeGVkKDIpfXNgO1xuICB9XG4gIHJldHVybiBmb3JtYXR0ZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsZWZ0UGFkKHN0cmluZywgbGVuZ3RoID0gOCkge1xuICB3aGlsZSAoc3RyaW5nLmxlbmd0aCA8IGxlbmd0aCkge1xuICAgIHN0cmluZyA9IGAgJHtzdHJpbmd9YDtcbiAgfVxuICByZXR1cm4gc3RyaW5nO1xufVxuIl19