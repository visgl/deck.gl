// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Transition, {TransitionSettings as BaseTransitionSettings} from '../transitions/transition';
import TransitionInterpolator from '../transitions/transition-interpolator';
import type {IViewState} from './view-state';

import type {Timeline} from '@luma.gl/engine';
import type {InteractionState} from './controller';

const noop = () => {};

// Enums cannot be directly exported as they are not transpiled correctly into ES5, see https://github.com/visgl/deck.gl/issues/7130
export const TRANSITION_EVENTS = {
  BREAK: 1,
  SNAP_TO_END: 2,
  IGNORE: 3
} as const;

type TransitionEvent = 1 | 2 | 3;

export type TransitionProps = {
  /** Transition duration in milliseconds, default value 0, implies no transition. When using `FlyToInterpolator`, it can also be set to `'auto'`. */
  transitionDuration?: number | 'auto';
  /** An interpolator object that defines the transition behavior between two viewports. */
  transitionInterpolator?: TransitionInterpolator;
  /** Easing function that can be used to achieve effects like "Ease-In-Cubic", "Ease-Out-Cubic", etc. Default value performs Linear easing. */
  transitionEasing?: (t: number) => number;
  /** Controls how to process a new view state change that occurs during an existing transition. */
  transitionInterruption?: TransitionEvent;
  /** Callback fired when requested transition starts. */
  onTransitionStart?: (transition: Transition) => void;
  /** Callback fired when requested transition is interrupted. */
  onTransitionInterrupt?: (transition: Transition) => void;
  /** Callback fired when requested transition ends. */
  onTransitionEnd?: (transition: Transition) => void;
};

const DEFAULT_EASING = t => t;
const DEFAULT_INTERRUPTION = TRANSITION_EVENTS.BREAK;

type TransitionSettings = BaseTransitionSettings & {
  interpolator: TransitionInterpolator;
  easing: (t: number) => number;
  interruption: TransitionEvent;
  startProps: Record<string, any>;
  endProps: Record<string, any>;
};

export default class TransitionManager<ControllerState extends IViewState<ControllerState>> {
  getControllerState: (props: any) => ControllerState;
  props?: TransitionProps;
  propsInTransition: Record<string, any> | null;
  transition: Transition;
  onViewStateChange: (params: {
    viewState: Record<string, any>;
    oldViewState: Record<string, any>;
  }) => void;
  onStateChange: (state: InteractionState) => void;

  constructor(opts: {
    timeline: Timeline;
    getControllerState: (props: any) => ControllerState;
    onViewStateChange?: (params: {
      viewState: Record<string, any>;
      oldViewState: Record<string, any>;
    }) => void;
    onStateChange?: (state: InteractionState) => void;
  }) {
    this.getControllerState = opts.getControllerState;
    this.propsInTransition = null;
    this.transition = new Transition(opts.timeline);

    this.onViewStateChange = opts.onViewStateChange || noop;
    this.onStateChange = opts.onStateChange || noop;
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
    if (!currentProps || this._shouldIgnoreViewportChange(currentProps, nextProps)) {
      return false;
    }

    if (this._isTransitionEnabled(nextProps)) {
      let startProps = currentProps;
      if (this.transition.inProgress) {
        // @ts-expect-error
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
      // @ts-expect-error
      return (this.transition.settings as TransitionSettings).interpolator.arePropsEqual(
        props,
        this.propsInTransition
      );
    }
    return false;
  }

  _shouldIgnoreViewportChange(currentProps: TransitionProps, nextProps: TransitionProps): boolean {
    if (this.transition.inProgress) {
      // @ts-expect-error
      const transitionSettings = this.transition.settings as TransitionSettings;
      // Ignore update if it is requested to be ignored
      return (
        transitionSettings.interruption === TRANSITION_EVENTS.IGNORE ||
        // Ignore update if it is due to current active transition.
        this._isUpdateDueToCurrentTransition(nextProps)
      );
    }
    if (this._isTransitionEnabled(nextProps)) {
      // Ignore if none of the viewport props changed.
      return (nextProps.transitionInterpolator as TransitionInterpolator).arePropsEqual(
        currentProps,
        nextProps
      );
    }
    return true;
  }

  _triggerTransition(startProps: TransitionProps, endProps: TransitionProps): void {
    const startViewstate = this.getControllerState(startProps);
    const endViewStateProps = this.getControllerState(endProps).shortestPathFrom(startViewstate);

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
    this.propsInTransition = this.getControllerState({
      ...this.props,
      ...viewport
    }).getViewportProps();

    this.onViewStateChange({
      viewState: this.propsInTransition,
      oldViewState: this.props as TransitionProps
    });
  };
}
