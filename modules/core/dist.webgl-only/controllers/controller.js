// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/* eslint-disable max-statements, complexity */
import TransitionManager from "./transition-manager.js";
import LinearInterpolator from "../transitions/linear-interpolator.js";
import { deepEqual } from "../utils/deep-equal.js";
const NO_TRANSITION_PROPS = {
    transitionDuration: 0
};
const DEFAULT_INERTIA = 300;
const REBOUND_DURATION = 300;
const INERTIA_EASING = (t) => 1 - (1 - t) * (1 - t);
const EASE_OUT_EXPONENTIAL = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const EVENT_TYPES = {
    WHEEL: ['wheel'],
    PAN: ['panstart', 'panmove', 'panend'],
    PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
    MULTI_PAN: ['multipanstart', 'multipanmove', 'multipanend'],
    DOUBLE_CLICK: ['dblclick'],
    DOUBLE_CLICK_DRAG: [
        'dblclickdragstart',
        'dblclickdragmove',
        'dblclickdragend',
        'dblclickdragcancel'
    ],
    KEYBOARD: ['keydown']
};
const pinchEventWorkaround = {};
export default class Controller {
    constructor(opts) {
        this.state = {};
        this._events = {};
        this._interactionState = {
            isDragging: false
        };
        this._customEvents = [];
        this._eventStartBlocked = null;
        this._panMove = false;
        this._multiPanMode = null;
        this._multiPanStartCenter = null;
        this._doubleClickDragAnchor = null;
        this._suppressDoubleClickUntil = 0;
        this.invertPan = false;
        this.dragMode = 'rotate';
        this.inertia = 0;
        this.scrollZoom = true;
        this.dragPan = true;
        this.dragRotate = true;
        this.doubleClickZoom = true;
        this.doubleClickDragZoom = true;
        this.touchZoom = true;
        this.touchRotate = false;
        this.multiTouchDrag = null;
        this.trackpadGesture = false;
        this.keyboard = true;
        this.transitionManager = new TransitionManager({
            ...opts,
            getControllerState: (props, constraintContext) => new this.ControllerState({
                ...props,
                constraintContext,
                makeViewport: opts.makeViewport
            }),
            onViewStateChange: this._onTransition.bind(this),
            onStateChange: this._setInteractionState.bind(this)
        });
        this.handleEvent = this.handleEvent.bind(this);
        this.eventManager = opts.eventManager;
        this.onViewStateChange = opts.onViewStateChange || (() => { });
        this.onStateChange = opts.onStateChange || (() => { });
        this.makeViewport = opts.makeViewport;
        this.pickPosition = opts.pickPosition;
    }
    set events(customEvents) {
        this.toggleEvents(this._customEvents, false);
        this.toggleEvents(customEvents, true);
        this._customEvents = customEvents;
        // Make sure default events are not overwritten
        if (this.props) {
            this.setProps(this.props);
        }
    }
    finalize() {
        for (const eventName in this._events) {
            if (this._events[eventName]) {
                // @ts-ignore (2345) event type string cannot be assifned to enum
                // eslint-disable-next-line @typescript-eslint/unbound-method
                this.eventManager?.off(eventName, this.handleEvent);
            }
        }
        this.transitionManager.finalize();
    }
    /**
     * Callback for events
     */
    handleEvent(event) {
        // Force recalculate controller state
        this._controllerState = undefined;
        const eventStartBlocked = this._eventStartBlocked;
        switch (event.type) {
            case 'panstart':
                return eventStartBlocked ? false : this._onPanStart(event);
            case 'panmove':
                return this._onPan(event);
            case 'panend':
                return this._onPanEnd(event);
            case 'pinchstart':
                return eventStartBlocked || !this._isTrackpadGestureAllowed(event)
                    ? false
                    : this._onPinchStart(event);
            case 'pinchmove':
                return this._isTrackpadGestureAllowed(event) ? this._onPinch(event) : false;
            case 'pinchend':
                return this._isTrackpadGestureAllowed(event) ? this._onPinchEnd(event) : false;
            case 'multipanstart':
                return eventStartBlocked ? false : this._onMultiPanStart(event);
            case 'multipanmove':
                return this._onMultiPan(event);
            case 'multipanend':
                return this._onMultiPanEnd(event);
            case 'dblclick':
                return this._onDoubleClick(event);
            case 'dblclickdragstart':
                return eventStartBlocked ? false : this._onDoubleClickDragStart(event);
            case 'dblclickdragmove':
                return this._onDoubleClickDrag(event);
            case 'dblclickdragend':
            case 'dblclickdragcancel':
                return this._onDoubleClickDragEnd(event);
            case 'wheel':
                return this._onWheel(event);
            case 'keydown':
                return this._onKeyDown(event);
            default:
                return false;
        }
    }
    /* Event utils */
    // Event object: http://hammerjs.github.io/api/#event-object
    get controllerState() {
        this._controllerState =
            this._controllerState ||
                new this.ControllerState({
                    makeViewport: this.makeViewport,
                    ...this.props,
                    ...this.state
                });
        return this._controllerState;
    }
    getCenter(event) {
        const { x, y } = this.props;
        const { offsetCenter } = event;
        return [offsetCenter.x - x, offsetCenter.y - y];
    }
    isPointInBounds(pos, event) {
        const { width, height } = this.props;
        if (event && event.handled) {
            return false;
        }
        const inside = pos[0] >= 0 && pos[0] <= width && pos[1] >= 0 && pos[1] <= height;
        if (inside && event) {
            event.stopPropagation();
        }
        return inside;
    }
    isFunctionKeyPressed(event) {
        const { srcEvent } = event;
        return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
    }
    isDragging() {
        return this._interactionState.isDragging || false;
    }
    // When a multi-touch event ends, e.g. pinch, not all pointers are lifted at the same time.
    // This triggers a brief `pan` event.
    // Calling this method will temporarily disable *start events to avoid conflicting transitions.
    blockEvents(timeout) {
        /* global setTimeout */
        const timer = setTimeout(() => {
            if (this._eventStartBlocked === timer) {
                this._eventStartBlocked = null;
            }
        }, timeout);
        this._eventStartBlocked = timer;
    }
    /**
     * Extract interactivity options
     */
    setProps(props) {
        if (props.maxBoundsPadding === undefined) {
            props.maxBoundsPadding = null;
        }
        if (props.dragMode) {
            this.dragMode = props.dragMode;
        }
        const oldProps = this.props;
        this.props = props;
        if (!('transitionInterpolator' in props)) {
            // Add default transition interpolator
            props.transitionInterpolator = this._getTransitionProps().transitionInterpolator;
        }
        this.transitionManager.processViewStateChange(props);
        const { inertia } = props;
        this.inertia = Number.isFinite(inertia)
            ? inertia
            : inertia === true
                ? DEFAULT_INERTIA
                : 0;
        // TODO - make sure these are not reset on every setProps
        const { scrollZoom = true, dragPan = true, dragRotate = true, doubleClickZoom = true, doubleClickDragZoom = false, touchZoom = true, touchRotate = false, multiTouchDrag = touchRotate ? 'rotate' : null, trackpadGesture = false, keyboard = true } = props;
        // Register/unregister events
        const isInteractive = Boolean(this.onViewStateChange);
        this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
        // We always need the pan events to set the correct isDragging state, even if dragPan & dragRotate are both false
        this.toggleEvents(EVENT_TYPES.PAN, isInteractive);
        this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && (touchZoom || multiTouchDrag === 'rotate'));
        this.toggleEvents(EVENT_TYPES.MULTI_PAN, isInteractive && Boolean(multiTouchDrag));
        this.toggleEvents(EVENT_TYPES.DOUBLE_CLICK, isInteractive && doubleClickZoom);
        this.toggleEvents(EVENT_TYPES.DOUBLE_CLICK_DRAG, isInteractive && doubleClickDragZoom);
        this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);
        // Interaction toggles
        this.scrollZoom = scrollZoom;
        this.dragPan = dragPan;
        this.dragRotate = dragRotate;
        this.doubleClickZoom = doubleClickZoom;
        this.doubleClickDragZoom = doubleClickDragZoom;
        this.touchZoom = touchZoom;
        this.touchRotate = multiTouchDrag === 'rotate';
        this.multiTouchDrag = multiTouchDrag;
        this.trackpadGesture = trackpadGesture;
        this.keyboard = keyboard;
        // Normalize view state if maxBounds is defined
        const constraintChanged = !oldProps ||
            oldProps.height !== props.height ||
            oldProps.width !== props.width ||
            oldProps.maxBounds !== props.maxBounds ||
            oldProps.maxBoundsPadding !== props.maxBoundsPadding;
        if (constraintChanged && props.maxBounds) {
            // Constraint inputs changed, try re-normalize the props
            const controllerState = new this.ControllerState({ ...props, makeViewport: this.makeViewport });
            const normalizedProps = controllerState.getViewportProps();
            const changed = Object.keys(normalizedProps).some(key => !deepEqual(normalizedProps[key], props[key], 1));
            if (changed) {
                // some props are updated after normalization
                this.updateViewport(controllerState);
            }
        }
    }
    updateTransition() {
        this.transitionManager.updateTransition();
    }
    toggleEvents(eventNames, enabled) {
        if (this.eventManager) {
            eventNames.forEach(eventName => {
                if (this._events[eventName] !== enabled) {
                    this._events[eventName] = enabled;
                    if (enabled) {
                        // eslint-disable-next-line @typescript-eslint/unbound-method
                        this.eventManager.on(eventName, this.handleEvent);
                    }
                    else {
                        // eslint-disable-next-line @typescript-eslint/unbound-method
                        this.eventManager.off(eventName, this.handleEvent);
                    }
                }
            });
        }
    }
    // Private Methods
    /* Callback util */
    // formats map state and invokes callback function
    updateViewport(newControllerState, extraProps = null, interactionState = {}) {
        const viewState = { ...newControllerState.getViewportProps(), ...extraProps };
        // TODO - to restore diffing, we need to include interactionState
        const changed = this.controllerState !== newControllerState;
        // const oldViewState = this.controllerState.getViewportProps();
        // const changed = Object.keys(viewState).some(key => oldViewState[key] !== viewState[key]);
        this.state = newControllerState.getState();
        this._setInteractionState(interactionState);
        if (changed) {
            const oldViewState = this.controllerState && this.controllerState.getViewportProps();
            if (this.onViewStateChange) {
                this.onViewStateChange({
                    viewState,
                    interactionState: this._interactionState,
                    oldViewState,
                    viewId: this.props.id
                });
            }
        }
    }
    _onTransition(params) {
        this.onViewStateChange({
            ...params,
            interactionState: this._interactionState,
            viewId: this.props.id
        });
    }
    _setInteractionState(newStates) {
        Object.assign(this._interactionState, newStates);
        this.onStateChange(this._interactionState);
    }
    /** Maps a semantic input lifecycle to the constraint policy seen by controller state. */
    _getConstraintContext(_action, phase) {
        if (!this.props.rubberBand) {
            return { mode: 'hard' };
        }
        return { mode: phase === 'update' ? 'elastic' : phase === 'end' ? 'rebound' : 'hard' };
    }
    /** Returns a rebound transition when hard resolution changed the displayed viewport props. */
    _getReboundTransition(constraintContext, nextControllerState) {
        if (constraintContext.mode !== 'rebound') {
            return null;
        }
        const nextViewportProps = nextControllerState.getViewportProps();
        // At interaction end controllerState is reconstructed without the preceding elastic context.
        // Compare the hard-resolved destination with the displayed props to detect visible overshoot.
        const shouldRebound = Object.keys(nextViewportProps).some(key => !deepEqual(this.props[key], nextViewportProps[key], 1));
        return shouldRebound
            ? {
                ...this._getTransitionProps(),
                transitionDuration: REBOUND_DURATION,
                transitionEasing: EASE_OUT_EXPONENTIAL
            }
            : null;
    }
    /* Event handlers */
    // Default handler for the `panstart` event.
    _onPanStart(event) {
        const pos = this.getCenter(event);
        if (!this.isPointInBounds(pos, event)) {
            return false;
        }
        let alternateMode = this.isFunctionKeyPressed(event) || event.rightButton || false;
        if (this.invertPan || this.dragMode === 'pan') {
            // invertPan is replaced by props.dragMode, keeping for backward compatibility
            alternateMode = !alternateMode;
        }
        const action = alternateMode ? 'pan' : 'rotate';
        const constraintContext = this._getConstraintContext(action, 'start');
        const newControllerState = alternateMode
            ? this.controllerState.panStart({ pos }, constraintContext)
            : this.controllerState.rotateStart({ pos }, constraintContext);
        this._panMove = alternateMode;
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, { isDragging: true });
        return true;
    }
    // Default handler for the `panmove` and `panend` event.
    _onPan(event) {
        if (!this.isDragging()) {
            return false;
        }
        return this._panMove ? this._onPanMove(event) : this._onPanRotate(event);
    }
    _onPanEnd(event) {
        if (!this.isDragging()) {
            return false;
        }
        return this._panMove ? this._onPanMoveEnd(event) : this._onPanRotateEnd(event);
    }
    // Default handler for panning to move.
    // Called by `_onPan` when panning without function key pressed.
    _onPanMove(event) {
        if (!this.dragPan) {
            return false;
        }
        const pos = this.getCenter(event);
        const newControllerState = this.controllerState.pan({ pos }, this._getConstraintContext('pan', 'update'));
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
            isDragging: true,
            isPanning: true
        });
        return true;
    }
    _onPanMoveEnd(event) {
        const { inertia } = this;
        if (this.dragPan && inertia && event.velocity) {
            const pos = this.getCenter(event);
            const endPos = [
                pos[0] + (event.velocityX * inertia) / 2,
                pos[1] + (event.velocityY * inertia) / 2
            ];
            const newControllerState = this.controllerState.pan({ pos: endPos }).panEnd();
            this.updateViewport(newControllerState, {
                ...this._getTransitionProps(),
                transitionDuration: inertia,
                transitionEasing: INERTIA_EASING
            }, {
                isDragging: false,
                isPanning: true
            });
        }
        else {
            const currentControllerState = this.controllerState;
            const constraintContext = this._getConstraintContext('pan', 'end');
            const newControllerState = currentControllerState.panEnd(constraintContext);
            const reboundTransition = this._getReboundTransition(constraintContext, newControllerState);
            this.updateViewport(newControllerState, reboundTransition, {
                isDragging: false,
                isPanning: Boolean(reboundTransition)
            });
        }
        return true;
    }
    // Default handler for panning to rotate.
    // Called by `_onPan` when panning with function key pressed.
    _onPanRotate(event) {
        if (!this.dragRotate) {
            return false;
        }
        const pos = this.getCenter(event);
        const newControllerState = this.controllerState.rotate({ pos }, this._getConstraintContext('rotate', 'update'));
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
            isDragging: true,
            isRotating: true
        });
        return true;
    }
    _onPanRotateEnd(event) {
        const { inertia } = this;
        if (this.dragRotate && inertia && event.velocity) {
            const pos = this.getCenter(event);
            const endPos = [
                pos[0] + (event.velocityX * inertia) / 2,
                pos[1] + (event.velocityY * inertia) / 2
            ];
            const newControllerState = this.controllerState.rotate({ pos: endPos }).rotateEnd();
            this.updateViewport(newControllerState, {
                ...this._getTransitionProps(),
                transitionDuration: inertia,
                transitionEasing: INERTIA_EASING
            }, {
                isDragging: false,
                isRotating: true
            });
        }
        else {
            const currentControllerState = this.controllerState;
            const constraintContext = this._getConstraintContext('rotate', 'end');
            const newControllerState = currentControllerState.rotateEnd(constraintContext);
            const reboundTransition = this._getReboundTransition(constraintContext, newControllerState);
            this.updateViewport(newControllerState, reboundTransition, {
                isDragging: false,
                isRotating: Boolean(reboundTransition)
            });
        }
        return true;
    }
    // Default handler for the `wheel` event.
    _onWheel(event) {
        if (!this.scrollZoom) {
            return false;
        }
        if (this.trackpadGesture && event.device !== 'mouse') {
            return false;
        }
        const pos = this.getCenter(event);
        if (!this.isPointInBounds(pos, event)) {
            return false;
        }
        event.srcEvent.preventDefault();
        const { speed = 0.01, smooth = false } = this.scrollZoom === true ? {} : this.scrollZoom;
        const { delta } = event;
        // Map wheel delta to relative scale
        let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)));
        if (delta < 0 && scale !== 0) {
            scale = 1 / scale;
        }
        const transitionProps = smooth
            ? { ...this._getTransitionProps({ around: pos }), transitionDuration: 250 }
            : NO_TRANSITION_PROPS;
        const newControllerState = this.controllerState.zoom({ pos, scale });
        this.updateViewport(newControllerState, transitionProps, {
            isZooming: true,
            isPanning: true
        });
        // When there's no transition (duration = 0), immediately reset interaction state
        // since _onTransitionEnd callback won't fire
        if (!smooth) {
            this._setInteractionState({ isZooming: false, isPanning: false });
        }
        return true;
    }
    _onMultiPanStart(event) {
        const { multiTouchDrag } = this;
        if (!multiTouchDrag || !this._isMultiPanEventAllowed(event, multiTouchDrag)) {
            return false;
        }
        const currentCenter = event.offsetCenter;
        if (!this.isPointInBounds(this.getCenter(event), event)) {
            return false;
        }
        const isTrackpad = event.pointerType === 'trackpad';
        const startCenter = {
            x: currentCenter.x - (isTrackpad ? 0 : event.deltaX),
            y: currentCenter.y - (isTrackpad ? 0 : event.deltaY)
        };
        const startEvent = { ...event, offsetCenter: startCenter };
        const pos = this.getCenter(startEvent);
        const newControllerState = multiTouchDrag === 'pan'
            ? this.controllerState.panStart({ pos }, this._getConstraintContext('pan', 'start'))
            : this.controllerState.rotateStart({ pos }, this._getConstraintContext('rotate', 'start'));
        this._multiPanMode = multiTouchDrag;
        this._multiPanStartCenter = startCenter;
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, { isDragging: true });
        return true;
    }
    _onMultiPan(event) {
        const { mode, event: panEvent } = this._getMultiPanEvent(event);
        if (!mode || !panEvent || !this.isDragging()) {
            return false;
        }
        return mode === 'pan' ? this._onPanMove(panEvent) : this._onPanRotate(panEvent);
    }
    _onMultiPanEnd(event) {
        const { mode, event: panEvent } = this._getMultiPanEvent(event);
        if (!mode || !panEvent || !this.isDragging()) {
            this._resetMultiPan();
            return false;
        }
        const handled = mode === 'pan' ? this._onPanMoveEnd(panEvent) : this._onPanRotateEnd(panEvent);
        this._resetMultiPan();
        return handled;
    }
    _isTrackpadGestureAllowed(event) {
        return event.pointerType !== 'trackpad' || this.trackpadGesture;
    }
    _isMultiPanEventAllowed(event, mode) {
        if (event.pointerType === 'trackpad') {
            return this.trackpadGesture && (mode === 'pan' ? this.dragPan : this.dragRotate);
        }
        return event.pointerType === 'touch' && (mode === 'pan' ? this.dragPan : this.dragRotate);
    }
    _getMultiPanEvent(event) {
        const mode = this._multiPanMode;
        const startCenter = this._multiPanStartCenter;
        if (!mode || !startCenter) {
            return { mode: null, event: null };
        }
        return {
            mode,
            event: {
                ...event,
                offsetCenter: {
                    x: startCenter.x + event.deltaX,
                    y: startCenter.y + event.deltaY
                }
            }
        };
    }
    _resetMultiPan() {
        this._multiPanMode = null;
        this._multiPanStartCenter = null;
    }
    // Default handler for the `pinchstart` event.
    _onPinchStart(event) {
        this._doubleClickDragAnchor = null;
        const pos = this.getCenter(event);
        if (!this.isPointInBounds(pos, event)) {
            return false;
        }
        const newControllerState = this.controllerState
            .zoomStart({ pos }, this._getConstraintContext('zoom', 'start'))
            .rotateStart({ pos }, this._getConstraintContext('rotate', 'start'));
        // hack - hammer's `rotation` field doesn't seem to produce the correct angle
        pinchEventWorkaround._startPinchRotation = event.rotation;
        pinchEventWorkaround._lastPinchEvent = event;
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, { isDragging: true });
        return true;
    }
    // Default handler for the `pinchmove` and `pinchend` events.
    _onPinch(event) {
        if (!this.touchZoom && !this.touchRotate) {
            return false;
        }
        if (!this.isDragging()) {
            return false;
        }
        let newControllerState = this.controllerState;
        if (this.touchZoom) {
            const { scale } = event;
            const pos = this.getCenter(event);
            newControllerState = newControllerState.zoom({ pos, scale }, this._getConstraintContext('zoom', 'update'));
        }
        if (this.touchRotate) {
            const { rotation } = event;
            newControllerState = newControllerState.rotate({ deltaAngleX: pinchEventWorkaround._startPinchRotation - rotation }, this._getConstraintContext('rotate', 'update'));
        }
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
            isDragging: true,
            isPanning: this.touchZoom,
            isZooming: this.touchZoom,
            isRotating: this.touchRotate
        });
        pinchEventWorkaround._lastPinchEvent = event;
        return true;
    }
    _onPinchEnd(event) {
        if (!this.isDragging()) {
            return false;
        }
        const { inertia } = this;
        const { _lastPinchEvent } = pinchEventWorkaround;
        if (this.touchZoom && inertia && _lastPinchEvent && event.scale !== _lastPinchEvent.scale) {
            const pos = this.getCenter(event);
            let newControllerState = this.controllerState.rotateEnd();
            const z = Math.log2(event.scale);
            const velocityZ = (z - Math.log2(_lastPinchEvent.scale)) / (event.deltaTime - _lastPinchEvent.deltaTime);
            const endScale = Math.pow(2, z + (velocityZ * inertia) / 2);
            newControllerState = newControllerState.zoom({ pos, scale: endScale }).zoomEnd();
            this.updateViewport(newControllerState, {
                ...this._getTransitionProps({ around: pos }),
                transitionDuration: inertia,
                transitionEasing: INERTIA_EASING
            }, {
                isDragging: false,
                isPanning: this.touchZoom,
                isZooming: this.touchZoom,
                isRotating: false
            });
            this.blockEvents(inertia);
        }
        else {
            const currentControllerState = this.controllerState;
            const zoomConstraintContext = this._getConstraintContext('zoom', 'end');
            const rotateConstraintContext = this._getConstraintContext('rotate', 'end');
            const newControllerState = currentControllerState
                .zoomEnd(zoomConstraintContext)
                .rotateEnd(rotateConstraintContext);
            const reboundTransition = this._getReboundTransition(this.touchZoom ? zoomConstraintContext : rotateConstraintContext, newControllerState);
            this.updateViewport(newControllerState, reboundTransition, {
                isDragging: false,
                isPanning: Boolean(reboundTransition) && this.touchZoom,
                isZooming: Boolean(reboundTransition) && this.touchZoom,
                isRotating: Boolean(reboundTransition) && this.touchRotate
            });
        }
        pinchEventWorkaround._startPinchRotation = null;
        pinchEventWorkaround._lastPinchEvent = null;
        return true;
    }
    // Default handler for the `dblclick` event.
    _onDoubleClick(event) {
        if (!this.doubleClickZoom) {
            return false;
        }
        if (Date.now() < this._suppressDoubleClickUntil) {
            return false;
        }
        const pos = this.getCenter(event);
        if (!this.isPointInBounds(pos, event)) {
            return false;
        }
        const isZoomOut = this.isFunctionKeyPressed(event);
        const newControllerState = this.controllerState.zoom({ pos, scale: isZoomOut ? 0.5 : 2 });
        this.updateViewport(newControllerState, this._getTransitionProps({ around: pos }), {
            isZooming: true,
            isPanning: true
        });
        this.blockEvents(100);
        return true;
    }
    _onDoubleClickDragStart(event) {
        if (!this.doubleClickDragZoom) {
            this._doubleClickDragAnchor = null;
            return false;
        }
        const pos = this.getCenter(event);
        if (!this.isPointInBounds(pos, event)) {
            this._doubleClickDragAnchor = null;
            return false;
        }
        this._doubleClickDragAnchor = pos;
        let newControllerState = this.controllerState.zoomStart({ pos }, this._getConstraintContext('zoom', 'start'));
        if (event.scale !== 1) {
            newControllerState = newControllerState.zoom({ pos, scale: event.scale }, this._getConstraintContext('zoom', 'update'));
        }
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
            isDragging: true,
            isPanning: true,
            isZooming: true
        });
        return true;
    }
    _onDoubleClickDrag(event) {
        const pos = this._doubleClickDragAnchor;
        if (!pos) {
            return false;
        }
        const newControllerState = this.controllerState.zoom({ pos, scale: event.scale }, this._getConstraintContext('zoom', 'update'));
        this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
            isDragging: true,
            isPanning: true,
            isZooming: true
        });
        return true;
    }
    _onDoubleClickDragEnd(_event) {
        const pos = this._doubleClickDragAnchor;
        if (!pos) {
            return false;
        }
        this._doubleClickDragAnchor = null;
        const currentControllerState = this.controllerState;
        const constraintContext = this._getConstraintContext('zoom', 'end');
        const newControllerState = currentControllerState.zoomEnd(constraintContext);
        const reboundTransition = this._getReboundTransition(constraintContext, newControllerState);
        this.updateViewport(newControllerState, reboundTransition, {
            isDragging: false,
            isPanning: Boolean(reboundTransition),
            isZooming: Boolean(reboundTransition)
        });
        this._suppressDoubleClickUntil = Date.now() + 100;
        this.blockEvents(100);
        return true;
    }
    // Default handler for the `keydown` event
    _onKeyDown(event) {
        if (!this.keyboard) {
            return false;
        }
        const funcKey = this.isFunctionKeyPressed(event);
        // @ts-ignore
        const { zoomSpeed, moveSpeed, rotateSpeedX, rotateSpeedY } = this.keyboard === true ? {} : this.keyboard;
        const { controllerState } = this;
        let newControllerState;
        const interactionState = {};
        switch (event.srcEvent.code) {
            case 'Minus':
                newControllerState = funcKey
                    ? controllerState.zoomOut(zoomSpeed).zoomOut(zoomSpeed)
                    : controllerState.zoomOut(zoomSpeed);
                interactionState.isZooming = true;
                break;
            case 'Equal':
                newControllerState = funcKey
                    ? controllerState.zoomIn(zoomSpeed).zoomIn(zoomSpeed)
                    : controllerState.zoomIn(zoomSpeed);
                interactionState.isZooming = true;
                break;
            case 'ArrowLeft':
                if (funcKey) {
                    newControllerState = controllerState.rotateLeft(rotateSpeedX);
                    interactionState.isRotating = true;
                }
                else {
                    newControllerState = controllerState.moveLeft(moveSpeed);
                    interactionState.isPanning = true;
                }
                break;
            case 'ArrowRight':
                if (funcKey) {
                    newControllerState = controllerState.rotateRight(rotateSpeedX);
                    interactionState.isRotating = true;
                }
                else {
                    newControllerState = controllerState.moveRight(moveSpeed);
                    interactionState.isPanning = true;
                }
                break;
            case 'ArrowUp':
                if (funcKey) {
                    newControllerState = controllerState.rotateUp(rotateSpeedY);
                    interactionState.isRotating = true;
                }
                else {
                    newControllerState = controllerState.moveUp(moveSpeed);
                    interactionState.isPanning = true;
                }
                break;
            case 'ArrowDown':
                if (funcKey) {
                    newControllerState = controllerState.rotateDown(rotateSpeedY);
                    interactionState.isRotating = true;
                }
                else {
                    newControllerState = controllerState.moveDown(moveSpeed);
                    interactionState.isPanning = true;
                }
                break;
            default:
                return false;
        }
        this.updateViewport(newControllerState, this._getTransitionProps(), interactionState);
        return true;
    }
    _getTransitionProps(opts) {
        const { transition } = this;
        if (!transition || !transition.transitionInterpolator) {
            return NO_TRANSITION_PROPS;
        }
        // Enables Transitions on double-click/tap and key-down events.
        return opts
            ? {
                ...transition,
                transitionInterpolator: new LinearInterpolator({
                    ...opts,
                    ...transition.transitionInterpolator.opts,
                    makeViewport: this.controllerState.makeViewport
                })
            }
            : transition;
    }
}
//# sourceMappingURL=controller.js.map