var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import PropTypes from 'prop-types';
import OrbitViewport from '../viewports/orbit-viewport';
import OrbitState from '../controllers/orbit-state';
import ViewportControls from '../controllers/viewport-controls';
import { EventManager } from 'mjolnir.js';

var PREFIX = '-webkit-';

var CURSOR = {
  GRABBING: PREFIX + 'grabbing',
  GRAB: PREFIX + 'grab',
  POINTER: 'pointer'
};

var propTypes = {
  /* Viewport properties */
  lookAt: PropTypes.arrayOf(PropTypes.number), // target position
  distance: PropTypes.number, // distance from camera to the target
  rotationX: PropTypes.number, // rotation around X axis
  rotationY: PropTypes.number, // rotation around Y axis
  translationX: PropTypes.number, // translation x in screen space
  translationY: PropTypes.number, // translation y in screen space
  zoom: PropTypes.number, // scale in screen space
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  fov: PropTypes.number, // field of view
  near: PropTypes.number,
  far: PropTypes.number,
  width: PropTypes.number.isRequired, // viewport width in pixels
  height: PropTypes.number.isRequired, // viewport height in pixels

  /* Model properties */
  bounds: PropTypes.object, // bounds in the shape of {minX, minY, minZ, maxX, maxY, maxZ}

  /* Callbacks */
  onViewportChange: PropTypes.func.isRequired,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  /* Controls */
  orbitControls: PropTypes.object
};

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging;
  return isDragging ? CURSOR.GRABBING : CURSOR.GRAB;
};

var defaultProps = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  translationX: 0,
  translationY: 0,
  distance: 10,
  zoom: 1,
  minZoom: 0,
  maxZoom: Infinity,
  fov: 50,
  near: 1,
  far: 1000,
  getCursor: getDefaultCursor
};

/*
 * Maps mouse interaction to a deck.gl Viewport
 */

var OrbitControllerJS = function () {
  _createClass(OrbitControllerJS, null, [{
    key: 'getViewport',


    // Returns a deck.gl Viewport instance, to be used with the DeckGL component
    value: function getViewport(viewport) {
      return new OrbitViewport(viewport);
    }
  }]);

  function OrbitControllerJS(props) {
    _classCallCheck(this, OrbitControllerJS);

    props = Object.assign({}, defaultProps, props);

    this.props = props;

    this.state = {
      // Whether the cursor is down
      isDragging: false
    };

    this.canvas = props.canvas;

    var eventManager = new EventManager(this.canvas);

    this._eventManager = eventManager;

    this._controls = props.orbitControls || new ViewportControls(OrbitState);
    this._controls.setOptions(Object.assign({}, this.props, {
      onStateChange: this._onInteractiveStateChange.bind(this),
      eventManager: eventManager
    }));
  }

  _createClass(OrbitControllerJS, [{
    key: 'setProps',
    value: function setProps(props) {
      props = Object.assign({}, this.props, props);
      this.props = props;

      this._controls.setOptions(props);
    }
  }, {
    key: 'finalize',
    value: function finalize() {
      this._eventManager.destroy();
    }
  }, {
    key: '_onInteractiveStateChange',
    value: function _onInteractiveStateChange(_ref2) {
      var _ref2$isDragging = _ref2.isDragging,
          isDragging = _ref2$isDragging === undefined ? false : _ref2$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.state.isDragging = isDragging;
        var getCursor = this.props.getCursor;

        this.canvas.style.cursor = getCursor(this.state);
      }
    }
  }]);

  return OrbitControllerJS;
}();

export default OrbitControllerJS;


OrbitControllerJS.displayName = 'OrbitController';
OrbitControllerJS.propTypes = propTypes;
OrbitControllerJS.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3B1cmUtanMvb3JiaXQtY29udHJvbGxlci1qcy5qcyJdLCJuYW1lcyI6WyJQcm9wVHlwZXMiLCJPcmJpdFZpZXdwb3J0IiwiT3JiaXRTdGF0ZSIsIlZpZXdwb3J0Q29udHJvbHMiLCJFdmVudE1hbmFnZXIiLCJQUkVGSVgiLCJDVVJTT1IiLCJHUkFCQklORyIsIkdSQUIiLCJQT0lOVEVSIiwicHJvcFR5cGVzIiwibG9va0F0IiwiYXJyYXlPZiIsIm51bWJlciIsImRpc3RhbmNlIiwicm90YXRpb25YIiwicm90YXRpb25ZIiwidHJhbnNsYXRpb25YIiwidHJhbnNsYXRpb25ZIiwiem9vbSIsIm1pblpvb20iLCJtYXhab29tIiwiZm92IiwibmVhciIsImZhciIsIndpZHRoIiwiaXNSZXF1aXJlZCIsImhlaWdodCIsImJvdW5kcyIsIm9iamVjdCIsIm9uVmlld3BvcnRDaGFuZ2UiLCJmdW5jIiwiZ2V0Q3Vyc29yIiwib3JiaXRDb250cm9scyIsImdldERlZmF1bHRDdXJzb3IiLCJpc0RyYWdnaW5nIiwiZGVmYXVsdFByb3BzIiwiSW5maW5pdHkiLCJPcmJpdENvbnRyb2xsZXJKUyIsInZpZXdwb3J0IiwicHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJzdGF0ZSIsImNhbnZhcyIsImV2ZW50TWFuYWdlciIsIl9ldmVudE1hbmFnZXIiLCJfY29udHJvbHMiLCJzZXRPcHRpb25zIiwib25TdGF0ZUNoYW5nZSIsIl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UiLCJiaW5kIiwiZGVzdHJveSIsInN0eWxlIiwiY3Vyc29yIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPQSxTQUFQLE1BQXNCLFlBQXRCO0FBQ0EsT0FBT0MsYUFBUCxNQUEwQiw2QkFBMUI7QUFDQSxPQUFPQyxVQUFQLE1BQXVCLDRCQUF2QjtBQUNBLE9BQU9DLGdCQUFQLE1BQTZCLGtDQUE3QjtBQUNBLFNBQVFDLFlBQVIsUUFBMkIsWUFBM0I7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TUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS0YsS0FBdkIsRUFBOEJBLEtBQTlCLENBQVI7QUFDQSxXQUFLQSxLQUFMLEdBQWFBLEtBQWI7O0FBRUEsV0FBS08sU0FBTCxDQUFlQyxVQUFmLENBQTBCUixLQUExQjtBQUNEOzs7K0JBRVU7QUFDVCxXQUFLTSxhQUFMLENBQW1CTSxPQUFuQjtBQUNEOzs7cURBRStDO0FBQUEsbUNBQXJCakIsVUFBcUI7QUFBQSxVQUFyQkEsVUFBcUIsb0NBQVIsS0FBUTs7QUFDOUMsVUFBSUEsZUFBZSxLQUFLUSxLQUFMLENBQVdSLFVBQTlCLEVBQTBDO0FBQ3hDLGFBQUtRLEtBQUwsQ0FBV1IsVUFBWCxHQUF3QkEsVUFBeEI7QUFEd0MsWUFFakNILFNBRmlDLEdBRXBCLEtBQUtRLEtBRmUsQ0FFakNSLFNBRmlDOztBQUd4QyxhQUFLWSxNQUFMLENBQVlTLEtBQVosQ0FBa0JDLE1BQWxCLEdBQTJCdEIsVUFBVSxLQUFLVyxLQUFmLENBQTNCO0FBQ0Q7QUFDRjs7Ozs7O2VBL0NrQkwsaUI7OztBQWtEckJBLGtCQUFrQmlCLFdBQWxCLEdBQWdDLGlCQUFoQztBQUNBakIsa0JBQWtCNUIsU0FBbEIsR0FBOEJBLFNBQTlCO0FBQ0E0QixrQkFBa0JGLFlBQWxCLEdBQWlDQSxZQUFqQyIsImZpbGUiOiJvcmJpdC1jb250cm9sbGVyLWpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBPcmJpdFZpZXdwb3J0IGZyb20gJy4uL3ZpZXdwb3J0cy9vcmJpdC12aWV3cG9ydCc7XG5pbXBvcnQgT3JiaXRTdGF0ZSBmcm9tICcuLi9jb250cm9sbGVycy9vcmJpdC1zdGF0ZSc7XG5pbXBvcnQgVmlld3BvcnRDb250cm9scyBmcm9tICcuLi9jb250cm9sbGVycy92aWV3cG9ydC1jb250cm9scyc7XG5pbXBvcnQge0V2ZW50TWFuYWdlcn0gZnJvbSAnbWpvbG5pci5qcyc7XG5cbmNvbnN0IFBSRUZJWCA9ICctd2Via2l0LSc7XG5cbmNvbnN0IENVUlNPUiA9IHtcbiAgR1JBQkJJTkc6IGAke1BSRUZJWH1ncmFiYmluZ2AsXG4gIEdSQUI6IGAke1BSRUZJWH1ncmFiYCxcbiAgUE9JTlRFUjogJ3BvaW50ZXInXG59O1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIC8qIFZpZXdwb3J0IHByb3BlcnRpZXMgKi9cbiAgbG9va0F0OiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubnVtYmVyKSwgLy8gdGFyZ2V0IHBvc2l0aW9uXG4gIGRpc3RhbmNlOiBQcm9wVHlwZXMubnVtYmVyLCAvLyBkaXN0YW5jZSBmcm9tIGNhbWVyYSB0byB0aGUgdGFyZ2V0XG4gIHJvdGF0aW9uWDogUHJvcFR5cGVzLm51bWJlciwgLy8gcm90YXRpb24gYXJvdW5kIFggYXhpc1xuICByb3RhdGlvblk6IFByb3BUeXBlcy5udW1iZXIsIC8vIHJvdGF0aW9uIGFyb3VuZCBZIGF4aXNcbiAgdHJhbnNsYXRpb25YOiBQcm9wVHlwZXMubnVtYmVyLCAvLyB0cmFuc2xhdGlvbiB4IGluIHNjcmVlbiBzcGFjZVxuICB0cmFuc2xhdGlvblk6IFByb3BUeXBlcy5udW1iZXIsIC8vIHRyYW5zbGF0aW9uIHkgaW4gc2NyZWVuIHNwYWNlXG4gIHpvb206IFByb3BUeXBlcy5udW1iZXIsIC8vIHNjYWxlIGluIHNjcmVlbiBzcGFjZVxuICBtaW5ab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICBtYXhab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICBmb3Y6IFByb3BUeXBlcy5udW1iZXIsIC8vIGZpZWxkIG9mIHZpZXdcbiAgbmVhcjogUHJvcFR5cGVzLm51bWJlcixcbiAgZmFyOiBQcm9wVHlwZXMubnVtYmVyLFxuICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvLyB2aWV3cG9ydCB3aWR0aCBpbiBwaXhlbHNcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8vIHZpZXdwb3J0IGhlaWdodCBpbiBwaXhlbHNcblxuICAvKiBNb2RlbCBwcm9wZXJ0aWVzICovXG4gIGJvdW5kczogUHJvcFR5cGVzLm9iamVjdCwgLy8gYm91bmRzIGluIHRoZSBzaGFwZSBvZiB7bWluWCwgbWluWSwgbWluWiwgbWF4WCwgbWF4WSwgbWF4Wn1cblxuICAvKiBDYWxsYmFja3MgKi9cbiAgb25WaWV3cG9ydENoYW5nZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiBDb250cm9scyAqL1xuICBvcmJpdENvbnRyb2xzOiBQcm9wVHlwZXMub2JqZWN0XG59O1xuXG5jb25zdCBnZXREZWZhdWx0Q3Vyc29yID0gKHtpc0RyYWdnaW5nfSkgPT4gaXNEcmFnZ2luZyA/IENVUlNPUi5HUkFCQklORyA6IENVUlNPUi5HUkFCO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGxvb2tBdDogWzAsIDAsIDBdLFxuICByb3RhdGlvblg6IDAsXG4gIHJvdGF0aW9uWTogMCxcbiAgdHJhbnNsYXRpb25YOiAwLFxuICB0cmFuc2xhdGlvblk6IDAsXG4gIGRpc3RhbmNlOiAxMCxcbiAgem9vbTogMSxcbiAgbWluWm9vbTogMCxcbiAgbWF4Wm9vbTogSW5maW5pdHksXG4gIGZvdjogNTAsXG4gIG5lYXI6IDEsXG4gIGZhcjogMTAwMCxcbiAgZ2V0Q3Vyc29yOiBnZXREZWZhdWx0Q3Vyc29yXG59O1xuXG4vKlxuICogTWFwcyBtb3VzZSBpbnRlcmFjdGlvbiB0byBhIGRlY2suZ2wgVmlld3BvcnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JiaXRDb250cm9sbGVySlMge1xuXG4gIC8vIFJldHVybnMgYSBkZWNrLmdsIFZpZXdwb3J0IGluc3RhbmNlLCB0byBiZSB1c2VkIHdpdGggdGhlIERlY2tHTCBjb21wb25lbnRcbiAgc3RhdGljIGdldFZpZXdwb3J0KHZpZXdwb3J0KSB7XG4gICAgcmV0dXJuIG5ldyBPcmJpdFZpZXdwb3J0KHZpZXdwb3J0KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgZG93blxuICAgICAgaXNEcmFnZ2luZzogZmFsc2VcbiAgICB9O1xuXG4gICAgdGhpcy5jYW52YXMgPSBwcm9wcy5jYW52YXM7XG5cbiAgICBjb25zdCBldmVudE1hbmFnZXIgPSBuZXcgRXZlbnRNYW5hZ2VyKHRoaXMuY2FudmFzKTtcblxuICAgIHRoaXMuX2V2ZW50TWFuYWdlciA9IGV2ZW50TWFuYWdlcjtcblxuICAgIHRoaXMuX2NvbnRyb2xzID0gcHJvcHMub3JiaXRDb250cm9scyB8fCBuZXcgVmlld3BvcnRDb250cm9scyhPcmJpdFN0YXRlKTtcbiAgICB0aGlzLl9jb250cm9scy5zZXRPcHRpb25zKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IHRoaXMuX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZS5iaW5kKHRoaXMpLFxuICAgICAgZXZlbnRNYW5hZ2VyXG4gICAgfSkpO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHByb3BzKTtcbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG5cbiAgICB0aGlzLl9jb250cm9scy5zZXRPcHRpb25zKHByb3BzKTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIHRoaXMuX2V2ZW50TWFuYWdlci5kZXN0cm95KCk7XG4gIH1cblxuICBfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlKHtpc0RyYWdnaW5nID0gZmFsc2V9KSB7XG4gICAgaWYgKGlzRHJhZ2dpbmcgIT09IHRoaXMuc3RhdGUuaXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5zdGF0ZS5pc0RyYWdnaW5nID0gaXNEcmFnZ2luZztcbiAgICAgIGNvbnN0IHtnZXRDdXJzb3J9ID0gdGhpcy5wcm9wcztcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9IGdldEN1cnNvcih0aGlzLnN0YXRlKTtcbiAgICB9XG4gIH1cbn1cblxuT3JiaXRDb250cm9sbGVySlMuZGlzcGxheU5hbWUgPSAnT3JiaXRDb250cm9sbGVyJztcbk9yYml0Q29udHJvbGxlckpTLnByb3BUeXBlcyA9IHByb3BUeXBlcztcbk9yYml0Q29udHJvbGxlckpTLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==