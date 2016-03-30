'use strict';

require('babel-polyfill');

var _index = require('./index');

var DeckGL = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* Generate script that can be used in browser without browserify */

/* global window */


(function exposeAsGlobal() {
  if (typeof window !== 'undefined') {
    window.DeckGL = DeckGL;
  }
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9idW5kbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQTs7QUFDQTs7SUFBWTs7Ozs7Ozs7O0FBRVosQ0FBQyxTQUFTLGNBQVQsR0FBMEI7QUFDekIsTUFBSSxPQUFPLE1BQVAsS0FBa0IsV0FBbEIsRUFBK0I7QUFDakMsV0FBTyxNQUFQLEdBQWdCLE1BQWhCLENBRGlDO0dBQW5DO0NBREQsR0FBRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBHZW5lcmF0ZSBzY3JpcHQgdGhhdCBjYW4gYmUgdXNlZCBpbiBicm93c2VyIHdpdGhvdXQgYnJvd3NlcmlmeSAqL1xuXG4vKiBnbG9iYWwgd2luZG93ICovXG5pbXBvcnQgJ2JhYmVsLXBvbHlmaWxsJztcbmltcG9ydCAqIGFzIERlY2tHTCBmcm9tICcuL2luZGV4JztcblxuKGZ1bmN0aW9uIGV4cG9zZUFzR2xvYmFsKCkge1xuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB3aW5kb3cuRGVja0dMID0gRGVja0dMO1xuICB9XG59KCkpO1xuIl19