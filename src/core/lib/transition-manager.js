/* global requestAnimationFrame, cancelAnimationFrame */
import assert from 'assert';
import {
  viewportLinearInterpolator,
  extractViewportFrom,
  areViewportsEqual
} from './viewport-transition-utils';

const noop = () => {};

const VIEWPORT_TRANSITION_PROPS =
  ['longitude', 'latitude', 'zoom', 'bearing', 'pitch'];

export const TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
};

const DEFAULT_PROPS = {
  transitionDuration: 0,
  transitionEasing: t => t,
  transitionInterpolator: viewportLinearInterpolator,
  transitionInterruption: TRANSITION_EVENTS.BREAK,
  transitionProps: VIEWPORT_TRANSITION_PROPS,
  onTransitionStart: noop,
  onTransitionInterrupt: noop,
  onTransitionEnd: noop
};

const DEFAULT_STATE = {
  animation: null,
  viewport: null,
  startViewport: null,
  endViewport: null
};

export default class TransitionManager {
  constructor(props) {
    this.props = props;
    this.state = DEFAULT_STATE;

    this._onTransitionFrame = this._onTransitionFrame.bind(this);
  }

  // Returns current transitioned viewport.
  getViewportInTransition() {
    return this.state.viewport;
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
      const currentViewport = this.state.viewport || extractViewportFrom(currentProps);
      const endViewport = this.state.endViewport;

      const startViewport = this.state.interruption === TRANSITION_EVENTS.SNAP_TO_END ?
        (endViewport || currentViewport) :
        currentViewport;

      if (isTransitionInProgress) {
        currentProps.onTransitionInterrupt();
      }
      this.props.onTransitionStart();

      this._triggerTransition(startViewport);

      transitionTriggered = true;
    } else if (isTransitionInProgress) {
      currentProps.onTransitionInterrupt();
      this._endTransition();
    }

    return transitionTriggered;
  }

  // Helper methods

  _isTransitionInProgress() {
    return this.state.viewport;
  }

  _isTransitionEnabled(props) {
    return props.transitionDuration > 0;
  }

  _isUpdateDueToCurrentTransition(props) {
    if (this.state.viewport) {
      return areViewportsEqual(extractViewportFrom(props), this.state.viewport);
    }
    return false;
  }

  _shouldIgnoreViewportChange(nextProps) {
    // Ignore update if it is due to current active transition.
    // Ignore update if it is requested to be ignored
    if (this._isTransitionInProgress()) {
      if (this.state.interruption === TRANSITION_EVENTS.IGNORE ||
        this._isUpdateDueToCurrentTransition(nextProps)) {
        return true;
      }
    } else if (!this._isTransitionEnabled(nextProps)) {
      return true;
    }

    // Ignore if none of the viewport props changed.
    if (areViewportsEqual(extractViewportFrom(this.props), extractViewportFrom(nextProps))) {
      return true;
    }

    return false;
  }

  _triggerTransition(startViewport) {
    assert(this.props.transitionDuration !== 0);
    const endViewport = extractViewportFrom(this.props);
    this._updateAngles(startViewport, endViewport);

    cancelAnimationFrame(this.state.animation);

    this.state = {
      // Save current transition props
      duration: this.props.transitionDuration,
      easing: this.props.transitionEasing,
      interpolator: this.props.transitionInterpolator,
      interruption: this.props.transitionInterruption,

      startTime: Date.now(),
      startViewport,
      endViewport,
      animation: null,
      viewport: startViewport
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

  // Update angle props so they take shortest interpolation path.
  _updateAngles(startViewport, endViewport) {
    const angularProps = ['longitude', 'bearing'];
    angularProps.forEach((key) => {
      if (Number.isFinite(startViewport[key])) {
        assert(Number.isFinite(endViewport[key]));
        if (Math.abs(endViewport[key] - startViewport[key]) > 180) {
          endViewport[key] =
            (endViewport[key] < 0) ? endViewport[key] + 360 : endViewport[key] - 360;
        }
      }
    });
  }

  _updateViewport() {
    // NOTE: Be cautious re-ordering statements in this function.
    const currentTime = Date.now();
    const {startTime, duration, easing, interpolator, startViewport, endViewport} = this.state;

    let shouldEnd = false;
    let t = (currentTime - startTime) / duration;
    if (t >= 1) {
      t = 1;
      shouldEnd = true;
    }
    t = easing(t);

    const viewport = interpolator(startViewport, endViewport, t);
    this.state.viewport = extractViewportFrom(Object.assign({}, this.props, viewport));

    if (this.props.onViewportChange) {
      this.props.onViewportChange(this.state.viewport);
    }

    if (shouldEnd) {
      this._endTransition();
      this.props.onTransitionEnd();
    }
  }
}

TransitionManager.defaultProps = DEFAULT_PROPS;
