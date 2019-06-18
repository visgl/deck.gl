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

var PREDEFINED = ['constructor', 'render', 'componentWillMount', 'componentDidMount', 'componentWillReceiveProps', 'shouldComponentUpdate', 'componentWillUpdate', 'componentDidUpdate', 'componentWillUnmount'];

/**
 * Binds the "this" argument of all functions on a class instance to the instance
 * @param {Object} obj - class instance (typically a react component)
 */
export default function autobind(obj) {
  var proto = Object.getPrototypeOf(obj);
  var propNames = Object.getOwnPropertyNames(proto);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var key = _step.value;

      if (typeof obj[key] === 'function') {
        if (!PREDEFINED.find(function (name) {
          return key === name;
        })) {
          obj[key] = obj[key].bind(obj);
        }
      }
    };

    for (var _iterator = propNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9yZWFjdC91dGlscy9hdXRvYmluZC5qcyJdLCJuYW1lcyI6WyJQUkVERUZJTkVEIiwiYXV0b2JpbmQiLCJvYmoiLCJwcm90byIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvcE5hbWVzIiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImtleSIsImZpbmQiLCJuYW1lIiwiYmluZCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBTUEsYUFBYSxDQUNqQixhQURpQixFQUNGLFFBREUsRUFDUSxvQkFEUixFQUM4QixtQkFEOUIsRUFFakIsMkJBRmlCLEVBRVksdUJBRlosRUFFcUMscUJBRnJDLEVBR2pCLG9CQUhpQixFQUdLLHNCQUhMLENBQW5COztBQU1BOzs7O0FBSUEsZUFBZSxTQUFTQyxRQUFULENBQWtCQyxHQUFsQixFQUF1QjtBQUNwQyxNQUFNQyxRQUFRQyxPQUFPQyxjQUFQLENBQXNCSCxHQUF0QixDQUFkO0FBQ0EsTUFBTUksWUFBWUYsT0FBT0csbUJBQVAsQ0FBMkJKLEtBQTNCLENBQWxCO0FBRm9DO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsVUFHekJLLEdBSHlCOztBQUlsQyxVQUFJLE9BQU9OLElBQUlNLEdBQUosQ0FBUCxLQUFvQixVQUF4QixFQUFvQztBQUNsQyxZQUFJLENBQUNSLFdBQVdTLElBQVgsQ0FBZ0I7QUFBQSxpQkFBUUQsUUFBUUUsSUFBaEI7QUFBQSxTQUFoQixDQUFMLEVBQTRDO0FBQzFDUixjQUFJTSxHQUFKLElBQVdOLElBQUlNLEdBQUosRUFBU0csSUFBVCxDQUFjVCxHQUFkLENBQVg7QUFDRDtBQUNGO0FBUmlDOztBQUdwQyx5QkFBa0JJLFNBQWxCLDhIQUE2QjtBQUFBO0FBTTVCO0FBVG1DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVckMiLCJmaWxlIjoiYXV0b2JpbmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuY29uc3QgUFJFREVGSU5FRCA9IFtcbiAgJ2NvbnN0cnVjdG9yJywgJ3JlbmRlcicsICdjb21wb25lbnRXaWxsTW91bnQnLCAnY29tcG9uZW50RGlkTW91bnQnLFxuICAnY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcycsICdzaG91bGRDb21wb25lbnRVcGRhdGUnLCAnY29tcG9uZW50V2lsbFVwZGF0ZScsXG4gICdjb21wb25lbnREaWRVcGRhdGUnLCAnY29tcG9uZW50V2lsbFVubW91bnQnXG5dO1xuXG4vKipcbiAqIEJpbmRzIHRoZSBcInRoaXNcIiBhcmd1bWVudCBvZiBhbGwgZnVuY3Rpb25zIG9uIGEgY2xhc3MgaW5zdGFuY2UgdG8gdGhlIGluc3RhbmNlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gY2xhc3MgaW5zdGFuY2UgKHR5cGljYWxseSBhIHJlYWN0IGNvbXBvbmVudClcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXV0b2JpbmQob2JqKSB7XG4gIGNvbnN0IHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG4gIGNvbnN0IHByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKTtcbiAgZm9yIChjb25zdCBrZXkgb2YgcHJvcE5hbWVzKSB7XG4gICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKCFQUkVERUZJTkVELmZpbmQobmFtZSA9PiBrZXkgPT09IG5hbWUpKSB7XG4gICAgICAgIG9ialtrZXldID0gb2JqW2tleV0uYmluZChvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19