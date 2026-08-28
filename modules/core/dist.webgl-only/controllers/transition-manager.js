// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import Transition from "../transitions/transition.js";
const noop = () => { };
const PRESERVE_CONSTRAINT_CONTEXT = { mode: 'preserve' };
const HARD_CONSTRAINT_CONTEXT = { mode: 'hard' };
// Enums cannot be directly exported as they are not transpiled correctly into ES5, see https://github.com/visgl/deck.gl/issues/7130
export const TRANSITION_EVENTS = {
    BREAK: 1,
    SNAP_TO_END: 2,
    IGNORE: 3
};
const DEFAULT_EASING = t => t;
const DEFAULT_INTERRUPTION = TRANSITION_EVENTS.BREAK;
export default class TransitionManager {
    constructor(opts) {
        this._onTransitionUpdate = transition => {
            // NOTE: Be cautious re-ordering statements in this function.
            const { time, settings: { interpolator, startProps, endProps, duration, easing } } = transition;
            const t = easing(time / duration);
            const viewport = interpolator.interpolateProps(startProps, endProps, t);
            // This gurantees all props (e.g. bearing, longitude) are normalized
            // So when viewports are compared they are in same range.
            this.propsInTransition = this.getControllerState({
                ...this.props,
                ...viewport
            }, PRESERVE_CONSTRAINT_CONTEXT).getViewportProps();
            this.onViewStateChange({
                viewState: this.propsInTransition,
                oldViewState: this.props
            });
        };
        this.getControllerState = opts.getControllerState;
        this.propsInTransition = null;
        this.transition = new Transition(opts.timeline);
        this.onViewStateChange = opts.onViewStateChange || noop;
        this.onStateChange = opts.onStateChange || noop;
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
        this.props = nextProps;
        // NOTE: Be cautious re-ordering statements in this function.
        if (!currentProps || this._shouldIgnoreViewportChange(currentProps, nextProps)) {
            return false;
        }
        if (this._isTransitionEnabled(nextProps)) {
            let startProps = currentProps;
            if (this.transition.inProgress) {
                // @ts-expect-error
                const { interruption, endProps } = this.transition.settings;
                startProps = {
                    ...currentProps,
                    ...(interruption === TRANSITION_EVENTS.SNAP_TO_END
                        ? endProps
                        : this.propsInTransition || currentProps)
                };
            }
            this._triggerTransition(startProps, nextProps);
            transitionTriggered = true;
        }
        else {
            this.transition.cancel();
        }
        return transitionTriggered;
    }
    updateTransition() {
        this.transition.update();
    }
    // Helper methods
    _isTransitionEnabled(props) {
        const { transitionDuration, transitionInterpolator } = props;
        return ((transitionDuration > 0 || transitionDuration === 'auto') &&
            Boolean(transitionInterpolator));
    }
    _isUpdateDueToCurrentTransition(props) {
        if (this.transition.inProgress && this.propsInTransition) {
            // @ts-expect-error
            return this.transition.settings.interpolator.arePropsEqual(props, this.propsInTransition);
        }
        return false;
    }
    _shouldIgnoreViewportChange(currentProps, nextProps) {
        if (this.transition.inProgress) {
            // @ts-expect-error
            const transitionSettings = this.transition.settings;
            // Ignore update if it is requested to be ignored
            return (transitionSettings.interruption === TRANSITION_EVENTS.IGNORE ||
                // Ignore update if it is due to current active transition.
                this._isUpdateDueToCurrentTransition(nextProps));
        }
        if (this._isTransitionEnabled(nextProps)) {
            // Ignore if none of the viewport props changed.
            return nextProps.transitionInterpolator.arePropsEqual(currentProps, nextProps);
        }
        return true;
    }
    _triggerTransition(startProps, endProps) {
        const startViewstate = this.getControllerState(startProps, PRESERVE_CONSTRAINT_CONTEXT);
        const endViewStateProps = this.getControllerState(endProps, HARD_CONSTRAINT_CONTEXT).shortestPathFrom(startViewstate);
        // update transitionDuration for 'auto' mode
        const transitionInterpolator = endProps.transitionInterpolator;
        const duration = transitionInterpolator.getDuration
            ? transitionInterpolator.getDuration(startProps, endProps)
            : endProps.transitionDuration;
        if (duration === 0) {
            return;
        }
        const initialProps = transitionInterpolator.initializeProps(startProps, endViewStateProps);
        this.propsInTransition = {};
        const transitionSettings = {
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
        this.onStateChange({ inTransition: true });
        this.updateTransition();
    }
    _onTransitionEnd(callback) {
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
}
//# sourceMappingURL=transition-manager.js.map