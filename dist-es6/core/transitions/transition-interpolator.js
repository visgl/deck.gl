var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { equals } from 'math.gl';
import assert from 'assert';

var TransitionInterpolator = function () {
  function TransitionInterpolator() {
    _classCallCheck(this, TransitionInterpolator);
  }

  _createClass(TransitionInterpolator, [{
    key: 'arePropsEqual',


    /**
     * Checks if two sets of props need transition in between
     * @param currentProps {object} - a list of viewport props
     * @param nextProps {object} - a list of viewport props
     * @returns {bool} - true if two props are equivalent
     */
    value: function arePropsEqual(currentProps, nextProps) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (this.propNames || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          if (!equals(currentProps[key], nextProps[key])) {
            return false;
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

      return true;
    }

    /**
     * Called before transition starts to validate/pre-process start and end props
     * @param startProps {object} - a list of starting viewport props
     * @param endProps {object} - a list of target viewport props
     * @returns {Object} {start, end} - start and end props to be passed
     *   to `interpolateProps`
     */

  }, {
    key: 'initializeProps',
    value: function initializeProps(startProps, endProps) {
      return { start: startProps, end: endProps };
    }

    /**
     * Returns viewport props in transition
     * @param startProps {object} - a list of starting viewport props
     * @param endProps {object} - a list of target viewport props
     * @param t {number} - a time factor between [0, 1]
     * @returns {object} - a list of interpolated viewport props
     */

  }, {
    key: 'interpolateProps',
    value: function interpolateProps(startProps, endProps, t) {
      assert(false, 'interpolateProps is not implemented');
    }
  }]);

  return TransitionInterpolator;
}();

export default TransitionInterpolator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3RyYW5zaXRpb25zL3RyYW5zaXRpb24taW50ZXJwb2xhdG9yLmpzIl0sIm5hbWVzIjpbImVxdWFscyIsImFzc2VydCIsIlRyYW5zaXRpb25JbnRlcnBvbGF0b3IiLCJjdXJyZW50UHJvcHMiLCJuZXh0UHJvcHMiLCJwcm9wTmFtZXMiLCJrZXkiLCJzdGFydFByb3BzIiwiZW5kUHJvcHMiLCJzdGFydCIsImVuZCIsInQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxTQUFRQSxNQUFSLFFBQXFCLFNBQXJCO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQixRQUFuQjs7SUFFcUJDLHNCOzs7Ozs7Ozs7QUFFbkI7Ozs7OztrQ0FNY0MsWSxFQUFjQyxTLEVBQVc7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDckMsOEJBQW1CLEtBQUtDLFNBQUwsSUFBa0IsRUFBckMsK0hBQTBDO0FBQUEsY0FBL0JDLEdBQStCOztBQUN4QyxjQUFJLENBQUNOLE9BQU9HLGFBQWFHLEdBQWIsQ0FBUCxFQUEwQkYsVUFBVUUsR0FBVixDQUExQixDQUFMLEVBQWdEO0FBQzlDLG1CQUFPLEtBQVA7QUFDRDtBQUNGO0FBTG9DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBTXJDLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7O29DQU9nQkMsVSxFQUFZQyxRLEVBQVU7QUFDcEMsYUFBTyxFQUFDQyxPQUFPRixVQUFSLEVBQW9CRyxLQUFLRixRQUF6QixFQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7cUNBT2lCRCxVLEVBQVlDLFEsRUFBVUcsQyxFQUFHO0FBQ3hDVixhQUFPLEtBQVAsRUFBYyxxQ0FBZDtBQUNEOzs7Ozs7ZUFyQ2tCQyxzQiIsImZpbGUiOiJ0cmFuc2l0aW9uLWludGVycG9sYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7ZXF1YWxzfSBmcm9tICdtYXRoLmdsJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhbnNpdGlvbkludGVycG9sYXRvciB7XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0d28gc2V0cyBvZiBwcm9wcyBuZWVkIHRyYW5zaXRpb24gaW4gYmV0d2VlblxuICAgKiBAcGFyYW0gY3VycmVudFByb3BzIHtvYmplY3R9IC0gYSBsaXN0IG9mIHZpZXdwb3J0IHByb3BzXG4gICAqIEBwYXJhbSBuZXh0UHJvcHMge29iamVjdH0gLSBhIGxpc3Qgb2Ygdmlld3BvcnQgcHJvcHNcbiAgICogQHJldHVybnMge2Jvb2x9IC0gdHJ1ZSBpZiB0d28gcHJvcHMgYXJlIGVxdWl2YWxlbnRcbiAgICovXG4gIGFyZVByb3BzRXF1YWwoY3VycmVudFByb3BzLCBuZXh0UHJvcHMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiAodGhpcy5wcm9wTmFtZXMgfHwgW10pKSB7XG4gICAgICBpZiAoIWVxdWFscyhjdXJyZW50UHJvcHNba2V5XSwgbmV4dFByb3BzW2tleV0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIGJlZm9yZSB0cmFuc2l0aW9uIHN0YXJ0cyB0byB2YWxpZGF0ZS9wcmUtcHJvY2VzcyBzdGFydCBhbmQgZW5kIHByb3BzXG4gICAqIEBwYXJhbSBzdGFydFByb3BzIHtvYmplY3R9IC0gYSBsaXN0IG9mIHN0YXJ0aW5nIHZpZXdwb3J0IHByb3BzXG4gICAqIEBwYXJhbSBlbmRQcm9wcyB7b2JqZWN0fSAtIGEgbGlzdCBvZiB0YXJnZXQgdmlld3BvcnQgcHJvcHNcbiAgICogQHJldHVybnMge09iamVjdH0ge3N0YXJ0LCBlbmR9IC0gc3RhcnQgYW5kIGVuZCBwcm9wcyB0byBiZSBwYXNzZWRcbiAgICogICB0byBgaW50ZXJwb2xhdGVQcm9wc2BcbiAgICovXG4gIGluaXRpYWxpemVQcm9wcyhzdGFydFByb3BzLCBlbmRQcm9wcykge1xuICAgIHJldHVybiB7c3RhcnQ6IHN0YXJ0UHJvcHMsIGVuZDogZW5kUHJvcHN9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdmlld3BvcnQgcHJvcHMgaW4gdHJhbnNpdGlvblxuICAgKiBAcGFyYW0gc3RhcnRQcm9wcyB7b2JqZWN0fSAtIGEgbGlzdCBvZiBzdGFydGluZyB2aWV3cG9ydCBwcm9wc1xuICAgKiBAcGFyYW0gZW5kUHJvcHMge29iamVjdH0gLSBhIGxpc3Qgb2YgdGFyZ2V0IHZpZXdwb3J0IHByb3BzXG4gICAqIEBwYXJhbSB0IHtudW1iZXJ9IC0gYSB0aW1lIGZhY3RvciBiZXR3ZWVuIFswLCAxXVxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSAtIGEgbGlzdCBvZiBpbnRlcnBvbGF0ZWQgdmlld3BvcnQgcHJvcHNcbiAgICovXG4gIGludGVycG9sYXRlUHJvcHMoc3RhcnRQcm9wcywgZW5kUHJvcHMsIHQpIHtcbiAgICBhc3NlcnQoZmFsc2UsICdpbnRlcnBvbGF0ZVByb3BzIGlzIG5vdCBpbXBsZW1lbnRlZCcpO1xuICB9XG5cbn1cbiJdfQ==