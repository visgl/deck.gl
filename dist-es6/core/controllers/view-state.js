var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { Vector3, experimental } from 'math.gl';
var SphericalCoordinates = experimental.SphericalCoordinates;

import assert from 'assert';

var defaultState = {
  position: [0, 0, 0],
  lookAt: [0, 0, 0],
  up: [0, 0, 1],

  rotationX: 0,
  rotationY: 0,

  fov: 50,
  near: 1,
  far: 100
};

/* Helpers */

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

var DEFAULT_POSITION = [0, 0, 0];

var ViewState = function () {
  function ViewState(opts) {
    _classCallCheck(this, ViewState);

    var width = opts.width,
        height = opts.height,
        _opts$position = opts.position,
        position = _opts$position === undefined ? DEFAULT_POSITION : _opts$position,
        bearing = opts.bearing,
        pitch = opts.pitch,
        longitude = opts.longitude,
        latitude = opts.latitude,
        zoom = opts.zoom;


    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');

    this._viewportProps = this._applyConstraints(Object.assign({}, opts, {
      width: width,
      height: height,
      position: new Vector3(ensureFinite(position && position[0], defaultState.position[0]), ensureFinite(position && position[1], defaultState.position[1]), ensureFinite(position && position[2], defaultState.position[2])),
      bearing: ensureFinite(bearing, defaultState.bearing),
      pitch: ensureFinite(pitch, defaultState.pitch),
      longitude: longitude,
      latitude: latitude,
      zoom: zoom
    }));
  }

  _createClass(ViewState, [{
    key: 'getViewportProps',
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
    key: 'getDirection',
    value: function getDirection() {
      var spherical = new SphericalCoordinates({
        bearing: this._viewportProps.bearing,
        pitch: this._viewportProps.pitch
      });
      var direction = spherical.toVector3().normalize();
      return direction;
    }
  }, {
    key: 'getDirectionFromBearing',
    value: function getDirectionFromBearing(bearing) {
      var spherical = new SphericalCoordinates({
        bearing: bearing,
        pitch: 90
      });
      var direction = spherical.toVector3().normalize();
      return direction;
    }

    // Redefined by subclass
    // Apply any constraints (mathematical or defined by _viewportProps) to map state

  }, {
    key: '_applyConstraints',
    value: function _applyConstraints(props) {
      return props;
    }
  }]);

  return ViewState;
}();

export default ViewState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRyb2xsZXJzL3ZpZXctc3RhdGUuanMiXSwibmFtZXMiOlsiVmVjdG9yMyIsImV4cGVyaW1lbnRhbCIsIlNwaGVyaWNhbENvb3JkaW5hdGVzIiwiYXNzZXJ0IiwiZGVmYXVsdFN0YXRlIiwicG9zaXRpb24iLCJsb29rQXQiLCJ1cCIsInJvdGF0aW9uWCIsInJvdGF0aW9uWSIsImZvdiIsIm5lYXIiLCJmYXIiLCJlbnN1cmVGaW5pdGUiLCJ2YWx1ZSIsImZhbGxiYWNrVmFsdWUiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIkRFRkFVTFRfUE9TSVRJT04iLCJWaWV3U3RhdGUiLCJvcHRzIiwid2lkdGgiLCJoZWlnaHQiLCJiZWFyaW5nIiwicGl0Y2giLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsInpvb20iLCJfdmlld3BvcnRQcm9wcyIsIl9hcHBseUNvbnN0cmFpbnRzIiwiT2JqZWN0IiwiYXNzaWduIiwic3BoZXJpY2FsIiwiZGlyZWN0aW9uIiwidG9WZWN0b3IzIiwibm9ybWFsaXplIiwicHJvcHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxTQUFRQSxPQUFSLEVBQWlCQyxZQUFqQixRQUFvQyxTQUFwQztJQUNPQyxvQixHQUF3QkQsWSxDQUF4QkMsb0I7O0FBQ1AsT0FBT0MsTUFBUCxNQUFtQixRQUFuQjs7QUFFQSxJQUFNQyxlQUFlO0FBQ25CQyxZQUFVLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRFM7QUFFbkJDLFVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsQ0FGVztBQUduQkMsTUFBSSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUhlOztBQUtuQkMsYUFBVyxDQUxRO0FBTW5CQyxhQUFXLENBTlE7O0FBUW5CQyxPQUFLLEVBUmM7QUFTbkJDLFFBQU0sQ0FUYTtBQVVuQkMsT0FBSztBQVZjLENBQXJCOztBQWFBOztBQUVBLFNBQVNDLFlBQVQsQ0FBc0JDLEtBQXRCLEVBQTZCQyxhQUE3QixFQUE0QztBQUMxQyxTQUFPQyxPQUFPQyxRQUFQLENBQWdCSCxLQUFoQixJQUF5QkEsS0FBekIsR0FBaUNDLGFBQXhDO0FBQ0Q7O0FBRUQsSUFBTUcsbUJBQW1CLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQXpCOztJQUVxQkMsUztBQUNuQixxQkFBWUMsSUFBWixFQUFrQjtBQUFBOztBQUFBLFFBR2RDLEtBSGMsR0FnQlpELElBaEJZLENBR2RDLEtBSGM7QUFBQSxRQUlkQyxNQUpjLEdBZ0JaRixJQWhCWSxDQUlkRSxNQUpjO0FBQUEseUJBZ0JaRixJQWhCWSxDQU9kZixRQVBjO0FBQUEsUUFPZEEsUUFQYyxrQ0FPSGEsZ0JBUEc7QUFBQSxRQVNkSyxPQVRjLEdBZ0JaSCxJQWhCWSxDQVNkRyxPQVRjO0FBQUEsUUFVZEMsS0FWYyxHQWdCWkosSUFoQlksQ0FVZEksS0FWYztBQUFBLFFBYWRDLFNBYmMsR0FnQlpMLElBaEJZLENBYWRLLFNBYmM7QUFBQSxRQWNkQyxRQWRjLEdBZ0JaTixJQWhCWSxDQWNkTSxRQWRjO0FBQUEsUUFlZEMsSUFmYyxHQWdCWlAsSUFoQlksQ0FlZE8sSUFmYzs7O0FBa0JoQnhCLFdBQU9hLE9BQU9DLFFBQVAsQ0FBZ0JJLEtBQWhCLENBQVAsRUFBK0IsMEJBQS9CO0FBQ0FsQixXQUFPYSxPQUFPQyxRQUFQLENBQWdCSyxNQUFoQixDQUFQLEVBQWdDLDJCQUFoQzs7QUFFQSxTQUFLTSxjQUFMLEdBQXNCLEtBQUtDLGlCQUFMLENBQXVCQyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQlgsSUFBbEIsRUFBd0I7QUFDbkVDLGtCQURtRTtBQUVuRUMsb0JBRm1FO0FBR25FakIsZ0JBQVUsSUFBSUwsT0FBSixDQUNSYSxhQUFhUixZQUFZQSxTQUFTLENBQVQsQ0FBekIsRUFBc0NELGFBQWFDLFFBQWIsQ0FBc0IsQ0FBdEIsQ0FBdEMsQ0FEUSxFQUVSUSxhQUFhUixZQUFZQSxTQUFTLENBQVQsQ0FBekIsRUFBc0NELGFBQWFDLFFBQWIsQ0FBc0IsQ0FBdEIsQ0FBdEMsQ0FGUSxFQUdSUSxhQUFhUixZQUFZQSxTQUFTLENBQVQsQ0FBekIsRUFBc0NELGFBQWFDLFFBQWIsQ0FBc0IsQ0FBdEIsQ0FBdEMsQ0FIUSxDQUh5RDtBQVFuRWtCLGVBQVNWLGFBQWFVLE9BQWIsRUFBc0JuQixhQUFhbUIsT0FBbkMsQ0FSMEQ7QUFTbkVDLGFBQU9YLGFBQWFXLEtBQWIsRUFBb0JwQixhQUFhb0IsS0FBakMsQ0FUNEQ7QUFVbkVDLDBCQVZtRTtBQVduRUMsd0JBWG1FO0FBWW5FQztBQVptRSxLQUF4QixDQUF2QixDQUF0QjtBQWNEOzs7O3VDQUVrQjtBQUNqQixhQUFPLEtBQUtDLGNBQVo7QUFDRDs7O21DQUVjO0FBQ2IsVUFBTUksWUFBWSxJQUFJOUIsb0JBQUosQ0FBeUI7QUFDekNxQixpQkFBUyxLQUFLSyxjQUFMLENBQW9CTCxPQURZO0FBRXpDQyxlQUFPLEtBQUtJLGNBQUwsQ0FBb0JKO0FBRmMsT0FBekIsQ0FBbEI7QUFJQSxVQUFNUyxZQUFZRCxVQUFVRSxTQUFWLEdBQXNCQyxTQUF0QixFQUFsQjtBQUNBLGFBQU9GLFNBQVA7QUFDRDs7OzRDQUV1QlYsTyxFQUFTO0FBQy9CLFVBQU1TLFlBQVksSUFBSTlCLG9CQUFKLENBQXlCO0FBQ3pDcUIsd0JBRHlDO0FBRXpDQyxlQUFPO0FBRmtDLE9BQXpCLENBQWxCO0FBSUEsVUFBTVMsWUFBWUQsVUFBVUUsU0FBVixHQUFzQkMsU0FBdEIsRUFBbEI7QUFDQSxhQUFPRixTQUFQO0FBQ0Q7O0FBRUQ7QUFDQTs7OztzQ0FDa0JHLEssRUFBTztBQUN2QixhQUFPQSxLQUFQO0FBQ0Q7Ozs7OztlQWhFa0JqQixTIiwiZmlsZSI6InZpZXctc3RhdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1ZlY3RvcjMsIGV4cGVyaW1lbnRhbH0gZnJvbSAnbWF0aC5nbCc7XG5jb25zdCB7U3BoZXJpY2FsQ29vcmRpbmF0ZXN9ID0gZXhwZXJpbWVudGFsO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBkZWZhdWx0U3RhdGUgPSB7XG4gIHBvc2l0aW9uOiBbMCwgMCwgMF0sXG4gIGxvb2tBdDogWzAsIDAsIDBdLFxuICB1cDogWzAsIDAsIDFdLFxuXG4gIHJvdGF0aW9uWDogMCxcbiAgcm90YXRpb25ZOiAwLFxuXG4gIGZvdjogNTAsXG4gIG5lYXI6IDEsXG4gIGZhcjogMTAwXG59O1xuXG4vKiBIZWxwZXJzICovXG5cbmZ1bmN0aW9uIGVuc3VyZUZpbml0ZSh2YWx1ZSwgZmFsbGJhY2tWYWx1ZSkge1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZmFsbGJhY2tWYWx1ZTtcbn1cblxuY29uc3QgREVGQVVMVF9QT1NJVElPTiA9IFswLCAwLCAwXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlld1N0YXRlIHtcbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIGNvbnN0IHtcbiAgICAgIC8qIFZpZXdwb3J0IGFyZ3VtZW50cyAqL1xuICAgICAgd2lkdGgsIC8vIFdpZHRoIG9mIHZpZXdwb3J0XG4gICAgICBoZWlnaHQsIC8vIEhlaWdodCBvZiB2aWV3cG9ydFxuXG4gICAgICAvLyBQb3NpdGlvbiBhbmQgb3JpZW50YXRpb25cbiAgICAgIHBvc2l0aW9uID0gREVGQVVMVF9QT1NJVElPTiwgLy8gdHlwaWNhbGx5IGluIG1ldGVycyBmcm9tIGFuY2hvciBwb2ludFxuXG4gICAgICBiZWFyaW5nLCAvLyBSb3RhdGlvbiBhcm91bmQgeSBheGlzXG4gICAgICBwaXRjaCwgLy8gUm90YXRpb24gYXJvdW5kIHggYXhpc1xuXG4gICAgICAvLyBHZW9zcGF0aWFsIGFuY2hvclxuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgbGF0aXR1ZGUsXG4gICAgICB6b29tXG4gICAgfSA9IG9wdHM7XG5cbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHdpZHRoKSwgJ2B3aWR0aGAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoaGVpZ2h0KSwgJ2BoZWlnaHRgIG11c3QgYmUgc3VwcGxpZWQnKTtcblxuICAgIHRoaXMuX3ZpZXdwb3J0UHJvcHMgPSB0aGlzLl9hcHBseUNvbnN0cmFpbnRzKE9iamVjdC5hc3NpZ24oe30sIG9wdHMsIHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKFxuICAgICAgICBlbnN1cmVGaW5pdGUocG9zaXRpb24gJiYgcG9zaXRpb25bMF0sIGRlZmF1bHRTdGF0ZS5wb3NpdGlvblswXSksXG4gICAgICAgIGVuc3VyZUZpbml0ZShwb3NpdGlvbiAmJiBwb3NpdGlvblsxXSwgZGVmYXVsdFN0YXRlLnBvc2l0aW9uWzFdKSxcbiAgICAgICAgZW5zdXJlRmluaXRlKHBvc2l0aW9uICYmIHBvc2l0aW9uWzJdLCBkZWZhdWx0U3RhdGUucG9zaXRpb25bMl0pXG4gICAgICApLFxuICAgICAgYmVhcmluZzogZW5zdXJlRmluaXRlKGJlYXJpbmcsIGRlZmF1bHRTdGF0ZS5iZWFyaW5nKSxcbiAgICAgIHBpdGNoOiBlbnN1cmVGaW5pdGUocGl0Y2gsIGRlZmF1bHRTdGF0ZS5waXRjaCksXG4gICAgICBsb25naXR1ZGUsXG4gICAgICBsYXRpdHVkZSxcbiAgICAgIHpvb21cbiAgICB9KSk7XG4gIH1cblxuICBnZXRWaWV3cG9ydFByb3BzKCkge1xuICAgIHJldHVybiB0aGlzLl92aWV3cG9ydFByb3BzO1xuICB9XG5cbiAgZ2V0RGlyZWN0aW9uKCkge1xuICAgIGNvbnN0IHNwaGVyaWNhbCA9IG5ldyBTcGhlcmljYWxDb29yZGluYXRlcyh7XG4gICAgICBiZWFyaW5nOiB0aGlzLl92aWV3cG9ydFByb3BzLmJlYXJpbmcsXG4gICAgICBwaXRjaDogdGhpcy5fdmlld3BvcnRQcm9wcy5waXRjaFxuICAgIH0pO1xuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHNwaGVyaWNhbC50b1ZlY3RvcjMoKS5ub3JtYWxpemUoKTtcbiAgICByZXR1cm4gZGlyZWN0aW9uO1xuICB9XG5cbiAgZ2V0RGlyZWN0aW9uRnJvbUJlYXJpbmcoYmVhcmluZykge1xuICAgIGNvbnN0IHNwaGVyaWNhbCA9IG5ldyBTcGhlcmljYWxDb29yZGluYXRlcyh7XG4gICAgICBiZWFyaW5nLFxuICAgICAgcGl0Y2g6IDkwXG4gICAgfSk7XG4gICAgY29uc3QgZGlyZWN0aW9uID0gc3BoZXJpY2FsLnRvVmVjdG9yMygpLm5vcm1hbGl6ZSgpO1xuICAgIHJldHVybiBkaXJlY3Rpb247XG4gIH1cblxuICAvLyBSZWRlZmluZWQgYnkgc3ViY2xhc3NcbiAgLy8gQXBwbHkgYW55IGNvbnN0cmFpbnRzIChtYXRoZW1hdGljYWwgb3IgZGVmaW5lZCBieSBfdmlld3BvcnRQcm9wcykgdG8gbWFwIHN0YXRlXG4gIF9hcHBseUNvbnN0cmFpbnRzKHByb3BzKSB7XG4gICAgcmV0dXJuIHByb3BzO1xuICB9XG59XG4iXX0=