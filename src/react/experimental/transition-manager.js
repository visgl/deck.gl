
/* eslint-disable max-depth */

/* global setInterval, clearInterval */
import assert from 'assert';
import {
  viewportLinearInterpolator,
  extractViewportFrom,
  VIEWPORT_PROPS
} from './viewport-transition-utils';

// TODO: make the frequency customizalbe , adapt to frame rate
const VIEWPORT_TRANSITION_FREQUENCY = 0.01;
const VIEWPORT_TRANSITION_EASING_FUNC = t => t;

export const TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};

const DEFAULT_PROPS = {
  transitionDuration: 0,
  transitionInterpolator: viewportLinearInterpolator,
  transitionEasing: VIEWPORT_TRANSITION_EASING_FUNC,
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  onTransitionStart: () => {},
  onTransitionInterrupt: () => {},
  onTransitionEnd: () => {}
};

export default class TransitionManager {
  constructor(props, onTransitionUpdate) {

    this.props = Object.assign({}, DEFAULT_PROPS, props);
    this.onTransitionUpdate = onTransitionUpdate;
    this.transitionContext = {
      time: 0,
      interval: null,
      viewport: null,
      startViewport: null,
      endViewport: null
    };

    this._updateViewport = this._updateViewport.bind(this);
    this._createTransitionInterval = this._createTransitionInterval.bind(this);
    this._isTheUpdateDueToCurrentTransition = this._isTheUpdateDueToCurrentTransition.bind(this);
    this._triggerTransition = this._triggerTransition.bind(this);
    this._endTransition = this._endTransition.bind(this);
    this._isTransitionEnabled = this._isTransitionEnabled.bind(this);
    this._isTransitionInProgress = this._isTransitionInProgress.bind(this);
    this.processViewportChange = this.processViewportChange.bind(this);
    this._shouldIgnoreViewportChange = this._shouldIgnoreViewportChange.bind(this);
  }

  getTransionedViewport() {
    return this.transitionContext.viewport;
  }

  processViewportChange(props, nextProps) {
    // NOTE: Be cautious re-ordering statements in this function.
    if (this._shouldIgnoreViewportChange(nextProps)) {
      return;
    }

    const shouldSnapToEnd = this._shouldSnapToEnd();
    const endViewport = this.transitionContext.endViewport;
    if (this._isTransitionInProgress()) {
      this.props.onTransitionInterrupt();
      this._endTransition();
    }

    if (this._isTransitionEnabled(nextProps)) {
      const currentViewport = extractViewportFrom(props);
      const startViewport = shouldSnapToEnd ?
        (endViewport || currentViewport) :
        currentViewport;
      this._triggerTransition(startViewport, nextProps);
      if (nextProps.onTransitionStart) {
        nextProps.onTransitionStart();
      }
    }

    const newProps = Object.assign({}, this.props, nextProps);
    this.props = newProps;
  }

  // Helper methods

  _areViewportsEqual(startViewport, endViewport) {
    for (const p of VIEWPORT_PROPS) {
      if (Array.isArray(startViewport[p])) {
        for (let i = 0; i < startViewport[p].length; ++i) {
          if (startViewport[p][i] !== endViewport[p][i]) {
            return false;
          }
        }
      } else if (startViewport[p] !== endViewport[p]) {
        return false;
      }
    }
    return true;
  }

  _createTransitionInterval(nextProps) {
    if (this.transitionContext.interval) {
      clearInterval(this.transitionContext.interval);
    }
    const updateFrequency = nextProps.transitionDuration * VIEWPORT_TRANSITION_FREQUENCY;
    return setInterval(() => this._updateViewport(), updateFrequency);
  }

  _endTransition() {
    clearInterval(this.transitionContext.interval);
    this.transitionContext = {
      time: 0,
      interval: null,
      viewport: null,
      startViewport: null,
      endViewport: null
    };
  }

  _isTransitionInProgress() {
    return this.transitionContext.interval;
  }

  _isTransitionEnabled(props) {
    return props.transitionDuration !== 0;
  }

  _isTheUpdateDueToCurrentTransition(nextProps) {
    if (this.transitionContext.viewport) {
      const newViewport = extractViewportFrom(nextProps);
      return this._areViewportsEqual(newViewport, this.transitionContext.viewport);
    }
    return false;
  }

  _shouldIgnoreViewportChange(nextProps) {
    // Ignore update if it is due to current active transition.
    if (this._isTheUpdateDueToCurrentTransition(nextProps)) {
      return true;
    }

    // Ignore update if it is requested to be ignored
    if (this._isTransitionInProgress() &&
      this.props.transitionInterruption === TRANSITION_EVENTS.IGNORE) {
      return true;
    }

    // Ignore if none of the viewport props changed.
    const start = extractViewportFrom(this.props);
    const end = extractViewportFrom(nextProps);
    if (this._areViewportsEqual(start, end)) {
      return true;
    }

    return false;
  }

  _shouldSnapToEnd() {
    return (this.transitionContext.interval &&
      this.props.transitionInterruption === TRANSITION_EVENTS.SNAP_TO_END);
  }

  _triggerTransition(startViewport, nextProps) {
    const endViewport = extractViewportFrom(nextProps);
    const interval = this._createTransitionInterval(nextProps);
    this.transitionContext = {
      time: VIEWPORT_TRANSITION_FREQUENCY,
      startViewport,
      endViewport,
      interval,
      viewport: startViewport
    };
  }

  _updateViewport() {
    // NOTE: Be cautious re-ordering statements in this function.
    const time = this.transitionContext.time;
    const easing = this.props.transitionEasing(time);
    const viewport = this.props.transitionInterpolator(
      this.transitionContext.startViewport,
      this.transitionContext.endViewport,
      easing
    );
    assert(time <= 1.0);
    this.transitionContext.viewport = Object.assign(
      {},
      this.transitionContext.endViewport,
      viewport);
    if (this.onTransitionUpdate) {
      this.onTransitionUpdate(viewport);
    }

    if (time === 1.0) {
      this._endTransition();
      this.props.onTransitionEnd();
    } else {
      let newTime = time + VIEWPORT_TRANSITION_FREQUENCY;
      // Make sure interplation step is always ends with time = 1.0
      if (newTime > 1.0) {
        newTime = 1.0 - VIEWPORT_TRANSITION_FREQUENCY;
      }
      this.transitionContext.time = newTime;
    }
  }
}
