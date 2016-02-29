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
  return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && o.constructor === Object;
}

// Shallow compare

function areEqualShallow(a, b) {
  for (var _key in a) {
    if (!(_key in b) || a[_key] !== b[_key]) {
      return false;
    }
  }
  for (var _key2 in b) {
    if (!(_key2 in a) || a[_key2] !== b[_key2]) {
      return false;
    }
  }
  return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O1FBRWdCO1FBc0JBOztlQWROOzs7O0FBUkgsU0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQTZCO0FBQ2xDLE1BQUksY0FBYyxNQUFkLEtBQXlCLENBQUMsT0FBTyxPQUFPLFFBQVAsQ0FBUixFQUEwQjtBQUNyRCxXQUFPLE9BQU8sUUFBUCxDQUFQLEdBQTBCLFNBQVMsUUFBVCxHQUFvQjtBQUM1QyxhQUFPLGNBQWMsSUFBZCxDQUFQLENBRDRDO0tBQXBCLENBRDJCO0dBQXZEO0NBREs7O0FBUVAsU0FBVSxhQUFWLENBQXdCLEdBQXhCO3NGQUNhOzs7Ozs7Ozs7O3NCQUFPLE9BQU8sSUFBUCxDQUFZLEdBQVo7Ozs7Ozs7O0FBQVA7O2dCQUNMLElBQUksY0FBSixDQUFtQixHQUFuQixLQUEyQixRQUFRLE9BQU8sUUFBUDs7Ozs7O2lCQUMvQixJQUFJLEdBQUo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBSFo7O0FBUUEsU0FBUyxhQUFULENBQXVCLENBQXZCLEVBQTBCO0FBQ3hCLFNBQU8sUUFBTyw2Q0FBUCxLQUFhLFFBQWIsSUFBeUIsRUFBRSxXQUFGLEtBQWtCLE1BQWxCLENBRFI7Q0FBMUI7Ozs7QUFNTyxTQUFTLGVBQVQsQ0FBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFBK0I7QUFDcEMsT0FBSyxJQUFNLElBQU4sSUFBYSxDQUFsQixFQUFxQjtBQUNuQixRQUFJLEVBQUUsUUFBTyxDQUFQLENBQUYsSUFBZSxFQUFFLElBQUYsTUFBVyxFQUFFLElBQUYsQ0FBWCxFQUFtQjtBQUNwQyxhQUFPLEtBQVAsQ0FEb0M7S0FBdEM7R0FERjtBQUtBLE9BQUssSUFBTSxLQUFOLElBQWEsQ0FBbEIsRUFBcUI7QUFDbkIsUUFBSSxFQUFFLFNBQU8sQ0FBUCxDQUFGLElBQWUsRUFBRSxLQUFGLE1BQVcsRUFBRSxLQUFGLENBQVgsRUFBbUI7QUFDcEMsYUFBTyxLQUFQLENBRG9DO0tBQXRDO0dBREY7QUFLQSxTQUFPLElBQVAsQ0FYb0M7Q0FBL0IiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIEVuYWJsZSBjbGFzc2ljIEphdmFTY3JpcHQgb2JqZWN0IG1hcHMgdG8gYmUgdXNlZCBhcyBkYXRhXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRJdGVyYXRvcihvYmplY3QpIHtcbiAgaWYgKGlzUGxhaW5PYmplY3Qob2JqZWN0KSAmJiAhb2JqZWN0W1N5bWJvbC5pdGVyYXRvcl0pIHtcbiAgICBvYmplY3RbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uIGl0ZXJhdG9yKCkge1xuICAgICAgcmV0dXJuIHZhbHVlSXRlcmF0b3IodGhpcyk7XG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiogdmFsdWVJdGVyYXRvcihvYmopIHtcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqKSkge1xuICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSAmJiBrZXkgIT09IFN5bWJvbC5pdGVyYXRvcikge1xuICAgICAgeWllbGQgb2JqW2tleV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qobykge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnICYmIG8uY29uc3RydWN0b3IgPT09IE9iamVjdDtcbn1cblxuLy8gU2hhbGxvdyBjb21wYXJlXG5cbmV4cG9ydCBmdW5jdGlvbiBhcmVFcXVhbFNoYWxsb3coYSwgYikge1xuICBmb3IgKGNvbnN0IGtleSBpbiBhKSB7XG4gICAgaWYgKCEoa2V5IGluIGIpIHx8IGFba2V5XSAhPT0gYltrZXldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3Qga2V5IGluIGIpIHtcbiAgICBpZiAoIShrZXkgaW4gYSkgfHwgYVtrZXldICE9PSBiW2tleV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=