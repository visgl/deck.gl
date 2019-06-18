var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import PropTypes from 'prop-types';

import { EventManager } from 'mjolnir.js';
import MapControls from '../controllers/map-controls';
import { MAPBOX_LIMITS } from '../controllers/map-state';

var PREFIX = '-webkit-';

var CURSOR = {
  GRABBING: PREFIX + 'grabbing',
  GRAB: PREFIX + 'grab',
  POINTER: 'pointer'
};

var propTypes = {
  width: PropTypes.number.isRequired, /** The width of the map. */
  height: PropTypes.number.isRequired, /** The height of the map. */
  longitude: PropTypes.number.isRequired, /** The longitude of the center of the map. */
  latitude: PropTypes.number.isRequired, /** The latitude of the center of the map. */
  zoom: PropTypes.number.isRequired, /** The tile zoom level of the map. */
  bearing: PropTypes.number, /** Specify the bearing of the viewport */
  pitch: PropTypes.number, /** Specify the pitch of the viewport */
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number, /** Altitude of the viewport camera. Default 1.5 "screen heights" */

  /** Viewport constraints */
  maxZoom: PropTypes.number, // Max zoom level
  minZoom: PropTypes.number, // Min zoom level
  maxPitch: PropTypes.number, // Max pitch in degrees
  minPitch: PropTypes.number, // Min pitch in degrees

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func,

  /** Enables control event handling */
  scrollZoom: PropTypes.bool, // Scroll to zoom
  dragPan: PropTypes.bool, // Drag to pan
  dragRotate: PropTypes.bool, // Drag to rotate
  doubleClickZoom: PropTypes.bool, // Double click to zoom
  touchZoomRotate: PropTypes.bool, // Pinch to zoom / rotate

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

var defaultProps = Object.assign({}, MAPBOX_LIMITS, {
  onViewportChange: null,
  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,
  getCursor: getDefaultCursor
});

var MapControllerJS = function () {
  function MapControllerJS(props) {
    _classCallCheck(this, MapControllerJS);

    props = Object.assign({}, defaultProps, props);

    this.props = props;
    this.state = {
      isDragging: false // Whether the cursor is down
    };

    this.canvas = props.canvas;

    var eventManager = new EventManager(this.canvas);

    this._eventManager = eventManager;

    // If props.controls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    this._controls = this.props.controls || new MapControls();
    this._controls.setOptions(Object.assign({}, this.props, {
      onStateChange: this._onInteractiveStateChange.bind(this),
      eventManager: eventManager
    }));
  }

  _createClass(MapControllerJS, [{
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

  return MapControllerJS;
}();

export default MapControllerJS;


MapControllerJS.displayName = 'MapController';
MapControllerJS.propTypes = propTypes;
MapControllerJS.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3B1cmUtanMvbWFwLWNvbnRyb2xsZXItanMuanMiXSwibmFtZXMiOlsiUHJvcFR5cGVzIiwiRXZlbnRNYW5hZ2VyIiwiTWFwQ29udHJvbHMiLCJNQVBCT1hfTElNSVRTIiwiUFJFRklYIiwiQ1VSU09SIiwiR1JBQkJJTkciLCJHUkFCIiwiUE9JTlRFUiIsInByb3BUeXBlcyIsIndpZHRoIiwibnVtYmVyIiwiaXNSZXF1aXJlZCIsImhlaWdodCIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwiem9vbSIsImJlYXJpbmciLCJwaXRjaCIsImFsdGl0dWRlIiwibWF4Wm9vbSIsIm1pblpvb20iLCJtYXhQaXRjaCIsIm1pblBpdGNoIiwib25WaWV3cG9ydENoYW5nZSIsImZ1bmMiLCJzY3JvbGxab29tIiwiYm9vbCIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tUm90YXRlIiwiZ2V0Q3Vyc29yIiwiY29udHJvbHMiLCJzaGFwZSIsImV2ZW50cyIsImFycmF5T2YiLCJzdHJpbmciLCJoYW5kbGVFdmVudCIsImdldERlZmF1bHRDdXJzb3IiLCJpc0RyYWdnaW5nIiwiZGVmYXVsdFByb3BzIiwiT2JqZWN0IiwiYXNzaWduIiwiTWFwQ29udHJvbGxlckpTIiwicHJvcHMiLCJzdGF0ZSIsImNhbnZhcyIsImV2ZW50TWFuYWdlciIsIl9ldmVudE1hbmFnZXIiLCJfY29udHJvbHMiLCJzZXRPcHRpb25zIiwib25TdGF0ZUNoYW5nZSIsIl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UiLCJiaW5kIiwiZGVzdHJveSIsInN0eWxlIiwiY3Vyc29yIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPQSxTQUFQLE1BQXNCLFlBQXRCOztBQUVBLFNBQVFDLFlBQVIsUUFBMkIsWUFBM0I7QUFDQSxPQUFPQyxXQUFQLE1BQXdCLDZCQUF4QjtBQUNBLFNBQVFDLGFBQVIsUUFBNEIsMEJB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QztBQUV0RE47QUFGc0QsS0FBOUIsQ0FBMUI7QUFJRDs7Ozs2QkFFUUgsSyxFQUFPO0FBQ2RBLGNBQVFILE9BQU9DLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUtFLEtBQXZCLEVBQThCQSxLQUE5QixDQUFSO0FBQ0EsV0FBS0EsS0FBTCxHQUFhQSxLQUFiOztBQUVBLFdBQUtLLFNBQUwsQ0FBZUMsVUFBZixDQUEwQk4sS0FBMUI7QUFDRDs7OytCQUVVO0FBQ1QsV0FBS0ksYUFBTCxDQUFtQk0sT0FBbkI7QUFDRDs7O3FEQUUrQztBQUFBLG1DQUFyQmYsVUFBcUI7QUFBQSxVQUFyQkEsVUFBcUIsb0NBQVIsS0FBUTs7QUFDOUMsVUFBSUEsZUFBZSxLQUFLTSxLQUFMLENBQVdOLFVBQTlCLEVBQTBDO0FBQ3hDLGFBQUtNLEtBQUwsQ0FBV04sVUFBWCxHQUF3QkEsVUFBeEI7QUFEd0MsWUFFakNSLFNBRmlDLEdBRXBCLEtBQUthLEtBRmUsQ0FFakNiLFNBRmlDOztBQUd4QyxhQUFLZSxNQUFMLENBQVlTLEtBQVosQ0FBa0JDLE1BQWxCLEdBQTJCekIsVUFBVSxLQUFLYyxLQUFmLENBQTNCO0FBQ0Q7QUFDRjs7Ozs7O2VBMUNrQkYsZTs7O0FBNkNyQkEsZ0JBQWdCYyxXQUFoQixHQUE4QixlQUE5QjtBQUNBZCxnQkFBZ0JuQyxTQUFoQixHQUE0QkEsU0FBNUI7QUFDQW1DLGdCQUFnQkgsWUFBaEIsR0FBK0JBLFlBQS9CIiwiZmlsZSI6Im1hcC1jb250cm9sbGVyLWpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuaW1wb3J0IHtFdmVudE1hbmFnZXJ9IGZyb20gJ21qb2xuaXIuanMnO1xuaW1wb3J0IE1hcENvbnRyb2xzIGZyb20gJy4uL2NvbnRyb2xsZXJzL21hcC1jb250cm9scyc7XG5pbXBvcnQge01BUEJPWF9MSU1JVFN9IGZyb20gJy4uL2NvbnRyb2xsZXJzL21hcC1zdGF0ZSc7XG5cbmNvbnN0IFBSRUZJWCA9ICctd2Via2l0LSc7XG5cbmNvbnN0IENVUlNPUiA9IHtcbiAgR1JBQkJJTkc6IGAke1BSRUZJWH1ncmFiYmluZ2AsXG4gIEdSQUI6IGAke1BSRUZJWH1ncmFiYCxcbiAgUE9JTlRFUjogJ3BvaW50ZXInXG59O1xuXG5jb25zdCBwcm9wVHlwZXMgPSB7XG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgd2lkdGggb2YgdGhlIG1hcC4gKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIGxvbmdpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIGxhdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbGF0aXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLiAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gIGJlYXJpbmc6IFByb3BUeXBlcy5udW1iZXIsIC8qKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydCAqL1xuICBwaXRjaDogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydCAqL1xuICAvLyBOb3RlOiBOb24tcHVibGljIEFQSSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8xMTM3XG4gIGFsdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLCAvKiogQWx0aXR1ZGUgb2YgdGhlIHZpZXdwb3J0IGNhbWVyYS4gRGVmYXVsdCAxLjUgXCJzY3JlZW4gaGVpZ2h0c1wiICovXG5cbiAgLyoqIFZpZXdwb3J0IGNvbnN0cmFpbnRzICovXG4gIG1heFpvb206IFByb3BUeXBlcy5udW1iZXIsIC8vIE1heCB6b29tIGxldmVsXG4gIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsIC8vIE1pbiB6b29tIGxldmVsXG4gIG1heFBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLCAvLyBNYXggcGl0Y2ggaW4gZGVncmVlc1xuICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlciwgLy8gTWluIHBpdGNoIGluIGRlZ3JlZXNcblxuICAvKipcbiAgICogYG9uVmlld3BvcnRDaGFuZ2VgIGNhbGxiYWNrIGlzIGZpcmVkIHdoZW4gdGhlIHVzZXIgaW50ZXJhY3RlZCB3aXRoIHRoZVxuICAgKiBtYXAuIFRoZSBvYmplY3QgcGFzc2VkIHRvIHRoZSBjYWxsYmFjayBjb250YWlucyB2aWV3cG9ydCBwcm9wZXJ0aWVzXG4gICAqIHN1Y2ggYXMgYGxvbmdpdHVkZWAsIGBsYXRpdHVkZWAsIGB6b29tYCBldGMuXG4gICAqL1xuICBvblZpZXdwb3J0Q2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogRW5hYmxlcyBjb250cm9sIGV2ZW50IGhhbmRsaW5nICovXG4gIHNjcm9sbFpvb206IFByb3BUeXBlcy5ib29sLCAvLyBTY3JvbGwgdG8gem9vbVxuICBkcmFnUGFuOiBQcm9wVHlwZXMuYm9vbCwgLy8gRHJhZyB0byBwYW5cbiAgZHJhZ1JvdGF0ZTogUHJvcFR5cGVzLmJvb2wsIC8vIERyYWcgdG8gcm90YXRlXG4gIGRvdWJsZUNsaWNrWm9vbTogUHJvcFR5cGVzLmJvb2wsIC8vIERvdWJsZSBjbGljayB0byB6b29tXG4gIHRvdWNoWm9vbVJvdGF0ZTogUHJvcFR5cGVzLmJvb2wsIC8vIFBpbmNoIHRvIHpvb20gLyByb3RhdGVcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvLyBBIG1hcCBjb250cm9sIGluc3RhbmNlIHRvIHJlcGxhY2UgdGhlIGRlZmF1bHQgbWFwIGNvbnRyb2xzXG4gIC8vIFRoZSBvYmplY3QgbXVzdCBleHBvc2Ugb25lIHByb3BlcnR5OiBgZXZlbnRzYCBhcyBhbiBhcnJheSBvZiBzdWJzY3JpYmVkXG4gIC8vIGV2ZW50IG5hbWVzOyBhbmQgdHdvIG1ldGhvZHM6IGBzZXRTdGF0ZShzdGF0ZSlgIGFuZCBgaGFuZGxlKGV2ZW50KWBcbiAgY29udHJvbHM6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgZXZlbnRzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc3RyaW5nKSxcbiAgICBoYW5kbGVFdmVudDogUHJvcFR5cGVzLmZ1bmNcbiAgfSlcbn07XG5cbmNvbnN0IGdldERlZmF1bHRDdXJzb3IgPSAoe2lzRHJhZ2dpbmd9KSA9PiBpc0RyYWdnaW5nID8gQ1VSU09SLkdSQUJCSU5HIDogQ1VSU09SLkdSQUI7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE1BUEJPWF9MSU1JVFMsIHtcbiAgb25WaWV3cG9ydENoYW5nZTogbnVsbCxcbiAgc2Nyb2xsWm9vbTogdHJ1ZSxcbiAgZHJhZ1BhbjogdHJ1ZSxcbiAgZHJhZ1JvdGF0ZTogdHJ1ZSxcbiAgZG91YmxlQ2xpY2tab29tOiB0cnVlLFxuICB0b3VjaFpvb21Sb3RhdGU6IHRydWUsXG4gIGdldEN1cnNvcjogZ2V0RGVmYXVsdEN1cnNvclxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcENvbnRyb2xsZXJKUyB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQcm9wcywgcHJvcHMpO1xuXG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZSAgICAgIC8vIFdoZXRoZXIgdGhlIGN1cnNvciBpcyBkb3duXG4gICAgfTtcblxuICAgIHRoaXMuY2FudmFzID0gcHJvcHMuY2FudmFzO1xuXG4gICAgY29uc3QgZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcih0aGlzLmNhbnZhcyk7XG5cbiAgICB0aGlzLl9ldmVudE1hbmFnZXIgPSBldmVudE1hbmFnZXI7XG5cbiAgICAvLyBJZiBwcm9wcy5jb250cm9scyBpcyBub3QgcHJvdmlkZWQsIGZhbGxiYWNrIHRvIGRlZmF1bHQgTWFwQ29udHJvbHMgaW5zdGFuY2VcbiAgICAvLyBDYW5ub3QgdXNlIGRlZmF1bHRQcm9wcyBoZXJlIGJlY2F1c2UgaXQgbmVlZHMgdG8gYmUgcGVyIG1hcCBpbnN0YW5jZVxuICAgIHRoaXMuX2NvbnRyb2xzID0gdGhpcy5wcm9wcy5jb250cm9scyB8fCBuZXcgTWFwQ29udHJvbHMoKTtcbiAgICB0aGlzLl9jb250cm9scy5zZXRPcHRpb25zKE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgIG9uU3RhdGVDaGFuZ2U6IHRoaXMuX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZS5iaW5kKHRoaXMpLFxuICAgICAgZXZlbnRNYW5hZ2VyXG4gICAgfSkpO1xuICB9XG5cbiAgc2V0UHJvcHMocHJvcHMpIHtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHByb3BzKTtcbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG5cbiAgICB0aGlzLl9jb250cm9scy5zZXRPcHRpb25zKHByb3BzKTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIHRoaXMuX2V2ZW50TWFuYWdlci5kZXN0cm95KCk7XG4gIH1cblxuICBfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlKHtpc0RyYWdnaW5nID0gZmFsc2V9KSB7XG4gICAgaWYgKGlzRHJhZ2dpbmcgIT09IHRoaXMuc3RhdGUuaXNEcmFnZ2luZykge1xuICAgICAgdGhpcy5zdGF0ZS5pc0RyYWdnaW5nID0gaXNEcmFnZ2luZztcbiAgICAgIGNvbnN0IHtnZXRDdXJzb3J9ID0gdGhpcy5wcm9wcztcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmN1cnNvciA9IGdldEN1cnNvcih0aGlzLnN0YXRlKTtcbiAgICB9XG4gIH1cbn1cblxuTWFwQ29udHJvbGxlckpTLmRpc3BsYXlOYW1lID0gJ01hcENvbnRyb2xsZXInO1xuTWFwQ29udHJvbGxlckpTLnByb3BUeXBlcyA9IHByb3BUeXBlcztcbk1hcENvbnRyb2xsZXJKUy5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=