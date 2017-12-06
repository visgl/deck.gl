/* global requestAnimationFrame, cancelAnimationFrame */
import LinearInterpolator from '../transitions/linear-interpolator';
import {extractViewportFrom} from '../transitions/transition-utils';
import WebMercatorViewport from '../viewports/web-mercator-viewport';

import assert from 'assert';
import PropTypes from 'prop-types';

const noop = () => {};

export const TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};

const PROP_TYPES = {
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

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func
};

const DEFAULT_PROPS = {
  transitionDuration: 0,
  transitionEasing: t => t,
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  onTransitionStart: noop,
  onTransitionInterrupt: noop,
  onTransitionEnd: noop
};

const DEFAULT_STATE = {
  animation: null,
  propsInTransition: null,
  startProps: null,
  endProps: null
};

export default class TransitionManager {
  constructor(props) {
    this.props = props;
    this.state = DEFAULT_STATE;

    this._onTransitionFrame = this._onTransitionFrame.bind(this);
  }

  // Returns current transitioned viewport.
  getViewportInTransition() {
    return this.state.propsInTransition;
  }

  // Process the vewiport change, either ignore or trigger a new transiton.
  // Return true if a new transition is triggered, false otherwise.
  processViewportChange(nextProps) {
    let transitionTriggered = false;
    const currentProps = this.props;

    // extract viewport props if needed.
    const viewportProps = this._getViewportProps(nextProps);
    const newProps = Object.assign({}, nextProps, viewportProps);

    // Set this.props here as '_triggerTransition' calls '_updateViewport' that uses this.props.
    this.props = newProps;

    // NOTE: Be cautious re-ordering statements in this function.
    if (this._shouldIgnoreViewportChange(currentProps, newProps)) {
      return transitionTriggered;
    }

    const isTransitionInProgress = this._isTransitionInProgress();

    if (this._isTransitionEnabled(newProps)) {
      const startProps = Object.assign({}, currentProps,
        this.state.interruption === TRANSITION_EVENTS.SNAP_TO_END ?
        this.state.endProps : (this.state.propsInTransition || currentProps)
      );

      if (isTransitionInProgress) {
        currentProps.onTransitionInterrupt();
      }
      newProps.onTransitionStart();

      this._triggerTransition(startProps, newProps);

      transitionTriggered = true;
    } else if (isTransitionInProgress) {
      currentProps.onTransitionInterrupt();
      this._endTransition();
    }

    return transitionTriggered;
  }

  // Helper methods

  // extracts required viewport props when multi-viewports are used
  _getViewportProps(nextProps) {
    const viewportProps = nextProps.viewports ?
      nextProps.viewports.filter(viewport => viewport instanceof WebMercatorViewport)[0] :
      nextProps.viewport;

    if (!viewportProps) {
      return {};
    }

    const {
      longitude, latitude, zoom, bearing, pitch, position
    } = viewportProps;
    const {width, height} = nextProps;

    return {
      width, height,
      longitude, latitude, zoom, bearing, pitch, position
    };
  }

  _isTransitionInProgress() {
    return this.state.propsInTransition;
  }

  _isTransitionEnabled(props) {
    return props.transitionDuration > 0 && props.transitionInterpolator;
  }

  _isUpdateDueToCurrentTransition(props) {
    if (this.state.propsInTransition) {
      return this.state.interpolator.arePropsEqual(props, this.state.propsInTransition);
    }
    return false;
  }

  _shouldIgnoreViewportChange(currentProps, nextProps) {
    if (this._isTransitionInProgress()) {
      // Ignore update if it is requested to be ignored
      return this.state.interruption === TRANSITION_EVENTS.IGNORE ||
        // Ignore update if it is due to current active transition.
        this._isUpdateDueToCurrentTransition(nextProps);
    } else if (this._isTransitionEnabled(nextProps)) {
      // Ignore if none of the viewport props changed.
      return nextProps.transitionInterpolator.arePropsEqual(currentProps, nextProps);
    }
    return true;
  }

  _triggerTransition(startProps, endProps) {
    assert(this._isTransitionEnabled(endProps), 'Transition is not enabled');

    cancelAnimationFrame(this.state.animation);

    const initialProps = endProps.transitionInterpolator.initializeProps(
      startProps,
      endProps
    );

    this.state = {
      // Save current transition props
      duration: endProps.transitionDuration,
      easing: endProps.transitionEasing,
      interpolator: endProps.transitionInterpolator,
      interruption: endProps.transitionInterruption,

      startTime: Date.now(),
      startProps: initialProps.start,
      endProps: initialProps.end,
      animation: null,
      propsInTransition: {}
    };

    this._onTransitionFrame();
  }

  _onTransitionFrame() {
    // _updateViewport() may cancel the animation
    this.state.animation = requestAnimationFrame(this._onTransitionFrame);
    this._updateViewport();
  }

  _endTransition() {
    cancelAnimationFrame(this.state.animation);
    this.state = DEFAULT_STATE;
  }

  _updateViewport() {
    // NOTE: Be cautious re-ordering statements in this function.
    const currentTime = Date.now();
    const {startTime, duration, easing, interpolator, startProps, endProps} = this.state;

    let shouldEnd = false;
    let t = (currentTime - startTime) / duration;
    if (t >= 1) {
      t = 1;
      shouldEnd = true;
    }
    t = easing(t);

    const viewport = interpolator.interpolateProps(startProps, endProps, t);

    // This extractViewportFrom gurantees angle props (bearing, longitude) are normalized
    // So when viewports are compared they are in same range.
    this.state.propsInTransition = extractViewportFrom(Object.assign({}, this.props, viewport));

    if (this.props.onViewportChange) {
      this.props.onViewportChange(this.state.propsInTransition, {inTransition: true});
    }

    if (shouldEnd) {
      this._endTransition();
      this.props.onTransitionEnd();
    }
  }
}

TransitionManager.propTypes = PROP_TYPES;
TransitionManager.defaultProps = DEFAULT_PROPS;
