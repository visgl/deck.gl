import Transition, {TransitionSettings as BaseTransitionSettings} from '../transitions/transition';
import TransitionInterpolator from '../transitions/transition-interpolator';
import type {IViewState, ConstructorOf} from './view-state';

import type {Timeline} from '@luma.gl/core';
import type {InteractionState} from './controller';

const noop = () => {};

export enum TRANSITION_EVENTS {
  BREAK = 1,
  SNAP_TO_END = 2,
  IGNORE = 3
}

export type TransitionProps = {
  transitionDuration?: number | 'auto';
  transitionInterpolator?: TransitionInterpolator;
  transitionEasing?: (t: number) => number;
  transitionInterruption?: TRANSITION_EVENTS;
  onTransitionStart?: (transition: Transition) => void;
  onTransitionInterrupt?: (transition: Transition) => void;
  onTransitionEnd?: (transition: Transition) => void;
};

const DEFAULT_EASING = t => t;
const DEFAULT_INTERRUPTION = TRANSITION_EVENTS.BREAK;

type TransitionSettings = BaseTransitionSettings & {
  interpolator: TransitionInterpolator;
  easing: (t: number) => number;
  interruption: TRANSITION_EVENTS;
  startProps: Record<string, any>;
  endProps: Record<string, any>;
};

export default class TransitionManager<ControllerState extends IViewState<ControllerState>> {
  ControllerState: ConstructorOf<ControllerState>;
  props: TransitionProps;
  propsInTransition: Record<string, any> | null;
  transition: Transition;
  onViewStateChange: (params: {
    viewState: Record<string, any>;
    oldViewState: Record<string, any>;
  }) => void;
  onStateChange: (state: InteractionState) => void;

  constructor(
    ControllerState: ConstructorOf<ControllerState>,
    props: TransitionProps & {
      timeline: Timeline;
      onViewStateChange?: (params: {
        viewState: Record<string, any>;
        oldViewState: Record<string, any>;
      }) => void;
      onStateChange?: (state: InteractionState) => void;
    }
  ) {
    this.ControllerState = ControllerState;
    this.props = props;
    this.propsInTransition = null;
    this.transition = new Transition(props.timeline);

    this.onViewStateChange = props.onViewStateChange || noop;
    this.onStateChange = props.onStateChange || noop;
  }

  finalize(): void {
    this.transition.cancel();
  }

  // Returns current transitioned viewport.
  getViewportInTransition(): Record<string, any> | null {
    return this.propsInTransition;
  }

  // Process the vewiport change, either ignore or trigger a new transition.
  // Return true if a new transition is triggered, false otherwise.
  processViewStateChange(nextProps: TransitionProps) {
    let transitionTriggered = false;
    const currentProps = this.props;
    // Set this.props here as '_triggerTransition' calls '_updateViewport' that uses this.props.
    this.props = nextProps;

    // NOTE: Be cautious re-ordering statements in this function.
    if (this._shouldIgnoreViewportChange(currentProps, nextProps)) {
      return transitionTriggered;
    }

    if (this._isTransitionEnabled(nextProps)) {
      let startProps = currentProps;
      if (this.transition.inProgress) {
        const {interruption, endProps} = this.transition.settings as TransitionSettings;
        startProps = {
          ...currentProps,
          ...(interruption === TRANSITION_EVENTS.SNAP_TO_END
            ? endProps
            : this.propsInTransition || currentProps)
        };
      }

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

  _isTransitionEnabled(props: TransitionProps): boolean {
    const {transitionDuration, transitionInterpolator} = props;
    return (
      ((transitionDuration as number) > 0 || transitionDuration === 'auto') &&
      Boolean(transitionInterpolator)
    );
  }

  _isUpdateDueToCurrentTransition(props: TransitionProps): boolean {
    if (this.transition.inProgress && this.propsInTransition) {
      return (this.transition.settings as TransitionSettings).interpolator.arePropsEqual(
        props,
        this.propsInTransition
      );
    }
    return false;
  }

  _shouldIgnoreViewportChange(currentProps: TransitionProps, nextProps: TransitionProps): boolean {
    if (this.transition.inProgress) {
      // Ignore update if it is requested to be ignored
      return (
        (this.transition.settings as TransitionSettings).interruption ===
          TRANSITION_EVENTS.IGNORE ||
        // Ignore update if it is due to current active transition.
        this._isUpdateDueToCurrentTransition(nextProps)
      );
    } else if (this._isTransitionEnabled(nextProps)) {
      // Ignore if none of the viewport props changed.
      return (nextProps.transitionInterpolator as TransitionInterpolator).arePropsEqual(
        currentProps,
        nextProps
      );
    }
    return true;
  }

  _triggerTransition(startProps: TransitionProps, endProps: TransitionProps): void {
    const startViewstate = new this.ControllerState(startProps);
    const endViewStateProps = new this.ControllerState(endProps).shortestPathFrom(startViewstate);

    // update transitionDuration for 'auto' mode
    const transitionInterpolator = endProps.transitionInterpolator as TransitionInterpolator;
    const duration = transitionInterpolator.getDuration
      ? transitionInterpolator.getDuration(startProps, endProps)
      : (endProps.transitionDuration as number);

    if (duration === 0) {
      return;
    }

    const initialProps = transitionInterpolator.initializeProps(startProps, endViewStateProps);

    this.propsInTransition = {};
    const transitionSettings: TransitionSettings = {
      duration,
      easing: endProps.transitionEasing || DEFAULT_EASING,
      interpolator: transitionInterpolator,
      interruption: endProps.transitionInterruption || DEFAULT_INTERRUPTION,

      startProps: initialProps.start,
      endProps: initialProps.end,

      onStart: endProps.onTransitionStart,
      onUpdate: this._onTransitionUpdate,
      onInterrupt: this._onTransitionEnd(endProps.onTransitionInterrupt),
      onEnd: this._onTransitionEnd(endProps.onTransitionEnd)
    };
    this.transition.start(transitionSettings);

    this.onStateChange({inTransition: true});

    this.updateTransition();
  }

  _onTransitionEnd(callback?: (transition: Transition) => void) {
    return transition => {
      this.propsInTransition = null;

      this.onStateChange({
        inTransition: false,
        isZooming: false,
        isPanning: false,
        isRotating: false
      });

      callback?.(transition);
    };
  }

  _onTransitionUpdate = transition => {
    // NOTE: Be cautious re-ordering statements in this function.
    const {
      time,
      settings: {interpolator, startProps, endProps, duration, easing}
    } = transition;
    const t = easing(time / duration);
    const viewport = interpolator.interpolateProps(startProps, endProps, t);

    // This gurantees all props (e.g. bearing, longitude) are normalized
    // So when viewports are compared they are in same range.
    this.propsInTransition = new this.ControllerState({
      ...this.props,
      ...viewport
    }).getViewportProps();

    this.onViewStateChange({
      viewState: this.propsInTransition,
      oldViewState: this.props
    });
  };
}
