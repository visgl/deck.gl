var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import MapState from './map-state';
import assert from 'assert';

// EVENT HANDLING PARAMETERS
var ZOOM_ACCEL = 0.01;

var PITCH_MOUSE_THRESHOLD = 5;
var PITCH_ACCEL = 1.2;

var EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown', 'keyup']
};

var ViewportControls = function () {
  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  function ViewportControls(ViewportState) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ViewportControls);

    assert(ViewportState);
    this.ViewportState = ViewportState;
    this.viewportState = null;
    this.viewportStateProps = null;
    this.eventManager = null;
    this._events = null;

    this._state = {
      isDragging: false
    };

    this.handleEvent = this.handleEvent.bind(this);

    this.setOptions(options);

    if (this.constructor === ViewportControls) {
      Object.seal(this);
    }
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */


  _createClass(ViewportControls, [{
    key: 'handleEvent',
    value: function handleEvent(event) {
      var ViewportState = this.ViewportState;

      this.viewportState = new ViewportState(Object.assign({}, this.viewportStateProps, this._state));

      switch (event.type) {
        case 'panstart':
          return this._onPanStart(event);
        case 'panmove':
          return this._onPan(event);
        case 'panend':
          return this._onPanEnd(event);
        case 'pinchstart':
          return this._onPinchStart(event);
        case 'pinch':
          return this._onPinch(event);
        case 'pinchend':
          return this._onPinchEnd(event);
        case 'doubletap':
          return this._onDoubleTap(event);
        case 'wheel':
          return this._onWheel(event);
        case 'keydown':
          return this._onKeyDown(event);
        case 'keyup':
          return this._onKeyUp(event);
        default:
          return false;
      }
    }

    /* Event utils */
    // Event object: http://hammerjs.github.io/api/#event-object

  }, {
    key: 'getCenter',
    value: function getCenter(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: 'isFunctionKeyPressed',
    value: function isFunctionKeyPressed(event) {
      var srcEvent = event.srcEvent;

      return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
    }
  }, {
    key: 'isDragging',
    value: function isDragging() {
      return this._state.isDragging;
    }

    /**
     * Extract interactivity options
     */

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var onViewportChange = options.onViewportChange,
          _options$onStateChang = options.onStateChange,
          onStateChange = _options$onStateChang === undefined ? this.onStateChange : _options$onStateChang,
          _options$eventManager = options.eventManager,
          eventManager = _options$eventManager === undefined ? this.eventManager : _options$eventManager,
          _options$scrollZoom = options.scrollZoom,
          scrollZoom = _options$scrollZoom === undefined ? true : _options$scrollZoom,
          _options$dragPan = options.dragPan,
          dragPan = _options$dragPan === undefined ? true : _options$dragPan,
          _options$dragRotate = options.dragRotate,
          dragRotate = _options$dragRotate === undefined ? true : _options$dragRotate,
          _options$doubleClickZ = options.doubleClickZoom,
          doubleClickZoom = _options$doubleClickZ === undefined ? true : _options$doubleClickZ,
          _options$touchZoomRot = options.touchZoomRotate,
          touchZoomRotate = _options$touchZoomRot === undefined ? true : _options$touchZoomRot,
          _options$keyboard = options.keyboard,
          keyboard = _options$keyboard === undefined ? true : _options$keyboard;


      this.onViewportChange = onViewportChange;
      this.onStateChange = onStateChange;
      this.viewportStateProps = options;

      if (this.eventManager !== eventManager) {
        // EventManager has changed
        this.eventManager = eventManager;
        this._events = {};
      }

      // Register/unregister events
      var isInteractive = Boolean(this.onViewportChange);
      this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
      this.toggleEvents(EVENT_TYPES.PAN, isInteractive && (dragPan || dragRotate));
      this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && touchZoomRotate);
      this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, isInteractive && doubleClickZoom);
      this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);

      this.scrollZoom = scrollZoom;
      this.dragPan = dragPan;
      this.dragRotate = dragRotate;
      this.doubleClickZoom = doubleClickZoom;
      this.touchZoomRotate = touchZoomRotate;
    }
  }, {
    key: 'toggleEvents',
    value: function toggleEvents(eventNames, enabled) {
      var _this = this;

      if (this.eventManager) {
        eventNames.forEach(function (eventName) {
          if (_this._events[eventName] !== enabled) {
            _this._events[eventName] = enabled;
            if (enabled) {
              _this.eventManager.on(eventName, _this.handleEvent);
            } else {
              _this.eventManager.off(eventName, _this.handleEvent);
            }
          }
        });
      }
    }

    // Private Methods

  }, {
    key: 'setState',
    value: function setState(newState) {
      Object.assign(this._state, newState);
      if (this.onStateChange) {
        this.onStateChange(this._state);
      }
    }

    /* Callback util */
    // formats map state and invokes callback function

  }, {
    key: 'updateViewport',
    value: function updateViewport(newViewportState) {
      var extraState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var oldViewport = this.viewportState.getViewportProps();
      var newViewport = newViewportState.getViewportProps();

      if (this.onViewportChange && Object.keys(newViewport).some(function (key) {
        return oldViewport[key] !== newViewport[key];
      })) {
        // Viewport has changed
        var viewport = this.viewportState.getViewport ? this.viewportState.getViewport() : null;
        this.onViewportChange(newViewport, viewport);
      }

      this.setState(Object.assign({}, newViewportState.getInteractiveState(), extraState));
    }

    /* Event handlers */
    // Default handler for the `panstart` event.

  }, {
    key: '_onPanStart',
    value: function _onPanStart(event) {
      var pos = this.getCenter(event);
      var newViewportState = this.viewportState.panStart({ pos: pos }).rotateStart({ pos: pos });
      return this.updateViewport(newViewportState, { isDragging: true });
    }

    // Default handler for the `panmove` event.

  }, {
    key: '_onPan',
    value: function _onPan(event) {
      return this.isFunctionKeyPressed(event) ? this._onPanMove(event) : this._onPanRotate(event);
    }

    // Default handler for the `panend` event.

  }, {
    key: '_onPanEnd',
    value: function _onPanEnd(event) {
      var newViewportState = this.viewportState.panEnd().rotateEnd();
      return this.updateViewport(newViewportState, { isDragging: false });
    }

    // Default handler for panning to move.
    // Called by `_onPan` when panning without function key pressed.

  }, {
    key: '_onPanMove',
    value: function _onPanMove(event) {
      if (!this.dragPan) {
        return false;
      }
      var pos = this.getCenter(event);
      var newViewportState = this.viewportState.pan({ pos: pos });
      return this.updateViewport(newViewportState);
    }

    // Default handler for panning to rotate.
    // Called by `_onPan` when panning with function key pressed.

  }, {
    key: '_onPanRotate',
    value: function _onPanRotate(event) {
      return this.viewportState instanceof MapState ? this._onPanRotateMap(event) : this._onPanRotateStandard(event);
    }

    // Normal pan to rotate

  }, {
    key: '_onPanRotateStandard',
    value: function _onPanRotateStandard(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _viewportState$getVie = this.viewportState.getViewportProps(),
          width = _viewportState$getVie.width,
          height = _viewportState$getVie.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = deltaY / height;

      var newViewportState = this.viewportState.rotate({ deltaScaleX: deltaScaleX, deltaScaleY: deltaScaleY });
      return this.updateViewport(newViewportState);
    }

    // Map specific pan to rotate
    // TODO - is this mapStateSpecific?

  }, {
    key: '_onPanRotateMap',
    value: function _onPanRotateMap(event) {
      if (!this.dragRotate) {
        return false;
      }

      var deltaX = event.deltaX,
          deltaY = event.deltaY;

      var _getCenter = this.getCenter(event),
          _getCenter2 = _slicedToArray(_getCenter, 2),
          centerY = _getCenter2[1];

      var startY = centerY - deltaY;

      var _viewportState$getVie2 = this.viewportState.getViewportProps(),
          width = _viewportState$getVie2.width,
          height = _viewportState$getVie2.height;

      var deltaScaleX = deltaX / width;
      var deltaScaleY = 0;

      if (deltaY > 0) {
        if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to -1 as we drag upwards
          deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
        }
      } else if (deltaY < 0) {
        if (startY > PITCH_MOUSE_THRESHOLD) {
          // Move from 0 to 1 as we drag upwards
          deltaScaleY = 1 - centerY / startY;
        }
      }
      deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));

      var newMapState = this.viewportState.rotate({ deltaScaleX: deltaScaleX, deltaScaleY: deltaScaleY });
      return this.updateViewport(newMapState);
    }

    // Default handler for the `wheel` event.

  }, {
    key: '_onWheel',
    value: function _onWheel(event) {
      if (!this.scrollZoom) {
        return false;
      }
      event.srcEvent.preventDefault();

      var pos = this.getCenter(event);
      var delta = event.delta;

      // Map wheel delta to relative scale

      var scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
      if (delta < 0 && scale !== 0) {
        scale = 1 / scale;
      }

      var newViewportState = this.viewportState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newViewportState);
    }

    // Default handler for the `pinchstart` event.

  }, {
    key: '_onPinchStart',
    value: function _onPinchStart(event) {
      var pos = this.getCenter(event);
      var newViewportState = this.viewportState.zoomStart({ pos: pos });
      return this.updateViewport(newViewportState, { isDragging: true });
    }

    // Default handler for the `pinch` event.

  }, {
    key: '_onPinch',
    value: function _onPinch(event) {
      if (!this.touchZoomRotate) {
        return false;
      }
      var pos = this.getCenter(event);
      var scale = event.scale;

      var newViewportState = this.viewportState.zoom({ pos: pos, scale: scale });
      return this.updateViewport(newViewportState);
    }

    // Default handler for the `pinchend` event.

  }, {
    key: '_onPinchEnd',
    value: function _onPinchEnd(event) {
      var newViewportState = this.viewportState.zoomEnd();
      return this.updateViewport(newViewportState, { isDragging: false });
    }

    // Default handler for the `doubletap` event.

  }, {
    key: '_onDoubleTap',
    value: function _onDoubleTap(event) {
      if (!this.doubleClickZoom) {
        return false;
      }
      var pos = this.getCenter(event);
      var isZoomOut = this.isFunctionKeyPressed(event);

      var newViewportState = this.viewportState.zoom({ pos: pos, scale: isZoomOut ? 0.5 : 2 });
      return this.updateViewport(newViewportState);
    }
  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      if (this.viewportState.isDragging) {
        return;
      }

      var KEY_BINDINGS = {
        w: 'moveForward',
        W: 'moveForward',
        ArrowUp: 'moveForward',

        s: 'moveBackward',
        S: 'moveBackward',
        ArrowDown: 'moveBackward',

        a: 'moveLeft',
        A: 'moveLeft',
        ArrowLeft: 'moveLeft',

        d: 'moveRight',
        D: 'moveRight',
        ArrowRight: 'moveRight',

        '=': 'zoomIn',
        '+': 'zoomIn',

        '-': 'zoomOut',

        '[': 'moveDown',
        ']': 'moveUp'
      };

      // keyCode is deprecated from web standards
      // code is not supported by IE/Edge
      var key = event.key;
      var handler = KEY_BINDINGS[key];
      if (this.viewportState[handler]) {
        var newViewportState = this.viewportState[handler]();
        this.updateViewport(newViewportState);
      }
    }
    /* eslint-enable complexity */

  }, {
    key: '_onKeyUp',
    value: function _onKeyUp(event) {}
  }]);

  return ViewportControls;
}();

export default ViewportControls;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NvbnRyb2xsZXJzL3ZpZXdwb3J0LWNvbnRyb2xzLmpzIl0sIm5hbWVzIjpbIk1hcFN0YXRlIiwiYXNzZXJ0IiwiWk9PTV9BQ0NFTCIsIlBJVENIX01PVVNFX1RIUkVTSE9MRCIsIlBJVENIX0FDQ0VMIiwiRVZFTlRfVFlQRVMiLCJXSEVFTCIsIlBBTiIsIlBJTkNIIiwiRE9VQkxFX1RBUCIsIktFWUJPQVJEIiwiVmlld3BvcnRDb250cm9scyIsIlZpZXdwb3J0U3RhdGUiLCJvcHRpb25zIiwidmlld3BvcnRTdGF0ZSIsInZpZXdwb3J0U3RhdGVQcm9wcyIsImV2ZW50TWFuYWdlciIsIl9ldmVudHMiLCJfc3RhdGUiLCJpc0RyYWdnaW5nIiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwic2V0T3B0aW9ucyIsImNvbnN0cnVjdG9yIiwiT2JqZWN0Iiwic2VhbCIsImV2ZW50IiwiYXNzaWduIiwidHlwZSIsIl9vblBhblN0YXJ0IiwiX29uUGFuIiwiX29uUGFuRW5kIiwiX29uUGluY2hTdGFydCIsIl9vblBpbmNoIiwiX29uUGluY2hFbmQiLCJfb25Eb3VibGVUYXAiLCJfb25XaGVlbCIsIl9vbktleURvd24iLCJfb25LZXlVcCIsIm9mZnNldENlbnRlciIsIngiLCJ5Iiwic3JjRXZlbnQiLCJCb29sZWFuIiwibWV0YUtleSIsImFsdEtleSIsImN0cmxLZXkiLCJzaGlmdEtleSIsIm9uVmlld3BvcnRDaGFuZ2UiLCJvblN0YXRlQ2hhbmdlIiwic2Nyb2xsWm9vbSIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tUm90YXRlIiwia2V5Ym9hcmQiLCJpc0ludGVyYWN0aXZlIiwidG9nZ2xlRXZlbnRzIiwiZXZlbnROYW1lcyIsImVuYWJsZWQiLCJmb3JFYWNoIiwiZXZlbnROYW1lIiwib24iLCJvZmYiLCJuZXdTdGF0ZSIsIm5ld1ZpZXdwb3J0U3RhdGUiLCJleHRyYVN0YXRlIiwib2xkVmlld3BvcnQiLCJnZXRWaWV3cG9ydFByb3BzIiwibmV3Vmlld3BvcnQiLCJrZXlzIiwic29tZSIsImtleSIsInZpZXdwb3J0IiwiZ2V0Vmlld3BvcnQiLCJzZXRTdGF0ZSIsImdldEludGVyYWN0aXZlU3RhdGUiLCJwb3MiLCJnZXRDZW50ZXIiLCJwYW5TdGFydCIsInJvdGF0ZVN0YXJ0IiwidXBkYXRlVmlld3BvcnQiLCJpc0Z1bmN0aW9uS2V5UHJlc3NlZCIsIl9vblBhbk1vdmUiLCJfb25QYW5Sb3RhdGUiLCJwYW5FbmQiLCJyb3RhdGVFbmQiLCJwYW4iLCJfb25QYW5Sb3RhdGVNYXAiLCJfb25QYW5Sb3RhdGVTdGFuZGFyZCIsImRlbHRhWCIsImRlbHRhWSIsIndpZHRoIiwiaGVpZ2h0IiwiZGVsdGFTY2FsZVgiLCJkZWx0YVNjYWxlWSIsInJvdGF0ZSIsImNlbnRlclkiLCJzdGFydFkiLCJNYXRoIiwiYWJzIiwibWluIiwibWF4IiwibmV3TWFwU3RhdGUiLCJwcmV2ZW50RGVmYXVsdCIsImRlbHRhIiwic2NhbGUiLCJleHAiLCJ6b29tIiwiem9vbVN0YXJ0Iiwiem9vbUVuZCIsImlzWm9vbU91dCIsIktFWV9CSU5ESU5HUyIsInciLCJXIiwiQXJyb3dVcCIsInMiLCJTIiwiQXJyb3dEb3duIiwiYSIsIkEiLCJBcnJvd0xlZnQiLCJkIiwiRCIsIkFycm93UmlnaHQiLCJoYW5kbGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFQLE1BQXFCLGFBQXJCO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQixRQUFuQjs7QUFFQTtBQUNBLElBQU1DLGFBQWEsSUFBbkI7O0FBRUEsSUFBTUMsd0JBQXdCLENBQTlCO0FBQ0EsSUFBTUMsY0FBYyxHQUFwQjs7QUFFQSxJQUFNQyxjQUFjO0FBQ2xCQyxTQUFPLENBQUMsT0FBRCxDQURXO0FBRWxCQyxPQUFL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QVNuQkMsV0FBRyxVQVRnQjtBQVVuQkMsV0FBRyxVQVZnQjtBQVduQkMsbUJBQVcsVUFYUTs7QUFhbkJDLFdBQUcsV0FiZ0I7QUFjbkJDLFdBQUcsV0FkZ0I7QUFlbkJDLG9CQUFZLFdBZk87O0FBaUJuQixhQUFLLFFBakJjO0FBa0JuQixhQUFLLFFBbEJjOztBQW9CbkIsYUFBSyxTQXBCYzs7QUFzQm5CLGFBQUssVUF0QmM7QUF1Qm5CLGFBQUs7QUF2QmMsT0FBckI7O0FBMEJBO0FBQ0E7QUFDQSxVQUFNcEQsTUFBTTlDLE1BQU04QyxHQUFsQjtBQUNBLFVBQU1xRCxVQUFVYixhQUFheEMsR0FBYixDQUFoQjtBQUNBLFVBQUksS0FBSzFELGFBQUwsQ0FBbUIrRyxPQUFuQixDQUFKLEVBQWlDO0FBQy9CLFlBQU01RCxtQkFBbUIsS0FBS25ELGFBQUwsQ0FBbUIrRyxPQUFuQixHQUF6QjtBQUNBLGFBQUs1QyxjQUFMLENBQW9CaEIsZ0JBQXBCO0FBQ0Q7QUFDRjtBQUNEOzs7OzZCQUVTdkMsSyxFQUFPLENBQ2Y7Ozs7OztlQXRWa0JmLGdCIiwiZmlsZSI6InZpZXdwb3J0LWNvbnRyb2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IE1hcFN0YXRlIGZyb20gJy4vbWFwLXN0YXRlJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLy8gRVZFTlQgSEFORExJTkcgUEFSQU1FVEVSU1xuY29uc3QgWk9PTV9BQ0NFTCA9IDAuMDE7XG5cbmNvbnN0IFBJVENIX01PVVNFX1RIUkVTSE9MRCA9IDU7XG5jb25zdCBQSVRDSF9BQ0NFTCA9IDEuMjtcblxuY29uc3QgRVZFTlRfVFlQRVMgPSB7XG4gIFdIRUVMOiBbJ3doZWVsJ10sXG4gIFBBTjogWydwYW5zdGFydCcsICdwYW5tb3ZlJywgJ3BhbmVuZCddLFxuICBQSU5DSDogWydwaW5jaHN0YXJ0JywgJ3BpbmNobW92ZScsICdwaW5jaGVuZCddLFxuICBET1VCTEVfVEFQOiBbJ2RvdWJsZXRhcCddLFxuICBLRVlCT0FSRDogWydrZXlkb3duJywgJ2tleXVwJ11cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdwb3J0Q29udHJvbHMge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBBIGNsYXNzIHRoYXQgaGFuZGxlcyBldmVudHMgYW5kIHVwZGF0ZXMgbWVyY2F0b3Igc3R5bGUgdmlld3BvcnQgcGFyYW1ldGVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IoVmlld3BvcnRTdGF0ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgYXNzZXJ0KFZpZXdwb3J0U3RhdGUpO1xuICAgIHRoaXMuVmlld3BvcnRTdGF0ZSA9IFZpZXdwb3J0U3RhdGU7XG4gICAgdGhpcy52aWV3cG9ydFN0YXRlID0gbnVsbDtcbiAgICB0aGlzLnZpZXdwb3J0U3RhdGVQcm9wcyA9IG51bGw7XG4gICAgdGhpcy5ldmVudE1hbmFnZXIgPSBudWxsO1xuICAgIHRoaXMuX2V2ZW50cyA9IG51bGw7XG5cbiAgICB0aGlzLl9zdGF0ZSA9IHtcbiAgICAgIGlzRHJhZ2dpbmc6IGZhbHNlXG4gICAgfTtcblxuICAgIHRoaXMuaGFuZGxlRXZlbnQgPSB0aGlzLmhhbmRsZUV2ZW50LmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLnNldE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBpZiAodGhpcy5jb25zdHJ1Y3RvciA9PT0gVmlld3BvcnRDb250cm9scykge1xuICAgICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZvciBldmVudHNcbiAgICogQHBhcmFtIHtoYW1tZXIuRXZlbnR9IGV2ZW50XG4gICAqL1xuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIGNvbnN0IHtWaWV3cG9ydFN0YXRlfSA9IHRoaXM7XG4gICAgdGhpcy52aWV3cG9ydFN0YXRlID0gbmV3IFZpZXdwb3J0U3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgdGhpcy52aWV3cG9ydFN0YXRlUHJvcHMsIHRoaXMuX3N0YXRlKSk7XG5cbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICBjYXNlICdwYW5zdGFydCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW5TdGFydChldmVudCk7XG4gICAgY2FzZSAncGFubW92ZSc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW4oZXZlbnQpO1xuICAgIGNhc2UgJ3BhbmVuZCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25QYW5FbmQoZXZlbnQpO1xuICAgIGNhc2UgJ3BpbmNoc3RhcnQnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGluY2hTdGFydChldmVudCk7XG4gICAgY2FzZSAncGluY2gnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uUGluY2goZXZlbnQpO1xuICAgIGNhc2UgJ3BpbmNoZW5kJzpcbiAgICAgIHJldHVybiB0aGlzLl9vblBpbmNoRW5kKGV2ZW50KTtcbiAgICBjYXNlICdkb3VibGV0YXAnOlxuICAgICAgcmV0dXJuIHRoaXMuX29uRG91YmxlVGFwKGV2ZW50KTtcbiAgICBjYXNlICd3aGVlbCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25XaGVlbChldmVudCk7XG4gICAgY2FzZSAna2V5ZG93bic6XG4gICAgICByZXR1cm4gdGhpcy5fb25LZXlEb3duKGV2ZW50KTtcbiAgICBjYXNlICdrZXl1cCc6XG4gICAgICByZXR1cm4gdGhpcy5fb25LZXlVcChldmVudCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKiBFdmVudCB1dGlscyAqL1xuICAvLyBFdmVudCBvYmplY3Q6IGh0dHA6Ly9oYW1tZXJqcy5naXRodWIuaW8vYXBpLyNldmVudC1vYmplY3RcbiAgZ2V0Q2VudGVyKGV2ZW50KSB7XG4gICAgY29uc3Qge29mZnNldENlbnRlcjoge3gsIHl9fSA9IGV2ZW50O1xuICAgIHJldHVybiBbeCwgeV07XG4gIH1cblxuICBpc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCkge1xuICAgIGNvbnN0IHtzcmNFdmVudH0gPSBldmVudDtcbiAgICByZXR1cm4gQm9vbGVhbihzcmNFdmVudC5tZXRhS2V5IHx8IHNyY0V2ZW50LmFsdEtleSB8fCBzcmNFdmVudC5jdHJsS2V5IHx8IHNyY0V2ZW50LnNoaWZ0S2V5KTtcbiAgfVxuXG4gIGlzRHJhZ2dpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlLmlzRHJhZ2dpbmc7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFjdCBpbnRlcmFjdGl2aXR5IG9wdGlvbnNcbiAgICovXG4gIHNldE9wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnN0IHtcbiAgICAgIG9uVmlld3BvcnRDaGFuZ2UsXG4gICAgICBvblN0YXRlQ2hhbmdlID0gdGhpcy5vblN0YXRlQ2hhbmdlLFxuICAgICAgZXZlbnRNYW5hZ2VyID0gdGhpcy5ldmVudE1hbmFnZXIsXG4gICAgICBzY3JvbGxab29tID0gdHJ1ZSxcbiAgICAgIGRyYWdQYW4gPSB0cnVlLFxuICAgICAgZHJhZ1JvdGF0ZSA9IHRydWUsXG4gICAgICBkb3VibGVDbGlja1pvb20gPSB0cnVlLFxuICAgICAgdG91Y2hab29tUm90YXRlID0gdHJ1ZSxcbiAgICAgIGtleWJvYXJkID0gdHJ1ZVxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgdGhpcy5vblZpZXdwb3J0Q2hhbmdlID0gb25WaWV3cG9ydENoYW5nZTtcbiAgICB0aGlzLm9uU3RhdGVDaGFuZ2UgPSBvblN0YXRlQ2hhbmdlO1xuICAgIHRoaXMudmlld3BvcnRTdGF0ZVByb3BzID0gb3B0aW9ucztcblxuICAgIGlmICh0aGlzLmV2ZW50TWFuYWdlciAhPT0gZXZlbnRNYW5hZ2VyKSB7XG4gICAgICAvLyBFdmVudE1hbmFnZXIgaGFzIGNoYW5nZWRcbiAgICAgIHRoaXMuZXZlbnRNYW5hZ2VyID0gZXZlbnRNYW5hZ2VyO1xuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgfVxuXG4gICAgLy8gUmVnaXN0ZXIvdW5yZWdpc3RlciBldmVudHNcbiAgICBjb25zdCBpc0ludGVyYWN0aXZlID0gQm9vbGVhbih0aGlzLm9uVmlld3BvcnRDaGFuZ2UpO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLldIRUVMLCBpc0ludGVyYWN0aXZlICYmIHNjcm9sbFpvb20pO1xuICAgIHRoaXMudG9nZ2xlRXZlbnRzKEVWRU5UX1RZUEVTLlBBTiwgaXNJbnRlcmFjdGl2ZSAmJiAoZHJhZ1BhbiB8fCBkcmFnUm90YXRlKSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuUElOQ0gsIGlzSW50ZXJhY3RpdmUgJiYgdG91Y2hab29tUm90YXRlKTtcbiAgICB0aGlzLnRvZ2dsZUV2ZW50cyhFVkVOVF9UWVBFUy5ET1VCTEVfVEFQLCBpc0ludGVyYWN0aXZlICYmIGRvdWJsZUNsaWNrWm9vbSk7XG4gICAgdGhpcy50b2dnbGVFdmVudHMoRVZFTlRfVFlQRVMuS0VZQk9BUkQsIGlzSW50ZXJhY3RpdmUgJiYga2V5Ym9hcmQpO1xuXG4gICAgdGhpcy5zY3JvbGxab29tID0gc2Nyb2xsWm9vbTtcbiAgICB0aGlzLmRyYWdQYW4gPSBkcmFnUGFuO1xuICAgIHRoaXMuZHJhZ1JvdGF0ZSA9IGRyYWdSb3RhdGU7XG4gICAgdGhpcy5kb3VibGVDbGlja1pvb20gPSBkb3VibGVDbGlja1pvb207XG4gICAgdGhpcy50b3VjaFpvb21Sb3RhdGUgPSB0b3VjaFpvb21Sb3RhdGU7XG4gIH1cblxuICB0b2dnbGVFdmVudHMoZXZlbnROYW1lcywgZW5hYmxlZCkge1xuICAgIGlmICh0aGlzLmV2ZW50TWFuYWdlcikge1xuICAgICAgZXZlbnROYW1lcy5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudHNbZXZlbnROYW1lXSAhPT0gZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50c1tldmVudE5hbWVdID0gZW5hYmxlZDtcbiAgICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIub24oZXZlbnROYW1lLCB0aGlzLmhhbmRsZUV2ZW50KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ldmVudE1hbmFnZXIub2ZmKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVFdmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBQcml2YXRlIE1ldGhvZHNcblxuICBzZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5fc3RhdGUsIG5ld1N0YXRlKTtcbiAgICBpZiAodGhpcy5vblN0YXRlQ2hhbmdlKSB7XG4gICAgICB0aGlzLm9uU3RhdGVDaGFuZ2UodGhpcy5fc3RhdGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qIENhbGxiYWNrIHV0aWwgKi9cbiAgLy8gZm9ybWF0cyBtYXAgc3RhdGUgYW5kIGludm9rZXMgY2FsbGJhY2sgZnVuY3Rpb25cbiAgdXBkYXRlVmlld3BvcnQobmV3Vmlld3BvcnRTdGF0ZSwgZXh0cmFTdGF0ZSA9IHt9KSB7XG4gICAgY29uc3Qgb2xkVmlld3BvcnQgPSB0aGlzLnZpZXdwb3J0U3RhdGUuZ2V0Vmlld3BvcnRQcm9wcygpO1xuICAgIGNvbnN0IG5ld1ZpZXdwb3J0ID0gbmV3Vmlld3BvcnRTdGF0ZS5nZXRWaWV3cG9ydFByb3BzKCk7XG5cbiAgICBpZiAodGhpcy5vblZpZXdwb3J0Q2hhbmdlICYmXG4gICAgICBPYmplY3Qua2V5cyhuZXdWaWV3cG9ydCkuc29tZShrZXkgPT4gb2xkVmlld3BvcnRba2V5XSAhPT0gbmV3Vmlld3BvcnRba2V5XSkpIHtcbiAgICAgIC8vIFZpZXdwb3J0IGhhcyBjaGFuZ2VkXG4gICAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMudmlld3BvcnRTdGF0ZS5nZXRWaWV3cG9ydCA/IHRoaXMudmlld3BvcnRTdGF0ZS5nZXRWaWV3cG9ydCgpIDogbnVsbDtcbiAgICAgIHRoaXMub25WaWV3cG9ydENoYW5nZShuZXdWaWV3cG9ydCwgdmlld3BvcnQpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgbmV3Vmlld3BvcnRTdGF0ZS5nZXRJbnRlcmFjdGl2ZVN0YXRlKCksIGV4dHJhU3RhdGUpKTtcbiAgfVxuXG4gIC8qIEV2ZW50IGhhbmRsZXJzICovXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwYW5zdGFydGAgZXZlbnQuXG4gIF9vblBhblN0YXJ0KGV2ZW50KSB7XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld1ZpZXdwb3J0U3RhdGUgPSB0aGlzLnZpZXdwb3J0U3RhdGUucGFuU3RhcnQoe3Bvc30pLnJvdGF0ZVN0YXJ0KHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdWaWV3cG9ydFN0YXRlLCB7aXNEcmFnZ2luZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBhbm1vdmVgIGV2ZW50LlxuICBfb25QYW4oZXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5pc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCkgPyB0aGlzLl9vblBhbk1vdmUoZXZlbnQpIDogdGhpcy5fb25QYW5Sb3RhdGUoZXZlbnQpO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHBhbmVuZGAgZXZlbnQuXG4gIF9vblBhbkVuZChldmVudCkge1xuICAgIGNvbnN0IG5ld1ZpZXdwb3J0U3RhdGUgPSB0aGlzLnZpZXdwb3J0U3RhdGUucGFuRW5kKCkucm90YXRlRW5kKCk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3Vmlld3BvcnRTdGF0ZSwge2lzRHJhZ2dpbmc6IGZhbHNlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHBhbm5pbmcgdG8gbW92ZS5cbiAgLy8gQ2FsbGVkIGJ5IGBfb25QYW5gIHdoZW4gcGFubmluZyB3aXRob3V0IGZ1bmN0aW9uIGtleSBwcmVzc2VkLlxuICBfb25QYW5Nb3ZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRyYWdQYW4pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IG5ld1ZpZXdwb3J0U3RhdGUgPSB0aGlzLnZpZXdwb3J0U3RhdGUucGFuKHtwb3N9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdWaWV3cG9ydFN0YXRlKTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgcGFubmluZyB0byByb3RhdGUuXG4gIC8vIENhbGxlZCBieSBgX29uUGFuYCB3aGVuIHBhbm5pbmcgd2l0aCBmdW5jdGlvbiBrZXkgcHJlc3NlZC5cbiAgX29uUGFuUm90YXRlKGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMudmlld3BvcnRTdGF0ZSBpbnN0YW5jZW9mIE1hcFN0YXRlID9cbiAgICAgIHRoaXMuX29uUGFuUm90YXRlTWFwKGV2ZW50KSA6XG4gICAgICB0aGlzLl9vblBhblJvdGF0ZVN0YW5kYXJkKGV2ZW50KTtcbiAgfVxuXG4gIC8vIE5vcm1hbCBwYW4gdG8gcm90YXRlXG4gIF9vblBhblJvdGF0ZVN0YW5kYXJkKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRyYWdSb3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB7ZGVsdGFYLCBkZWx0YVl9ID0gZXZlbnQ7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy52aWV3cG9ydFN0YXRlLmdldFZpZXdwb3J0UHJvcHMoKTtcblxuICAgIGNvbnN0IGRlbHRhU2NhbGVYID0gZGVsdGFYIC8gd2lkdGg7XG4gICAgY29uc3QgZGVsdGFTY2FsZVkgPSBkZWx0YVkgLyBoZWlnaHQ7XG5cbiAgICBjb25zdCBuZXdWaWV3cG9ydFN0YXRlID0gdGhpcy52aWV3cG9ydFN0YXRlLnJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3Vmlld3BvcnRTdGF0ZSk7XG4gIH1cblxuICAvLyBNYXAgc3BlY2lmaWMgcGFuIHRvIHJvdGF0ZVxuICAvLyBUT0RPIC0gaXMgdGhpcyBtYXBTdGF0ZVNwZWNpZmljP1xuICBfb25QYW5Sb3RhdGVNYXAoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuZHJhZ1JvdGF0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHtkZWx0YVgsIGRlbHRhWX0gPSBldmVudDtcbiAgICBjb25zdCBbLCBjZW50ZXJZXSA9IHRoaXMuZ2V0Q2VudGVyKGV2ZW50KTtcbiAgICBjb25zdCBzdGFydFkgPSBjZW50ZXJZIC0gZGVsdGFZO1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IHRoaXMudmlld3BvcnRTdGF0ZS5nZXRWaWV3cG9ydFByb3BzKCk7XG5cbiAgICBjb25zdCBkZWx0YVNjYWxlWCA9IGRlbHRhWCAvIHdpZHRoO1xuICAgIGxldCBkZWx0YVNjYWxlWSA9IDA7XG5cbiAgICBpZiAoZGVsdGFZID4gMCkge1xuICAgICAgaWYgKE1hdGguYWJzKGhlaWdodCAtIHN0YXJ0WSkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gLTEgYXMgd2UgZHJhZyB1cHdhcmRzXG4gICAgICAgIGRlbHRhU2NhbGVZID0gZGVsdGFZIC8gKHN0YXJ0WSAtIGhlaWdodCkgKiBQSVRDSF9BQ0NFTDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRlbHRhWSA8IDApIHtcbiAgICAgIGlmIChzdGFydFkgPiBQSVRDSF9NT1VTRV9USFJFU0hPTEQpIHtcbiAgICAgICAgLy8gTW92ZSBmcm9tIDAgdG8gMSBhcyB3ZSBkcmFnIHVwd2FyZHNcbiAgICAgICAgZGVsdGFTY2FsZVkgPSAxIC0gY2VudGVyWSAvIHN0YXJ0WTtcbiAgICAgIH1cbiAgICB9XG4gICAgZGVsdGFTY2FsZVkgPSBNYXRoLm1pbigxLCBNYXRoLm1heCgtMSwgZGVsdGFTY2FsZVkpKTtcblxuICAgIGNvbnN0IG5ld01hcFN0YXRlID0gdGhpcy52aWV3cG9ydFN0YXRlLnJvdGF0ZSh7ZGVsdGFTY2FsZVgsIGRlbHRhU2NhbGVZfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3TWFwU3RhdGUpO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBoYW5kbGVyIGZvciB0aGUgYHdoZWVsYCBldmVudC5cbiAgX29uV2hlZWwoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMuc2Nyb2xsWm9vbSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBldmVudC5zcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHtkZWx0YX0gPSBldmVudDtcblxuICAgIC8vIE1hcCB3aGVlbCBkZWx0YSB0byByZWxhdGl2ZSBzY2FsZVxuICAgIGxldCBzY2FsZSA9IDIgLyAoMSArIE1hdGguZXhwKC1NYXRoLmFicyhkZWx0YSAqIFpPT01fQUNDRUwpKSk7XG4gICAgaWYgKGRlbHRhIDwgMCAmJiBzY2FsZSAhPT0gMCkge1xuICAgICAgc2NhbGUgPSAxIC8gc2NhbGU7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3Vmlld3BvcnRTdGF0ZSA9IHRoaXMudmlld3BvcnRTdGF0ZS56b29tKHtwb3MsIHNjYWxlfSk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3Vmlld3BvcnRTdGF0ZSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGluY2hzdGFydGAgZXZlbnQuXG4gIF9vblBpbmNoU3RhcnQoZXZlbnQpIHtcbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3QgbmV3Vmlld3BvcnRTdGF0ZSA9IHRoaXMudmlld3BvcnRTdGF0ZS56b29tU3RhcnQoe3Bvc30pO1xuICAgIHJldHVybiB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld1ZpZXdwb3J0U3RhdGUsIHtpc0RyYWdnaW5nOiB0cnVlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgcGluY2hgIGV2ZW50LlxuICBfb25QaW5jaChldmVudCkge1xuICAgIGlmICghdGhpcy50b3VjaFpvb21Sb3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcG9zID0gdGhpcy5nZXRDZW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IHtzY2FsZX0gPSBldmVudDtcbiAgICBjb25zdCBuZXdWaWV3cG9ydFN0YXRlID0gdGhpcy52aWV3cG9ydFN0YXRlLnpvb20oe3Bvcywgc2NhbGV9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdWaWV3cG9ydFN0YXRlKTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaGFuZGxlciBmb3IgdGhlIGBwaW5jaGVuZGAgZXZlbnQuXG4gIF9vblBpbmNoRW5kKGV2ZW50KSB7XG4gICAgY29uc3QgbmV3Vmlld3BvcnRTdGF0ZSA9IHRoaXMudmlld3BvcnRTdGF0ZS56b29tRW5kKCk7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlVmlld3BvcnQobmV3Vmlld3BvcnRTdGF0ZSwge2lzRHJhZ2dpbmc6IGZhbHNlfSk7XG4gIH1cblxuICAvLyBEZWZhdWx0IGhhbmRsZXIgZm9yIHRoZSBgZG91YmxldGFwYCBldmVudC5cbiAgX29uRG91YmxlVGFwKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmRvdWJsZUNsaWNrWm9vbSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwb3MgPSB0aGlzLmdldENlbnRlcihldmVudCk7XG4gICAgY29uc3QgaXNab29tT3V0ID0gdGhpcy5pc0Z1bmN0aW9uS2V5UHJlc3NlZChldmVudCk7XG5cbiAgICBjb25zdCBuZXdWaWV3cG9ydFN0YXRlID0gdGhpcy52aWV3cG9ydFN0YXRlLnpvb20oe3Bvcywgc2NhbGU6IGlzWm9vbU91dCA/IDAuNSA6IDJ9KTtcbiAgICByZXR1cm4gdGhpcy51cGRhdGVWaWV3cG9ydChuZXdWaWV3cG9ydFN0YXRlKTtcbiAgfVxuXG4gIF9vbktleURvd24oZXZlbnQpIHtcbiAgICBpZiAodGhpcy52aWV3cG9ydFN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBLRVlfQklORElOR1MgPSB7XG4gICAgICB3OiAnbW92ZUZvcndhcmQnLFxuICAgICAgVzogJ21vdmVGb3J3YXJkJyxcbiAgICAgIEFycm93VXA6ICdtb3ZlRm9yd2FyZCcsXG5cbiAgICAgIHM6ICdtb3ZlQmFja3dhcmQnLFxuICAgICAgUzogJ21vdmVCYWNrd2FyZCcsXG4gICAgICBBcnJvd0Rvd246ICdtb3ZlQmFja3dhcmQnLFxuXG4gICAgICBhOiAnbW92ZUxlZnQnLFxuICAgICAgQTogJ21vdmVMZWZ0JyxcbiAgICAgIEFycm93TGVmdDogJ21vdmVMZWZ0JyxcblxuICAgICAgZDogJ21vdmVSaWdodCcsXG4gICAgICBEOiAnbW92ZVJpZ2h0JyxcbiAgICAgIEFycm93UmlnaHQ6ICdtb3ZlUmlnaHQnLFxuXG4gICAgICAnPSc6ICd6b29tSW4nLFxuICAgICAgJysnOiAnem9vbUluJyxcblxuICAgICAgJy0nOiAnem9vbU91dCcsXG5cbiAgICAgICdbJzogJ21vdmVEb3duJyxcbiAgICAgICddJzogJ21vdmVVcCdcbiAgICB9O1xuXG4gICAgLy8ga2V5Q29kZSBpcyBkZXByZWNhdGVkIGZyb20gd2ViIHN0YW5kYXJkc1xuICAgIC8vIGNvZGUgaXMgbm90IHN1cHBvcnRlZCBieSBJRS9FZGdlXG4gICAgY29uc3Qga2V5ID0gZXZlbnQua2V5O1xuICAgIGNvbnN0IGhhbmRsZXIgPSBLRVlfQklORElOR1Nba2V5XTtcbiAgICBpZiAodGhpcy52aWV3cG9ydFN0YXRlW2hhbmRsZXJdKSB7XG4gICAgICBjb25zdCBuZXdWaWV3cG9ydFN0YXRlID0gdGhpcy52aWV3cG9ydFN0YXRlW2hhbmRsZXJdKCk7XG4gICAgICB0aGlzLnVwZGF0ZVZpZXdwb3J0KG5ld1ZpZXdwb3J0U3RhdGUpO1xuICAgIH1cbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIGNvbXBsZXhpdHkgKi9cblxuICBfb25LZXlVcChldmVudCkge1xuICB9XG59XG4iXX0=