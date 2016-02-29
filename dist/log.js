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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7a0JBSXdCOzs7Ozs7OztBQUFULFNBQVMsR0FBVCxDQUFhLFFBQWIsRUFBZ0M7QUFDN0Msd0JBQU8sT0FBTyxRQUFQLEtBQW9CLFFBQXBCLENBQVAsQ0FENkM7QUFFN0MsTUFBSSxZQUFZLElBQUksUUFBSixFQUFjOzs7c0NBRlM7O0tBRVQ7O0FBQzVCLHlCQUFRLEtBQVIsaUJBQWlCLElBQWpCLEVBRDRCO0dBQTlCO0NBRmE7Ozs7QUFPZixJQUFJLFFBQUosR0FBZSxDQUFmOzs7QUFHQSxJQUFJLE9BQU8sTUFBUCxLQUFrQixXQUFsQixFQUErQjtBQUNqQyxTQUFPLEdBQVAsR0FBYSxHQUFiLENBRGlDO0NBQW5DIiwiZmlsZSI6ImxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbi8qIGdsb2JhbCBjb25zb2xlLCB3aW5kb3cgKi9cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbG9nKHByaW9yaXR5LCAuLi5hcmdzKSB7XG4gIGFzc2VydCh0eXBlb2YgcHJpb3JpdHkgPT09ICdudW1iZXInKTtcbiAgaWYgKHByaW9yaXR5IDw9IGxvZy5wcmlvcml0eSkge1xuICAgIGNvbnNvbGUuZGVidWcoLi4uYXJncyk7XG4gIH1cbn1cblxubG9nLnByaW9yaXR5ID0gMDtcblxuLy8gRXhwb3NlIHRvIGJyb3dzZXJcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3aW5kb3cubG9nID0gbG9nO1xufVxuIl19