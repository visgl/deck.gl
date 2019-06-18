var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';

import { EventManager } from 'mjolnir.js';
import { experimental } from '../core';
var ViewportControls = experimental.ViewportControls,
    TransitionManager = experimental.TransitionManager;


import CURSOR from './utils/cursors';

var propTypes = {
  viewportState: PropTypes.func,
  state: PropTypes.object,

  /** Viewport props */
  /** The width of the map. */
  width: PropTypes.number.isRequired,
  /** The height of the map. */
  height: PropTypes.number.isRequired,
  /** The longitude of the center of the map. */
  longitude: PropTypes.number.isRequired,
  /** The latitude of the center of the map. */
  latitude: PropTypes.number.isRequired,
  /** The tile zoom level of the map. */
  zoom: PropTypes.number.isRequired,
  /** Specify the bearing of the viewport */
  bearing: PropTypes.number,
  /** Specify the pitch of the viewport */
  pitch: PropTypes.number,
  /** Altitude of the viewport camera. Default 1.5 "screen heights" */
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number,
  // Camera position for FirstPersonViewport
  position: PropTypes.array,

  /** Viewport constraints */
  // Max zoom level
  maxZoom: PropTypes.number,
  // Min zoom level
  minZoom: PropTypes.number,
  // Max pitch in degrees
  maxPitch: PropTypes.number,
  // Min pitch in degrees
  minPitch: PropTypes.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: PropTypes.number,
  // an instance of ViewportTransitionInterpolator, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.object,
  // type of interruption of current transition on update.
  transitionInterruption: PropTypes.number,
  // easing function
  transitionEasing: PropTypes.func,
  // transition status update functions
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: PropTypes.bool,
  // Drag to pan
  dragPan: PropTypes.bool,
  // Drag to rotate
  dragRotate: PropTypes.bool,
  // Double click to zoom
  doubleClickZoom: PropTypes.bool,
  // Pinch to zoom / rotate
  touchZoomRotate: PropTypes.bool,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  controls: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.string),
    handleEvent: PropTypes.func
  })
};

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging;
  return isDragging ? CURSOR.GRABBING : CURSOR.GRAB;
};

var defaultProps = Object.assign({}, TransitionManager.defaultProps, {
  onViewportChange: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  getCursor: getDefaultCursor
});

var ViewportController = function (_PureComponent) {
  _inherits(ViewportController, _PureComponent);

  function ViewportController(props) {
    _classCallCheck(this, ViewportController);

    var _this = _possibleConstructorReturn(this, (ViewportController.__proto__ || Object.getPrototypeOf(ViewportController)).call(this, props));

    _this.state = {
      isDragging: false // Whether the cursor is down
    };
    return _this;
  }

  _createClass(ViewportController, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventCanvas = this.refs.eventCanvas;


      this._eventManager = new EventManager(eventCanvas);

      // If props.controls is not provided, fallback to default MapControls instance
      // Cannot use defaultProps here because it needs to be per map instance
      this._controls = this.props.controls || new ViewportControls(this.props.viewportState);

      this._controls.setOptions(Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange.bind(this),
        eventManager: this._eventManager
      }));

      this._transitionManger = new TransitionManager(this.props);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      if (this._transitionManger) {
        var transitionTriggered = this._transitionManger.processViewportChange(nextProps);
        // Skip this render to avoid jump during viewport transitions.
        return !transitionTriggered;
      }
      return true;
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      if (this._controls) {
        this._controls.setOptions(nextProps);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._eventManager.destroy();
    }
  }, {
    key: '_onInteractiveStateChange',
    value: function _onInteractiveStateChange(_ref2) {
      var _ref2$isDragging = _ref2.isDragging,
          isDragging = _ref2$isDragging === undefined ? false : _ref2$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.setState({ isDragging: isDragging });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          getCursor = _props.getCursor;


      var eventCanvasStyle = {
        width: width,
        height: height,
        position: 'relative',
        cursor: getCursor(this.state)
      };

      return createElement('div', {
        key: 'map-controls',
        ref: 'eventCanvas',
        style: eventCanvasStyle
      }, this.props.children);
    }
  }]);

  return ViewportController;
}(PureComponent);

export default ViewportController;


ViewportController.displayName = 'ViewportController';
ViewportController.propTypes = propTypes;
ViewportController.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZWFjdC92aWV3cG9ydC1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbIlB1cmVDb21wb25lbnQiLCJjcmVhdGVFbGVtZW50IiwiUHJvcFR5cGVzIiwiRXZlbnRNYW5hZ2VyIiwiZXhwZXJpbWVudGFsIiwiVmlld3BvcnRDb250cm9scyIsIlRyYW5zaXRpb25NYW5hZ2VyIiwiQ1VSU09SIiwicHJvcFR5cGVzIiwidmlld3BvcnRTdGF0ZSIsImZ1bmMiLCJzdGF0ZSIsIm9iamVjdCIsIndpZHRoIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImhlaWdodCIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiem9vbSIsImJlYXJpbmciLCJwaXRjaCIsImFsdGl0dWRlIiwicG9zaXRpb24iLCJhcnJheSIsIm1heFpvb20iLCJtaW5ab29tIiwibWF4UGl0Y2giLCJtaW5QaXRjaCIsIm9uVmlld3BvcnRDaGFuZ2UiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJ0cmFuc2l0aW9uSW50ZXJwb2xhdG9yIiwidHJhbnNpdGlvbkludGVycnVwdGlvbiIsInRyYW5zaXRpb25FYXNpbmciLCJvblRyYW5zaXRpb25TdGFydCIsIm9uVHJhbnNpdGlvbkludGVycnVwdCIsIm9uVHJhbnNpdGlvbkVuZCIsInNjcm9sbFpvb20iLCJib29sIiwiZHJhZ1BhbiIsImRyYWdSb3RhdGUiLCJkb3VibGVDbGlja1pvb20iLCJ0b3VjaFpvb21Sb3RhdGUiLCJnZXRDdXJzb3IiLCJjb250cm9scyIsInNoYXBlIiwiZXZlbnRzIiwiYXJyYXlPZiIsInN0cmluZyIsImhhbmRsZUV2ZW50IiwiZ2V0RGVmYXVsdEN1cnNvciIsImlzRHJhZ2dpbmciLCJHUkFCQklORyIsIkdSQUIiLCJkZWZhdWx0UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJWaWV3cG9ydENvbnRyb2xsZXIiLCJwcm9wcyIsImV2ZW50Q2FudmFzIiwicmVmcyIsIl9ldmVudE1hbmFnZXIiLCJfY29udHJvbHMiLCJzZXRPcHRpb25zIiwib25TdGF0ZUNoYW5nZSIsIl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UiLCJiaW5kIiwiZXZlbnRNYW5hZ2VyIiwiX3RyYW5zaXRpb25NYW5nZXIiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJ0cmFuc2l0aW9uVHJpZ2dlcmVkIiwicHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlIiwiZGVzdHJveSIsInNldFN0YXRlIiwiZXZlbnRDYW52YXNTdHlsZSIsImN1cnNvciIsImtleSIsInJlZiIsInN0eWxlIiwiY2hpbGRyZW4iLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxTQUFRQSxhQUFSLEVBQXVCQyxhQUF2QixRQUEyQyxPQUEzQztBQUNBLE9BQU9DLFNBQVAsTUFBc0IsWUFBdEI7O0FBRUEsU0FBUUMsWUFBUixRQUEyQixZQUEzQjtBQUNBLFNBQVFDLFlBQVIsUUFBMkIsU0FBM0I7SUFDT0MsZ0IsR0FBdUNELFksQ0FBdkNDLGdCO0lBQWtCQyxpQixHQUFxQkYsWSxDQUFyQkUsaUI7OztBQUV6QixPQUFPQyxNQUFQLE1BQW1CLGlCQUFuQjs7QUFFQSxJQUFNQyxZQUFZO0FBQ2hCQyxpQkFBZVAsVUFBVVEsSUFEVDtBQUVoQkMsU0FBT1QsVUFBVVUsTUFGRDs7QUFJaEI7QUFDQTtBQUNBQyxTQUFPWCxVQUFVWSxNQUFWLENBQWlCQyxVQU5SO0FBT2hCO0FBQ0FDLFVBQVFkLFVBQVVZLE1BQVYsQ0FBaUJDLFVBUlQ7QUFTaEI7QUFDQUUsYUFBV2YsVUFBVVksTUFBVixDQUFpQkMsVUFWWjtBQVdoQjtBQUNBRyxZQUFVaEIsVUFBVVksTUFBVixDQUFpQkMsVUFaWDtBQWFoQjtBQUNBSSxRQUFNakIsVUFBVVksTUFBVixDQUFpQkMsVUFkUDtBQWVoQjtBQUNBSyxXQUFTbEIsVUFBVVksTUFoQkg7QUFpQmhCO0FBQ0FPLFNBQU9uQixVQUFVWSxNQWxCRDtBQW1CaEI7QUFDQTtBQUNBUSxZQUFVcEIsVUFBVVksTUFyQko7QUFzQmhCO0FBQ0FTLFlBQVVyQixVQUFVc0IsS0F2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cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQdXJlQ29tcG9uZW50LCBjcmVhdGVFbGVtZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuXG5pbXBvcnQge0V2ZW50TWFuYWdlcn0gZnJvbSAnbWpvbG5pci5qcyc7XG5pbXBvcnQge2V4cGVyaW1lbnRhbH0gZnJvbSAnLi4vY29yZSc7XG5jb25zdCB7Vmlld3BvcnRDb250cm9scywgVHJhbnNpdGlvbk1hbmFnZXJ9ID0gZXhwZXJpbWVudGFsO1xuXG5pbXBvcnQgQ1VSU09SIGZyb20gJy4vdXRpbHMvY3Vyc29ycyc7XG5cbmNvbnN0IHByb3BUeXBlcyA9IHtcbiAgdmlld3BvcnRTdGF0ZTogUHJvcFR5cGVzLmZ1bmMsXG4gIHN0YXRlOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gIC8qKiBWaWV3cG9ydCBwcm9wcyAqL1xuICAvKiogVGhlIHdpZHRoIG9mIHRoZSBtYXAuICovXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuICovXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKiogVGhlIGxvbmdpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKiogVGhlIGxhdGl0dWRlIG9mIHRoZSBjZW50ZXIgb2YgdGhlIG1hcC4gKi9cbiAgbGF0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgLyoqIFRoZSB0aWxlIHpvb20gbGV2ZWwgb2YgdGhlIG1hcC4gKi9cbiAgem9vbTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAvKiogU3BlY2lmeSB0aGUgYmVhcmluZyBvZiB0aGUgdmlld3BvcnQgKi9cbiAgYmVhcmluZzogUHJvcFR5cGVzLm51bWJlcixcbiAgLyoqIFNwZWNpZnkgdGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydCAqL1xuICBwaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgLyoqIEFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmEuIERlZmF1bHQgMS41IFwic2NyZWVuIGhlaWdodHNcIiAqL1xuICAvLyBOb3RlOiBOb24tcHVibGljIEFQSSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xMTM3XG4gIGFsdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBDYW1lcmEgcG9zaXRpb24gZm9yIEZpcnN0UGVyc29uVmlld3BvcnRcbiAgcG9zaXRpb246IFByb3BUeXBlcy5hcnJheSxcblxuICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgLy8gTWF4IHpvb20gbGV2ZWxcbiAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHpvb20gbGV2ZWxcbiAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWF4IHBpdGNoIGluIGRlZ3JlZXNcbiAgbWF4UGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiBwaXRjaCBpbiBkZWdyZWVzXG4gIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgKiBgb25WaWV3cG9ydENoYW5nZWAgY2FsbGJhY2sgaXMgZmlyZWQgd2hlbiB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlXG4gICAqIG1hcC4gVGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrIGNvbnRhaW5zIHZpZXdwb3J0IHByb3BlcnRpZXNcbiAgICogc3VjaCBhcyBgbG9uZ2l0dWRlYCwgYGxhdGl0dWRlYCwgYHpvb21gIGV0Yy5cbiAgICovXG4gIG9uVmlld3BvcnRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBWaWV3cG9ydCB0cmFuc2l0aW9uICoqL1xuICAvLyB0cmFuc2l0aW9uIGR1cmF0aW9uIGZvciB2aWV3cG9ydCBjaGFuZ2VcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBhbiBpbnN0YW5jZSBvZiBWaWV3cG9ydFRyYW5zaXRpb25JbnRlcnBvbGF0b3IsIGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gY3VzdG9tIHRyYW5zaXRpb25zLlxuICB0cmFuc2l0aW9uSW50ZXJwb2xhdG9yOiBQcm9wVHlwZXMub2JqZWN0LFxuICAvLyB0eXBlIG9mIGludGVycnVwdGlvbiBvZiBjdXJyZW50IHRyYW5zaXRpb24gb24gdXBkYXRlLlxuICB0cmFuc2l0aW9uSW50ZXJydXB0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBlYXNpbmcgZnVuY3Rpb25cbiAgdHJhbnNpdGlvbkVhc2luZzogUHJvcFR5cGVzLmZ1bmMsXG4gIC8vIHRyYW5zaXRpb24gc3RhdHVzIHVwZGF0ZSBmdW5jdGlvbnNcbiAgb25UcmFuc2l0aW9uU3RhcnQ6IFByb3BUeXBlcy5mdW5jLFxuICBvblRyYW5zaXRpb25JbnRlcnJ1cHQ6IFByb3BUeXBlcy5mdW5jLFxuICBvblRyYW5zaXRpb25FbmQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBFbmFibGVzIGNvbnRyb2wgZXZlbnQgaGFuZGxpbmcgKi9cbiAgLy8gU2Nyb2xsIHRvIHpvb21cbiAgc2Nyb2xsWm9vbTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERyYWcgdG8gcGFuXG4gIGRyYWdQYW46IFByb3BUeXBlcy5ib29sLFxuICAvLyBEcmFnIHRvIHJvdGF0ZVxuICBkcmFnUm90YXRlOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRG91YmxlIGNsaWNrIHRvIHpvb21cbiAgZG91YmxlQ2xpY2tab29tOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gUGluY2ggdG8gem9vbSAvIHJvdGF0ZVxuICB0b3VjaFpvb21Sb3RhdGU6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKiBBY2Nlc3NvciB0aGF0IHJldHVybnMgYSBjdXJzb3Igc3R5bGUgdG8gc2hvdyBpbnRlcmFjdGl2ZSBzdGF0ZSAqL1xuICBnZXRDdXJzb3I6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8vIEEgbWFwIGNvbnRyb2wgaW5zdGFuY2UgdG8gcmVwbGFjZSB0aGUgZGVmYXVsdCBtYXAgY29udHJvbHNcbiAgLy8gVGhlIG9iamVjdCBtdXN0IGV4cG9zZSBvbmUgcHJvcGVydHk6IGBldmVudHNgIGFzIGFuIGFycmF5IG9mIHN1YnNjcmliZWRcbiAgLy8gZXZlbnQgbmFtZXM7IGFuZCB0d28gbWV0aG9kczogYHNldFN0YXRlKHN0YXRlKWAgYW5kIGBoYW5kbGUoZXZlbnQpYFxuICBjb250cm9sczogUHJvcFR5cGVzLnNoYXBlKHtcbiAgICBldmVudHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5zdHJpbmcpLFxuICAgIGhhbmRsZUV2ZW50OiBQcm9wVHlwZXMuZnVuY1xuICB9KVxufTtcblxuY29uc3QgZ2V0RGVmYXVsdEN1cnNvciA9ICh7aXNEcmFnZ2luZ30pID0+IGlzRHJhZ2dpbmcgPyBDVVJTT1IuR1JBQkJJTkcgOiBDVVJTT1IuR1JBQjtcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgVHJhbnNpdGlvbk1hbmFnZXIuZGVmYXVsdFByb3BzLCB7XG4gIG9uVmlld3BvcnRDaGFuZ2U6IG51bGwsXG5cbiAgc2Nyb2xsWm9vbTogdHJ1ZSxcbiAgZHJhZ1BhbjogdHJ1ZSxcbiAgZHJhZ1JvdGF0ZTogdHJ1ZSxcbiAgZG91YmxlQ2xpY2tab29tOiB0cnVlLFxuICB0b3VjaFpvb21Sb3RhdGU6IHRydWUsXG5cbiAgZ2V0Q3Vyc29yOiBnZXREZWZhdWx0Q3Vyc29yXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlld3BvcnRDb250cm9sbGVyIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgaXNEcmFnZ2luZzogZmFsc2UgICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgZG93blxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCB7ZXZlbnRDYW52YXN9ID0gdGhpcy5yZWZzO1xuXG4gICAgdGhpcy5fZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcihldmVudENhbnZhcyk7XG5cbiAgICAvLyBJZiBwcm9wcy5jb250cm9scyBpcyBub3QgcHJvdmlkZWQsIGZhbGxiYWNrIHRvIGRlZmF1bHQgTWFwQ29udHJvbHMgaW5zdGFuY2VcbiAgICAvLyBDYW5ub3QgdXNlIGRlZmF1bHRQcm9wcyBoZXJlIGJlY2F1c2UgaXQgbmVlZHMgdG8gYmUgcGVyIG1hcCBpbnN0YW5jZVxuICAgIHRoaXMuX2NvbnRyb2xzID0gdGhpcy5wcm9wcy5jb250cm9scyB8fCBuZXcgVmlld3BvcnRDb250cm9scyh0aGlzLnByb3BzLnZpZXdwb3J0U3RhdGUpO1xuXG4gICAgdGhpcy5fY29udHJvbHMuc2V0T3B0aW9ucyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICBvblN0YXRlQ2hhbmdlOiB0aGlzLl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgIGV2ZW50TWFuYWdlcjogdGhpcy5fZXZlbnRNYW5hZ2VyXG4gICAgfSkpO1xuXG4gICAgdGhpcy5fdHJhbnNpdGlvbk1hbmdlciA9IG5ldyBUcmFuc2l0aW9uTWFuYWdlcih0aGlzLnByb3BzKTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgIGlmICh0aGlzLl90cmFuc2l0aW9uTWFuZ2VyKSB7XG4gICAgICBjb25zdCB0cmFuc2l0aW9uVHJpZ2dlcmVkID0gdGhpcy5fdHJhbnNpdGlvbk1hbmdlci5wcm9jZXNzVmlld3BvcnRDaGFuZ2UobmV4dFByb3BzKTtcbiAgICAgIC8vIFNraXAgdGhpcyByZW5kZXIgdG8gYXZvaWQganVtcCBkdXJpbmcgdmlld3BvcnQgdHJhbnNpdGlvbnMuXG4gICAgICByZXR1cm4gIXRyYW5zaXRpb25UcmlnZ2VyZWQ7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVwZGF0ZShuZXh0UHJvcHMpIHtcbiAgICBpZiAodGhpcy5fY29udHJvbHMpIHtcbiAgICAgIHRoaXMuX2NvbnRyb2xzLnNldE9wdGlvbnMobmV4dFByb3BzKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9ldmVudE1hbmFnZXIuZGVzdHJveSgpO1xuICB9XG5cbiAgX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSh7aXNEcmFnZ2luZyA9IGZhbHNlfSkge1xuICAgIGlmIChpc0RyYWdnaW5nICE9PSB0aGlzLnN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2lzRHJhZ2dpbmd9KTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGdldEN1cnNvcn0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgZXZlbnRDYW52YXNTdHlsZSA9IHtcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICBjdXJzb3I6IGdldEN1cnNvcih0aGlzLnN0YXRlKVxuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICBrZXk6ICdtYXAtY29udHJvbHMnLFxuICAgICAgICByZWY6ICdldmVudENhbnZhcycsXG4gICAgICAgIHN0eWxlOiBldmVudENhbnZhc1N0eWxlXG4gICAgICB9LFxuICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICApXG4gICAgKTtcbiAgfVxufVxuXG5WaWV3cG9ydENvbnRyb2xsZXIuZGlzcGxheU5hbWUgPSAnVmlld3BvcnRDb250cm9sbGVyJztcblZpZXdwb3J0Q29udHJvbGxlci5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5WaWV3cG9ydENvbnRyb2xsZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19