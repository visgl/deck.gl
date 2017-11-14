import {PureComponent, createElement} from 'react';
import PropTypes from 'prop-types';

import {ViewState, Controller, MapController, experimental} from '../core';
const {TransitionManager} = experimental;
import CURSOR from './utils/cursors';
import {EventManager} from 'mjolnir.js';

const propTypes = {
  // A control instance to replace the default map controls
  controller: PropTypes.oneOfType([
    PropTypes.instanceOf(Controller), // An instance of a controller
    PropTypes.func                    // A controller class (will be instanced)
  ]),

  // Viewport props
  // The width of the map.
  width: PropTypes.number.isRequired,
  // The height of the map.
  height: PropTypes.number.isRequired,

  // ViewState props
  viewState: PropTypes.object,

  // The longitude of the center of the map.
  longitude: PropTypes.number,
  // The latitude of the center of the map.
  latitude: PropTypes.number,
  // The tile zoom level of the map.
  zoom: PropTypes.number,

  // Camera position for FirstPersonViewport
  position: PropTypes.array,
  // Specify the bearing of the viewport
  bearing: PropTypes.number,
  // Specify the pitch of the viewport
  pitch: PropTypes.number,
  // Altitude of the viewport camera. Default 1.5 "screen heights"
  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number,

  // Viewport constraints
  // Max zoom level
  maxZoom: PropTypes.number,
  // Min zoom level
  minZoom: PropTypes.number,
  // Max pitch in degrees
  maxPitch: PropTypes.number,
  // Min pitch in degrees
  minPitch: PropTypes.number,

  // `onViewportChange` callback is fired when the user interacted with the
  // map. The object passed to the callback contains viewport properties
  // such as `longitude`, `latitude`, `zoom` etc.
  onViewportChange: PropTypes.func,

  // Viewport transition
  // transition duration for viewport change
  transitionDuration: PropTypes.number,
  // function called for each transition step, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.func,
  // type of interruption of current transition on update.
  transitionInterruption: PropTypes.number,
  // easing function
  transitionEasing: PropTypes.func,
  // props to transition
  transitionProps: PropTypes.array,
  // transition status update functions
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  // Enables control event handling
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
