import Transition from '../transitions/transition';
import TransitionInterpolator from '../transitions/transition-interpolator';
import type {IViewState} from './view-state';
import type {Timeline} from '@luma.gl/engine';
import type {InteractionState} from './controller';
export declare const TRANSITION_EVENTS: {
  readonly BREAK: 1;
  readonly SNAP_TO_END: 2;
  readonly IGNORE: 3;
};
declare type TransitionEvent = 1 | 2 | 3;
export declare type TransitionProps = {
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
  });
  finalize(): void;
  getViewportInTransition(): Record<string, any> | null;
  processViewStateChange(nextProps: TransitionProps): boolean;
  updateTransition(): void;
  _isTransitionEnabled(props: TransitionProps): boolean;
  _isUpdateDueToCurrentTransition(props: TransitionProps): boolean;
  _shouldIgnoreViewportChange(currentProps: TransitionProps, nextProps: TransitionProps): boolean;
  _triggerTransition(startProps: TransitionProps, endProps: TransitionProps): void;
  _onTransitionEnd(callback?: (transition: Transition) => void): (transition: any) => void;
  _onTransitionUpdate: (transition: any) => void;
}
export {};
// # sourceMappingURL=transition-manager.d.ts.map
