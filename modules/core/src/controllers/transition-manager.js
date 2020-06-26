import LinearInterpolator from '../transitions/linear-interpolator';
import Transition from '../transitions/transition';

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

export default class TransitionManager {
  constructor(ControllerState, props = {}) {
    this.ControllerState = ControllerState;
    this.props = Object.assign({}, DEFAULT_PROPS, props);
    this.propsInTransition = null;
    this.transition = new Transition(props.timeline);

    this.onViewStateChange = props.onViewStateChange;

    this._onTransitionUpdate = this._onTransitionUpdate.bind(this);
  }

  finalize() {
    this.transition.cancel();
  }

  // Returns current transitioned viewport.
  getViewportInTransition() {
    return this.propsInTransition;
  }

  // Process the vewiport change, either ignore or trigger a new transition.
  // Return true if a new transition is triggered, false otherwise.
  processViewStateChange(nextProps) {
    let transitionTriggered = false;
    const currentProps = this.props;
    // Set this.props here as '_triggerTransition' calls '_updateViewport' that uses this.props.
    nextProps = Object.assign({}, DEFAULT_PROPS, nextProps);
    this.props = nextProps;

    // NOTE: Be cautious re-ordering statements in this function.
    if (this._shouldIgnoreViewportChange(currentProps, nextProps)) {
      return transitionTriggered;
    }

    if (this._isTransitionEnabled(nextProps)) {
      const {interruption, endProps} = this.transition.settings;
      const startProps = Object.assign(
        {},
        currentProps,
        interruption === TRANSITION_EVENTS.SNAP_TO_END
          ? endProps
          : this.propsInTransition || currentProps
      );

      this._triggerTransition(startProps, nextProps);

      transitionTriggered = true;
    } else {
      this.transition.cancel();
    }

    return transitionTriggered;
  }

  updateTransition() {
    this.transition.update();
  }

  // Helper methods

  _isTransitionEnabled(props) {
    const {transitionDuration, transitionInterpolator} = props;
    return (
      (transitionDuration > 0 || transitionDuration === 'auto') && Boolean(transitionInterpolator)
    );
  }

  _isUpdateDueToCurrentTransition(props) {
    if (this.transition.inProgress) {
      return this.transition.settings.interpolator.arePropsEqual(props, this.propsInTransition);
    }
    return false;
  }

  _shouldIgnoreViewportChange(currentProps, nextProps) {
    if (this.transition.inProgress) {
      // Ignore update if it is requested to be ignored
      return (
        this.transition.settings.interruption === TRANSITION_EVENTS.IGNORE ||
        // Ignore update if it is due to current active transition.
        this._isUpdateDueToCurrentTransition(nextProps)
      );
    } else if (this._isTransitionEnabled(nextProps)) {
      // Ignore if none of the viewport props changed.
      return nextProps.transitionInterpolator.arePropsEqual(currentProps, nextProps);
    }
    return true;
  }

  _triggerTransition(startProps, endProps) {
    const startViewstate = new this.ControllerState(startProps);
    const endViewStateProps = new this.ControllerState(endProps).shortestPathFrom(startViewstate);

    // update transitionDuration for 'auto' mode
    const {transitionInterpolator} = endProps;
    const duration = transitionInterpolator.getDuration
      ? transitionInterpolator.getDuration(startProps, endProps)
      : endProps.transitionDuration;

    if (duration === 0) {
      return;
    }

    const initialProps = endProps.transitionInterpolator.initializeProps(
      startProps,
      endViewStateProps
    );

    this.propsInTransition = {};
    this.duration = duration;
    this.transition.start({
      duration,
      easing: endProps.transitionEasing,
      interpolator: endProps.transitionInterpolator,
      interruption: endProps.transitionInterruption,

      startProps: initialProps.start,
      endProps: initialProps.end,

      onStart: endProps.onTransitionStart,
      onUpdate: this._onTransitionUpdate,
      onInterrupt: this._onTransitionEnd(endProps.onTransitionInterrupt),
      onEnd: this._onTransitionEnd(endProps.onTransitionEnd)
    });
    this.updateTransition();
  }

  _onTransitionEnd(callback) {
    return transition => {
      this.propsInTransition = null;
      callback(transition);
    };
  }

  _onTransitionUpdate(transition) {
    // NOTE: Be cautious re-ordering statements in this function.
    const {
      time,
      settings: {interpolator, startProps, endProps, duration, easing}
    } = transition;
    const t = easing(time / duration);
    const viewport = interpolator.interpolateProps(startProps, endProps, t);

    // This gurantees all props (e.g. bearing, longitude) are normalized
    // So when viewports are compared they are in same range.
    this.propsInTransition = new this.ControllerState(
      Object.assign({}, this.props, viewport)
    ).getViewportProps();

    if (this.onViewStateChange) {
      this.onViewStateChange({
        viewState: this.propsInTransition,
        interactionState: {inTransition: true},
        oldViewState: this.props
      });
    }
  }
}

TransitionManager.defaultProps = DEFAULT_PROPS;
