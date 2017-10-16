import {PureComponent, createElement, cloneElement, Children, isValidElement} from 'react';
import PropTypes from 'prop-types';

import {EventManager} from 'mjolnir.js';
import {ViewportControls} from '../core';
import CURSOR from './utils/cursors';

import TransitionManager from './experimental/transition-manager';
import {extractViewportFrom} from './experimental/viewport-transition-utils';

const propTypes = {
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
  position: PropTypes.object,

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
  // function called for each transition step, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.func,
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

const getDefaultCursor = ({isDragging}) => isDragging ? CURSOR.GRABBING : CURSOR.GRAB;

const defaultProps = {
  onViewportChange: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  getCursor: getDefaultCursor
};

export default class ViewportController extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isDragging: false      // Whether the cursor is down
    };

    this._recursiveUpdateChildren = this._recursiveUpdateChildren.bind(this);
    this._updateChildrenViewport = this._updateChildrenViewport.bind(this);
    this._onTransitionUpdate = this._onTransitionUpdate.bind(this);
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;

    this._eventManager = new EventManager(eventCanvas);

    // If props.controls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    this._controls = this.props.controls || new ViewportControls(this.props.viewportState);

    this._controls.setOptions(Object.assign({}, this.props, {
      onStateChange: this._onInteractiveStateChange.bind(this),
      eventManager: this._eventManager
    }));

    this._transitionManger = new TransitionManager(this.props, this._onTransitionUpdate);
  }

  componentWillUpdate(nextProps) {
    if (this._controls) {
      this._controls.setOptions(nextProps);
    }
    if (this._transitionManger) {
      this._transitionManger.processViewportChange(this.props, nextProps);
    }
  }

  componentWillUnmount() {
    this._eventManager.destroy();
  }

  // Helper methods
  _onTransitionUpdate(viewport) {
    if (this.props.onViewportChange) {
      this.props.onViewportChange(viewport);
    }
    // Application onViewportChange may or may not trigger a render
    this.forceUpdate();
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.setState({isDragging});
    }
  }

  _recursiveUpdateChildren(children, viewport) {
    // TODO: use component key or a custom prop to identify which child to modify.
    return Children.map(children, child => {
      if (!isValidElement(child)) {
        return child;
      }
      let childProps = {};
      if (child.props.viewports) {
        const childViewports = [];
        child.props.viewports.forEach((childViewport) => {
          childViewports.push(Object.assign({}, childViewport, viewport));
        });
        childProps = Object.assign({}, {viewports: childViewports});
      } else {
        childProps = Object.assign({}, viewport, {viewport});
      }
      childProps.children = this._recursiveUpdateChildren(child.props.children, viewport);
      const cloned = cloneElement(child, childProps);
      return cloned;
    });
  }

  _updateChildrenViewport() {
    const viewport = (this._transitionManger && this._transitionManger.getTransionedViewport()) ||
      extractViewportFrom(this.props);
    const childrenWithProps = this._recursiveUpdateChildren(
        this.props.children,
        viewport);
    return childrenWithProps;
  }

  render() {
    const {width, height, getCursor} = this.props;

    const eventCanvasStyle = {
      width,
      height,
      position: 'relative',
      cursor: getCursor(this.state)
    };

    const childrenWithProps = this._updateChildrenViewport();

    return (
      createElement('div', {
        key: 'map-controls',
        ref: 'eventCanvas',
        style: eventCanvasStyle
      },
        childrenWithProps
      )
    );
  }
}

ViewportController.displayName = 'ViewportController';
ViewportController.propTypes = propTypes;
ViewportController.defaultProps = defaultProps;
