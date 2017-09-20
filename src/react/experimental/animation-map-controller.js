/* global setInterval, clearInterval */
import {PureComponent, createElement, cloneElement, Children, isValidElement} from 'react';
import PropTypes from 'prop-types';

import {EventManager} from 'mjolnir.js';
import Controls from '../../core/controllers/controls';
import MapState from '../../core/controllers/map-state';
import {MAPBOX_LIMITS} from '../../core/controllers/map-state';
import CURSOR from '../utils/cursors';

import {viewportLinearInterpolator} from './viewport-animation-utils.js';

const VIEWPORT_ANIMATE_PROPS = ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];
const VIEWPORT_ANIMATE_FREQUENCY = 0.01;
const VIEWPORT_ANIMATION_DURATION = 0;
const VIEWPORT_ANIMATION_EASING_FUNC = t => t;

export const ANIMATION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};

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

  /** Viewport animation **/
  // animation duration for viewport change
  animaitonDuration: PropTypes.number,
  // function called for each animation step, can be used to perform custom animations.
  animationInterpolator: PropTypes.func,
  // easing function
  viewportAnimationEasingFunc: PropTypes.func,

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

const defaultProps = Object.assign({}, MAPBOX_LIMITS, {
  onViewportChange: null,
  animaitonDuration: VIEWPORT_ANIMATION_DURATION,
  animationInterpolator: viewportLinearInterpolator,
  viewportAnimationEasingFunc: VIEWPORT_ANIMATION_EASING_FUNC,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  getCursor: getDefaultCursor
});

export default class AnimationMapController extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      isDragging: false      // Whether the cursor is down
    };

    // Private animation state
    this.animationContext = {
      animationT: 0,
      animationInterval: null,
      animationStartState: null,
      animationEndState: null,
      animatedViewport: null
    };

    this._updateViewport = this._updateViewport.bind(this);
    this._createAnimationInterval = this._createAnimationInterval.bind(this);
    this._isTheUpdateDueToCurrentAnimation = this._isTheUpdateDueToCurrentAnimation.bind(this);
    this._animateViewportProp = this._animateViewportProp.bind(this);
    this._endAnimation = this._endAnimation.bind(this);
    this._recursiveUpdateChildren = this._recursiveUpdateChildren.bind(this);
    this._isViewportAnimationEnabled = this._isViewportAnimationEnabled.bind(this);
    this._isAnimationInProgress = this._isAnimationInProgress.bind(this);
    this._processViewportChange = this._processViewportChange.bind(this);
    this._shouldIgnoreViewportChange = this._shouldIgnoreViewportChange.bind(this);
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;

    const eventManager = new EventManager(eventCanvas);

    this._eventManager = eventManager;

    // If props.controls is not provided, fallback to default MapControls instance
    // Cannot use defaultProps here because it needs to be per map instance
    this._controls = this.props.controls || new Controls(MapState);
    this._controls.setOptions(Object.assign({}, this.props, {
      onStateChange: this._onInteractiveStateChange.bind(this),
      eventManager
    }));

    this.animationContext = {
      animationT: 0,
      animationInterval: null,
      animationStartState: null,
      animationEndState: null,
      animatedViewport: null
    };
  }

  componentWillUpdate(nextProps) {
    this.someVar = 'componentWillUpdate';
    this._controls.setOptions(nextProps);
    this._processViewportChange(nextProps);
  }

  componentDidUpdate() {
    if (this.animationEndCallback) {
      this.animationEndCallback({t: this.animationEndTime});
      this.animationEndCallback = null;
    }
  }

  componentWillUnmount() {
    this._eventManager.destroy();
  }

  // Helper methods

  _animateViewportProp(startViewport, nextProps) {
    const endViewport = this._extractViewportFromProps(nextProps);
    if (this._didViewportAnimatePropChanged(startViewport, endViewport)) {
      const animationInterval = this._createAnimationInterval(nextProps);
      this.animationContext = {
        animationT: 0.0,
        animationStartViewport: startViewport,
        animationEndViewport: endViewport,
        animationInterval,
        animatedViewport: startViewport,
        onAnimationInterruption: nextProps.onAnimationInterruption,
        onAnimationStop: nextProps.onAnimationStop
      };
      this.forceUpdate();
    }
  }

  _createAnimationInterval(nextProps) {
    if (this.animationContext.animationInterval) {
      clearInterval(this.animationContext.animationInterval);
    }
    const updateFrequency = nextProps.animaitonDuration * VIEWPORT_ANIMATE_FREQUENCY;
    return setInterval(() => this._updateViewport(), updateFrequency);
  }

  _didViewportAnimatePropChanged(startViewport, endViewport) {
    // TODO: also check for `animationDuration` `animationFreeze`
    for (const p of VIEWPORT_ANIMATE_PROPS) {
      if (startViewport[p] !== undefined &&
        endViewport[p] !== undefined &&
        startViewport[p] !== endViewport[p]) {
        return true;
      }
    }
    return false;
  }

  _endAnimation() {
    clearInterval(this.animationContext.animationInterval);
    this.animationEndCallback = this.animationContext.onAnimationStop;
    this.animationEndTime = this.animationContext.animationT;
    // TODO: may be just set animationContext to null
    this.animationContext = {
      animationT: 0,
      animationInterval: null,
      animationStartState: null,
      animationEndState: null,
      animatedViewport: null,
      onAnimationStop: null,
      onAnimationInterruption: null
    };
  }

  // TODO: add viewport or viewportState prop to avoid this extraction.
  _extractViewportFromProps(props) {
    return {
      width: props.width,
      height: props.height,
      latitude: props.latitude,
      longitude: props.longitude,
      zoom: props.zoom,
      bearing: props.bearing,
      pitch: props.pitch,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom
    };
  }

  _isAnimationInProgress() {
    return this.animationContext.animationInterval;
  }

  _isViewportAnimationEnabled(props) {
    return props.animaitonDuration !== 0;
  }

  _isTheUpdateDueToCurrentAnimation(nextProps) {
    if (this.animationContext.animatedViewport) {
      const newViewport = this._extractViewportFromProps(nextProps);
      for (const p of VIEWPORT_ANIMATE_PROPS) {
        if (newViewport[p] !== this.animationContext.animatedViewport[p]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  _onInteractiveStateChange(interactiveState) {
    const {isDragging = false} = interactiveState;
    if (isDragging !== this.state.isDragging) {
      this.setState({isDragging});
    }
  }

  _processViewportChange(nextProps) {

    if (this._shouldIgnoreViewportChange(nextProps)) {
      return;
    }

    const animationEndViewport = this.animationContext ?
      this.animationContext.animationEndViewport : null;
    const shouldSnapToEnd = this._shouldEndAnimation();
    if (this._isAnimationInProgress()) {
      this._endAnimation();
    }

    if (this._isViewportAnimationEnabled(nextProps)) {
      let startViewport;
      if (shouldSnapToEnd) {
        startViewport = animationEndViewport || this._extractViewportFromProps(this.props);
      } else {
        startViewport = this._extractViewportFromProps(this.props);
      }
      this._animateViewportProp(startViewport, nextProps);
    }
  }

  _recursiveUpdateChildren(children, viewport) {
    return Children.map(children, child => {
      if (!isValidElement(child)) {
        return child;
      }
      // TODO: we need to filter chidren and only update those that require
      // updated viewport prop.
      const childProps = Object.assign({}, viewport, {viewport});
      childProps.children = this._recursiveUpdateChildren(child.props.children, viewport);
      const cloned = cloneElement(child, childProps);
      return cloned;
    });
  }

  _shouldEndAnimation() {
    return (this.animationContext &&
      this.animationContext.onAnimationInterruption === ANIMATION_EVENTS.SNAP_TO_END);
  }

  _shouldIgnoreViewportChange(nextProps) {
    // Ignore update if it is due to current active animation.
    if (this._isTheUpdateDueToCurrentAnimation(nextProps)) {
      return true;
    }

    // Ignore update if it is requested to ignore
    if (this.animationContext &&
      this.animationContext.onAnimationInterruption === ANIMATION_EVENTS.IGNORE) {
      return true;
    }

    // Ignore if none of the viewport props changed.
    const start = this._extractViewportFromProps(this.props);
    const end = this._extractViewportFromProps(nextProps);
    if (!this._didViewportAnimatePropChanged(start, end)) {
      return true;
    }

    return false;
  }

  _updateViewport() {
    const t = this.props.viewportAnimationEasingFunc(this.animationContext.animationT);
    const animatedViewport = this.props.animationInterpolator(
      this.animationContext.animationStartViewport,
      this.animationContext.animationEndViewport,
      t
    );
    const currentTime = this.animationContext.animationT;
    if (currentTime <= 1.0) {
      // console.log(`Controller update pitch: ${animatedViewport.pitch} t: ${t}`);
      this.animationContext.animationT = (
        currentTime + VIEWPORT_ANIMATE_FREQUENCY > 1.0 &&
        currentTime + VIEWPORT_ANIMATE_FREQUENCY < 1.0 + VIEWPORT_ANIMATE_FREQUENCY
        ) ? 1.0 : currentTime + VIEWPORT_ANIMATE_FREQUENCY;
      this.animationContext.animatedViewport = Object.assign(
        {},
        this.animationContext.animationEndViewport,
        animatedViewport);
      if (this.props.onViewportChange) {
        this.props.onViewportChange(animatedViewport);
      }
    } else {
      this._endAnimation();
    }
    this.forceUpdate();
  }

  render() {
    const {width, height, getCursor} = this.props;

    const eventCanvasStyle = {
      width,
      height,
      position: 'relative',
      cursor: getCursor(this.state)
    };

    let childrenWithProps;
    if (this._isAnimationInProgress()) {
      childrenWithProps = this._recursiveUpdateChildren(
        this.props.children,
        this.animationContext.animatedViewport);
    } else {
      // console.log('=== AnimationController Render using original props for children');
      childrenWithProps = this._recursiveUpdateChildren(
        this.props.children,
        this._extractViewportFromProps(this.props));
    }

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

AnimationMapController.displayName = 'AnimationMapController';
AnimationMapController.propTypes = propTypes;
AnimationMapController.defaultProps = defaultProps;
