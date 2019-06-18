var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import TransitionInterpolator from './transition-interpolator';
import { isValid, lerp, getEndValueByShortestPath } from './transition-utils';

import { Vector2 } from 'math.gl';
import { projectFlat, unprojectFlat } from 'viewport-mercator-project';
import assert from 'assert';

var EPSILON = 0.01;
var VIEWPORT_TRANSITION_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
var REQUIRED_PROPS = ['latitude', 'longitude', 'zoom', 'width', 'height'];
var LINEARLY_INTERPOLATED_PROPS = ['bearing', 'pitch'];
var LINEARLY_INTERPOLATED_PROPS_ALT = ['latitude', 'longitude', 'zoom'];

/**
 * This class adapts mapbox-gl-js Map#flyTo animation so it can be used in
 * react/redux architecture.
 * mapbox-gl-js flyTo : https://www.mapbox.com/mapbox-gl-js/api/#map#flyto.
 * It implements “Smooth and efficient zooming and panning.” algorithm by
 * "Jarke J. van Wijk and Wim A.A. Nuij"
*/

var ViewportFlyToInterpolator = function (_TransitionInterpolat) {
  _inherits(ViewportFlyToInterpolator, _TransitionInterpolat);

  function ViewportFlyToInterpolator() {
    _classCallCheck(this, ViewportFlyToInterpolator);

    var _this = _possibleConstructorReturn(this, (ViewportFlyToInterpolator.__proto__ || Object.getPrototypeOf(ViewportFlyToInterpolator)).call(this));

    _this.propNames = VIEWPORT_TRANSITION_PROPS;
    return _this;
  }

  _createClass(ViewportFlyToInterpolator, [{
    key: 'initializeProps',
    value: function initializeProps(startProps, endProps) {
      var startViewportProps = {};
      var endViewportProps = {};

      // Check minimum required props
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = REQUIRED_PROPS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = LINEARLY_INTERPOLATED_PROPS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _key = _step2.value;

          var _startValue = startProps[_key] || 0;
          var _endValue = endProps[_key] || 0;
          startViewportProps[_key] = _startValue;
          endViewportProps[_key] = getEndValueByShortestPath(_key, _startValue, _endValue);
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

      return {
        start: startViewportProps,
        end: endViewportProps
      };
    }
  }, {
    key: 'interpolateProps',
    value: function interpolateProps(startProps, endProps, t) {
      return viewportFlyToInterpolator(startProps, endProps, t);
    }
  }]);

  return ViewportFlyToInterpolator;
}(TransitionInterpolator);

/** Util functions */


export default ViewportFlyToInterpolator;
function zoomToScale(zoom) {
  return Math.pow(2, zoom);
}

function scaleToZoom(scale) {
  return Math.log2(scale);
}

/* eslint-disable max-statements */
function viewportFlyToInterpolator(startProps, endProps, t) {
  // Equations from above paper are referred where needed.

  var viewport = {};

  // TODO: add this as an option for applications.
  var rho = 1.414;

  var startZoom = startProps.zoom;
  var startCenter = [startProps.longitude, startProps.latitude];
  var startScale = zoomToScale(startZoom);
  var endZoom = endProps.zoom;
  var endCenter = [endProps.longitude, endProps.latitude];
  var scale = zoomToScale(endZoom - startZoom);

  var startCenterXY = new Vector2(projectFlat(startCenter, startScale));
  var endCenterXY = new Vector2(projectFlat(endCenter, startScale));
  var uDelta = endCenterXY.subtract(startCenterXY);

  var w0 = Math.max(startProps.width, startProps.height);
  var w1 = w0 / scale;
  var u1 = Math.sqrt(uDelta.x * uDelta.x + uDelta.y * uDelta.y);
  // u0 is treated as '0' in Eq (9).

  // Linearly interpolate 'bearing' and 'pitch' if exist.
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = LINEARLY_INTERPOLATED_PROPS[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _key2 = _step3.value;

      viewport[_key2] = lerp(startProps[_key2], endProps[_key2], t);
    }

    // If change in center is too small, do linear interpolaiton.
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

  if (Math.abs(u1) < EPSILON) {
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = LINEARLY_INTERPOLATED_PROPS_ALT[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var key = _step4.value;

        var startValue = startProps[key];
        var endValue = endProps[key];
        viewport[key] = lerp(startValue, endValue, t);
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

    return viewport;
  }

  // Implement Equation (9) from above algorithm.
  var rho2 = rho * rho;
  var b0 = (w1 * w1 - w0 * w0 + rho2 * rho2 * u1 * u1) / (2 * w0 * rho2 * u1);
  var b1 = (w1 * w1 - w0 * w0 - rho2 * rho2 * u1 * u1) / (2 * w1 * rho2 * u1);
  var r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
  var r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
  var S = (r1 - r0) / rho;
  var s = t * S;

  var w = Math.cosh(r0) / Math.cosh(r0 + rho * s);
  var u = w0 * ((Math.cosh(r0) * Math.tanh(r0 + rho * s) - Math.sinh(r0)) / rho2) / u1;

  var scaleIncrement = 1 / w; // Using w method for scaling.
  var newZoom = startZoom + scaleToZoom(scaleIncrement);

  var newCenter = unprojectFlat(startCenterXY.add(uDelta.scale(u)).scale(scaleIncrement), zoomToScale(newZoom));
  viewport.longitude = newCenter[0];
  viewport.latitude = newCenter[1];
  viewport.zoom = newZoom;
  return viewport;
}
/* eslint-enable max-statements */
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3RyYW5zaXRpb25zL3ZpZXdwb3J0LWZseS10by1pbnRlcnBvbGF0b3IuanMiXSwibmFtZXMiOlsiVHJhbnNpdGlvbkludGVycG9sYXRvciIsImlzVmFsaWQiLCJsZXJwIiwiZ2V0RW5kVmFsdWVCeVNob3J0ZXN0UGF0aCIsIlZlY3RvcjIiLCJwcm9qZWN0RmxhdCIsInVucHJvamVjdEZsYXQiLCJhc3NlcnQiLCJFUFNJTE9OIiwiVklFV1BPUlRfVFJBTlNJVElPTl9QUk9QUyIsIlJFUVVJUkVEX1BST1BTIiwiTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTIiwiTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTX0FMVCIsIlZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3IiLCJwcm9wTmFtZXMiLCJzdGFydFByb3BzIiwiZW5kUHJvcHMiLCJzdGFydFZpZXdwb3J0UHJvcHMiLCJlbmRWaWV3cG9ydFByb3BzIiwia2V5Iiwic3RhcnRWYWx1ZSIsImVuZFZhbHVlIiwic3RhcnQiLCJlbmQiLCJ0Iiwidmlld3BvcnRGbHlUb0ludGVycG9sYXRvciIsInpvb21Ub1NjYWxlIiwiem9vbSIsIk1hdGgiLCJwb3ciLCJzY2FsZVRvWm9vbSIsInNjYWxlIiwibG9nMiIsInZpZXdwb3J0IiwicmhvIiwic3RhcnRab29tIiwic3RhcnRDZW50ZXIiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsInN0YXJ0U2NhbGUiLCJlbmRab29tIiwiZW5kQ2VudGVyIiwic3RhcnRDZW50ZXJYWSIsImVuZENlbnRlclhZIiwidURlbHRhIiwic3VidHJhY3QiLCJ3MCIsIm1heCIsIndpZHRoIiwiaGVpZ2h0IiwidzEiLCJ1MSIsInNxcnQiLCJ4IiwieSIsImFicyIsInJobzIiLCJiMCIsImIxIiwicjAiLCJsb2ciLCJyMSIsIlMiLCJzIiwidyIsImNvc2giLCJ1IiwidGFuaCIsInNpbmgiLCJzY2FsZUluY3JlbWVudCIsIm5ld1pvb20iLCJuZXdDZW50ZXIiLCJh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QUFMLENBQVVNLEtBQUtBLEVBQUwsR0FBVSxDQUFwQixJQUF5QkEsRUFBbEMsQ0FBWDtBQUNBLE1BQU1JLElBQUksQ0FBQ0QsS0FBS0YsRUFBTixJQUFZekIsR0FBdEI7QUFDQSxNQUFNNkIsSUFBSXZDLElBQUlzQyxDQUFkOztBQUVBLE1BQU1FLElBQUtwQyxLQUFLcUMsSUFBTCxDQUFVTixFQUFWLElBQWdCL0IsS0FBS3FDLElBQUwsQ0FBVU4sS0FBS3pCLE1BQU02QixDQUFyQixDQUEzQjtBQUNBLE1BQU1HLElBQUlwQixNQUFNLENBQUNsQixLQUFLcUMsSUFBTCxDQUFVTixFQUFWLElBQWdCL0IsS0FBS3VDLElBQUwsQ0FBVVIsS0FBS3pCLE1BQU02QixDQUFyQixDQUFoQixHQUEwQ25DLEtBQUt3QyxJQUFMLENBQVVULEVBQVYsQ0FBM0MsSUFBNERILElBQWxFLElBQTBFTCxFQUFwRjs7QUFFQSxNQUFNa0IsaUJBQWlCLElBQUlMLENBQTNCLENBbkQwRCxDQW1ENUI7QUFDOUIsTUFBTU0sVUFBVW5DLFlBQVlMLFlBQVl1QyxjQUFaLENBQTVCOztBQUVBLE1BQU1FLFlBQVlqRSxjQUNmb0MsY0FBYzhCLEdBQWQsQ0FBa0I1QixPQUFPYixLQUFQLENBQWFtQyxDQUFiLENBQWxCLENBQUQsQ0FBcUNuQyxLQUFyQyxDQUEyQ3NDLGNBQTNDLENBRGdCLEVBRWhCM0MsWUFBWTRDLE9BQVosQ0FGZ0IsQ0FBbEI7QUFHQXJDLFdBQVNJLFNBQVQsR0FBcUJrQyxVQUFVLENBQVYsQ0FBckI7QUFDQXRDLFdBQVNLLFFBQVQsR0FBb0JpQyxVQUFVLENBQVYsQ0FBcEI7QUFDQXRDLFdBQVNOLElBQVQsR0FBZ0IyQyxPQUFoQjtBQUNBLFNBQU9yQyxRQUFQO0FBQ0Q7QUFDRCIsImZpbGUiOiJ2aWV3cG9ydC1mbHktdG8taW50ZXJwb2xhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRyYW5zaXRpb25JbnRlcnBvbGF0b3IgZnJvbSAnLi90cmFuc2l0aW9uLWludGVycG9sYXRvcic7XG5pbXBvcnQge2lzVmFsaWQsIGxlcnAsIGdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGh9IGZyb20gJy4vdHJhbnNpdGlvbi11dGlscyc7XG5cbmltcG9ydCB7VmVjdG9yMn0gZnJvbSAnbWF0aC5nbCc7XG5pbXBvcnQge3Byb2plY3RGbGF0LCB1bnByb2plY3RGbGF0fSBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgRVBTSUxPTiA9IDAuMDE7XG5jb25zdCBWSUVXUE9SVF9UUkFOU0lUSU9OX1BST1BTID0gWydsb25naXR1ZGUnLCAnbGF0aXR1ZGUnLCAnem9vbScsICdiZWFyaW5nJywgJ3BpdGNoJ107XG5jb25zdCBSRVFVSVJFRF9QUk9QUyA9IFsnbGF0aXR1ZGUnLCAnbG9uZ2l0dWRlJywgJ3pvb20nLCAnd2lkdGgnLCAnaGVpZ2h0J107XG5jb25zdCBMSU5FQVJMWV9JTlRFUlBPTEFURURfUFJPUFMgPSBbJ2JlYXJpbmcnLCAncGl0Y2gnXTtcbmNvbnN0IExJTkVBUkxZX0lOVEVSUE9MQVRFRF9QUk9QU19BTFQgPSBbJ2xhdGl0dWRlJywgJ2xvbmdpdHVkZScsICd6b29tJ107XG5cbi8qKlxuICogVGhpcyBjbGFzcyBhZGFwdHMgbWFwYm94LWdsLWpzIE1hcCNmbHlUbyBhbmltYXRpb24gc28gaXQgY2FuIGJlIHVzZWQgaW5cbiAqIHJlYWN0L3JlZHV4IGFyY2hpdGVjdHVyZS5cbiAqIG1hcGJveC1nbC1qcyBmbHlUbyA6IGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jbWFwI2ZseXRvLlxuICogSXQgaW1wbGVtZW50cyDigJxTbW9vdGggYW5kIGVmZmljaWVudCB6b29taW5nIGFuZCBwYW5uaW5nLuKAnSBhbGdvcml0aG0gYnlcbiAqIFwiSmFya2UgSi4gdmFuIFdpamsgYW5kIFdpbSBBLkEuIE51aWpcIlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdwb3J0Rmx5VG9JbnRlcnBvbGF0b3IgZXh0ZW5kcyBUcmFuc2l0aW9uSW50ZXJwb2xhdG9yIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucHJvcE5hbWVzID0gVklFV1BPUlRfVFJBTlNJVElPTl9QUk9QUztcbiAgfVxuXG4gIGluaXRpYWxpemVQcm9wcyhzdGFydFByb3BzLCBlbmRQcm9wcykge1xuICAgIGNvbnN0IHN0YXJ0Vmlld3BvcnRQcm9wcyA9IHt9O1xuICAgIGNvbnN0IGVuZFZpZXdwb3J0UHJvcHMgPSB7fTtcblxuICAgIC8vIENoZWNrIG1pbmltdW0gcmVxdWlyZWQgcHJvcHNcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBSRVFVSVJFRF9QUk9QUykge1xuICAgICAgY29uc3Qgc3RhcnRWYWx1ZSA9IHN0YXJ0UHJvcHNba2V5XTtcbiAgICAgIGNvbnN0IGVuZFZhbHVlID0gZW5kUHJvcHNba2V5XTtcbiAgICAgIGFzc2VydChpc1ZhbGlkKHN0YXJ0VmFsdWUpICYmIGlzVmFsaWQoZW5kVmFsdWUpLCBgJHtrZXl9IG11c3QgYmUgc3VwcGxpZWQgZm9yIHRyYW5zaXRpb25gKTtcbiAgICAgIHN0YXJ0Vmlld3BvcnRQcm9wc1trZXldID0gc3RhcnRWYWx1ZTtcbiAgICAgIGVuZFZpZXdwb3J0UHJvcHNba2V5XSA9IGdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGgoa2V5LCBzdGFydFZhbHVlLCBlbmRWYWx1ZSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTKSB7XG4gICAgICBjb25zdCBzdGFydFZhbHVlID0gc3RhcnRQcm9wc1trZXldIHx8IDA7XG4gICAgICBjb25zdCBlbmRWYWx1ZSA9IGVuZFByb3BzW2tleV0gfHwgMDtcbiAgICAgIHN0YXJ0Vmlld3BvcnRQcm9wc1trZXldID0gc3RhcnRWYWx1ZTtcbiAgICAgIGVuZFZpZXdwb3J0UHJvcHNba2V5XSA9IGdldEVuZFZhbHVlQnlTaG9ydGVzdFBhdGgoa2V5LCBzdGFydFZhbHVlLCBlbmRWYWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzdGFydFZpZXdwb3J0UHJvcHMsXG4gICAgICBlbmQ6IGVuZFZpZXdwb3J0UHJvcHNcbiAgICB9O1xuICB9XG5cbiAgaW50ZXJwb2xhdGVQcm9wcyhzdGFydFByb3BzLCBlbmRQcm9wcywgdCkge1xuICAgIHJldHVybiB2aWV3cG9ydEZseVRvSW50ZXJwb2xhdG9yKHN0YXJ0UHJvcHMsIGVuZFByb3BzLCB0KTtcbiAgfVxuXG59XG5cbi8qKiBVdGlsIGZ1bmN0aW9ucyAqL1xuZnVuY3Rpb24gem9vbVRvU2NhbGUoem9vbSkge1xuICByZXR1cm4gTWF0aC5wb3coMiwgem9vbSk7XG59XG5cbmZ1bmN0aW9uIHNjYWxlVG9ab29tKHNjYWxlKSB7XG4gIHJldHVybiBNYXRoLmxvZzIoc2NhbGUpO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuZnVuY3Rpb24gdmlld3BvcnRGbHlUb0ludGVycG9sYXRvcihzdGFydFByb3BzLCBlbmRQcm9wcywgdCkge1xuICAvLyBFcXVhdGlvbnMgZnJvbSBhYm92ZSBwYXBlciBhcmUgcmVmZXJyZWQgd2hlcmUgbmVlZGVkLlxuXG4gIGNvbnN0IHZpZXdwb3J0ID0ge307XG5cbiAgLy8gVE9ETzogYWRkIHRoaXMgYXMgYW4gb3B0aW9uIGZvciBhcHBsaWNhdGlvbnMuXG4gIGNvbnN0IHJobyA9IDEuNDE0O1xuXG4gIGNvbnN0IHN0YXJ0Wm9vbSA9IHN0YXJ0UHJvcHMuem9vbTtcbiAgY29uc3Qgc3RhcnRDZW50ZXIgPSBbc3RhcnRQcm9wcy5sb25naXR1ZGUsIHN0YXJ0UHJvcHMubGF0aXR1ZGVdO1xuICBjb25zdCBzdGFydFNjYWxlID0gem9vbVRvU2NhbGUoc3RhcnRab29tKTtcbiAgY29uc3QgZW5kWm9vbSA9IGVuZFByb3BzLnpvb207XG4gIGNvbnN0IGVuZENlbnRlciA9IFtlbmRQcm9wcy5sb25naXR1ZGUsIGVuZFByb3BzLmxhdGl0dWRlXTtcbiAgY29uc3Qgc2NhbGUgPSB6b29tVG9TY2FsZShlbmRab29tIC0gc3RhcnRab29tKTtcblxuICBjb25zdCBzdGFydENlbnRlclhZID0gbmV3IFZlY3RvcjIocHJvamVjdEZsYXQoc3RhcnRDZW50ZXIsIHN0YXJ0U2NhbGUpKTtcbiAgY29uc3QgZW5kQ2VudGVyWFkgPSBuZXcgVmVjdG9yMihwcm9qZWN0RmxhdChlbmRDZW50ZXIsIHN0YXJ0U2NhbGUpKTtcbiAgY29uc3QgdURlbHRhID0gZW5kQ2VudGVyWFkuc3VidHJhY3Qoc3RhcnRDZW50ZXJYWSk7XG5cbiAgY29uc3QgdzAgPSBNYXRoLm1heChzdGFydFByb3BzLndpZHRoLCBzdGFydFByb3BzLmhlaWdodCk7XG4gIGNvbnN0IHcxID0gdzAgLyBzY2FsZTtcbiAgY29uc3QgdTEgPSBNYXRoLnNxcnQoKHVEZWx0YS54ICogdURlbHRhLngpICsgKHVEZWx0YS55ICogdURlbHRhLnkpKTtcbiAgLy8gdTAgaXMgdHJlYXRlZCBhcyAnMCcgaW4gRXEgKDkpLlxuXG4gIC8vIExpbmVhcmx5IGludGVycG9sYXRlICdiZWFyaW5nJyBhbmQgJ3BpdGNoJyBpZiBleGlzdC5cbiAgZm9yIChjb25zdCBrZXkgb2YgTElORUFSTFlfSU5URVJQT0xBVEVEX1BST1BTKSB7XG4gICAgdmlld3BvcnRba2V5XSA9IGxlcnAoc3RhcnRQcm9wc1trZXldLCBlbmRQcm9wc1trZXldLCB0KTtcbiAgfVxuXG4gIC8vIElmIGNoYW5nZSBpbiBjZW50ZXIgaXMgdG9vIHNtYWxsLCBkbyBsaW5lYXIgaW50ZXJwb2xhaXRvbi5cbiAgaWYgKE1hdGguYWJzKHUxKSA8IEVQU0lMT04pIHtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBMSU5FQVJMWV9JTlRFUlBPTEFURURfUFJPUFNfQUxUKSB7XG4gICAgICBjb25zdCBzdGFydFZhbHVlID0gc3RhcnRQcm9wc1trZXldO1xuICAgICAgY29uc3QgZW5kVmFsdWUgPSBlbmRQcm9wc1trZXldO1xuICAgICAgdmlld3BvcnRba2V5XSA9IGxlcnAoc3RhcnRWYWx1ZSwgZW5kVmFsdWUsIHQpO1xuICAgIH1cbiAgICByZXR1cm4gdmlld3BvcnQ7XG4gIH1cblxuICAvLyBJbXBsZW1lbnQgRXF1YXRpb24gKDkpIGZyb20gYWJvdmUgYWxnb3JpdGhtLlxuICBjb25zdCByaG8yID0gcmhvICogcmhvO1xuICBjb25zdCBiMCA9ICh3MSAqIHcxIC0gdzAgKiB3MCArIHJobzIgKiByaG8yICogdTEgKiB1MSkgLyAoMiAqIHcwICogcmhvMiAqIHUxKTtcbiAgY29uc3QgYjEgPSAodzEgKiB3MSAtIHcwICogdzAgLSByaG8yICogcmhvMiAqIHUxICogdTEpIC8gKDIgKiB3MSAqIHJobzIgKiB1MSk7XG4gIGNvbnN0IHIwID0gTWF0aC5sb2coTWF0aC5zcXJ0KGIwICogYjAgKyAxKSAtIGIwKTtcbiAgY29uc3QgcjEgPSBNYXRoLmxvZyhNYXRoLnNxcnQoYjEgKiBiMSArIDEpIC0gYjEpO1xuICBjb25zdCBTID0gKHIxIC0gcjApIC8gcmhvO1xuICBjb25zdCBzID0gdCAqIFM7XG5cbiAgY29uc3QgdyA9IChNYXRoLmNvc2gocjApIC8gTWF0aC5jb3NoKHIwICsgcmhvICogcykpO1xuICBjb25zdCB1ID0gdzAgKiAoKE1hdGguY29zaChyMCkgKiBNYXRoLnRhbmgocjAgKyByaG8gKiBzKSAtIE1hdGguc2luaChyMCkpIC8gcmhvMikgLyB1MTtcblxuICBjb25zdCBzY2FsZUluY3JlbWVudCA9IDEgLyB3OyAvLyBVc2luZyB3IG1ldGhvZCBmb3Igc2NhbGluZy5cbiAgY29uc3QgbmV3Wm9vbSA9IHN0YXJ0Wm9vbSArIHNjYWxlVG9ab29tKHNjYWxlSW5jcmVtZW50KTtcblxuICBjb25zdCBuZXdDZW50ZXIgPSB1bnByb2plY3RGbGF0KFxuICAgIChzdGFydENlbnRlclhZLmFkZCh1RGVsdGEuc2NhbGUodSkpKS5zY2FsZShzY2FsZUluY3JlbWVudCksXG4gICAgem9vbVRvU2NhbGUobmV3Wm9vbSkpO1xuICB2aWV3cG9ydC5sb25naXR1ZGUgPSBuZXdDZW50ZXJbMF07XG4gIHZpZXdwb3J0LmxhdGl0dWRlID0gbmV3Q2VudGVyWzFdO1xuICB2aWV3cG9ydC56b29tID0gbmV3Wm9vbTtcbiAgcmV0dXJuIHZpZXdwb3J0O1xufVxuLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuIl19