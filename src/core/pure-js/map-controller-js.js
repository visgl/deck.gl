import PropTypes from 'prop-types';

import {EventManager} from 'mjolnir.js';
import MapControls from '../controllers/map-controls';
import {MAPBOX_LIMITS} from '../controllers/map-state';

const PREFIX = '-webkit-';

const CURSOR = {
  GRABBING: `${PREFIX}grabbing`,
  GRAB: `${PREFIX}grab`,
  POINTER: 'pointer'
};

const propTypes = {
  width: PropTypes.number.isRequired /** The width of the map. */,
  height: PropTypes.number.isRequired /** The height of the map. */,
  longitude: PropTypes.number.isRequired /** The longitude of the center of the map. */,
  latitude: PropTypes.number.isRequired /** The latitude of the center of the map. */,
  zoom: PropTypes.number.isRequired /** The tile zoom level of the map. */,
  bearing: PropTypes.number /** Specify the bearing of the viewport */,
  pitch: PropTypes.number /** Specify the pitch of the viewport */,
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */,

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

const getDefaultCursor = ({isDragging}) => (isDragging ? CURSOR.GRABBING : CURSOR.GRAB);

const defaultProps = Object.assign({}, MAPBOX_LIMITS, {
  onViewportChange: null,
  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,
  getCursor: getDefaultCursor
});

export default class MapControllerJS {
  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.props = props;
    this.state = {
      isDragging: false // Whether the cursor is down
    };

    this.canvas = props.canvas;

    const eventManager = new EventManager(this.canvas);

    this._eventManager = eventManager;

    // If props.controls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    this._controls = this.props.controls || new MapControls();
    this._controls.setOptions(
      Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange.bind(this),
        eventManager
      })
    );
  }

  setProps(props) {
    props = Object.assign({}, this.props, props);
    this.props = props;

    this._controls.setOptions(props);
  }

  finalize() {
    this._eventManager.destroy();
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.state.isDragging = isDragging;
      const {getCursor} = this.props;
      this.canvas.style.cursor = getCursor(this.state);
    }
  }
}

MapControllerJS.displayName = 'MapController';
MapControllerJS.propTypes = propTypes;
MapControllerJS.defaultProps = defaultProps;
