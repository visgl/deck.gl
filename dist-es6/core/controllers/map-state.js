var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import ViewState from './view-state';
import PerspectiveMercatorViewport from '../viewports/web-mercator-viewport';
import assert from 'assert';
import { mod } from '../utils/math-utils';

// MAPBOX LIMITS
export var MAPBOX_LIMITS = {
  minZoom: 0,
  maxZoom: 20,
  minPitch: 0,
  maxPitch: 60
};

var defaultState = {
  pitch: 0,
  bearing: 0,
  altitude: 1.5
};

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

var MapState = function (_ViewState) {
  _inherits(MapState, _ViewState);

  function MapState() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        width = _ref.width,
        height = _ref.height,
        latitude = _ref.latitude,
        longitude = _ref.longitude,
        zoom = _ref.zoom,
        bearing = _ref.bearing,
        pitch = _ref.pitch,
        altitude = _ref.altitude,
        maxZoom = _ref.maxZoom,
        minZoom = _ref.minZoom,
        maxPitch = _ref.maxPitch,
        minPitch = _ref.minPitch,
        startPanLngLat = _ref.startPanLngLat,
        startZoomLngLat = _ref.startZoomLngLat,
        startBearing = _ref.startBearing,
        startPitch = _ref.startPitch,
        startZoom = _ref.startZoom;

    _classCallCheck(this, MapState);

    assert(Number.isFinite(longitude), '`longitude` must be supplied');
    assert(Number.isFinite(latitude), '`latitude` must be supplied');
    assert(Number.isFinite(zoom), '`zoom` must be supplied');

    var _this = _possibleConstructorReturn(this, (MapState.__proto__ || Object.getPrototypeOf(MapState)).call(this, {
      width: width,
      height: height,
      latitude: latitude,
      longitude: longitude,
      zoom: zoom,
      bearing: bearing,
      pitch: pitch,

      altitude: ensureFinite(altitude, defaultState.altitude),
      maxZoom: ensureFinite(maxZoom, MAPBOX_LIMITS.maxZoom),
      minZoom: ensureFinite(minZoom, MAPBOX_LIMITS.minZoom),
      maxPitch: ensureFinite(maxPitch, MAPBOX_LIMITS.maxPitch),
      minPitch: ensureFinite(minPitch, MAPBOX_LIMITS.minPitch)
    }));

    _this._interactiveState = {
      startPanLngLat: startPanLngLat,
      startZoomLngLat: startZoomLngLat,
      startBearing: startBearing,
      startPitch: startPitch,
      startZoom: startZoom
    };
    return _this;
  }

  /* Public API */

  _createClass(MapState, [{
    key: 'getInteractiveState',
    value: function getInteractiveState() {
      return this._interactiveState;
    }

    /**
     * Start panning
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'panStart',
    value: function panStart(_ref2) {
      var pos = _ref2.pos;

      return this._getUpdatedState({
        startPanLngLat: this._unproject(pos)
      });
    }

    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     * @param {[Number, Number], optional} startPos - where the pointer grabbed at
     *   the start of the operation. Must be supplied of `panStart()` was not called
     */

  }, {
    key: 'pan',
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;

      var startPanLngLat = this._interactiveState.startPanLngLat || this._unproject(startPos);

      // take the start lnglat and put it where the mouse is down.
      assert(startPanLngLat, '`startPanLngLat` prop is required ' + 'for mouse pan behavior to calculate where to position the map.');

      var _calculateNewLngLat2 = this._calculateNewLngLat({ startPanLngLat: startPanLngLat, pos: pos }),
          _calculateNewLngLat3 = _slicedToArray(_calculateNewLngLat2, 2),
          longitude = _calculateNewLngLat3[0],
          latitude = _calculateNewLngLat3[1];

      return this._getUpdatedState({
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End panning
     * Must call if `panStart()` was called
     */

  }, {
    key: 'panEnd',
    value: function panEnd() {
      return this._getUpdatedState({
        startPanLngLat: null
      });
    }

    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'rotateStart',
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;

      return this._getUpdatedState({
        startBearing: this._viewportProps.bearing,
        startPitch: this._viewportProps.pitch
      });
    }

    /**
     * Rotate
     * @param {Number} deltaScaleX - a number between [-1, 1] specifying the
     *   change to bearing.
     * @param {Number} deltaScaleY - a number between [-1, 1] specifying the
     *   change to pitch. -1 sets to minPitch and 1 sets to maxPitch.
     */

  }, {
    key: 'rotate',
    value: function rotate(_ref5) {
      var deltaScaleX = _ref5.deltaScaleX,
          deltaScaleY = _ref5.deltaScaleY;

      assert(deltaScaleX >= -1 && deltaScaleX <= 1, '`deltaScaleX` must be a number between [-1, 1]');
      assert(deltaScaleY >= -1 && deltaScaleY <= 1, '`deltaScaleY` must be a number between [-1, 1]');

      var _interactiveState = this._interactiveState,
          startBearing = _interactiveState.startBearing,
          startPitch = _interactiveState.startPitch;


      if (!Number.isFinite(startBearing)) {
        startBearing = this._viewportProps.bearing;
      }
      if (!Number.isFinite(startPitch)) {
        startPitch = this._viewportProps.pitch;
      }

      var _calculateNewPitchAnd = this._calculateNewPitchAndBearing({
        deltaScaleX: deltaScaleX,
        deltaScaleY: deltaScaleY,
        startBearing: startBearing,
        startPitch: startPitch
      }),
          pitch = _calculateNewPitchAnd.pitch,
          bearing = _calculateNewPitchAnd.bearing;

      return this._getUpdatedState({
        bearing: bearing,
        pitch: pitch
      });
    }

    /**
     * End rotating
     * Must call if `rotateStart()` was called
     */

  }, {
    key: 'rotateEnd',
    value: function rotateEnd() {
      return this._getUpdatedState({
        startBearing: null,
        startPitch: null
      });
    }

    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the center is
     */

  }, {
    key: 'zoomStart',
    value: function zoomStart(_ref6) {
      var pos = _ref6.pos;

      return this._getUpdatedState({
        startZoomLngLat: this._unproject(pos),
        startZoom: this._viewportProps.zoom
      });
    }

    /**
     * Zoom
     * @param {[Number, Number]} pos - position on screen where the current center is
     * @param {[Number, Number]} startPos - the center position at
     *   the start of the operation. Must be supplied of `zoomStart()` was not called
     * @param {Number} scale - a number between [0, 1] specifying the accumulated
     *   relative scale.
     */

  }, {
    key: 'zoom',
    value: function zoom(_ref7) {
      var pos = _ref7.pos,
          startPos = _ref7.startPos,
          scale = _ref7.scale;

      assert(scale > 0, '`scale` must be a positive number');

      // Make sure we zoom around the current mouse position rather than map center
      var startZoomLngLat = this._interactiveState.startZoomLngLat || this._unproject(startPos) || this._unproject(pos);
      var startZoom = this._interactiveState.startZoom;


      if (!Number.isFinite(startZoom)) {
        startZoom = this._viewportProps.zoom;
      }

      // take the start lnglat and put it where the mouse is down.
      assert(startZoomLngLat, '`startZoomLngLat` prop is required ' + 'for zoom behavior to calculate where to position the map.');

      var zoom = this._calculateNewZoom({ scale: scale, startZoom: startZoom });

      var zoomedViewport = new PerspectiveMercatorViewport(Object.assign({}, this._viewportProps, { zoom: zoom }));

      var _zoomedViewport$getLo = zoomedViewport.getLocationAtPoint({ lngLat: startZoomLngLat, pos: pos }),
          _zoomedViewport$getLo2 = _slicedToArray(_zoomedViewport$getLo, 2),
          longitude = _zoomedViewport$getLo2[0],
          latitude = _zoomedViewport$getLo2[1];

      return this._getUpdatedState({
        zoom: zoom,
        longitude: longitude,
        latitude: latitude
      });
    }

    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */

  }, {
    key: 'zoomEnd',
    value: function zoomEnd() {
      return this._getUpdatedState({
        startZoomLngLat: null,
        startZoom: null
      });
    }
  }, {
    key: 'moveLeft',
    value: function moveLeft() {
      return this._getUpdatedState({
        bearing: this._viewportProps.bearing - 3
      });
    }
  }, {
    key: 'moveRight',
    value: function moveRight() {
      return this._getUpdatedState({
        bearing: this._viewportProps.bearing + 3
      });
    }
  }, {
    key: 'moveForward',
    value: function moveForward() {
      return this._getUpdatedState({
        pitch: this._viewportProps.pitch + 3
      });
    }
  }, {
    key: 'moveBackward',
    value: function moveBackward() {
      return this._getUpdatedState({
        pitch: this._viewportProps.pitch - 3
      });
    }
  }, {
    key: 'zoomIn',
    value: function zoomIn() {
      return this._getUpdatedState({
        zoom: this._viewportProps.zoom + 0.2
      });
    }
  }, {
    key: 'zoomOut',
    value: function zoomOut() {
      return this._getUpdatedState({
        zoom: this._viewportProps.zoom - 0.2
      });
    }

    /* Private methods */

  }, {
    key: '_getUpdatedState',
    value: function _getUpdatedState(newProps) {
      // Update _viewportProps
      return new MapState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
    }

    // Apply any constraints (mathematical or defined by _viewportProps) to map state

  }, {
    key: '_applyConstraints',
    value: function _applyConstraints(props) {
      // Normalize degrees
      props.longitude = mod(props.longitude + 180, 360) - 180;
      props.bearing = mod(props.bearing + 180, 360) - 180;

      // Ensure zoom is within specified range
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom;

      props.zoom = zoom > maxZoom ? maxZoom : zoom;
      props.zoom = props.zoom < minZoom ? minZoom : props.zoom;

      // Ensure pitch is within specified range
      var maxPitch = props.maxPitch,
          minPitch = props.minPitch,
          pitch = props.pitch;


      props.pitch = pitch > maxPitch ? maxPitch : pitch;
      props.pitch = props.pitch < minPitch ? minPitch : props.pitch;

      return props;
    }
  }, {
    key: '_unproject',
    value: function _unproject(pos) {
      var viewport = new PerspectiveMercatorViewport(this._viewportProps);
      return pos && viewport.unproject(pos, { topLeft: true });
    }

    // Calculate a new lnglat based on pixel dragging position

  }, {
    key: '_calculateNewLngLat',
    value: function _calculateNewLngLat(_ref8) {
      var startPanLngLat = _ref8.startPanLngLat,
          pos = _ref8.pos;

      var viewport = new PerspectiveMercatorViewport(this._viewportProps);
      return viewport.getLocationAtPoint({ lngLat: startPanLngLat, pos: pos });
    }

    // Calculates new zoom

  }, {
    key: '_calculateNewZoom',
    value: function _calculateNewZoom(_ref9) {
      var scale = _ref9.scale,
          startZoom = _ref9.startZoom;
      var _viewportProps = this._viewportProps,
          maxZoom = _viewportProps.maxZoom,
          minZoom = _viewportProps.minZoom;

      var zoom = startZoom + Math.log2(scale);
      zoom = zoom > maxZoom ? maxZoom : zoom;
      zoom = zoom < minZoom ? minZoom : zoom;
      return zoom;
    }

    // Calculates a new pitch and bearing from a position (coming from an event)

  }, {
    key: '_calculateNewPitchAndBearing',
    value: function _calculateNewPitchAndBearing(_ref10) {
      var deltaScaleX = _ref10.deltaScaleX,
          deltaScaleY = _ref10.deltaScaleY,
          startBearing = _ref10.startBearing,
          startPitch = _ref10.startPitch;
      var _viewportProps2 = this._viewportProps,
          minPitch = _viewportProps2.minPitch,
          maxPitch = _viewportProps2.maxPitch;


      var bearing = startBearing + 180 * deltaScaleX;
      var pitch = startPitch;
      if (deltaScaleY > 0) {
        // Gradually increase pitch
        pitch = startPitch + deltaScaleY * (maxPitch - startPitch);
      } else if (deltaScaleY < 0) {
        // Gradually decrease pitch
        pitch = startPitch - deltaScaleY * (minPitch - startPitch);
      }

      return {
        pitch: pitch,
        bearing: bearing
      };
    }
  }]);

  return MapState;
}(ViewState);

export default MapState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRyb2xsZXJzL21hcC1zdGF0ZS5qcyJdLCJuYW1lcyI6WyJWaWV3U3RhdGUiLCJQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQiLCJhc3NlcnQiLCJtb2QiLCJNQVBCT1hfTElNSVRTIiwibWluWm9vbSIsIm1heFpvb20iLCJtaW5QaXRjaCIsIm1heFBpdGNoIiwiZGVmYXVsdFN0YXRlIiwicGl0Y2giLCJiZWFyaW5nIiwiYWx0aXR1ZGUiLCJlbnN1cmVGaW5pdGUiLCJ2YWx1ZSIsImZhbGxiYWNrVmFsdWUiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIk1hcFN0YXRlIiwid2lkdGgiLCJoZWlnaHQiLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsInpvb20iLCJzdGFydFBhbkxuZ0xhdCIsInN0YXJ0Wm9vbUxuZ0xhdCIsInN0YXJ0QmVhcmluZyIsInN0YXJ0UGl0Y2giLCJzdGFydFpvb20iLCJfaW50ZXJhY3RpdmVTdGF0ZSIsInBvcyIsIl9nZXRVcGRhdGVkU3RhdGUiLCJfdW5wcm9qZWN0Iiwic3RhcnRQb3MiLCJfY2FsY3VsYXRlTmV3TG5nTGF0IiwiX3ZpZXdwb3J0UHJvcHMiLCJkZWx0YVNjYWxlWCIsImRlbHRhU2NhbGVZIiwiX2NhbGN1bGF0ZU5ld1BpdGNoQW5kQmVhcmluZyIsInNjYWxlIiwiX2NhbGN1bGF0ZU5ld1pvb20iLCJ6b29tZWRWaWV3cG9ydCIsIk9iamVjdCIsImFzc2lnbiIsImdldExvY2F0aW9uQXRQb2ludCIsImxuZ0xhdCIsIm5ld1Byb3BzIiwicHJvcHMiLCJ2aWV3cG9ydCIsInVucHJvamVjdCIsInRvcExlZnQiLCJNYXRoIiwibG9nMiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLE9BQU9BLFNBQVAsTUFBc0IsY0FBdEI7QUFDQSxPQUFPQywyQkFBUCxNQUF3QyxvQ0FBeEM7QUFDQSxPQUFPQyxNQUFQLE1BQW1CLFFBQW5CO0FBQ0EsU0FBUUMsR0FBUixRQUFrQixxQkFBbEI7O0FBRUE7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S0FBVixDQUF2QjtBQUNBaEIsYUFBT0EsT0FBT2pCLE9BQVAsR0FBaUJBLE9BQWpCLEdBQTJCaUIsSUFBbEM7QUFDQUEsYUFBT0EsT0FBT2xCLE9BQVAsR0FBaUJBLE9BQWpCLEdBQTJCa0IsSUFBbEM7QUFDQSxhQUFPQSxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7eURBQ21GO0FBQUEsVUFBckRhLFdBQXFELFVBQXJEQSxXQUFxRDtBQUFBLFVBQXhDQyxXQUF3QyxVQUF4Q0EsV0FBd0M7QUFBQSxVQUEzQlgsWUFBMkIsVUFBM0JBLFlBQTJCO0FBQUEsVUFBYkMsVUFBYSxVQUFiQSxVQUFhO0FBQUEsNEJBQ3BELEtBQUtRLGNBRCtDO0FBQUEsVUFDMUU1QixRQUQwRSxtQkFDMUVBLFFBRDBFO0FBQUEsVUFDaEVDLFFBRGdFLG1CQUNoRUEsUUFEZ0U7OztBQUdqRixVQUFNRyxVQUFVZSxlQUFlLE1BQU1VLFdBQXJDO0FBQ0EsVUFBSTFCLFFBQVFpQixVQUFaO0FBQ0EsVUFBSVUsY0FBYyxDQUFsQixFQUFxQjtBQUNuQjtBQUNBM0IsZ0JBQVFpQixhQUFhVSxlQUFlN0IsV0FBV21CLFVBQTFCLENBQXJCO0FBQ0QsT0FIRCxNQUdPLElBQUlVLGNBQWMsQ0FBbEIsRUFBcUI7QUFDMUI7QUFDQTNCLGdCQUFRaUIsYUFBYVUsZUFBZTlCLFdBQVdvQixVQUExQixDQUFyQjtBQUNEOztBQUVELGFBQU87QUFDTGpCLG9CQURLO0FBRUxDO0FBRkssT0FBUDtBQUlEOzs7O0VBalZtQ1gsUzs7ZUFBakJrQixRIiwiZmlsZSI6Im1hcC1zdGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBWaWV3U3RhdGUgZnJvbSAnLi92aWV3LXN0YXRlJztcbmltcG9ydCBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQgZnJvbSAnLi4vdmlld3BvcnRzL3dlYi1tZXJjYXRvci12aWV3cG9ydCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge21vZH0gZnJvbSAnLi4vdXRpbHMvbWF0aC11dGlscyc7XG5cbi8vIE1BUEJPWCBMSU1JVFNcbmV4cG9ydCBjb25zdCBNQVBCT1hfTElNSVRTID0ge1xuICBtaW5ab29tOiAwLFxuICBtYXhab29tOiAyMCxcbiAgbWluUGl0Y2g6IDAsXG4gIG1heFBpdGNoOiA2MFxufTtcblxuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICBwaXRjaDogMCxcbiAgYmVhcmluZzogMCxcbiAgYWx0aXR1ZGU6IDEuNVxufTtcblxuZnVuY3Rpb24gZW5zdXJlRmluaXRlKHZhbHVlLCBmYWxsYmFja1ZhbHVlKSB7XG4gIHJldHVybiBOdW1iZXIuaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiBmYWxsYmFja1ZhbHVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXBTdGF0ZSBleHRlbmRzIFZpZXdTdGF0ZSB7XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIC8qKiBNYXBib3ggdmlld3BvcnQgcHJvcGVydGllcyAqL1xuICAgIC8qKiBUaGUgd2lkdGggb2YgdGhlIHZpZXdwb3J0ICovXG4gICAgd2lkdGgsXG4gICAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIHZpZXdwb3J0ICovXG4gICAgaGVpZ2h0LFxuICAgIC8qKiBUaGUgbGF0aXR1ZGUgYXQgdGhlIGNlbnRlciBvZiB0aGUgdmlld3BvcnQgKi9cbiAgICBsYXRpdHVkZSxcbiAgICAvKiogVGhlIGxvbmdpdHVkZSBhdCB0aGUgY2VudGVyIG9mIHRoZSB2aWV3cG9ydCAqL1xuICAgIGxvbmdpdHVkZSxcbiAgICAvKiogVGhlIHRpbGUgem9vbSBsZXZlbCBvZiB0aGUgbWFwLiAqL1xuICAgIHpvb20sXG4gICAgLyoqIFRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydCBpbiBkZWdyZWVzICovXG4gICAgYmVhcmluZyxcbiAgICAvKiogVGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydCBpbiBkZWdyZWVzICovXG4gICAgcGl0Y2gsXG4gICAgLyoqXG4gICAgKiBTcGVjaWZ5IHRoZSBhbHRpdHVkZSBvZiB0aGUgdmlld3BvcnQgY2FtZXJhXG4gICAgKiBVbml0OiBtYXAgaGVpZ2h0cywgZGVmYXVsdCAxLjVcbiAgICAqIE5vbi1wdWJsaWMgQVBJLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzExMzdcbiAgICAqL1xuICAgIGFsdGl0dWRlLFxuXG4gICAgLyoqIFZpZXdwb3J0IGNvbnN0cmFpbnRzICovXG4gICAgbWF4Wm9vbSxcbiAgICBtaW5ab29tLFxuICAgIG1heFBpdGNoLFxuICAgIG1pblBpdGNoLFxuXG4gICAgLyoqIEludGVyYWN0aW9uIHN0YXRlcywgcmVxdWlyZWQgdG8gY2FsY3VsYXRlIGNoYW5nZSBkdXJpbmcgdHJhbnNmb3JtICovXG4gICAgLyogVGhlIHBvaW50IG9uIG1hcCBiZWluZyBncmFiYmVkIHdoZW4gdGhlIG9wZXJhdGlvbiBmaXJzdCBzdGFydGVkICovXG4gICAgc3RhcnRQYW5MbmdMYXQsXG4gICAgLyogQ2VudGVyIG9mIHRoZSB6b29tIHdoZW4gdGhlIG9wZXJhdGlvbiBmaXJzdCBzdGFydGVkICovXG4gICAgc3RhcnRab29tTG5nTGF0LFxuICAgIC8qKiBCZWFyaW5nIHdoZW4gY3VycmVudCBwZXJzcGVjdGl2ZSByb3RhdGUgb3BlcmF0aW9uIHN0YXJ0ZWQgKi9cbiAgICBzdGFydEJlYXJpbmcsXG4gICAgLyoqIFBpdGNoIHdoZW4gY3VycmVudCBwZXJzcGVjdGl2ZSByb3RhdGUgb3BlcmF0aW9uIHN0YXJ0ZWQgKi9cbiAgICBzdGFydFBpdGNoLFxuICAgIC8qKiBab29tIHdoZW4gY3VycmVudCB6b29tIG9wZXJhdGlvbiBzdGFydGVkICovXG4gICAgc3RhcnRab29tXG4gIH0gPSB7fSkge1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUobG9uZ2l0dWRlKSwgJ2Bsb25naXR1ZGVgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGxhdGl0dWRlKSwgJ2BsYXRpdHVkZWAgbXVzdCBiZSBzdXBwbGllZCcpO1xuICAgIGFzc2VydChOdW1iZXIuaXNGaW5pdGUoem9vbSksICdgem9vbWAgbXVzdCBiZSBzdXBwbGllZCcpO1xuXG4gICAgc3VwZXIoe1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBsYXRpdHVkZSxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIHpvb20sXG4gICAgICBiZWFyaW5nLFxuICAgICAgcGl0Y2gsXG5cbiAgICAgIGFsdGl0dWRlOiBlbnN1cmVGaW5pdGUoYWx0aXR1ZGUsIGRlZmF1bHRTdGF0ZS5hbHRpdHVkZSksXG4gICAgICBtYXhab29tOiBlbnN1cmVGaW5pdGUobWF4Wm9vbSwgTUFQQk9YX0xJTUlUUy5tYXhab29tKSxcbiAgICAgIG1pblpvb206IGVuc3VyZUZpbml0ZShtaW5ab29tLCBNQVBCT1hfTElNSVRTLm1pblpvb20pLFxuICAgICAgbWF4UGl0Y2g6IGVuc3VyZUZpbml0ZShtYXhQaXRjaCwgTUFQQk9YX0xJTUlUUy5tYXhQaXRjaCksXG4gICAgICBtaW5QaXRjaDogZW5zdXJlRmluaXRlKG1pblBpdGNoLCBNQVBCT1hfTElNSVRTLm1pblBpdGNoKVxuICAgIH0pO1xuXG4gICAgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSA9IHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0LFxuICAgICAgc3RhcnRab29tTG5nTGF0LFxuICAgICAgc3RhcnRCZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaCxcbiAgICAgIHN0YXJ0Wm9vbVxuICAgIH07XG4gIH1cblxuICAvKiBQdWJsaWMgQVBJICovXG5cbiAgZ2V0SW50ZXJhY3RpdmVTdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBwYW5uaW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJzXG4gICAqL1xuICBwYW5TdGFydCh7cG9zfSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgc3RhcnRQYW5MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFuXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGlzXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXSwgb3B0aW9uYWx9IHN0YXJ0UG9zIC0gd2hlcmUgdGhlIHBvaW50ZXIgZ3JhYmJlZCBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGBwYW5TdGFydCgpYCB3YXMgbm90IGNhbGxlZFxuICAgKi9cbiAgcGFuKHtwb3MsIHN0YXJ0UG9zfSkge1xuICAgIGNvbnN0IHN0YXJ0UGFuTG5nTGF0ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFBhbkxuZ0xhdCB8fCB0aGlzLl91bnByb2plY3Qoc3RhcnRQb3MpO1xuXG4gICAgLy8gdGFrZSB0aGUgc3RhcnQgbG5nbGF0IGFuZCBwdXQgaXQgd2hlcmUgdGhlIG1vdXNlIGlzIGRvd24uXG4gICAgYXNzZXJ0KHN0YXJ0UGFuTG5nTGF0LCAnYHN0YXJ0UGFuTG5nTGF0YCBwcm9wIGlzIHJlcXVpcmVkICcgK1xuICAgICAgJ2ZvciBtb3VzZSBwYW4gYmVoYXZpb3IgdG8gY2FsY3VsYXRlIHdoZXJlIHRvIHBvc2l0aW9uIHRoZSBtYXAuJyk7XG5cbiAgICBjb25zdCBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gPSB0aGlzLl9jYWxjdWxhdGVOZXdMbmdMYXQoe3N0YXJ0UGFuTG5nTGF0LCBwb3N9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgbG9uZ2l0dWRlLFxuICAgICAgbGF0aXR1ZGVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmQgcGFubmluZ1xuICAgKiBNdXN0IGNhbGwgaWYgYHBhblN0YXJ0KClgIHdhcyBjYWxsZWRcbiAgICovXG4gIHBhbkVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAgIHN0YXJ0UGFuTG5nTGF0OiBudWxsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcm90YXRpbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGNlbnRlciBpc1xuICAgKi9cbiAgcm90YXRlU3RhcnQoe3Bvc30pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAgIHN0YXJ0QmVhcmluZzogdGhpcy5fdmlld3BvcnRQcm9wcy5iZWFyaW5nLFxuICAgICAgc3RhcnRQaXRjaDogdGhpcy5fdmlld3BvcnRQcm9wcy5waXRjaFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFTY2FsZVggLSBhIG51bWJlciBiZXR3ZWVuIFstMSwgMV0gc3BlY2lmeWluZyB0aGVcbiAgICogICBjaGFuZ2UgdG8gYmVhcmluZy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhU2NhbGVZIC0gYSBudW1iZXIgYmV0d2VlbiBbLTEsIDFdIHNwZWNpZnlpbmcgdGhlXG4gICAqICAgY2hhbmdlIHRvIHBpdGNoLiAtMSBzZXRzIHRvIG1pblBpdGNoIGFuZCAxIHNldHMgdG8gbWF4UGl0Y2guXG4gICAqL1xuICByb3RhdGUoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWX0pIHtcbiAgICBhc3NlcnQoZGVsdGFTY2FsZVggPj0gLTEgJiYgZGVsdGFTY2FsZVggPD0gMSxcbiAgICAgICdgZGVsdGFTY2FsZVhgIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiBbLTEsIDFdJyk7XG4gICAgYXNzZXJ0KGRlbHRhU2NhbGVZID49IC0xICYmIGRlbHRhU2NhbGVZIDw9IDEsXG4gICAgICAnYGRlbHRhU2NhbGVZYCBtdXN0IGJlIGEgbnVtYmVyIGJldHdlZW4gWy0xLCAxXScpO1xuXG4gICAgbGV0IHtzdGFydEJlYXJpbmcsIHN0YXJ0UGl0Y2h9ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHN0YXJ0QmVhcmluZykpIHtcbiAgICAgIHN0YXJ0QmVhcmluZyA9IHRoaXMuX3ZpZXdwb3J0UHJvcHMuYmVhcmluZztcbiAgICB9XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoc3RhcnRQaXRjaCkpIHtcbiAgICAgIHN0YXJ0UGl0Y2ggPSB0aGlzLl92aWV3cG9ydFByb3BzLnBpdGNoO1xuICAgIH1cblxuICAgIGNvbnN0IHtwaXRjaCwgYmVhcmluZ30gPSB0aGlzLl9jYWxjdWxhdGVOZXdQaXRjaEFuZEJlYXJpbmcoe1xuICAgICAgZGVsdGFTY2FsZVgsXG4gICAgICBkZWx0YVNjYWxlWSxcbiAgICAgIHN0YXJ0QmVhcmluZyxcbiAgICAgIHN0YXJ0UGl0Y2hcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgYmVhcmluZyxcbiAgICAgIHBpdGNoXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHJvdGF0aW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcm90YXRlU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcm90YXRlRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgc3RhcnRCZWFyaW5nOiBudWxsLFxuICAgICAgc3RhcnRQaXRjaDogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHpvb21pbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGNlbnRlciBpc1xuICAgKi9cbiAgem9vbVN0YXJ0KHtwb3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBzdGFydFpvb21MbmdMYXQ6IHRoaXMuX3VucHJvamVjdChwb3MpLFxuICAgICAgc3RhcnRab29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb21cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBjdXJyZW50IGNlbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHN0YXJ0UG9zIC0gdGhlIGNlbnRlciBwb3NpdGlvbiBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGB6b29tU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIC0gYSBudW1iZXIgYmV0d2VlbiBbMCwgMV0gc3BlY2lmeWluZyB0aGUgYWNjdW11bGF0ZWRcbiAgICogICByZWxhdGl2ZSBzY2FsZS5cbiAgICovXG4gIHpvb20oe3Bvcywgc3RhcnRQb3MsIHNjYWxlfSkge1xuICAgIGFzc2VydChzY2FsZSA+IDAsICdgc2NhbGVgIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcblxuICAgIC8vIE1ha2Ugc3VyZSB3ZSB6b29tIGFyb3VuZCB0aGUgY3VycmVudCBtb3VzZSBwb3NpdGlvbiByYXRoZXIgdGhhbiBtYXAgY2VudGVyXG4gICAgY29uc3Qgc3RhcnRab29tTG5nTGF0ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFpvb21MbmdMYXQgfHxcbiAgICAgIHRoaXMuX3VucHJvamVjdChzdGFydFBvcykgfHwgdGhpcy5fdW5wcm9qZWN0KHBvcyk7XG4gICAgbGV0IHtzdGFydFpvb219ID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZTtcblxuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHN0YXJ0Wm9vbSkpIHtcbiAgICAgIHN0YXJ0Wm9vbSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHMuem9vbTtcbiAgICB9XG5cbiAgICAvLyB0YWtlIHRoZSBzdGFydCBsbmdsYXQgYW5kIHB1dCBpdCB3aGVyZSB0aGUgbW91c2UgaXMgZG93bi5cbiAgICBhc3NlcnQoc3RhcnRab29tTG5nTGF0LCAnYHN0YXJ0Wm9vbUxuZ0xhdGAgcHJvcCBpcyByZXF1aXJlZCAnICtcbiAgICAgICdmb3Igem9vbSBiZWhhdmlvciB0byBjYWxjdWxhdGUgd2hlcmUgdG8gcG9zaXRpb24gdGhlIG1hcC4nKTtcblxuICAgIGNvbnN0IHpvb20gPSB0aGlzLl9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSk7XG5cbiAgICBjb25zdCB6b29tZWRWaWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl92aWV3cG9ydFByb3BzLCB7em9vbX0pXG4gICAgKTtcbiAgICBjb25zdCBbbG9uZ2l0dWRlLCBsYXRpdHVkZV0gPSB6b29tZWRWaWV3cG9ydC5nZXRMb2NhdGlvbkF0UG9pbnQoe2xuZ0xhdDogc3RhcnRab29tTG5nTGF0LCBwb3N9KTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgem9vbSxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHpvb21pbmdcbiAgICogTXVzdCBjYWxsIGlmIGB6b29tU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgem9vbUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAgIHN0YXJ0Wm9vbUxuZ0xhdDogbnVsbCxcbiAgICAgIHN0YXJ0Wm9vbTogbnVsbFxuICAgIH0pO1xuICB9XG5cbiAgbW92ZUxlZnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBiZWFyaW5nOiB0aGlzLl92aWV3cG9ydFByb3BzLmJlYXJpbmcgLSAzXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlUmlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBiZWFyaW5nOiB0aGlzLl92aWV3cG9ydFByb3BzLmJlYXJpbmcgKyAzXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlRm9yd2FyZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAgIHBpdGNoOiB0aGlzLl92aWV3cG9ydFByb3BzLnBpdGNoICsgM1xuICAgIH0pO1xuICB9XG5cbiAgbW92ZUJhY2t3YXJkKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgcGl0Y2g6IHRoaXMuX3ZpZXdwb3J0UHJvcHMucGl0Y2ggLSAzXG4gICAgfSk7XG4gIH1cblxuICB6b29tSW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICB6b29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb20gKyAwLjJcbiAgICB9KTtcbiAgfVxuXG4gIHpvb21PdXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICB6b29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb20gLSAwLjJcbiAgICB9KTtcbiAgfVxuXG4gIC8qIFByaXZhdGUgbWV0aG9kcyAqL1xuXG4gIF9nZXRVcGRhdGVkU3RhdGUobmV3UHJvcHMpIHtcbiAgICAvLyBVcGRhdGUgX3ZpZXdwb3J0UHJvcHNcbiAgICByZXR1cm4gbmV3IE1hcFN0YXRlKE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZpZXdwb3J0UHJvcHMsIHRoaXMuX2ludGVyYWN0aXZlU3RhdGUsIG5ld1Byb3BzKSk7XG4gIH1cblxuICAvLyBBcHBseSBhbnkgY29uc3RyYWludHMgKG1hdGhlbWF0aWNhbCBvciBkZWZpbmVkIGJ5IF92aWV3cG9ydFByb3BzKSB0byBtYXAgc3RhdGVcbiAgX2FwcGx5Q29uc3RyYWludHMocHJvcHMpIHtcbiAgICAvLyBOb3JtYWxpemUgZGVncmVlc1xuICAgIHByb3BzLmxvbmdpdHVkZSA9IG1vZChwcm9wcy5sb25naXR1ZGUgKyAxODAsIDM2MCkgLSAxODA7XG4gICAgcHJvcHMuYmVhcmluZyA9IG1vZChwcm9wcy5iZWFyaW5nICsgMTgwLCAzNjApIC0gMTgwO1xuXG4gICAgLy8gRW5zdXJlIHpvb20gaXMgd2l0aGluIHNwZWNpZmllZCByYW5nZVxuICAgIGNvbnN0IHttYXhab29tLCBtaW5ab29tLCB6b29tfSA9IHByb3BzO1xuICAgIHByb3BzLnpvb20gPSB6b29tID4gbWF4Wm9vbSA/IG1heFpvb20gOiB6b29tO1xuICAgIHByb3BzLnpvb20gPSBwcm9wcy56b29tIDwgbWluWm9vbSA/IG1pblpvb20gOiBwcm9wcy56b29tO1xuXG4gICAgLy8gRW5zdXJlIHBpdGNoIGlzIHdpdGhpbiBzcGVjaWZpZWQgcmFuZ2VcbiAgICBjb25zdCB7bWF4UGl0Y2gsIG1pblBpdGNoLCBwaXRjaH0gPSBwcm9wcztcblxuICAgIHByb3BzLnBpdGNoID0gcGl0Y2ggPiBtYXhQaXRjaCA/IG1heFBpdGNoIDogcGl0Y2g7XG4gICAgcHJvcHMucGl0Y2ggPSBwcm9wcy5waXRjaCA8IG1pblBpdGNoID8gbWluUGl0Y2ggOiBwcm9wcy5waXRjaDtcblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxuXG4gIF91bnByb2plY3QocG9zKSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgUGVyc3BlY3RpdmVNZXJjYXRvclZpZXdwb3J0KHRoaXMuX3ZpZXdwb3J0UHJvcHMpO1xuICAgIHJldHVybiBwb3MgJiYgdmlld3BvcnQudW5wcm9qZWN0KHBvcywge3RvcExlZnQ6IHRydWV9KTtcbiAgfVxuXG4gIC8vIENhbGN1bGF0ZSBhIG5ldyBsbmdsYXQgYmFzZWQgb24gcGl4ZWwgZHJhZ2dpbmcgcG9zaXRpb25cbiAgX2NhbGN1bGF0ZU5ld0xuZ0xhdCh7c3RhcnRQYW5MbmdMYXQsIHBvc30pIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBQZXJzcGVjdGl2ZU1lcmNhdG9yVmlld3BvcnQodGhpcy5fdmlld3BvcnRQcm9wcyk7XG4gICAgcmV0dXJuIHZpZXdwb3J0LmdldExvY2F0aW9uQXRQb2ludCh7bG5nTGF0OiBzdGFydFBhbkxuZ0xhdCwgcG9zfSk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGVzIG5ldyB6b29tXG4gIF9jYWxjdWxhdGVOZXdab29tKHtzY2FsZSwgc3RhcnRab29tfSkge1xuICAgIGNvbnN0IHttYXhab29tLCBtaW5ab29tfSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG4gICAgbGV0IHpvb20gPSBzdGFydFpvb20gKyBNYXRoLmxvZzIoc2NhbGUpO1xuICAgIHpvb20gPSB6b29tID4gbWF4Wm9vbSA/IG1heFpvb20gOiB6b29tO1xuICAgIHpvb20gPSB6b29tIDwgbWluWm9vbSA/IG1pblpvb20gOiB6b29tO1xuICAgIHJldHVybiB6b29tO1xuICB9XG5cbiAgLy8gQ2FsY3VsYXRlcyBhIG5ldyBwaXRjaCBhbmQgYmVhcmluZyBmcm9tIGEgcG9zaXRpb24gKGNvbWluZyBmcm9tIGFuIGV2ZW50KVxuICBfY2FsY3VsYXRlTmV3UGl0Y2hBbmRCZWFyaW5nKHtkZWx0YVNjYWxlWCwgZGVsdGFTY2FsZVksIHN0YXJ0QmVhcmluZywgc3RhcnRQaXRjaH0pIHtcbiAgICBjb25zdCB7bWluUGl0Y2gsIG1heFBpdGNofSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG5cbiAgICBjb25zdCBiZWFyaW5nID0gc3RhcnRCZWFyaW5nICsgMTgwICogZGVsdGFTY2FsZVg7XG4gICAgbGV0IHBpdGNoID0gc3RhcnRQaXRjaDtcbiAgICBpZiAoZGVsdGFTY2FsZVkgPiAwKSB7XG4gICAgICAvLyBHcmFkdWFsbHkgaW5jcmVhc2UgcGl0Y2hcbiAgICAgIHBpdGNoID0gc3RhcnRQaXRjaCArIGRlbHRhU2NhbGVZICogKG1heFBpdGNoIC0gc3RhcnRQaXRjaCk7XG4gICAgfSBlbHNlIGlmIChkZWx0YVNjYWxlWSA8IDApIHtcbiAgICAgIC8vIEdyYWR1YWxseSBkZWNyZWFzZSBwaXRjaFxuICAgICAgcGl0Y2ggPSBzdGFydFBpdGNoIC0gZGVsdGFTY2FsZVkgKiAobWluUGl0Y2ggLSBzdGFydFBpdGNoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGl0Y2gsXG4gICAgICBiZWFyaW5nXG4gICAgfTtcbiAgfVxufVxuIl19