var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

// ES6 includes iteration and iterable protocols, and new standard containers
// Influential libraries like Immutable.js provide useful containers that
// adopt these conventions.
//
// So, is it possible to write generic JavaScript code that works with any
// well-written container class? And is it possible to write generic container
// classes that work with any well-written code.
//
// Almost. But it is not trivial. Importantly the standard JavaScript `Object`s
// lack even basic iteration support and even standard JavaScript `Array`s
// differ in minor but important aspects from the new classes.
//
// The bad news is that it does not appear that these things are going to be
// solved soon, even in an actively evolving language like JavaScript. The
// reason is concerns.
//
// The good news is that it is not overly hard to "paper over" the differences
// with a set of small efficient functions. And voila, container.js.
//
// Different types of containers provide different types of access.
// A random access container
// A keyed container

var ERR_NOT_CONTAINER = 'Expected a container';
var ERR_NOT_KEYED_CONTAINER = 'Expected a "keyed" container';

/**
 * Checks if argument is an indexable object (not a primitive value, nor null)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a JavaScript object
 */
export function isObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

/**
 * Checks if argument is a plain object (not a class or array etc)
 * @param {*} value - JavaScript value to be tested
 * @return {Boolean} - true if argument is a plain JavaScript object
 */
export function isPlainObject(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.constructor === Object;
}

export function isContainer(value) {
  return Array.isArray(value) || ArrayBuffer.isView(value) || isObject(value);
}

/**
 * Deduces numer of elements in a JavaScript container.
 * - Auto-deduction for ES6 containers that define a count() method
 * - Auto-deduction for ES6 containers that define a size member
 * - Auto-deduction for Classic Arrays via the built-in length attribute
 * - Also handles objects, although note that this an O(N) operation
 */
export function count(container) {
  // Check if ES6 collection "count" function is available
  if (typeof container.count === 'function') {
    return container.count();
  }

  // Check if ES6 collection "size" attribute is set
  if (Number.isFinite(container.size)) {
    return container.size;
  }

  // Check if array length attribute is set
  // Note: checking this last since some ES6 collections (Immutable.js)
  // emit profuse warnings when trying to access `length` attribute
  if (Number.isFinite(container.length)) {
    return container.length;
  }

  // Note that getting the count of an object is O(N)
  if (isPlainObject(container)) {
    var counter = 0;
    for (var key in container) {
      // eslint-disable-line
      counter++;
    }
    return counter;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

// Returns an iterator over all **values** of a container
//
// Note: Keyed containers are expected to provide an `values()` method,
// with the exception of plain objects which get special handling

export function values(container) {
  // HACK - Needed to make buble compiler work
  if (Array.isArray(container)) {
    return container;
  }

  var prototype = Object.getPrototypeOf(container);
  if (typeof prototype.values === 'function') {
    return container.values();
  }

  if (typeof container.constructor.values === 'function') {
    return container.constructor.values(container);
  }

  var iterator = container[Symbol.iterator];
  if (iterator) {
    return container;
  }

  throw new Error(ERR_NOT_CONTAINER);
}

// /////////////////////////////////////////////////////////
// KEYED CONTAINERS
// Examples: objects, Map, Immutable.Map, ...

export function isKeyedContainer(container) {
  if (Array.isArray(container)) {
    return false;
  }
  var prototype = Object.getPrototypeOf(container);
  // HACK to classify Immutable.List as non keyed container
  if (typeof prototype.shift === 'function') {
    return false;
  }
  var hasKeyedMethods = typeof prototype.get === 'function';
  return hasKeyedMethods || isPlainObject(container);
}

// Returns an iterator over all **entries** of a "keyed container"
// Keyed containers are expected to provide a `keys()` method,
// with the exception of plain objects.
//
export function keys(keyedContainer) {
  var prototype = Object.getPrototypeOf(keyedContainer);
  if (typeof prototype.keys === 'function') {
    return keyedContainer.keys();
  }

  if (typeof keyedContainer.constructor.keys === 'function') {
    return keyedContainer.constructor.keys(keyedContainer);
  }

  throw new Error(ERR_NOT_KEYED_CONTAINER);
}

// Returns an iterator over all **entries** of a "keyed container"
//
// Keyed containers are expected to provide an `entries()` method,
// with the exception of plain objects.
//
export function entries(keyedContainer) {
  var prototype = Object.getPrototypeOf(keyedContainer);
  if (typeof prototype.entries === 'function') {
    return keyedContainer.entries();
  }

  // if (typeof prototype.constructor.entries === 'function') {
  //   return prototype.constructor.entries(keyedContainer);
  // }

  if (typeof keyedContainer.constructor.entries === 'function') {
    return keyedContainer.constructor.entries(keyedContainer);
  }

  return null;
}

// "Generic" forEach that first attempts to call a
export function forEach(container, visitor) {
  // Hack to work around limitations in buble compiler
  var prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    container.forEach(visitor);
    return;
  }

  var isKeyed = isKeyedContainer(container);
  if (isKeyed) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = entries(container)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _slicedToArray(_step.value, 2),
            key = _step$value[0],
            value = _step$value[1];

        visitor(value, key, container);
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

    return;
  }

  var index = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = values(container)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var element = _step2.value;

      // result[index] = visitor(element, index, container);
      visitor(element, index, container);
      index++;
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

export function map(container, visitor) {
  // Hack to work around limitations in buble compiler
  var prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    var _result = [];
    container.forEach(function (x, i, e) {
      return _result.push(visitor(x, i, e));
    });
    return _result;
  }

  var isKeyed = isKeyedContainer(container);
  // const result = new Array(count(container));
  var result = [];
  if (isKeyed) {
    // TODO - should this create an object?
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = entries(container)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _step3$value = _slicedToArray(_step3.value, 2),
            key = _step3$value[0],
            value = _step3$value[1];

        // result[index] = visitor(element, index, container);
        result.push(visitor(value, key, container));
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  } else {
    var index = 0;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = values(container)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var element = _step4.value;

        // result[index] = visitor(element, index, container);
        result.push(visitor(element, index, container));
        index++;
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }
  return result;
}

export function reduce(container, visitor) {
  // Hack to work around limitations in buble compiler
  var prototype = Object.getPrototypeOf(container);
  if (prototype.forEach) {
    var _result2 = [];
    container.forEach(function (x, i, e) {
      return _result2.push(visitor(x, i, e));
    });
    return _result2;
  }

  var isKeyed = isKeyedContainer(container);
  // const result = new Array(count(container));
  var result = [];
  if (isKeyed) {
    // TODO - should this create an object?
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = entries(container)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var _step5$value = _slicedToArray(_step5.value, 2),
            key = _step5$value[0],
            value = _step5$value[1];

        // result[index] = visitor(element, index, container);
        result.push(visitor(value, key, container));
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }
  } else {
    var index = 0;
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = values(container)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var element = _step6.value;

        // result[index] = visitor(element, index, container);
        result.push(visitor(element, index, container));
        index++;
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  }
  return result;
}

// Attempt to create a simple (array, plain object) representation of
// a nested structure of ES6 iterable classes.
// Assumption is that if an entries() method is available, the iterable object
// should be represented as an object, if not as an array.
export function toJS(container) {
  if (!isObject(container)) {
    return container;
  }

  if (isKeyedContainer(container)) {
    var _result3 = {};
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = entries(container)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var _step7$value = _slicedToArray(_step7.value, 2),
            key = _step7$value[0],
            value = _step7$value[1];

        _result3[key] = toJS(value);
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    return _result3;
  }

  var result = [];
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = values(container)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var value = _step8.value;

      result.push(toJS(value));
    }
  } catch (err) {
    _didIteratorError8 = true;
    _iteratorError8 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion8 && _iterator8.return) {
        _iterator8.return();
      }
    } finally {
      if (_didIteratorError8) {
        throw _iteratorError8;
      }
    }
  }

  return result;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2V4cGVyaW1lbnRhbC9jb250YWluZXIuanMiXSwibmFtZXMiOlsiRVJSX05PVF9DT05UQUlORVIiLCJFUlJfTk9UX0tFWUVEX0NPTlRBSU5FUiIsImlzT2JqZWN0IiwidmFsdWUiLCJpc1BsYWluT2JqZWN0IiwiY29uc3RydWN0b3IiLCJPYmplY3QiLCJpc0NvbnRhaW5lciIsIkFycmF5IiwiaXNBcnJheSIsIkFycmF5QnVmZmVyIiwiaXNWaWV3IiwiY291bnQiLCJjb250YWluZXIiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsInNpemUiLCJsZW5ndGgiLCJjb3VudGVyIiwia2V5IiwiRXJyb3IiLCJ2YWx1ZXMiLCJwcm90b3R5cGUiLCJnZXRQcm90b3R5cGVPZiIsIml0ZXJhdG9yIiwiU3ltYm9sIiwiaXNLZXllZENvbnRhaW5lciIsInNoaWZ0IiwiaGFzS2V5ZWRNZXRob2RzIiwiZ2V0Iiwia2V5cyIsImtleWVkQ29udGFpbmVyIiwiZW50cmllcyIsImZvckVhY2giLCJ2aXNpdG9yIiwiaXNLZXllZCIsImluZGV4IiwiZWxlbWVudCIsIm1hcCIsInJlc3VsdCIsIngiLCJpIiwiZSIsInB1c2giLCJyZWR1Y2UiLCJ0b0pTIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBTUEsb0JBQW9CLHNCQUExQjtBQUNBLElBQU1DLDBCQUEwQiw4QkFBaEM7O0FBRUE7Ozs7O0FBS0EsT0FBTyxTQUFTQyxRQUFULENBQWtCQyxLQUFsQixFQUF5QjtBQUM5QixTQUFPQSxVQUFV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QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLL0IsV0FBT29DLFFBQVA7QUFDRDs7QUFFRCxNQUFNQSxTQUFTLEVBQWY7QUFiOEI7QUFBQTtBQUFBOztBQUFBO0FBYzlCLDBCQUFvQmxCLE9BQU9SLFNBQVAsQ0FBcEIsbUlBQXVDO0FBQUEsVUFBNUJWLEtBQTRCOztBQUNyQ29DLGFBQU9JLElBQVAsQ0FBWUUsS0FBSzFDLEtBQUwsQ0FBWjtBQUNEO0FBaEI2QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWlCOUIsU0FBT29DLE1BQVA7QUFDRCIsImZpbGUiOiJjb250YWluZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gRVM2IGluY2x1ZGVzIGl0ZXJhdGlvbiBhbmQgaXRlcmFibGUgcHJvdG9jb2xzLCBhbmQgbmV3IHN0YW5kYXJkIGNvbnRhaW5lcnNcbi8vIEluZmx1ZW50aWFsIGxpYnJhcmllcyBsaWtlIEltbXV0YWJsZS5qcyBwcm92aWRlIHVzZWZ1bCBjb250YWluZXJzIHRoYXRcbi8vIGFkb3B0IHRoZXNlIGNvbnZlbnRpb25zLlxuLy9cbi8vIFNvLCBpcyBpdCBwb3NzaWJsZSB0byB3cml0ZSBnZW5lcmljIEphdmFTY3JpcHQgY29kZSB0aGF0IHdvcmtzIHdpdGggYW55XG4vLyB3ZWxsLXdyaXR0ZW4gY29udGFpbmVyIGNsYXNzPyBBbmQgaXMgaXQgcG9zc2libGUgdG8gd3JpdGUgZ2VuZXJpYyBjb250YWluZXJcbi8vIGNsYXNzZXMgdGhhdCB3b3JrIHdpdGggYW55IHdlbGwtd3JpdHRlbiBjb2RlLlxuLy9cbi8vIEFsbW9zdC4gQnV0IGl0IGlzIG5vdCB0cml2aWFsLiBJbXBvcnRhbnRseSB0aGUgc3RhbmRhcmQgSmF2YVNjcmlwdCBgT2JqZWN0YHNcbi8vIGxhY2sgZXZlbiBiYXNpYyBpdGVyYXRpb24gc3VwcG9ydCBhbmQgZXZlbiBzdGFuZGFyZCBKYXZhU2NyaXB0IGBBcnJheWBzXG4vLyBkaWZmZXIgaW4gbWlub3IgYnV0IGltcG9ydGFudCBhc3BlY3RzIGZyb20gdGhlIG5ldyBjbGFzc2VzLlxuLy9cbi8vIFRoZSBiYWQgbmV3cyBpcyB0aGF0IGl0IGRvZXMgbm90IGFwcGVhciB0aGF0IHRoZXNlIHRoaW5ncyBhcmUgZ29pbmcgdG8gYmVcbi8vIHNvbHZlZCBzb29uLCBldmVuIGluIGFuIGFjdGl2ZWx5IGV2b2x2aW5nIGxhbmd1YWdlIGxpa2UgSmF2YVNjcmlwdC4gVGhlXG4vLyByZWFzb24gaXMgY29uY2VybnMuXG4vL1xuLy8gVGhlIGdvb2QgbmV3cyBpcyB0aGF0IGl0IGlzIG5vdCBvdmVybHkgaGFyZCB0byBcInBhcGVyIG92ZXJcIiB0aGUgZGlmZmVyZW5jZXNcbi8vIHdpdGggYSBzZXQgb2Ygc21hbGwgZWZmaWNpZW50IGZ1bmN0aW9ucy4gQW5kIHZvaWxhLCBjb250YWluZXIuanMuXG4vL1xuLy8gRGlmZmVyZW50IHR5cGVzIG9mIGNvbnRhaW5lcnMgcHJvdmlkZSBkaWZmZXJlbnQgdHlwZXMgb2YgYWNjZXNzLlxuLy8gQSByYW5kb20gYWNjZXNzIGNvbnRhaW5lclxuLy8gQSBrZXllZCBjb250YWluZXJcblxuY29uc3QgRVJSX05PVF9DT05UQUlORVIgPSAnRXhwZWN0ZWQgYSBjb250YWluZXInO1xuY29uc3QgRVJSX05PVF9LRVlFRF9DT05UQUlORVIgPSAnRXhwZWN0ZWQgYSBcImtleWVkXCIgY29udGFpbmVyJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYXJndW1lbnQgaXMgYW4gaW5kZXhhYmxlIG9iamVjdCAobm90IGEgcHJpbWl0aXZlIHZhbHVlLCBub3IgbnVsbClcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgLSBKYXZhU2NyaXB0IHZhbHVlIHRvIGJlIHRlc3RlZFxuICogQHJldHVybiB7Qm9vbGVhbn0gLSB0cnVlIGlmIGFyZ3VtZW50IGlzIGEgSmF2YVNjcmlwdCBvYmplY3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBhcmd1bWVudCBpcyBhIHBsYWluIG9iamVjdCAobm90IGEgY2xhc3Mgb3IgYXJyYXkgZXRjKVxuICogQHBhcmFtIHsqfSB2YWx1ZSAtIEphdmFTY3JpcHQgdmFsdWUgdG8gYmUgdGVzdGVkXG4gKiBAcmV0dXJuIHtCb29sZWFufSAtIHRydWUgaWYgYXJndW1lbnQgaXMgYSBwbGFpbiBKYXZhU2NyaXB0IG9iamVjdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb250YWluZXIodmFsdWUpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkgfHwgaXNPYmplY3QodmFsdWUpO1xufVxuXG4vKipcbiAqIERlZHVjZXMgbnVtZXIgb2YgZWxlbWVudHMgaW4gYSBKYXZhU2NyaXB0IGNvbnRhaW5lci5cbiAqIC0gQXV0by1kZWR1Y3Rpb24gZm9yIEVTNiBjb250YWluZXJzIHRoYXQgZGVmaW5lIGEgY291bnQoKSBtZXRob2RcbiAqIC0gQXV0by1kZWR1Y3Rpb24gZm9yIEVTNiBjb250YWluZXJzIHRoYXQgZGVmaW5lIGEgc2l6ZSBtZW1iZXJcbiAqIC0gQXV0by1kZWR1Y3Rpb24gZm9yIENsYXNzaWMgQXJyYXlzIHZpYSB0aGUgYnVpbHQtaW4gbGVuZ3RoIGF0dHJpYnV0ZVxuICogLSBBbHNvIGhhbmRsZXMgb2JqZWN0cywgYWx0aG91Z2ggbm90ZSB0aGF0IHRoaXMgYW4gTyhOKSBvcGVyYXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50KGNvbnRhaW5lcikge1xuICAvLyBDaGVjayBpZiBFUzYgY29sbGVjdGlvbiBcImNvdW50XCIgZnVuY3Rpb24gaXMgYXZhaWxhYmxlXG4gIGlmICh0eXBlb2YgY29udGFpbmVyLmNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5jb3VudCgpO1xuICB9XG5cbiAgLy8gQ2hlY2sgaWYgRVM2IGNvbGxlY3Rpb24gXCJzaXplXCIgYXR0cmlidXRlIGlzIHNldFxuICBpZiAoTnVtYmVyLmlzRmluaXRlKGNvbnRhaW5lci5zaXplKSkge1xuICAgIHJldHVybiBjb250YWluZXIuc2l6ZTtcbiAgfVxuXG4gIC8vIENoZWNrIGlmIGFycmF5IGxlbmd0aCBhdHRyaWJ1dGUgaXMgc2V0XG4gIC8vIE5vdGU6IGNoZWNraW5nIHRoaXMgbGFzdCBzaW5jZSBzb21lIEVTNiBjb2xsZWN0aW9ucyAoSW1tdXRhYmxlLmpzKVxuICAvLyBlbWl0IHByb2Z1c2Ugd2FybmluZ3Mgd2hlbiB0cnlpbmcgdG8gYWNjZXNzIGBsZW5ndGhgIGF0dHJpYnV0ZVxuICBpZiAoTnVtYmVyLmlzRmluaXRlKGNvbnRhaW5lci5sZW5ndGgpKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5sZW5ndGg7XG4gIH1cblxuICAvLyBOb3RlIHRoYXQgZ2V0dGluZyB0aGUgY291bnQgb2YgYW4gb2JqZWN0IGlzIE8oTilcbiAgaWYgKGlzUGxhaW5PYmplY3QoY29udGFpbmVyKSkge1xuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBjb250YWluZXIpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgY291bnRlcisrO1xuICAgIH1cbiAgICByZXR1cm4gY291bnRlcjtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihFUlJfTk9UX0NPTlRBSU5FUik7XG59XG5cbi8vIFJldHVybnMgYW4gaXRlcmF0b3Igb3ZlciBhbGwgKip2YWx1ZXMqKiBvZiBhIGNvbnRhaW5lclxuLy9cbi8vIE5vdGU6IEtleWVkIGNvbnRhaW5lcnMgYXJlIGV4cGVjdGVkIHRvIHByb3ZpZGUgYW4gYHZhbHVlcygpYCBtZXRob2QsXG4vLyB3aXRoIHRoZSBleGNlcHRpb24gb2YgcGxhaW4gb2JqZWN0cyB3aGljaCBnZXQgc3BlY2lhbCBoYW5kbGluZ1xuXG5leHBvcnQgZnVuY3Rpb24gdmFsdWVzKGNvbnRhaW5lcikge1xuICAvLyBIQUNLIC0gTmVlZGVkIHRvIG1ha2UgYnVibGUgY29tcGlsZXIgd29ya1xuICBpZiAoQXJyYXkuaXNBcnJheShjb250YWluZXIpKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxuXG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjb250YWluZXIpO1xuICBpZiAodHlwZW9mIHByb3RvdHlwZS52YWx1ZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLnZhbHVlcygpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBjb250YWluZXIuY29uc3RydWN0b3IudmFsdWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5jb25zdHJ1Y3Rvci52YWx1ZXMoY29udGFpbmVyKTtcbiAgfVxuXG4gIGNvbnN0IGl0ZXJhdG9yID0gY29udGFpbmVyW1N5bWJvbC5pdGVyYXRvcl07XG4gIGlmIChpdGVyYXRvcikge1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoRVJSX05PVF9DT05UQUlORVIpO1xufVxuXG4vLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEtFWUVEIENPTlRBSU5FUlNcbi8vIEV4YW1wbGVzOiBvYmplY3RzLCBNYXAsIEltbXV0YWJsZS5NYXAsIC4uLlxuXG5leHBvcnQgZnVuY3Rpb24gaXNLZXllZENvbnRhaW5lcihjb250YWluZXIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY29udGFpbmVyKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29udGFpbmVyKTtcbiAgLy8gSEFDSyB0byBjbGFzc2lmeSBJbW11dGFibGUuTGlzdCBhcyBub24ga2V5ZWQgY29udGFpbmVyXG4gIGlmICh0eXBlb2YgcHJvdG90eXBlLnNoaWZ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IGhhc0tleWVkTWV0aG9kcyA9IHR5cGVvZiBwcm90b3R5cGUuZ2V0ID09PSAnZnVuY3Rpb24nO1xuICByZXR1cm4gaGFzS2V5ZWRNZXRob2RzIHx8IGlzUGxhaW5PYmplY3QoY29udGFpbmVyKTtcbn1cblxuLy8gUmV0dXJucyBhbiBpdGVyYXRvciBvdmVyIGFsbCAqKmVudHJpZXMqKiBvZiBhIFwia2V5ZWQgY29udGFpbmVyXCJcbi8vIEtleWVkIGNvbnRhaW5lcnMgYXJlIGV4cGVjdGVkIHRvIHByb3ZpZGUgYSBga2V5cygpYCBtZXRob2QsXG4vLyB3aXRoIHRoZSBleGNlcHRpb24gb2YgcGxhaW4gb2JqZWN0cy5cbi8vXG5leHBvcnQgZnVuY3Rpb24ga2V5cyhrZXllZENvbnRhaW5lcikge1xuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoa2V5ZWRDb250YWluZXIpO1xuICBpZiAodHlwZW9mIHByb3RvdHlwZS5rZXlzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGtleWVkQ29udGFpbmVyLmtleXMoKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Yga2V5ZWRDb250YWluZXIuY29uc3RydWN0b3Iua2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBrZXllZENvbnRhaW5lci5jb25zdHJ1Y3Rvci5rZXlzKGtleWVkQ29udGFpbmVyKTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihFUlJfTk9UX0tFWUVEX0NPTlRBSU5FUik7XG59XG5cbi8vIFJldHVybnMgYW4gaXRlcmF0b3Igb3ZlciBhbGwgKiplbnRyaWVzKiogb2YgYSBcImtleWVkIGNvbnRhaW5lclwiXG4vL1xuLy8gS2V5ZWQgY29udGFpbmVycyBhcmUgZXhwZWN0ZWQgdG8gcHJvdmlkZSBhbiBgZW50cmllcygpYCBtZXRob2QsXG4vLyB3aXRoIHRoZSBleGNlcHRpb24gb2YgcGxhaW4gb2JqZWN0cy5cbi8vXG5leHBvcnQgZnVuY3Rpb24gZW50cmllcyhrZXllZENvbnRhaW5lcikge1xuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoa2V5ZWRDb250YWluZXIpO1xuICBpZiAodHlwZW9mIHByb3RvdHlwZS5lbnRyaWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGtleWVkQ29udGFpbmVyLmVudHJpZXMoKTtcbiAgfVxuXG4gIC8vIGlmICh0eXBlb2YgcHJvdG90eXBlLmNvbnN0cnVjdG9yLmVudHJpZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gICByZXR1cm4gcHJvdG90eXBlLmNvbnN0cnVjdG9yLmVudHJpZXMoa2V5ZWRDb250YWluZXIpO1xuICAvLyB9XG5cbiAgaWYgKHR5cGVvZiBrZXllZENvbnRhaW5lci5jb25zdHJ1Y3Rvci5lbnRyaWVzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGtleWVkQ29udGFpbmVyLmNvbnN0cnVjdG9yLmVudHJpZXMoa2V5ZWRDb250YWluZXIpO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFwiR2VuZXJpY1wiIGZvckVhY2ggdGhhdCBmaXJzdCBhdHRlbXB0cyB0byBjYWxsIGFcbmV4cG9ydCBmdW5jdGlvbiBmb3JFYWNoKGNvbnRhaW5lciwgdmlzaXRvcikge1xuICAvLyBIYWNrIHRvIHdvcmsgYXJvdW5kIGxpbWl0YXRpb25zIGluIGJ1YmxlIGNvbXBpbGVyXG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjb250YWluZXIpO1xuICBpZiAocHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBjb250YWluZXIuZm9yRWFjaCh2aXNpdG9yKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBpc0tleWVkID0gaXNLZXllZENvbnRhaW5lcihjb250YWluZXIpO1xuICBpZiAoaXNLZXllZCkge1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGVudHJpZXMoY29udGFpbmVyKSkge1xuICAgICAgdmlzaXRvcih2YWx1ZSwga2V5LCBjb250YWluZXIpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgaW5kZXggPSAwO1xuICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdmFsdWVzKGNvbnRhaW5lcikpIHtcbiAgICAvLyByZXN1bHRbaW5kZXhdID0gdmlzaXRvcihlbGVtZW50LCBpbmRleCwgY29udGFpbmVyKTtcbiAgICB2aXNpdG9yKGVsZW1lbnQsIGluZGV4LCBjb250YWluZXIpO1xuICAgIGluZGV4Kys7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcChjb250YWluZXIsIHZpc2l0b3IpIHtcbiAgLy8gSGFjayB0byB3b3JrIGFyb3VuZCBsaW1pdGF0aW9ucyBpbiBidWJsZSBjb21waWxlclxuICBjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY29udGFpbmVyKTtcbiAgaWYgKHByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgY29udGFpbmVyLmZvckVhY2goKHgsIGksIGUpID0+IHJlc3VsdC5wdXNoKHZpc2l0b3IoeCwgaSwgZSkpKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgY29uc3QgaXNLZXllZCA9IGlzS2V5ZWRDb250YWluZXIoY29udGFpbmVyKTtcbiAgLy8gY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KGNvdW50KGNvbnRhaW5lcikpO1xuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgaWYgKGlzS2V5ZWQpIHtcbiAgICAvLyBUT0RPIC0gc2hvdWxkIHRoaXMgY3JlYXRlIGFuIG9iamVjdD9cbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKGNvbnRhaW5lcikpIHtcbiAgICAgIC8vIHJlc3VsdFtpbmRleF0gPSB2aXNpdG9yKGVsZW1lbnQsIGluZGV4LCBjb250YWluZXIpO1xuICAgICAgcmVzdWx0LnB1c2godmlzaXRvcih2YWx1ZSwga2V5LCBjb250YWluZXIpKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdmFsdWVzKGNvbnRhaW5lcikpIHtcbiAgICAgIC8vIHJlc3VsdFtpbmRleF0gPSB2aXNpdG9yKGVsZW1lbnQsIGluZGV4LCBjb250YWluZXIpO1xuICAgICAgcmVzdWx0LnB1c2godmlzaXRvcihlbGVtZW50LCBpbmRleCwgY29udGFpbmVyKSk7XG4gICAgICBpbmRleCsrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVkdWNlKGNvbnRhaW5lciwgdmlzaXRvcikge1xuICAvLyBIYWNrIHRvIHdvcmsgYXJvdW5kIGxpbWl0YXRpb25zIGluIGJ1YmxlIGNvbXBpbGVyXG4gIGNvbnN0IHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihjb250YWluZXIpO1xuICBpZiAocHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBjb250YWluZXIuZm9yRWFjaCgoeCwgaSwgZSkgPT4gcmVzdWx0LnB1c2godmlzaXRvcih4LCBpLCBlKSkpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBjb25zdCBpc0tleWVkID0gaXNLZXllZENvbnRhaW5lcihjb250YWluZXIpO1xuICAvLyBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkoY291bnQoY29udGFpbmVyKSk7XG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xuICBpZiAoaXNLZXllZCkge1xuICAgIC8vIFRPRE8gLSBzaG91bGQgdGhpcyBjcmVhdGUgYW4gb2JqZWN0P1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGVudHJpZXMoY29udGFpbmVyKSkge1xuICAgICAgLy8gcmVzdWx0W2luZGV4XSA9IHZpc2l0b3IoZWxlbWVudCwgaW5kZXgsIGNvbnRhaW5lcik7XG4gICAgICByZXN1bHQucHVzaCh2aXNpdG9yKHZhbHVlLCBrZXksIGNvbnRhaW5lcikpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAwO1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiB2YWx1ZXMoY29udGFpbmVyKSkge1xuICAgICAgLy8gcmVzdWx0W2luZGV4XSA9IHZpc2l0b3IoZWxlbWVudCwgaW5kZXgsIGNvbnRhaW5lcik7XG4gICAgICByZXN1bHQucHVzaCh2aXNpdG9yKGVsZW1lbnQsIGluZGV4LCBjb250YWluZXIpKTtcbiAgICAgIGluZGV4Kys7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIEF0dGVtcHQgdG8gY3JlYXRlIGEgc2ltcGxlIChhcnJheSwgcGxhaW4gb2JqZWN0KSByZXByZXNlbnRhdGlvbiBvZlxuLy8gYSBuZXN0ZWQgc3RydWN0dXJlIG9mIEVTNiBpdGVyYWJsZSBjbGFzc2VzLlxuLy8gQXNzdW1wdGlvbiBpcyB0aGF0IGlmIGFuIGVudHJpZXMoKSBtZXRob2QgaXMgYXZhaWxhYmxlLCB0aGUgaXRlcmFibGUgb2JqZWN0XG4vLyBzaG91bGQgYmUgcmVwcmVzZW50ZWQgYXMgYW4gb2JqZWN0LCBpZiBub3QgYXMgYW4gYXJyYXkuXG5leHBvcnQgZnVuY3Rpb24gdG9KUyhjb250YWluZXIpIHtcbiAgaWYgKCFpc09iamVjdChjb250YWluZXIpKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxuXG4gIGlmIChpc0tleWVkQ29udGFpbmVyKGNvbnRhaW5lcikpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKGNvbnRhaW5lcikpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdG9KUyh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBbXTtcbiAgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMoY29udGFpbmVyKSkge1xuICAgIHJlc3VsdC5wdXNoKHRvSlModmFsdWUpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIl19