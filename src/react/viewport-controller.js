import {PureComponent, createElement} from 'react';
import PropTypes from 'prop-types';

import {ViewState, Controller, MapController, experimental} from '../core';
const {TransitionManager} = experimental;
import CURSOR from './utils/cursors';
import {EventManager} from 'mjolnir.js';

const propTypes = {
  // A controller class or instance
  controller: PropTypes.oneOfType([
    PropTypes.instanceOf(Controller), // An instance of a controller
    PropTypes.func                    // A controller class (will be instanced)
  ]),

  // Width and height
  width: PropTypes.number.isRequired, // The width of the map.
  height: PropTypes.number.isRequired, // The height of the map.

  // Viewport props
  viewState: PropTypes.func,
  state: PropTypes.object,

  // Alternative props (a `ViewState` will be created from these)
  longitude: PropTypes.number,  // The longitude of the center of the map.
  latitude: PropTypes.number, // The latitude of the center of the map.
  zoom: PropTypes.number, // The tile zoom level of the map.

  position: PropTypes.array, // Camera position, e.g. for FirstPersonViewport
  bearing: PropTypes.number, // Specify the bearing of the viewport
  pitch: PropTypes.number, // Specify the pitch of the viewport
  altitude: PropTypes.number, // Not fully implemented, mapbox restrictions

  // Viewport constraints
  // TODO - define constraints object
  maxZoom: PropTypes.number, // Max zoom level
  minZoom: PropTypes.number, // Min zoom level
  maxPitch: PropTypes.number, // Max pitch in degrees
  minPitch: PropTypes.number, // Min pitch in degrees

  // `onViewportChange` callback is fired when the user interacted with the
  // map. The object passed to the callback contains viewport properties
  // such as `longitude`, `latitude`, `zoom` etc.
  onViewportChange: PropTypes.func,

  // Viewport transition
  // TODO - a lot of props, audit these?
  transitionDuration: PropTypes.number, // transition duration for viewport change
  // function called for each transition step, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.func,
  transitionInterruption: PropTypes.number, // type of interruption of current transition on update.
  transitionEasing: PropTypes.func, // easing function
  transitionProps: PropTypes.array, // props to transition
  // transition status update functions
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  // Enables control event handling
  // TODO - audit these names?
  scrollZoom: PropTypes.bool, // Scroll to zoom
  dragPan: PropTypes.bool, // Drag to pan
  dragRotate: PropTypes.bool, // Drag to rotate
  doubleClickZoom: PropTypes.bool, // Double click to zoom
  touchZoomRotate: PropTypes.bool, // Pinch to zoom / rotate

  // Accessor that returns a cursor style to show interactive state
  getCursor: PropTypes.func
};

const getDefaultCursor = ({isDragging}) => isDragging ? CURSOR.GRABBING : CURSOR.GRAB;

const defaultProps = Object.assign({}, TransitionManager.defaultProps, {
  controller: MapController,
  onViewStateChange: null,
  onViewportChange: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  getCursor: getDefaultCursor
});

export default class ViewportController extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isDragging: false      // Whether the cursor is down
    };
  }

  componentDidMount() {
    this._eventManager = new EventManager(this.refs.eventCanvas);
    if (typeof this.props.controller === 'function') {
      const ControllerClass = this.props.controller;
      // If props.controls is not provided, fallback to default MapControls instance
      // Cannot use defaultProps here because it needs to be per map instance
      this._controller = new ControllerClass((this.props.viewState));
    } else {
      this._controller = this.props.controller;
    }

    // this._transitionManger = new TransitionManager(this.props);

    this._controller.setOptions(Object.assign({}, this.props, {
      eventManager: this._eventManager,
      onStateChange: this._onInteractiveStateChange.bind(this),
      viewState: this._getViewState(this.props)
    }));
  }

  // Skip this render to avoid jump during viewport transitions.
  shouldComponentUpdate(nextProps, nextState) {
    if (this._transitionManger) {
      const transitionTriggered = this._transitionManger.processViewportChange(nextProps);
      return !transitionTriggered;
    }
    return true;
  }

  componentWillUpdate(nextProps) {
    this._viewState = this._getViewState(nextProps);
    this._controller.setOptions(Object.assign({}, nextProps, {
      viewState: this._getViewState(nextProps)
    }));
  }

  componentWillUnmount() {
    this._eventManager.destroy();
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.setState({isDragging});
    }
  }

  _getViewState(props) {
    return props.viewState || new ViewState(props);
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

ViewportController.displayName = 'ViewportController';
ViewportController.propTypes = propTypes;
ViewportController.defaultProps = defaultProps;
