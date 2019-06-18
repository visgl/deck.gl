var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import OrbitViewport from '../viewports/orbit-viewport';
import assert from 'assert';

var defaultState = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  fov: 50,
  near: 1,
  far: 100,
  translationX: 0,
  translationY: 0,
  zoom: 1
};

var defaultConstraints = {
  minZoom: 0,
  maxZoom: Infinity
};

/* Helpers */

// Constrain number between bounds
function clamp(x, min, max) {
  return x < min ? min : x > max ? max : x;
}

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

var OrbitState = function () {
  function OrbitState(_ref) {
    var width = _ref.width,
        height = _ref.height,
        distance = _ref.distance,
        rotationX = _ref.rotationX,
        rotationOrbit = _ref.rotationOrbit,
        orbitAxis = _ref.orbitAxis,
        bounds = _ref.bounds,
        lookAt = _ref.lookAt,
        fov = _ref.fov,
        near = _ref.near,
        far = _ref.far,
        translationX = _ref.translationX,
        translationY = _ref.translationY,
        zoom = _ref.zoom,
        minZoom = _ref.minZoom,
        maxZoom = _ref.maxZoom,
        startPanViewport = _ref.startPanViewport,
        startPanPos = _ref.startPanPos,
        isPanning = _ref.isPanning,
        startRotateViewport = _ref.startRotateViewport,
        isRotating = _ref.isRotating,
        startZoomViewport = _ref.startZoomViewport,
        startZoomPos = _ref.startZoomPos;

    _classCallCheck(this, OrbitState);

    assert(Number.isFinite(width), '`width` must be supplied');
    assert(Number.isFinite(height), '`height` must be supplied');
    assert(Number.isFinite(distance), '`distance` must be supplied');

    this._viewportProps = this._applyConstraints({
      width: width,
      height: height,
      distance: distance,
      rotationX: ensureFinite(rotationX, defaultState.rotationX),
      rotationOrbit: ensureFinite(rotationOrbit, defaultState.rotationOrbit),
      orbitAxis: orbitAxis,

      bounds: bounds,
      lookAt: lookAt || defaultState.lookAt,

      fov: ensureFinite(fov, defaultState.fov),
      near: ensureFinite(near, defaultState.near),
      far: ensureFinite(far, defaultState.far),
      translationX: ensureFinite(translationX, defaultState.translationX),
      translationY: ensureFinite(translationY, defaultState.translationY),
      zoom: ensureFinite(zoom, defaultState.zoom),

      minZoom: ensureFinite(minZoom, defaultConstraints.minZoom),
      maxZoom: ensureFinite(maxZoom, defaultConstraints.maxZoom)
    });

    this._interactiveState = {
      startPanViewport: startPanViewport,
      startPanPos: startPanPos,
      isPanning: isPanning,
      startRotateViewport: startRotateViewport,
      isRotating: isRotating,
      startZoomViewport: startZoomViewport,
      startZoomPos: startZoomPos
    };
  }

  /* Public API */

  _createClass(OrbitState, [{
    key: 'getViewportProps',
    value: function getViewportProps() {
      return this._viewportProps;
    }
  }, {
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

      var viewport = new OrbitViewport(this._viewportProps);

      return this._getUpdatedOrbitState({
        startPanPos: pos,
        startPanViewport: viewport
      });
    }

    /**
     * Pan
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */

  }, {
    key: 'pan',
    value: function pan(_ref3) {
      var pos = _ref3.pos,
          startPos = _ref3.startPos;

      if (this._interactiveState.isRotating) {
        return this._getUpdatedOrbitState();
      }

      var startPanPos = this._interactiveState.startPanPos || startPos;
      assert(startPanPos, '`startPanPos` props is required');

      var viewport = this._interactiveState.startPanViewport || new OrbitViewport(this._viewportProps);

      var deltaX = pos[0] - startPanPos[0];
      var deltaY = pos[1] - startPanPos[1];

      var center = viewport.project(viewport.lookAt);
      var newLookAt = viewport.unproject([center[0] - deltaX, center[1] - deltaY, center[2]]);

      return this._getUpdatedOrbitState({
        lookAt: newLookAt,
        isPanning: true
      });
    }

    /**
     * End panning
     * Must call if `panStart()` was called
     */

  }, {
    key: 'panEnd',
    value: function panEnd() {
      return this._getUpdatedOrbitState({
        startPanViewport: null,
        startPanPos: null,
        isPanning: null
      });
    }

    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'rotateStart',
    value: function rotateStart(_ref4) {
      var pos = _ref4.pos;

      // Rotation center should be the worldspace position at the center of the
      // the screen. If not found, use the last one.
      var viewport = new OrbitViewport(this._viewportProps);

      return this._getUpdatedOrbitState({
        startRotateViewport: viewport
      });
    }

    /**
     * Rotate
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */

  }, {
    key: 'rotate',
    value: function rotate(_ref5) {
      var deltaScaleX = _ref5.deltaScaleX,
          deltaScaleY = _ref5.deltaScaleY;

      if (this._interactiveState.isPanning) {
        return this._getUpdatedOrbitState();
      }

      var startRotateViewport = this._interactiveState.startRotateViewport;

      var _ref6 = startRotateViewport || {},
          rotationX = _ref6.rotationX,
          rotationOrbit = _ref6.rotationOrbit;

      rotationX = ensureFinite(rotationX, this._viewportProps.rotationX);
      rotationOrbit = ensureFinite(rotationOrbit, this._viewportProps.rotationOrbit);

      var newRotationX = clamp(rotationX - deltaScaleY * 180, -89.999, 89.999);
      var newRotationOrbit = (rotationOrbit - deltaScaleX * 180) % 360;

      return this._getUpdatedOrbitState({
        rotationX: newRotationX,
        rotationOrbit: newRotationOrbit,
        isRotating: true
      });
    }

    /**
     * End rotating
     * Must call if `rotateStart()` was called
     */

  }, {
    key: 'rotateEnd',
    value: function rotateEnd() {
      return this._getUpdatedOrbitState({
        startRotateViewport: null,
        isRotating: null
      });
    }

    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'zoomStart',
    value: function zoomStart(_ref7) {
      var pos = _ref7.pos;

      var viewport = new OrbitViewport(this._viewportProps);
      return this._getUpdatedOrbitState({
        startZoomViewport: viewport,
        startZoomPos: pos
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
    value: function zoom(_ref8) {
      var pos = _ref8.pos,
          startPos = _ref8.startPos,
          scale = _ref8.scale;
      var _viewportProps = this._viewportProps,
          zoom = _viewportProps.zoom,
          minZoom = _viewportProps.minZoom,
          maxZoom = _viewportProps.maxZoom,
          width = _viewportProps.width,
          height = _viewportProps.height;

      var startZoomPos = this._interactiveState.startZoomPos || startPos || pos;
      var viewport = this._interactiveState.startZoomViewport || new OrbitViewport(this._viewportProps);

      var newZoom = clamp(zoom * scale, minZoom, maxZoom);
      var deltaX = pos[0] - startZoomPos[0];
      var deltaY = pos[1] - startZoomPos[1];

      // Zoom around the center position
      var cx = startZoomPos[0] - width / 2;
      var cy = height / 2 - startZoomPos[1];
      var center = viewport.project(viewport.lookAt);
      var newCenterX = center[0] - cx + cx * newZoom / zoom + deltaX;
      var newCenterY = center[1] + cy - cy * newZoom / zoom - deltaY;

      var newLookAt = viewport.unproject([newCenterX, newCenterY, center[2]]);

      return this._getUpdatedOrbitState({
        lookAt: newLookAt,
        zoom: newZoom
      });
    }

    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */

  }, {
    key: 'zoomEnd',
    value: function zoomEnd() {
      return this._getUpdatedOrbitState({
        startZoomPos: null
      });
    }

    /* Private methods */

  }, {
    key: '_getUpdatedOrbitState',
    value: function _getUpdatedOrbitState(newProps) {
      // Update _viewportProps
      return new OrbitState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
    }

    // Apply any constraints (mathematical or defined by _viewportProps) to map state

  }, {
    key: '_applyConstraints',
    value: function _applyConstraints(props) {
      // Ensure zoom is within specified range
      var maxZoom = props.maxZoom,
          minZoom = props.minZoom,
          zoom = props.zoom;

      props.zoom = zoom > maxZoom ? maxZoom : zoom;
      props.zoom = zoom < minZoom ? minZoom : zoom;

      return props;
    }
  }]);

  return OrbitState;
}();

export default OrbitState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRyb2xsZXJzL29yYml0LXN0YXRlLmpzIl0sIm5hbWVzIjpbIk9yYml0Vmlld3BvcnQiLCJhc3NlcnQiLCJkZWZhdWx0U3RhdGUiLCJsb29rQXQiLCJyb3RhdGlvblgiLCJyb3RhdGlvbk9yYml0IiwiZm92IiwibmVhciIsImZhciIsInRyYW5zbGF0aW9uWCIsInRyYW5zbGF0aW9uWSIsInpvb20iLCJkZWZhdWx0Q29uc3RyYWludHMiLCJtaW5ab29tIiwibWF4Wm9vbSIsIkluZmluaXR5IiwiY2xhbXAiLCJ4IiwibWluIiwibWF4IiwiZW5zdXJlRmluaXRlIiwidmFsdWUiLCJmYWxsYmFja1ZhbHVlIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJPcmJpdFN0YXRlIiwid2lkdGgiLCJoZWlnaHQiLCJkaXN0YW5jZSIsIm9yYml0QXhpcyIsImJvdW5kcyIsInN0YXJ0UGFuVmlld3BvcnQiLCJzdGFydFBhblBvcyIsImlzUGFubmluZyIsInN0YXJ0Um90YXRlVmlld3BvcnQiLCJpc1JvdGF0aW5nIiwic3RhcnRab29tVmlld3BvcnQiLCJzdGFydFpvb21Qb3MiLCJfdmlld3BvcnRQcm9wcyIsIl9hcHBseUNvbnN0cmFpbnRzIiwiX2ludGVyYWN0aXZlU3RhdGUiLCJwb3MiLCJ2aWV3cG9ydCIsIl9nZXRVcGRhdGVkT3JiaXRTdGF0ZSIsInN0YXJ0UG9zIiwiZGVsdGFYIiwiZGVsdGFZIiwiY2VudGVyIiwicHJvamVjdCIsIm5ld0xvb2tBdCIsInVucHJvamVjdCIsImRlbHRhU2NhbGVYIiwiZGVsdGFTY2FsZVkiLCJuZXdSb3RhdGlvblgiLCJuZXdSb3RhdGlvbk9yYml0Iiwic2NhbGUiLCJuZXdab29tIiwiY3giLCJjeSIsIm5ld0NlbnRlclgiLCJuZXdDZW50ZXJZIiwibmV3UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJwcm9wcyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU9BLGFBQVAsTUFBMEIsNkJBQTFCO0FBQ0Es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U0FBVCxDQUFtQixDQUFDUyxVQUFELEVBQWFDLFVBQWIsRUFBeUJiLE9BQU8sQ0FBUCxDQUF6QixDQUFuQixDQUFsQjs7QUFFQSxhQUFPLEtBQUtKLHFCQUFMLENBQTJCO0FBQ2hDeEMsZ0JBQVE4QyxTQUR3QjtBQUVoQ3RDLGNBQU02QztBQUYwQixPQUEzQixDQUFQO0FBSUQ7O0FBRUQ7Ozs7Ozs7OEJBSVU7QUFDUixhQUFPLEtBQUtiLHFCQUFMLENBQTJCO0FBQ2hDTixzQkFBYztBQURrQixPQUEzQixDQUFQO0FBR0Q7O0FBRUQ7Ozs7MENBRXNCd0IsUSxFQUFVO0FBQzlCO0FBQ0EsYUFBTyxJQUFJcEMsVUFBSixDQUFlcUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS3pCLGNBQXZCLEVBQXVDLEtBQUtFLGlCQUE1QyxFQUErRHFCLFFBQS9ELENBQWYsQ0FBUDtBQUNEOztBQUVEOzs7O3NDQUNrQkcsSyxFQUFPO0FBQ3ZCO0FBRHVCLFVBRWhCbEQsT0FGZ0IsR0FFVWtELEtBRlYsQ0FFaEJsRCxPQUZnQjtBQUFBLFVBRVBELE9BRk8sR0FFVW1ELEtBRlYsQ0FFUG5ELE9BRk87QUFBQSxVQUVFRixJQUZGLEdBRVVxRCxLQUZWLENBRUVyRCxJQUZGOztBQUd2QnFELFlBQU1yRCxJQUFOLEdBQWFBLE9BQU9HLE9BQVAsR0FBaUJBLE9BQWpCLEdBQTJCSCxJQUF4QztBQUNBcUQsWUFBTXJELElBQU4sR0FBYUEsT0FBT0UsT0FBUCxHQUFpQkEsT0FBakIsR0FBMkJGLElBQXhDOztBQUVBLGFBQU9xRCxLQUFQO0FBQ0Q7Ozs7OztlQXRRa0J2QyxVIiwiZmlsZSI6Im9yYml0LXN0YXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE9yYml0Vmlld3BvcnQgZnJvbSAnLi4vdmlld3BvcnRzL29yYml0LXZpZXdwb3J0JztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICBsb29rQXQ6IFswLCAwLCAwXSxcbiAgcm90YXRpb25YOiAwLFxuICByb3RhdGlvbk9yYml0OiAwLFxuICBmb3Y6IDUwLFxuICBuZWFyOiAxLFxuICBmYXI6IDEwMCxcbiAgdHJhbnNsYXRpb25YOiAwLFxuICB0cmFuc2xhdGlvblk6IDAsXG4gIHpvb206IDFcbn07XG5cbmNvbnN0IGRlZmF1bHRDb25zdHJhaW50cyA9IHtcbiAgbWluWm9vbTogMCxcbiAgbWF4Wm9vbTogSW5maW5pdHlcbn07XG5cbi8qIEhlbHBlcnMgKi9cblxuLy8gQ29uc3RyYWluIG51bWJlciBiZXR3ZWVuIGJvdW5kc1xuZnVuY3Rpb24gY2xhbXAoeCwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIHggPCBtaW4gPyBtaW4gOiAoeCA+IG1heCA/IG1heCA6IHgpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVGaW5pdGUodmFsdWUsIGZhbGxiYWNrVmFsdWUpIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9yYml0U3RhdGUge1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICAvKiBWaWV3cG9ydCBhcmd1bWVudHMgKi9cbiAgICB3aWR0aCwgLy8gV2lkdGggb2Ygdmlld3BvcnRcbiAgICBoZWlnaHQsIC8vIEhlaWdodCBvZiB2aWV3cG9ydFxuICAgIGRpc3RhbmNlLCAvLyBGcm9tIGV5ZSB0byB0YXJnZXRcbiAgICByb3RhdGlvblgsIC8vIFJvdGF0aW9uIGFyb3VuZCB4IGF4aXNcbiAgICByb3RhdGlvbk9yYml0LCAvLyBSb3RhdGlvbiBhcm91bmQgb3JiaXQgYXhpc1xuICAgIG9yYml0QXhpcywgLy8gT3JiaXQgYXhpcyB3aXRoIDM2MCBkZWdyZWVzIHJvdGF0aW5nIGZyZWVkb20sIGNhbiBvbmx5IGJlICdZJyBvciAnWidcbiAgICAvLyBCb3VuZGluZyBib3ggb2YgdGhlIG1vZGVsLCBpbiB0aGUgc2hhcGUgb2Yge21pblgsIG1heFgsIG1pblksIG1heFksIG1pblosIG1heFp9XG4gICAgYm91bmRzLFxuXG4gICAgLyogVmlldyBtYXRyaXggYXJndW1lbnRzICovXG4gICAgbG9va0F0LCAvLyBXaGljaCBwb2ludCBpcyBjYW1lcmEgbG9va2luZyBhdCwgZGVmYXVsdCBvcmlnaW5cblxuICAgIC8qIFByb2plY3Rpb24gbWF0cml4IGFyZ3VtZW50cyAqL1xuICAgIGZvdiwgLy8gRmllbGQgb2YgdmlldyBjb3ZlcmVkIGJ5IGNhbWVyYVxuICAgIG5lYXIsIC8vIERpc3RhbmNlIG9mIG5lYXIgY2xpcHBpbmcgcGxhbmVcbiAgICBmYXIsIC8vIERpc3RhbmNlIG9mIGZhciBjbGlwcGluZyBwbGFuZVxuXG4gICAgLyogQWZ0ZXIgcHJvamVjdGlvbiAqL1xuICAgIHRyYW5zbGF0aW9uWCwgLy8gaW4gcGl4ZWxzXG4gICAgdHJhbnNsYXRpb25ZLCAvLyBpbiBwaXhlbHNcbiAgICB6b29tLFxuXG4gICAgLyogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgICBtaW5ab29tLFxuICAgIG1heFpvb20sXG5cbiAgICAvKiogSW50ZXJhY3Rpb24gc3RhdGVzLCByZXF1aXJlZCB0byBjYWxjdWxhdGUgY2hhbmdlIGR1cmluZyB0cmFuc2Zvcm0gKi9cbiAgICAvLyBNb2RlbCBzdGF0ZSB3aGVuIHRoZSBwYW4gb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWRcbiAgICBzdGFydFBhblZpZXdwb3J0LFxuICAgIHN0YXJ0UGFuUG9zLFxuICAgIGlzUGFubmluZyxcbiAgICAvLyBNb2RlbCBzdGF0ZSB3aGVuIHRoZSByb3RhdGUgb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWRcbiAgICBzdGFydFJvdGF0ZVZpZXdwb3J0LFxuICAgIGlzUm90YXRpbmcsXG4gICAgLy8gTW9kZWwgc3RhdGUgd2hlbiB0aGUgem9vbSBvcGVyYXRpb24gZmlyc3Qgc3RhcnRlZFxuICAgIHN0YXJ0Wm9vbVZpZXdwb3J0LFxuICAgIHN0YXJ0Wm9vbVBvc1xuICB9KSB7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZSh3aWR0aCksICdgd2lkdGhgIG11c3QgYmUgc3VwcGxpZWQnKTtcbiAgICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKGhlaWdodCksICdgaGVpZ2h0YCBtdXN0IGJlIHN1cHBsaWVkJyk7XG4gICAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShkaXN0YW5jZSksICdgZGlzdGFuY2VgIG11c3QgYmUgc3VwcGxpZWQnKTtcblxuICAgIHRoaXMuX3ZpZXdwb3J0UHJvcHMgPSB0aGlzLl9hcHBseUNvbnN0cmFpbnRzKHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgZGlzdGFuY2UsXG4gICAgICByb3RhdGlvblg6IGVuc3VyZUZpbml0ZShyb3RhdGlvblgsIGRlZmF1bHRTdGF0ZS5yb3RhdGlvblgpLFxuICAgICAgcm90YXRpb25PcmJpdDogZW5zdXJlRmluaXRlKHJvdGF0aW9uT3JiaXQsIGRlZmF1bHRTdGF0ZS5yb3RhdGlvbk9yYml0KSxcbiAgICAgIG9yYml0QXhpcyxcblxuICAgICAgYm91bmRzLFxuICAgICAgbG9va0F0OiBsb29rQXQgfHwgZGVmYXVsdFN0YXRlLmxvb2tBdCxcblxuICAgICAgZm92OiBlbnN1cmVGaW5pdGUoZm92LCBkZWZhdWx0U3RhdGUuZm92KSxcbiAgICAgIG5lYXI6IGVuc3VyZUZpbml0ZShuZWFyLCBkZWZhdWx0U3RhdGUubmVhciksXG4gICAgICBmYXI6IGVuc3VyZUZpbml0ZShmYXIsIGRlZmF1bHRTdGF0ZS5mYXIpLFxuICAgICAgdHJhbnNsYXRpb25YOiBlbnN1cmVGaW5pdGUodHJhbnNsYXRpb25YLCBkZWZhdWx0U3RhdGUudHJhbnNsYXRpb25YKSxcbiAgICAgIHRyYW5zbGF0aW9uWTogZW5zdXJlRmluaXRlKHRyYW5zbGF0aW9uWSwgZGVmYXVsdFN0YXRlLnRyYW5zbGF0aW9uWSksXG4gICAgICB6b29tOiBlbnN1cmVGaW5pdGUoem9vbSwgZGVmYXVsdFN0YXRlLnpvb20pLFxuXG4gICAgICBtaW5ab29tOiBlbnN1cmVGaW5pdGUobWluWm9vbSwgZGVmYXVsdENvbnN0cmFpbnRzLm1pblpvb20pLFxuICAgICAgbWF4Wm9vbTogZW5zdXJlRmluaXRlKG1heFpvb20sIGRlZmF1bHRDb25zdHJhaW50cy5tYXhab29tKVxuICAgIH0pO1xuXG4gICAgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSA9IHtcbiAgICAgIHN0YXJ0UGFuVmlld3BvcnQsXG4gICAgICBzdGFydFBhblBvcyxcbiAgICAgIGlzUGFubmluZyxcbiAgICAgIHN0YXJ0Um90YXRlVmlld3BvcnQsXG4gICAgICBpc1JvdGF0aW5nLFxuICAgICAgc3RhcnRab29tVmlld3BvcnQsXG4gICAgICBzdGFydFpvb21Qb3NcbiAgICB9O1xuICB9XG5cbiAgLyogUHVibGljIEFQSSAqL1xuXG4gIGdldFZpZXdwb3J0UHJvcHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG4gIH1cblxuICBnZXRJbnRlcmFjdGl2ZVN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9pbnRlcmFjdGl2ZVN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHBhbm5pbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIHBvaW50ZXIgZ3JhYnNcbiAgICovXG4gIHBhblN0YXJ0KHtwb3N9KSB7XG4gICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgT3JiaXRWaWV3cG9ydCh0aGlzLl92aWV3cG9ydFByb3BzKTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkT3JiaXRTdGF0ZSh7XG4gICAgICBzdGFydFBhblBvczogcG9zLFxuICAgICAgc3RhcnRQYW5WaWV3cG9ydDogdmlld3BvcnRcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYW5cbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIHBvaW50ZXIgaXNcbiAgICovXG4gIHBhbih7cG9zLCBzdGFydFBvc30pIHtcbiAgICBpZiAodGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5pc1JvdGF0aW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydFBhblBvcyA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRQYW5Qb3MgfHwgc3RhcnRQb3M7XG4gICAgYXNzZXJ0KHN0YXJ0UGFuUG9zLCAnYHN0YXJ0UGFuUG9zYCBwcm9wcyBpcyByZXF1aXJlZCcpO1xuXG4gICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLl9pbnRlcmFjdGl2ZVN0YXRlLnN0YXJ0UGFuVmlld3BvcnQgfHxcbiAgICAgIG5ldyBPcmJpdFZpZXdwb3J0KHRoaXMuX3ZpZXdwb3J0UHJvcHMpO1xuXG4gICAgY29uc3QgZGVsdGFYID0gcG9zWzBdIC0gc3RhcnRQYW5Qb3NbMF07XG4gICAgY29uc3QgZGVsdGFZID0gcG9zWzFdIC0gc3RhcnRQYW5Qb3NbMV07XG5cbiAgICBjb25zdCBjZW50ZXIgPSB2aWV3cG9ydC5wcm9qZWN0KHZpZXdwb3J0Lmxvb2tBdCk7XG4gICAgY29uc3QgbmV3TG9va0F0ID0gdmlld3BvcnQudW5wcm9qZWN0KFtjZW50ZXJbMF0gLSBkZWx0YVgsIGNlbnRlclsxXSAtIGRlbHRhWSwgY2VudGVyWzJdXSk7XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgbG9va0F0OiBuZXdMb29rQXQsXG4gICAgICBpc1Bhbm5pbmc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmQgcGFubmluZ1xuICAgKiBNdXN0IGNhbGwgaWYgYHBhblN0YXJ0KClgIHdhcyBjYWxsZWRcbiAgICovXG4gIHBhbkVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgc3RhcnRQYW5WaWV3cG9ydDogbnVsbCxcbiAgICAgIHN0YXJ0UGFuUG9zOiBudWxsLFxuICAgICAgaXNQYW5uaW5nOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcm90YXRpbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIHBvaW50ZXIgZ3JhYnNcbiAgICovXG4gIHJvdGF0ZVN0YXJ0KHtwb3N9KSB7XG4gICAgLy8gUm90YXRpb24gY2VudGVyIHNob3VsZCBiZSB0aGUgd29ybGRzcGFjZSBwb3NpdGlvbiBhdCB0aGUgY2VudGVyIG9mIHRoZVxuICAgIC8vIHRoZSBzY3JlZW4uIElmIG5vdCBmb3VuZCwgdXNlIHRoZSBsYXN0IG9uZS5cbiAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBPcmJpdFZpZXdwb3J0KHRoaXMuX3ZpZXdwb3J0UHJvcHMpO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRPcmJpdFN0YXRlKHtcbiAgICAgIHN0YXJ0Um90YXRlVmlld3BvcnQ6IHZpZXdwb3J0XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUm90YXRlXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGlzXG4gICAqL1xuICByb3RhdGUoe2RlbHRhU2NhbGVYLCBkZWx0YVNjYWxlWX0pIHtcbiAgICBpZiAodGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5pc1Bhbm5pbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkT3JiaXRTdGF0ZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IHtzdGFydFJvdGF0ZVZpZXdwb3J0fSA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG5cbiAgICBsZXQge3JvdGF0aW9uWCwgcm90YXRpb25PcmJpdH0gPSBzdGFydFJvdGF0ZVZpZXdwb3J0IHx8IHt9O1xuICAgIHJvdGF0aW9uWCA9IGVuc3VyZUZpbml0ZShyb3RhdGlvblgsIHRoaXMuX3ZpZXdwb3J0UHJvcHMucm90YXRpb25YKTtcbiAgICByb3RhdGlvbk9yYml0ID0gZW5zdXJlRmluaXRlKHJvdGF0aW9uT3JiaXQsIHRoaXMuX3ZpZXdwb3J0UHJvcHMucm90YXRpb25PcmJpdCk7XG5cbiAgICBjb25zdCBuZXdSb3RhdGlvblggPSBjbGFtcChyb3RhdGlvblggLSBkZWx0YVNjYWxlWSAqIDE4MCwgLTg5Ljk5OSwgODkuOTk5KTtcbiAgICBjb25zdCBuZXdSb3RhdGlvbk9yYml0ID0gKHJvdGF0aW9uT3JiaXQgLSBkZWx0YVNjYWxlWCAqIDE4MCkgJSAzNjA7XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgcm90YXRpb25YOiBuZXdSb3RhdGlvblgsXG4gICAgICByb3RhdGlvbk9yYml0OiBuZXdSb3RhdGlvbk9yYml0LFxuICAgICAgaXNSb3RhdGluZzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCByb3RhdGluZ1xuICAgKiBNdXN0IGNhbGwgaWYgYHJvdGF0ZVN0YXJ0KClgIHdhcyBjYWxsZWRcbiAgICovXG4gIHJvdGF0ZUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgc3RhcnRSb3RhdGVWaWV3cG9ydDogbnVsbCxcbiAgICAgIGlzUm90YXRpbmc6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB6b29taW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJzXG4gICAqL1xuICB6b29tU3RhcnQoe3Bvc30pIHtcbiAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBPcmJpdFZpZXdwb3J0KHRoaXMuX3ZpZXdwb3J0UHJvcHMpO1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkT3JiaXRTdGF0ZSh7XG4gICAgICBzdGFydFpvb21WaWV3cG9ydDogdmlld3BvcnQsXG4gICAgICBzdGFydFpvb21Qb3M6IHBvc1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFpvb21cbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIGN1cnJlbnQgY2VudGVyIGlzXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gc3RhcnRQb3MgLSB0aGUgY2VudGVyIHBvc2l0aW9uIGF0XG4gICAqICAgdGhlIHN0YXJ0IG9mIHRoZSBvcGVyYXRpb24uIE11c3QgYmUgc3VwcGxpZWQgb2YgYHpvb21TdGFydCgpYCB3YXMgbm90IGNhbGxlZFxuICAgKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgLSBhIG51bWJlciBiZXR3ZWVuIFswLCAxXSBzcGVjaWZ5aW5nIHRoZSBhY2N1bXVsYXRlZFxuICAgKiAgIHJlbGF0aXZlIHNjYWxlLlxuICAgKi9cbiAgem9vbSh7cG9zLCBzdGFydFBvcywgc2NhbGV9KSB7XG5cbiAgICBjb25zdCB7em9vbSwgbWluWm9vbSwgbWF4Wm9vbSwgd2lkdGgsIGhlaWdodH0gPSB0aGlzLl92aWV3cG9ydFByb3BzO1xuICAgIGNvbnN0IHN0YXJ0Wm9vbVBvcyA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRab29tUG9zIHx8IHN0YXJ0UG9zIHx8IHBvcztcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRab29tVmlld3BvcnQgfHxcbiAgICAgIG5ldyBPcmJpdFZpZXdwb3J0KHRoaXMuX3ZpZXdwb3J0UHJvcHMpO1xuXG4gICAgY29uc3QgbmV3Wm9vbSA9IGNsYW1wKHpvb20gKiBzY2FsZSwgbWluWm9vbSwgbWF4Wm9vbSk7XG4gICAgY29uc3QgZGVsdGFYID0gcG9zWzBdIC0gc3RhcnRab29tUG9zWzBdO1xuICAgIGNvbnN0IGRlbHRhWSA9IHBvc1sxXSAtIHN0YXJ0Wm9vbVBvc1sxXTtcblxuICAgIC8vIFpvb20gYXJvdW5kIHRoZSBjZW50ZXIgcG9zaXRpb25cbiAgICBjb25zdCBjeCA9IHN0YXJ0Wm9vbVBvc1swXSAtIHdpZHRoIC8gMjtcbiAgICBjb25zdCBjeSA9IGhlaWdodCAvIDIgLSBzdGFydFpvb21Qb3NbMV07XG4gICAgY29uc3QgY2VudGVyID0gdmlld3BvcnQucHJvamVjdCh2aWV3cG9ydC5sb29rQXQpO1xuICAgIGNvbnN0IG5ld0NlbnRlclggPSBjZW50ZXJbMF0gLSBjeCArIGN4ICogbmV3Wm9vbSAvIHpvb20gKyBkZWx0YVg7XG4gICAgY29uc3QgbmV3Q2VudGVyWSA9IGNlbnRlclsxXSArIGN5IC0gY3kgKiBuZXdab29tIC8gem9vbSAtIGRlbHRhWTtcblxuICAgIGNvbnN0IG5ld0xvb2tBdCA9IHZpZXdwb3J0LnVucHJvamVjdChbbmV3Q2VudGVyWCwgbmV3Q2VudGVyWSwgY2VudGVyWzJdXSk7XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgbG9va0F0OiBuZXdMb29rQXQsXG4gICAgICB6b29tOiBuZXdab29tXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRW5kIHpvb21pbmdcbiAgICogTXVzdCBjYWxsIGlmIGB6b29tU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgem9vbUVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZE9yYml0U3RhdGUoe1xuICAgICAgc3RhcnRab29tUG9zOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICAvKiBQcml2YXRlIG1ldGhvZHMgKi9cblxuICBfZ2V0VXBkYXRlZE9yYml0U3RhdGUobmV3UHJvcHMpIHtcbiAgICAvLyBVcGRhdGUgX3ZpZXdwb3J0UHJvcHNcbiAgICByZXR1cm4gbmV3IE9yYml0U3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5fdmlld3BvcnRQcm9wcywgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSwgbmV3UHJvcHMpKTtcbiAgfVxuXG4gIC8vIEFwcGx5IGFueSBjb25zdHJhaW50cyAobWF0aGVtYXRpY2FsIG9yIGRlZmluZWQgYnkgX3ZpZXdwb3J0UHJvcHMpIHRvIG1hcCBzdGF0ZVxuICBfYXBwbHlDb25zdHJhaW50cyhwcm9wcykge1xuICAgIC8vIEVuc3VyZSB6b29tIGlzIHdpdGhpbiBzcGVjaWZpZWQgcmFuZ2VcbiAgICBjb25zdCB7bWF4Wm9vbSwgbWluWm9vbSwgem9vbX0gPSBwcm9wcztcbiAgICBwcm9wcy56b29tID0gem9vbSA+IG1heFpvb20gPyBtYXhab29tIDogem9vbTtcbiAgICBwcm9wcy56b29tID0gem9vbSA8IG1pblpvb20gPyBtaW5ab29tIDogem9vbTtcblxuICAgIHJldHVybiBwcm9wcztcbiAgfVxufVxuIl19