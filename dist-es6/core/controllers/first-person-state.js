var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import ViewState from './view-state';

import { Vector3 } from 'math.gl';
import assert from 'assert';

var MOVEMENT_SPEED = 1; // 1 meter per keyboard click
var ROTATION_STEP_DEGREES = 2;

/* Helpers */

// Constrain number between bounds
function clamp(x, min, max) {
  return x < min ? min : x > max ? max : x;
}

function ensureFinite(value, fallbackValue) {
  return Number.isFinite(value) ? value : fallbackValue;
}

var FirstPersonState = function (_ViewState) {
  _inherits(FirstPersonState, _ViewState);

  function FirstPersonState(_ref) {
    var width = _ref.width,
        height = _ref.height,
        position = _ref.position,
        bearing = _ref.bearing,
        pitch = _ref.pitch,
        longitude = _ref.longitude,
        latitude = _ref.latitude,
        zoom = _ref.zoom,
        _ref$syncBearing = _ref.syncBearing,
        syncBearing = _ref$syncBearing === undefined ? true : _ref$syncBearing,
        bounds = _ref.bounds,
        startPanEventPosition = _ref.startPanEventPosition,
        startPanPosition = _ref.startPanPosition,
        startRotateCenter = _ref.startRotateCenter,
        startRotateViewport = _ref.startRotateViewport,
        startZoomPos = _ref.startZoomPos,
        startZoom = _ref.startZoom;

    _classCallCheck(this, FirstPersonState);

    var _this = _possibleConstructorReturn(this, (FirstPersonState.__proto__ || Object.getPrototypeOf(FirstPersonState)).call(this, {
      width: width,
      height: height,
      position: position,
      bearing: bearing,
      pitch: pitch,
      longitude: longitude,
      latitude: latitude,
      zoom: zoom
    }));

    _this._interactiveState = {
      startPanEventPosition: startPanEventPosition,
      startPanPosition: startPanPosition,
      startRotateCenter: startRotateCenter,
      startRotateViewport: startRotateViewport,
      startZoomPos: startZoomPos,
      startZoom: startZoom
    };
    return _this;
  }

  /* Public API */

  _createClass(FirstPersonState, [{
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
      var _viewportProps = this._viewportProps,
          translationX = _viewportProps.translationX,
          translationY = _viewportProps.translationY;


      return this._getUpdatedState({
        startPanPosition: [translationX, translationY],
        startPanEventPosition: pos
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

      var startPanEventPosition = this._interactiveState.startPanEventPosition || startPos;
      assert(startPanEventPosition, '`startPanEventPosition` props is required');

      var _ref4 = this._interactiveState.startPanPosition || [],
          _ref5 = _slicedToArray(_ref4, 2),
          translationX = _ref5[0],
          translationY = _ref5[1];

      translationX = ensureFinite(translationX, this._viewportProps.translationX);
      translationY = ensureFinite(translationY, this._viewportProps.translationY);

      var deltaX = pos[0] - startPanEventPosition[0];
      var deltaY = pos[1] - startPanEventPosition[1];

      return this._getUpdatedState({
        translationX: translationX + deltaX,
        translationY: translationY - deltaY
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
        startPanPosition: null,
        startPanPos: null
      });
    }

    /**
     * Start rotating
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'rotateStart',
    value: function rotateStart(_ref6) {
      var pos = _ref6.pos;

      return this._getUpdatedState({
        startRotateCenter: this._viewportProps.position,
        startRotateViewport: this._viewportProps
      });
    }

    /**
     * Rotate
     * @param {[Number, Number]} pos - position on screen where the pointer is
     */

  }, {
    key: 'rotate',
    value: function rotate(_ref7) {
      var deltaScaleX = _ref7.deltaScaleX,
          deltaScaleY = _ref7.deltaScaleY;
      var _viewportProps2 = this._viewportProps,
          bearing = _viewportProps2.bearing,
          pitch = _viewportProps2.pitch;


      return this._getUpdatedState({
        bearing: bearing + deltaScaleX * 10,
        pitch: pitch - deltaScaleY * 10
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
        startRotateCenter: null,
        startRotateViewport: null
      });
    }

    /**
     * Start zooming
     * @param {[Number, Number]} pos - position on screen where the pointer grabs
     */

  }, {
    key: 'zoomStart',
    value: function zoomStart(_ref8) {
      var pos = _ref8.pos;

      return this._getUpdatedState({
        startZoomPos: pos,
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
    value: function zoom(_ref9) {
      var pos = _ref9.pos,
          startPos = _ref9.startPos,
          scale = _ref9.scale;
      var _viewportProps3 = this._viewportProps,
          zoom = _viewportProps3.zoom,
          minZoom = _viewportProps3.minZoom,
          maxZoom = _viewportProps3.maxZoom,
          width = _viewportProps3.width,
          height = _viewportProps3.height,
          translationX = _viewportProps3.translationX,
          translationY = _viewportProps3.translationY;


      var startZoomPos = this._interactiveState.startZoomPos || startPos || pos;

      var newZoom = clamp(zoom * scale, minZoom, maxZoom);
      var deltaX = pos[0] - startZoomPos[0];
      var deltaY = pos[1] - startZoomPos[1];

      // Zoom around the center position
      var cx = startZoomPos[0] - width / 2;
      var cy = height / 2 - startZoomPos[1];
      /* eslint-disable no-unused-vars */
      var newTranslationX = cx - (cx - translationX) * newZoom / zoom + deltaX;
      var newTranslationY = cy - (cy - translationY) * newZoom / zoom - deltaY;
      /* eslint-enable no-unused-vars */

      // return this._getUpdatedState({
      //   position
      //   translationX: newTranslationX,
      //   translationY: newTranslationY
      // });

      // TODO HACK
      return newZoom / zoom < 1 ? this.moveBackward() : this.moveForward();
    }

    /**
     * End zooming
     * Must call if `zoomStart()` was called
     */

  }, {
    key: 'zoomEnd',
    value: function zoomEnd() {
      return this._getUpdatedState({
        startZoomPos: null,
        startZoom: null
      });
    }
  }, {
    key: 'moveLeft',
    value: function moveLeft() {
      var bearing = this._viewportProps.bearing;

      var newBearing = bearing - ROTATION_STEP_DEGREES;
      return this._getUpdatedState({
        bearing: newBearing
      });
    }
  }, {
    key: 'moveRight',
    value: function moveRight() {
      var bearing = this._viewportProps.bearing;

      var newBearing = bearing + ROTATION_STEP_DEGREES;
      return this._getUpdatedState({
        bearing: newBearing
      });
    }
  }, {
    key: 'moveForward',
    value: function moveForward() {
      var position = this._viewportProps.position;

      var direction = this.getDirection();
      var delta = new Vector3(direction).normalize().scale(MOVEMENT_SPEED);
      return this._getUpdatedState({
        position: new Vector3(position).add(delta)
      });
    }
  }, {
    key: 'moveBackward',
    value: function moveBackward() {
      var position = this._viewportProps.position;

      var direction = this.getDirection();
      var delta = new Vector3(direction).normalize().scale(-MOVEMENT_SPEED);
      return this._getUpdatedState({
        position: new Vector3(position).add(delta)
      });
    }
  }, {
    key: 'moveUp',
    value: function moveUp() {
      var position = this._viewportProps.position;

      var delta = [0, 0, 1];
      return this._getUpdatedState({
        position: new Vector3(position).add(delta)
      });
    }
  }, {
    key: 'moveDown',
    value: function moveDown() {
      var position = this._viewportProps.position;

      var delta = position[2] >= 1 ? [0, 0, -1] : [0, 0, 0];
      return this._getUpdatedState({
        position: new Vector3(position).add(delta)
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
      return new FirstPersonState(Object.assign({}, this._viewportProps, this._interactiveState, newProps));
    }
  }]);

  return FirstPersonState;
}(ViewState);

export default FirstPersonState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRyb2xsZXJzL2ZpcnN0LXBlcnNvbi1zdGF0ZS5qcyJdLCJuYW1lcyI6WyJWaWV3U3RhdGUiLCJWZWN0b3IzIiwiYXNzZXJ0IiwiTU9WRU1FTlRfU1BFRUQiLCJST1RBVElPTl9TVEVQX0RFR1JFRVMiLCJjbGFtcCIsIngiLCJtaW4iLCJtYXgiLCJlbnN1cmVGaW5pdGUiLCJ2YWx1ZSIsImZhbGxiYWNrVmFsdWUiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsIkZpcnN0UGVyc29uU3RhdGUiLCJ3aWR0aCIsImhlaWdodCIsInBvc2l0aW9uIiwiYmVhcmluZyIsInBpdGNoIiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJ6b29tIiwic3luY0JlYXJpbmciLCJib3VuZHMiLCJzdGFydFBhbkV2ZW50UG9zaXRpb24iLCJzdGFydFBhblBvc2l0aW9uIiwic3RhcnRSb3RhdGVDZW50ZXIiLCJzdGFydFJvdGF0ZVZpZXdwb3J0Iiwic3RhcnRab29tUG9zIiwic3RhcnRab29tIiwiX2ludGVyYWN0aXZlU3RhdGUiLCJwb3MiLCJfdmlld3BvcnRQcm9wcyIsInRyYW5zbGF0aW9uWCIsInRyYW5zbGF0aW9uWSIsIl9nZXRVcGRhdGVkU3RhdGUiLCJzdGFydFBvcyIsImRlbHRhWCIsImRlbHRhWSIsInN0YXJ0UGFuUG9zIiwiZGVsdGFTY2FsZVgiLCJkZWx0YVNjYWxlWSIsInNjYWxlIiwibWluWm9vbSIsIm1heFpvb20iLCJuZXdab29tIiwiY3giLCJjeSIsIm5ld1RyYW5zbGF0aW9uWCIsIm5ld1RyYW5zbGF0aW9uWSIsIm1vdmVCYWNrd2FyZCIsIm1vdmVGb3J3YXJkIiwibmV3QmVhcmluZyIsImRpcmVjdGlvbiIsImdldERpcmVjdGlvbiIsImRlbHRhIiwibm9ybWFsaXplIiwiYWRkIiwibmV3UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxPQUFPQSxTQUFQLE1BQXNCLGNBQXRCOztBQUVB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QXNCO0FBQzNCZCxjQUFNLEtBQUtXLGNBQUwsQ0FBb0JYLElBQXBCLEdBQTJCO0FBRE4sT0FBdEIsQ0FBUDtBQUdEOztBQUVEOzs7O3FDQUVpQnFDLFEsRUFBVTtBQUN6QjtBQUNBLGFBQU8sSUFBSTdDLGdCQUFKLENBQ0w4QyxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQixLQUFLNUIsY0FBdkIsRUFBdUMsS0FBS0YsaUJBQTVDLEVBQStENEIsUUFBL0QsQ0FESyxDQUFQO0FBR0Q7Ozs7RUE5UTJDM0QsUzs7ZUFBekJjLGdCIiwiZmlsZSI6ImZpcnN0LXBlcnNvbi1zdGF0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBWaWV3U3RhdGUgZnJvbSAnLi92aWV3LXN0YXRlJztcblxuaW1wb3J0IHtWZWN0b3IzfSBmcm9tICdtYXRoLmdsJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgTU9WRU1FTlRfU1BFRUQgPSAxOyAgLy8gMSBtZXRlciBwZXIga2V5Ym9hcmQgY2xpY2tcbmNvbnN0IFJPVEFUSU9OX1NURVBfREVHUkVFUyA9IDI7XG5cbi8qIEhlbHBlcnMgKi9cblxuLy8gQ29uc3RyYWluIG51bWJlciBiZXR3ZWVuIGJvdW5kc1xuZnVuY3Rpb24gY2xhbXAoeCwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIHggPCBtaW4gPyBtaW4gOiAoeCA+IG1heCA/IG1heCA6IHgpO1xufVxuXG5mdW5jdGlvbiBlbnN1cmVGaW5pdGUodmFsdWUsIGZhbGxiYWNrVmFsdWUpIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrVmFsdWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpcnN0UGVyc29uU3RhdGUgZXh0ZW5kcyBWaWV3U3RhdGUge1xuXG4gIGNvbnN0cnVjdG9yKHtcbiAgICAvKiBWaWV3cG9ydCBhcmd1bWVudHMgKi9cbiAgICB3aWR0aCwgLy8gV2lkdGggb2Ygdmlld3BvcnRcbiAgICBoZWlnaHQsIC8vIEhlaWdodCBvZiB2aWV3cG9ydFxuXG4gICAgLy8gUG9zaXRpb24gYW5kIG9yaWVudGF0aW9uXG4gICAgcG9zaXRpb24sIC8vIHR5cGljYWxseSBpbiBtZXRlcnMgZnJvbSBhbmNob3IgcG9pbnRcblxuICAgIGJlYXJpbmcsIC8vIFJvdGF0aW9uIGFyb3VuZCB5IGF4aXNcbiAgICBwaXRjaCwgLy8gUm90YXRpb24gYXJvdW5kIHggYXhpc1xuXG4gICAgLy8gR2Vvc3BhdGlhbCBhbmNob3JcbiAgICBsb25naXR1ZGUsXG4gICAgbGF0aXR1ZGUsXG4gICAgem9vbSxcblxuICAgIHN5bmNCZWFyaW5nID0gdHJ1ZSwgLy8gV2hldGhlciB0byBsb2NrIGJlYXJpbmcgdG8gZGlyZWN0aW9uXG5cbiAgICAvLyBDb25zdHJhaW50cyAtIHNpbXBsZSBtb3ZlbWVudCBsaW1pdFxuICAgIC8vIEJvdW5kaW5nIGJveCBvZiB0aGUgd29ybGQsIGluIHRoZSBzaGFwZSBvZiB7bWluWCwgbWF4WCwgbWluWSwgbWF4WSwgbWluWiwgbWF4Wn1cbiAgICBib3VuZHMsXG5cbiAgICAvKiogSW50ZXJhY3Rpb24gc3RhdGVzLCByZXF1aXJlZCB0byBjYWxjdWxhdGUgY2hhbmdlIGR1cmluZyB0cmFuc2Zvcm0gKi9cbiAgICAvLyBNb2RlbCBzdGF0ZSB3aGVuIHRoZSBwYW4gb3BlcmF0aW9uIGZpcnN0IHN0YXJ0ZWRcbiAgICBzdGFydFBhbkV2ZW50UG9zaXRpb24sXG4gICAgc3RhcnRQYW5Qb3NpdGlvbixcblxuICAgIC8vIE1vZGVsIHN0YXRlIHdoZW4gdGhlIHJvdGF0ZSBvcGVyYXRpb24gZmlyc3Qgc3RhcnRlZFxuICAgIHN0YXJ0Um90YXRlQ2VudGVyLFxuICAgIHN0YXJ0Um90YXRlVmlld3BvcnQsXG5cbiAgICAvLyBNb2RlbCBzdGF0ZSB3aGVuIHRoZSB6b29tIG9wZXJhdGlvbiBmaXJzdCBzdGFydGVkXG4gICAgc3RhcnRab29tUG9zLFxuICAgIHN0YXJ0Wm9vbVxuICB9KSB7XG4gICAgc3VwZXIoe1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwb3NpdGlvbixcbiAgICAgIGJlYXJpbmcsXG4gICAgICBwaXRjaCxcbiAgICAgIGxvbmdpdHVkZSxcbiAgICAgIGxhdGl0dWRlLFxuICAgICAgem9vbVxuICAgIH0pO1xuXG4gICAgdGhpcy5faW50ZXJhY3RpdmVTdGF0ZSA9IHtcbiAgICAgIHN0YXJ0UGFuRXZlbnRQb3NpdGlvbixcbiAgICAgIHN0YXJ0UGFuUG9zaXRpb24sXG4gICAgICBzdGFydFJvdGF0ZUNlbnRlcixcbiAgICAgIHN0YXJ0Um90YXRlVmlld3BvcnQsXG4gICAgICBzdGFydFpvb21Qb3MsXG4gICAgICBzdGFydFpvb21cbiAgICB9O1xuICB9XG5cbiAgLyogUHVibGljIEFQSSAqL1xuXG4gIGdldEludGVyYWN0aXZlU3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlU3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcGFubmluZ1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHBvcyAtIHBvc2l0aW9uIG9uIHNjcmVlbiB3aGVyZSB0aGUgcG9pbnRlciBncmFic1xuICAgKi9cbiAgcGFuU3RhcnQoe3Bvc30pIHtcbiAgICBjb25zdCB7dHJhbnNsYXRpb25YLCB0cmFuc2xhdGlvbll9ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgc3RhcnRQYW5Qb3NpdGlvbjogW3RyYW5zbGF0aW9uWCwgdHJhbnNsYXRpb25ZXSxcbiAgICAgIHN0YXJ0UGFuRXZlbnRQb3NpdGlvbjogcG9zXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGFuXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGlzXG4gICAqL1xuICBwYW4oe3Bvcywgc3RhcnRQb3N9KSB7XG4gICAgY29uc3Qgc3RhcnRQYW5FdmVudFBvc2l0aW9uID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFBhbkV2ZW50UG9zaXRpb24gfHwgc3RhcnRQb3M7XG4gICAgYXNzZXJ0KHN0YXJ0UGFuRXZlbnRQb3NpdGlvbiwgJ2BzdGFydFBhbkV2ZW50UG9zaXRpb25gIHByb3BzIGlzIHJlcXVpcmVkJyk7XG5cbiAgICBsZXQgW3RyYW5zbGF0aW9uWCwgdHJhbnNsYXRpb25ZXSA9IHRoaXMuX2ludGVyYWN0aXZlU3RhdGUuc3RhcnRQYW5Qb3NpdGlvbiB8fCBbXTtcbiAgICB0cmFuc2xhdGlvblggPSBlbnN1cmVGaW5pdGUodHJhbnNsYXRpb25YLCB0aGlzLl92aWV3cG9ydFByb3BzLnRyYW5zbGF0aW9uWCk7XG4gICAgdHJhbnNsYXRpb25ZID0gZW5zdXJlRmluaXRlKHRyYW5zbGF0aW9uWSwgdGhpcy5fdmlld3BvcnRQcm9wcy50cmFuc2xhdGlvblkpO1xuXG4gICAgY29uc3QgZGVsdGFYID0gcG9zWzBdIC0gc3RhcnRQYW5FdmVudFBvc2l0aW9uWzBdO1xuICAgIGNvbnN0IGRlbHRhWSA9IHBvc1sxXSAtIHN0YXJ0UGFuRXZlbnRQb3NpdGlvblsxXTtcblxuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgdHJhbnNsYXRpb25YOiB0cmFuc2xhdGlvblggKyBkZWx0YVgsXG4gICAgICB0cmFuc2xhdGlvblk6IHRyYW5zbGF0aW9uWSAtIGRlbHRhWVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuZCBwYW5uaW5nXG4gICAqIE11c3QgY2FsbCBpZiBgcGFuU3RhcnQoKWAgd2FzIGNhbGxlZFxuICAgKi9cbiAgcGFuRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgc3RhcnRQYW5Qb3NpdGlvbjogbnVsbCxcbiAgICAgIHN0YXJ0UGFuUG9zOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcm90YXRpbmdcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIHBvaW50ZXIgZ3JhYnNcbiAgICovXG4gIHJvdGF0ZVN0YXJ0KHtwb3N9KSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBzdGFydFJvdGF0ZUNlbnRlcjogdGhpcy5fdmlld3BvcnRQcm9wcy5wb3NpdGlvbixcbiAgICAgIHN0YXJ0Um90YXRlVmlld3BvcnQ6IHRoaXMuX3ZpZXdwb3J0UHJvcHNcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGVcbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBwb3MgLSBwb3NpdGlvbiBvbiBzY3JlZW4gd2hlcmUgdGhlIHBvaW50ZXIgaXNcbiAgICovXG4gIHJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSkge1xuICAgIGNvbnN0IHtiZWFyaW5nLCBwaXRjaH0gPSB0aGlzLl92aWV3cG9ydFByb3BzO1xuXG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBiZWFyaW5nOiBiZWFyaW5nICsgZGVsdGFTY2FsZVggKiAxMCxcbiAgICAgIHBpdGNoOiBwaXRjaCAtIGRlbHRhU2NhbGVZICogMTBcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmQgcm90YXRpbmdcbiAgICogTXVzdCBjYWxsIGlmIGByb3RhdGVTdGFydCgpYCB3YXMgY2FsbGVkXG4gICAqL1xuICByb3RhdGVFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBzdGFydFJvdGF0ZUNlbnRlcjogbnVsbCxcbiAgICAgIHN0YXJ0Um90YXRlVmlld3BvcnQ6IG51bGxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB6b29taW5nXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBwb2ludGVyIGdyYWJzXG4gICAqL1xuICB6b29tU3RhcnQoe3Bvc30pIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAgIHN0YXJ0Wm9vbVBvczogcG9zLFxuICAgICAgc3RhcnRab29tOiB0aGlzLl92aWV3cG9ydFByb3BzLnpvb21cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gcG9zIC0gcG9zaXRpb24gb24gc2NyZWVuIHdoZXJlIHRoZSBjdXJyZW50IGNlbnRlciBpc1xuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IHN0YXJ0UG9zIC0gdGhlIGNlbnRlciBwb3NpdGlvbiBhdFxuICAgKiAgIHRoZSBzdGFydCBvZiB0aGUgb3BlcmF0aW9uLiBNdXN0IGJlIHN1cHBsaWVkIG9mIGB6b29tU3RhcnQoKWAgd2FzIG5vdCBjYWxsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIC0gYSBudW1iZXIgYmV0d2VlbiBbMCwgMV0gc3BlY2lmeWluZyB0aGUgYWNjdW11bGF0ZWRcbiAgICogICByZWxhdGl2ZSBzY2FsZS5cbiAgICovXG4gIHpvb20oe3Bvcywgc3RhcnRQb3MsIHNjYWxlfSkge1xuICAgIGNvbnN0IHt6b29tLCBtaW5ab29tLCBtYXhab29tLCB3aWR0aCwgaGVpZ2h0LCB0cmFuc2xhdGlvblgsIHRyYW5zbGF0aW9uWX0gPSB0aGlzLl92aWV3cG9ydFByb3BzO1xuXG4gICAgY29uc3Qgc3RhcnRab29tUG9zID0gdGhpcy5faW50ZXJhY3RpdmVTdGF0ZS5zdGFydFpvb21Qb3MgfHwgc3RhcnRQb3MgfHwgcG9zO1xuXG4gICAgY29uc3QgbmV3Wm9vbSA9IGNsYW1wKHpvb20gKiBzY2FsZSwgbWluWm9vbSwgbWF4Wm9vbSk7XG4gICAgY29uc3QgZGVsdGFYID0gcG9zWzBdIC0gc3RhcnRab29tUG9zWzBdO1xuICAgIGNvbnN0IGRlbHRhWSA9IHBvc1sxXSAtIHN0YXJ0Wm9vbVBvc1sxXTtcblxuICAgIC8vIFpvb20gYXJvdW5kIHRoZSBjZW50ZXIgcG9zaXRpb25cbiAgICBjb25zdCBjeCA9IHN0YXJ0Wm9vbVBvc1swXSAtIHdpZHRoIC8gMjtcbiAgICBjb25zdCBjeSA9IGhlaWdodCAvIDIgLSBzdGFydFpvb21Qb3NbMV07XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICBjb25zdCBuZXdUcmFuc2xhdGlvblggPSBjeCAtIChjeCAtIHRyYW5zbGF0aW9uWCkgKiBuZXdab29tIC8gem9vbSArIGRlbHRhWDtcbiAgICBjb25zdCBuZXdUcmFuc2xhdGlvblkgPSBjeSAtIChjeSAtIHRyYW5zbGF0aW9uWSkgKiBuZXdab29tIC8gem9vbSAtIGRlbHRhWTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbiAgICAvLyByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAvLyAgIHBvc2l0aW9uXG4gICAgLy8gICB0cmFuc2xhdGlvblg6IG5ld1RyYW5zbGF0aW9uWCxcbiAgICAvLyAgIHRyYW5zbGF0aW9uWTogbmV3VHJhbnNsYXRpb25ZXG4gICAgLy8gfSk7XG5cbiAgICAvLyBUT0RPIEhBQ0tcbiAgICByZXR1cm4gbmV3Wm9vbSAvIHpvb20gPCAxID8gdGhpcy5tb3ZlQmFja3dhcmQoKSA6IHRoaXMubW92ZUZvcndhcmQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmQgem9vbWluZ1xuICAgKiBNdXN0IGNhbGwgaWYgYHpvb21TdGFydCgpYCB3YXMgY2FsbGVkXG4gICAqL1xuICB6b29tRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgc3RhcnRab29tUG9zOiBudWxsLFxuICAgICAgc3RhcnRab29tOiBudWxsXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlTGVmdCgpIHtcbiAgICBjb25zdCB7YmVhcmluZ30gPSB0aGlzLl92aWV3cG9ydFByb3BzO1xuICAgIGNvbnN0IG5ld0JlYXJpbmcgPSBiZWFyaW5nIC0gUk9UQVRJT05fU1RFUF9ERUdSRUVTO1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgYmVhcmluZzogbmV3QmVhcmluZ1xuICAgIH0pO1xuICB9XG5cbiAgbW92ZVJpZ2h0KCkge1xuICAgIGNvbnN0IHtiZWFyaW5nfSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG4gICAgY29uc3QgbmV3QmVhcmluZyA9IGJlYXJpbmcgKyBST1RBVElPTl9TVEVQX0RFR1JFRVM7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBiZWFyaW5nOiBuZXdCZWFyaW5nXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlRm9yd2FyZCgpIHtcbiAgICBjb25zdCB7cG9zaXRpb259ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbigpO1xuICAgIGNvbnN0IGRlbHRhID0gbmV3IFZlY3RvcjMoZGlyZWN0aW9uKS5ub3JtYWxpemUoKS5zY2FsZShNT1ZFTUVOVF9TUEVFRCk7XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMocG9zaXRpb24pLmFkZChkZWx0YSlcbiAgICB9KTtcbiAgfVxuXG4gIG1vdmVCYWNrd2FyZCgpIHtcbiAgICBjb25zdCB7cG9zaXRpb259ID0gdGhpcy5fdmlld3BvcnRQcm9wcztcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLmdldERpcmVjdGlvbigpO1xuICAgIGNvbnN0IGRlbHRhID0gbmV3IFZlY3RvcjMoZGlyZWN0aW9uKS5ub3JtYWxpemUoKS5zY2FsZSgtTU9WRU1FTlRfU1BFRUQpO1xuICAgIHJldHVybiB0aGlzLl9nZXRVcGRhdGVkU3RhdGUoe1xuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IzKHBvc2l0aW9uKS5hZGQoZGVsdGEpXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlVXAoKSB7XG4gICAgY29uc3Qge3Bvc2l0aW9ufSA9IHRoaXMuX3ZpZXdwb3J0UHJvcHM7XG4gICAgY29uc3QgZGVsdGEgPSBbMCwgMCwgMV07XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMocG9zaXRpb24pLmFkZChkZWx0YSlcbiAgICB9KTtcbiAgfVxuXG4gIG1vdmVEb3duKCkge1xuICAgIGNvbnN0IHtwb3NpdGlvbn0gPSB0aGlzLl92aWV3cG9ydFByb3BzO1xuICAgIGNvbnN0IGRlbHRhID0gcG9zaXRpb25bMl0gPj0gMSA/IFswLCAwLCAtMV0gOiBbMCwgMCwgMF07XG4gICAgcmV0dXJuIHRoaXMuX2dldFVwZGF0ZWRTdGF0ZSh7XG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjMocG9zaXRpb24pLmFkZChkZWx0YSlcbiAgICB9KTtcbiAgfVxuXG4gIHpvb21JbigpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAgIHpvb206IHRoaXMuX3ZpZXdwb3J0UHJvcHMuem9vbSArIDAuMlxuICAgIH0pO1xuICB9XG5cbiAgem9vbU91dCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VXBkYXRlZFN0YXRlKHtcbiAgICAgIHpvb206IHRoaXMuX3ZpZXdwb3J0UHJvcHMuem9vbSAtIDAuMlxuICAgIH0pO1xuICB9XG5cbiAgLyogUHJpdmF0ZSBtZXRob2RzICovXG5cbiAgX2dldFVwZGF0ZWRTdGF0ZShuZXdQcm9wcykge1xuICAgIC8vIFVwZGF0ZSBfdmlld3BvcnRQcm9wc1xuICAgIHJldHVybiBuZXcgRmlyc3RQZXJzb25TdGF0ZShcbiAgICAgIE9iamVjdC5hc3NpZ24oe30sIHRoaXMuX3ZpZXdwb3J0UHJvcHMsIHRoaXMuX2ludGVyYWN0aXZlU3RhdGUsIG5ld1Byb3BzKVxuICAgICk7XG4gIH1cbn1cbiJdfQ==