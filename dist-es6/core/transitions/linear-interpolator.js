var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import TransitionInterpolator from './transition-interpolator';
import { isValid, lerp, getEndValueByShortestPath } from './transition-utils';
import assert from 'assert';

var VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];

/**
 * Performs linear interpolation of two viewports.
*/

var LinearInterpolator = function (_TransitionInterpolat) {
  _inherits(LinearInterpolator, _TransitionInterpolat);

  /**
   * @param {Array} transitionProps - list of props to apply linear transition to.
   */
  function LinearInterpolator() {
    var transitionProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : VIEWPORT_TRANSITION_PROPS;

    _classCallCheck(this, LinearInterpolator);

    var _this = _possibleConstructorReturn(this, (LinearInterpolator.__proto__ || Object.getPrototypeOf(LinearInterpolator)).call(this));

    _this.propNames = transitionProps;
    return _this;
  }

  _createClass(LinearInterpolator, [{
    key: 'initializeProps',
    value: function initializeProps(startProps, endProps) {
      var startViewportProps = {};
      var endViewportProps = {};

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.propNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var startValue = startProps[key];
          var endValue = endProps[key];
          assert(isValid(startValue) && isValid(endValue), key + ' must be supplied for transition');

          startViewportProps[key] = startValue;
          endViewportProps[key] = getEndValueByShortestPath(key, startValue, endValue);
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

      return {
        start: startViewportProps,
        end: endViewportProps
      };
    }
  }, {
    key: 'interpolateProps',
    value: function interpolateProps(startProps, endProps, t) {
      var viewport = {};
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.propNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var key = _step2.value;

          viewport[key] = lerp(startProps[key], endProps[key], t);
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

      return viewport;
    }
  }]);

  return LinearInterpolator;
}(TransitionInterpolator);

export default LinearInterpolator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3RyYW5zaXRpb25zL2xpbmVhci1pbnRlcnBvbGF0b3IuanMiXSwibmFtZXMiOlsiVHJhbnNpdGlvbkludGVycG9sYXRvciIsImlzVmFsaWQiLCJsZXJwIiwiZ2V0RW5kVmFsdWVCeVNob3J0ZXN0UGF0aCIsImFzc2VydCIsIlZJRVdQT1JUX1RSQU5TSVRJT05fUFJPUFMiLCJMaW5lYXJJbnRlcnBvbGF0b3IiLCJ0cmFuc2l0aW9uUHJvcHMiLCJwcm9wTmFtZXMiLCJzdGFydFByb3BzIiwiZW5kUHJvcHMiLCJzdGFydFZpZXdwb3J0UHJvcHMiLCJlbmRWaWV3cG9ydFByb3BzIiwia2V5Iiwic3RhcnRWYWx1ZSIsImVuZFZhbHVlIiwic3RhcnQiLCJlbmQiLCJ0Iiwidmlld3BvcnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsT0FBT0Esc0JBQVAsTUFBbUMsMkJBQW5DO0FBQ0EsU0FBUUMsT0FBUixFQUFpQkMsSUFBakIsRUFBdUJDLHlCQUF2QixRQUF1RCxvQkFBdkQ7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5COztBQUVBLElBQU1DLDRCQUE0QixDQUFDLFdBQUQsRUFBYyxVQUFkLEVBQTBCLE1BQTFCLEVBQWtDLFNBQWxDLEVBQTZDLE9BQTdDLENBQWxDOztBQUVBOzs7O0lBR3FCQyxrQjs7O0FBRW5COzs7QUFHQSxnQ0FBeUQ7QUFBQSxRQUE3Q0MsZUFBNkMsdUVBQTNCRix5QkFBMkI7O0FBQUE7O0FBQUE7O0FBRXZELFVBQUtHLFNBQUwsR0FBaUJELGVBQWpCO0FBRnVEO0FBR3hEOzs7O29DQUVlRSxVLEVBQVlDLFEsRUFBVTtBQUNwQyxVQUFNQyxxQkFBcUIsRUFBM0I7QUFDQSxVQUFNQyxtQkFBbUIsRUFBekI7O0FBRm9DO0FBQUE7QUFBQTs7QUFBQTtBQUlwQyw2QkFBa0IsS0FBS0osU0FBdkIsOEhBQWtDO0FBQUEsY0FBdkJLLEdBQXVCOztBQUNoQyxjQUFNQyxhQUFhTCxXQUFXSSxHQUFYLENBQW5CO0FBQ0EsY0FBTUUsV0FBV0wsU0FBU0csR0FBVCxDQUFqQjtBQUNBVCxpQkFBT0gsUUFBUWEsVUFBUixLQUF1QmIsUUFBUWMsUUFBUixDQUE5QixFQUFvREYsR0FBcEQ7O0FBRUFGLDZCQUFtQkUsR0FBbkIsSUFBMEJDLFVBQTFCO0FBQ0FGLDJCQUFpQkMsR0FBakIsSUFBd0JWLDBCQUEwQlUsR0FBMUIsRUFBK0JDLFVBQS9CLEVBQTJDQyxRQUEzQyxDQUF4QjtBQUNEO0FBWG1DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBYXBDLGFBQU87QUFDTEMsZUFBT0wsa0JBREY7QUFFTE0sYUFBS0w7QUFGQSxPQUFQO0FBSUQ7OztxQ0FFZ0JILFUsRUFBWUMsUSxFQUFVUSxDLEVBQUc7QUFDeEMsVUFBTUMsV0FBVyxFQUFqQjtBQUR3QztBQUFBO0FBQUE7O0FBQUE7QUFFeEMsOEJBQWtCLEtBQUtYLFNBQXZCLG1JQUFrQztBQUFBLGNBQXZCSyxHQUF1Qjs7QUFDaENNLG1CQUFTTixHQUFULElBQWdCWCxLQUFLTyxXQUFXSSxHQUFYLENBQUwsRUFBc0JILFNBQVNHLEdBQVQsQ0FBdEIsRUFBcUNLLENBQXJDLENBQWhCO0FBQ0Q7QUFKdUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLeEMsYUFBT0MsUUFBUDtBQUNEOzs7O0VBbkM2Q25CLHNCOztlQUEzQk0sa0IiLCJmaWxlIjoibGluZWFyLWludGVycG9sYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIGZyb20gJy4vdHJhbnNpdGlvbi1pbnRlcnBvbGF0b3InO1xuaW1wb3J0IHtpc1ZhbGlkLCBsZXJwLCBnZXRFbmRWYWx1ZUJ5U2hvcnRlc3RQYXRofSBmcm9tICcuL3RyYW5zaXRpb24tdXRpbHMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBWSUVXUE9SVF9UUkFOU0lUSU9OX1BST1BTID0gWydsb25naXR1ZGUnLCAnbGF0aXR1ZGUnLCAnem9vbScsICdiZWFyaW5nJywgJ3BpdGNoJ107XG5cbi8qKlxuICogUGVyZm9ybXMgbGluZWFyIGludGVycG9sYXRpb24gb2YgdHdvIHZpZXdwb3J0cy5cbiovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW5lYXJJbnRlcnBvbGF0b3IgZXh0ZW5kcyBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtBcnJheX0gdHJhbnNpdGlvblByb3BzIC0gbGlzdCBvZiBwcm9wcyB0byBhcHBseSBsaW5lYXIgdHJhbnNpdGlvbiB0by5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHRyYW5zaXRpb25Qcm9wcyA9IFZJRVdQT1JUX1RSQU5TSVRJT05fUFJPUFMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucHJvcE5hbWVzID0gdHJhbnNpdGlvblByb3BzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVByb3BzKHN0YXJ0UHJvcHMsIGVuZFByb3BzKSB7XG4gICAgY29uc3Qgc3RhcnRWaWV3cG9ydFByb3BzID0ge307XG4gICAgY29uc3QgZW5kVmlld3BvcnRQcm9wcyA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5wcm9wTmFtZXMpIHtcbiAgICAgIGNvbnN0IHN0YXJ0VmFsdWUgPSBzdGFydFByb3BzW2tleV07XG4gICAgICBjb25zdCBlbmRWYWx1ZSA9IGVuZFByb3BzW2tleV07XG4gICAgICBhc3NlcnQoaXNWYWxpZChzdGFydFZhbHVlKSAmJiBpc1ZhbGlkKGVuZFZhbHVlKSwgYCR7a2V5fSBtdXN0IGJlIHN1cHBsaWVkIGZvciB0cmFuc2l0aW9uYCk7XG5cbiAgICAgIHN0YXJ0Vmlld3BvcnRQcm9wc1trZXldID0gc3RhcnRWYWx1ZTtcbiAgICAgIGVuZFZpZXdwb3J0UHJvcHNba2V5XSA9IGdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGgoa2V5LCBzdGFydFZhbHVlLCBlbmRWYWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzdGFydFZpZXdwb3J0UHJvcHMsXG4gICAgICBlbmQ6IGVuZFZpZXdwb3J0UHJvcHNcbiAgICB9O1xuICB9XG5cbiAgaW50ZXJwb2xhdGVQcm9wcyhzdGFydFByb3BzLCBlbmRQcm9wcywgdCkge1xuICAgIGNvbnN0IHZpZXdwb3J0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5wcm9wTmFtZXMpIHtcbiAgICAgIHZpZXdwb3J0W2tleV0gPSBsZXJwKHN0YXJ0UHJvcHNba2V5XSwgZW5kUHJvcHNba2V5XSwgdCk7XG4gICAgfVxuICAgIHJldHVybiB2aWV3cG9ydDtcbiAgfVxuXG59XG4iXX0=