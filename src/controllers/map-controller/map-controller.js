import {PureComponent, createElement} from 'react';
import PropTypes from 'prop-types';

import {MAPBOX_LIMITS} from './map-state';
import EventManager from '../../utils/events/event-manager';
import MapControls from './map-controls';
import config from '../config';

const propTypes = {
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
  mapControls: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.string),
    handleEvent: PropTypes.func
  })
};

const getDefaultCursor = ({isDragging}) => isDragging ?
  config.CURSOR.GRABBING : config.CURSOR.GRAB;

const defaultProps = Object.assign({}, MAPBOX_LIMITS, {
  onViewportChange: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  getCursor: getDefaultCursor
});

export default class MapController extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      // Whether the cursor is down
      isDragging: false
    };

    // If props.mapControls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    this._mapControls = props.mapControls || new MapControls();
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;

    const eventManager = new EventManager(eventCanvas);

    this._eventManager = eventManager;

    this._mapControls.setOptions(Object.assign({}, this.props, {
      onStateChange: this._onInteractiveStateChange.bind(this),
      eventManager
    }));
  }

  componentWillUpdate(nextProps) {
    this._mapControls.setOptions(nextProps);
  }

  componentWillUnmount() {
    if (this._eventManager) {
      // Must destroy because hammer adds event listeners to window
      this._eventManager.destroy();
    }
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.setState({isDragging});
    }
  }

  render() {
    const {width, height, getCursor} = this.props;

    const eventCanvasStyle = {
      width,
      height,
      position: 'relative',
      cursor: getCursor(this.state)
    };

    return (
      createElement('div', {
        key: 'map-controls',
        ref: 'eventCanvas',
        style: eventCanvasStyle
      },
        this.props.children
      )
    );
  }
}

MapController.displayName = 'MapController';
MapController.propTypes = propTypes;
MapController.defaultProps = defaultProps;
