'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = log;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function log(priority) {
  (0, _assert2.default)(typeof priority === 'number');
  if (priority <= log.priority) {
    var _console;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    (_console = console).debug.apply(_console, args);
  }
} /* eslint-disable no-console */
/* global console, window */


log.priority = 0;

// Expose to browser
if (typeof window !== 'undefined') {
  window.log = log;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBSXdCOztBQUZ4Qjs7Ozs7O0FBRWUsU0FBUyxHQUFULENBQWEsUUFBYixFQUFnQztBQUM3Qyx3QkFBTyxPQUFPLFFBQVAsS0FBb0IsUUFBcEIsQ0FBUCxDQUQ2QztBQUU3QyxNQUFJLFlBQVksSUFBSSxRQUFKLEVBQWM7OztzQ0FGUzs7S0FFVDs7QUFDNUIseUJBQVEsS0FBUixpQkFBaUIsSUFBakIsRUFENEI7R0FBOUI7Q0FGYTs7OztBQU9mLElBQUksUUFBSixHQUFlLENBQWY7OztBQUdBLElBQUksT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEVBQStCO0FBQ2pDLFNBQU8sR0FBUCxHQUFhLEdBQWIsQ0FEaUM7Q0FBbkMiLCJmaWxlIjoibG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuLyogZ2xvYmFsIGNvbnNvbGUsIHdpbmRvdyAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsb2cocHJpb3JpdHksIC4uLmFyZ3MpIHtcbiAgYXNzZXJ0KHR5cGVvZiBwcmlvcml0eSA9PT0gJ251bWJlcicpO1xuICBpZiAocHJpb3JpdHkgPD0gbG9nLnByaW9yaXR5KSB7XG4gICAgY29uc29sZS5kZWJ1ZyguLi5hcmdzKTtcbiAgfVxufVxuXG5sb2cucHJpb3JpdHkgPSAwO1xuXG4vLyBFeHBvc2UgdG8gYnJvd3NlclxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHdpbmRvdy5sb2cgPSBsb2c7XG59XG4iXX0=