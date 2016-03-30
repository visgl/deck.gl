'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.addIterator = addIterator;
exports.areEqualShallow = areEqualShallow;

var _marked = [valueIterator].map(regeneratorRuntime.mark);

// Enable classic JavaScript object maps to be used as data

function addIterator(object) {
  if (isPlainObject(object) && !object[Symbol.iterator]) {
    object[Symbol.iterator] = function iterator() {
      return valueIterator(this);
    };
  }
}

function valueIterator(obj) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, key;

  return regeneratorRuntime.wrap(function valueIterator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 3;
          _iterator = Object.keys(obj)[Symbol.iterator]();

        case 5:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 13;
            break;
          }

          key = _step.value;

          if (!(obj.hasOwnProperty(key) && key !== Symbol.iterator)) {
            _context.next = 10;
            break;
          }

          _context.next = 10;
          return obj[key];

        case 10:
          _iteratorNormalCompletion = true;
          _context.next = 5;
          break;

        case 13:
          _context.next = 19;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context['catch'](3);
          _didIteratorError = true;
          _iteratorError = _context.t0;

        case 19:
          _context.prev = 19;
          _context.prev = 20;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 22:
          _context.prev = 22;

          if (!_didIteratorError) {
            _context.next = 25;
            break;
          }

          throw _iteratorError;

        case 25:
          return _context.finish(22);

        case 26:
          return _context.finish(19);

        case 27:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this, [[3, 15, 19, 27], [20,, 22, 26]]);
}

function isPlainObject(o) {
  return o !== null && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o.constructor === Object;
}

// Shallow compare
/* eslint-disable complexity */
function areEqualShallow(a, b) {

  if (a === b) {
    return true;
  }

  if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) !== 'object' || a === null || (typeof b === 'undefined' ? 'undefined' : _typeof(b)) !== 'object' || b === null) {
    return false;
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (var _key in a) {
    if (!(_key in b) || a[_key] !== b[_key]) {
      return false;
    }
  }
  for (var _key2 in b) {
    if (!(_key2 in a)) {
      return false;
    }
  }
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O1FBRWdCO1FBc0JBOztlQWROOzs7O0FBUkgsU0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQTZCO0FBQ2xDLE1BQUksY0FBYyxNQUFkLEtBQXlCLENBQUMsT0FBTyxPQUFPLFFBQVAsQ0FBUixFQUEwQjtBQUNyRCxXQUFPLE9BQU8sUUFBUCxDQUFQLEdBQTBCLFNBQVMsUUFBVCxHQUFvQjtBQUM1QyxhQUFPLGNBQWMsSUFBZCxDQUFQLENBRDRDO0tBQXBCLENBRDJCO0dBQXZEO0NBREs7O0FBUVAsU0FBVSxhQUFWLENBQXdCLEdBQXhCO3NGQUNhOzs7Ozs7Ozs7O3NCQUFPLE9BQU8sSUFBUCxDQUFZLEdBQVo7Ozs7Ozs7O0FBQVA7O2dCQUNMLElBQUksY0FBSixDQUFtQixHQUFuQixLQUEyQixRQUFRLE9BQU8sUUFBUDs7Ozs7O2lCQUMvQixJQUFJLEdBQUo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBSFo7O0FBUUEsU0FBUyxhQUFULENBQXVCLENBQXZCLEVBQTBCO0FBQ3hCLFNBQU8sTUFBTSxJQUFOLElBQWMsUUFBTyw2Q0FBUCxLQUFhLFFBQWIsSUFBeUIsRUFBRSxXQUFGLEtBQWtCLE1BQWxCLENBRHRCO0NBQTFCOzs7O0FBTU8sU0FBUyxlQUFULENBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCOztBQUVwQyxNQUFJLE1BQU0sQ0FBTixFQUFTO0FBQ1gsV0FBTyxJQUFQLENBRFc7R0FBYjs7QUFJQSxNQUFJLFFBQU8sNkNBQVAsS0FBYSxRQUFiLElBQXlCLE1BQU0sSUFBTixJQUMzQixRQUFPLDZDQUFQLEtBQWEsUUFBYixJQUF5QixNQUFNLElBQU4sRUFBWTtBQUNyQyxXQUFPLEtBQVAsQ0FEcUM7R0FEdkM7O0FBS0EsTUFBSSxPQUFPLElBQVAsQ0FBWSxDQUFaLEVBQWUsTUFBZixLQUEwQixPQUFPLElBQVAsQ0FBWSxDQUFaLEVBQWUsTUFBZixFQUF1QjtBQUNuRCxXQUFPLEtBQVAsQ0FEbUQ7R0FBckQ7O0FBSUEsT0FBSyxJQUFNLElBQU4sSUFBYSxDQUFsQixFQUFxQjtBQUNuQixRQUFJLEVBQUUsUUFBTyxDQUFQLENBQUYsSUFBZSxFQUFFLElBQUYsTUFBVyxFQUFFLElBQUYsQ0FBWCxFQUFtQjtBQUNwQyxhQUFPLEtBQVAsQ0FEb0M7S0FBdEM7R0FERjtBQUtBLE9BQUssSUFBTSxLQUFOLElBQWEsQ0FBbEIsRUFBcUI7QUFDbkIsUUFBSSxFQUFFLFNBQU8sQ0FBUCxDQUFGLEVBQWE7QUFDZixhQUFPLEtBQVAsQ0FEZTtLQUFqQjtHQURGO0FBS0EsU0FBTyxJQUFQLENBekJvQztDQUEvQiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRW5hYmxlIGNsYXNzaWMgSmF2YVNjcmlwdCBvYmplY3QgbWFwcyB0byBiZSB1c2VkIGFzIGRhdGFcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEl0ZXJhdG9yKG9iamVjdCkge1xuICBpZiAoaXNQbGFpbk9iamVjdChvYmplY3QpICYmICFvYmplY3RbU3ltYm9sLml0ZXJhdG9yXSkge1xuICAgIG9iamVjdFtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gaXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gdmFsdWVJdGVyYXRvcih0aGlzKTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uKiB2YWx1ZUl0ZXJhdG9yKG9iaikge1xuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmopKSB7XG4gICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIGtleSAhPT0gU3ltYm9sLml0ZXJhdG9yKSB7XG4gICAgICB5aWVsZCBvYmpba2V5XTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvKSB7XG4gIHJldHVybiBvICE9PSBudWxsICYmIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBvLmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG59XG5cbi8vIFNoYWxsb3cgY29tcGFyZVxuLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFyZUVxdWFsU2hhbGxvdyhhLCBiKSB7XG5cbiAgaWYgKGEgPT09IGIpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYSAhPT0gJ29iamVjdCcgfHwgYSA9PT0gbnVsbCB8fFxuICAgIHR5cGVvZiBiICE9PSAnb2JqZWN0JyB8fCBiID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKE9iamVjdC5rZXlzKGEpLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMoYikubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gYSkge1xuICAgIGlmICghKGtleSBpbiBiKSB8fCBhW2tleV0gIT09IGJba2V5XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGtleSBpbiBiKSB7XG4gICAgaWYgKCEoa2V5IGluIGEpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuIl19