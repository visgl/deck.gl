/* global requestAnimationFrame, cancelAnimationFrame */
import assert from 'assert';
import {extractViewportFrom, LinearInterpolator} from './transition';

const noop = () => {};

export const TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
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
  viewport: null,
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

    // NOTE: Be cautious re-ordering statements in this function.
    if (this._shouldIgnoreViewportChange(nextProps)) {
      this.props = nextProps;
      return transitionTriggered;
    }

    const isTransitionInProgress = this._isTransitionInProgress();
    const currentProps = this.props;
    // Set this.props here as '_triggerTransition' calls '_updateViewport' that uses this.props.
    this.props = nextProps;

    if (this._isTransitionEnabled(nextProps)) {
      const {propsInTransition, endProps} = this.state;

      const startProps = this.state.interruption === TRANSITION_EVENTS.SNAP_TO_END ?
        endProps : (propsInTransition || currentProps);

      if (isTransitionInProgress) {
        currentProps.onTransitionInterrupt();
      }
      this.props.onTransitionStart();

      this._triggerTransition(startProps);

      transitionTriggered = true;
    } else if (isTransitionInProgress) {
      currentProps.onTransitionInterrupt();
      this._endTransition();
    }

    return transitionTriggered;
  }

  // Helper methods

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

  _shouldIgnoreViewportChange(nextProps) {
    if (this._isTransitionInProgress()) {
      // Ignore update if it is requested to be ignored
      return this.state.interruption === TRANSITION_EVENTS.IGNORE ||
        // Ignore update if it is due to current active transition.
        this._isUpdateDueToCurrentTransition(nextProps);
    } else if (this._isTransitionEnabled(nextProps)) {
      // Ignore if none of the viewport props changed.
      return nextProps.transitionInterpolator.arePropsEqual(this.props, nextProps);
    }
    return true;
  }

  _triggerTransition(startProps) {
    assert(this.props.transitionDuration !== 0);

    cancelAnimationFrame(this.state.animation);

    this.state = {
      // Save current transition props
      duration: this.props.transitionDuration,
      easing: this.props.transitionEasing,
      interpolator: this.props.transitionInterpolator,
      interruption: this.props.transitionInterruption,

      startTime: Date.now(),
      startProps: Object.assign({}, startProps),
      endProps: Object.assign({}, this.props),
      animation: null,
      viewport: startProps
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

TransitionManager.defaultProps = DEFAULT_PROPS;
