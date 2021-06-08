// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable max-statements, complexity */
import TransitionManager, {TRANSITION_EVENTS} from './transition-manager';
import LinearInterpolator from '../transitions/linear-interpolator';

const NO_TRANSITION_PROPS = {
  transitionDuration: 0
};

const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: t => t,
  transitionInterruption: TRANSITION_EVENTS.BREAK
};

const DEFAULT_INERTIA = 300;
const INERTIA_EASING = t => 1 - (1 - t) * (1 - t);

const EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  TRIPLE_PAN: ['tripanstart', 'tripanmove', 'tripanend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown']
};

export default class Controller {
  constructor(ControllerState, options = {}) {
    this.ControllerState = ControllerState;
    this.controllerState = null;
    this.controllerStateProps = null;
    this.eventManager = null;
    this.transitionManager = new TransitionManager(ControllerState, {
      ...options,
      onViewStateChange: this._onTransition.bind(this),
      onStateChange: this._setInteractionState.bind(this)
    });

    const linearTransitionProps = this.linearTransitionProps;
    this._transition = linearTransitionProps && {
      ...LINEAR_TRANSITION_PROPS,
      transitionInterpolator: new LinearInterpolator({
        transitionProps: linearTransitionProps
      })
    };

    this._events = null;
    this._interactionState = {
      isDragging: false
    };
    this._customEvents = [];
    this.onViewStateChange = null;
    this.onStateChange = null;

    this.handleEvent = this.handleEvent.bind(this);

    this.setProps(options);
  }

  get linearTransitionProps() {
    return null;
  }

  set events(customEvents) {
    this.toggleEvents(this._customEvents, false);
    this.toggleEvents(customEvents, true);
    this._customEvents = customEvents;
    // Make sure default events are not overwritten
    this.setProps(this.controllerStateProps);
  }

  finalize() {
    for (const eventName in this._events) {
      if (this._events[eventName]) {
        this.eventManager.off(eventName, this.handleEvent);
      }
    }
    this.transitionManager.finalize();
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */
  handleEvent(event) {
    const {ControllerState} = this;
    this.controllerState = new ControllerState({
      makeViewport: this.makeViewport,
      ...this.controllerStateProps,
      ...this._state
    });
    const eventStartBlocked = this._eventStartBlocked;

    switch (event.type) {
      case 'panstart':
        return eventStartBlocked ? false : this._onPanStart(event);
      case 'panmove':
        return this._onPan(event);
      case 'panend':
        return this._onPanEnd(event);
      case 'pinchstart':
        return eventStartBlocked ? false : this._onPinchStart(event);
      case 'pinchmove':
        return this._onPinch(event);
      case 'pinchend':
        return this._onPinchEnd(event);
      case 'tripanstart':
        return eventStartBlocked ? false : this._onTriplePanStart(event);
      case 'tripanmove':
        return this._onTriplePan(event);
      case 'tripanend':
        return this._onTriplePanEnd(event);
      case 'doubletap':
        return this._onDoubleTap(event);
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
  getCenter(event) {
    const {x, y} = this.controllerStateProps;
    const {offsetCenter} = event;
    return [offsetCenter.x - x, offsetCenter.y - y];
  }

  isPointInBounds(pos, event) {
    const {width, height} = this.controllerStateProps;
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
    const {srcEvent} = event;
    return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
  }

  isDragging() {
    return this._interactionState.isDragging;
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
    if ('onViewStateChange' in props) {
      this.onViewStateChange = props.onViewStateChange;
    }
    if ('onStateChange' in props) {
      this.onStateChange = props.onStateChange;
    }
    if ('makeViewport' in props) {
      this.makeViewport = props.makeViewport;
    }
    if ('dragMode' in props) {
      this.dragMode = props.dragMode;
    }
    this.controllerStateProps = props;

    if ('eventManager' in props && this.eventManager !== props.eventManager) {
      // EventManager has changed
      this.eventManager = props.eventManager;
      this._events = {};
      this.toggleEvents(this._customEvents, true);
    }

    if (!('transitionInterpolator' in props)) {
      // Add default transition interpolator
      props.transitionInterpolator = this._getTransitionProps().transitionInterpolator;
    }

    this.transitionManager.processViewStateChange(props);

    let {inertia} = props;
    if (inertia === true) {
      inertia = DEFAULT_INERTIA;
    }
    this.inertia = inertia;

    // TODO - make sure these are not reset on every setProps
    const {
      scrollZoom = true,
      dragPan = true,
      dragRotate = true,
      doubleClickZoom = true,
      touchZoom = true,
      touchRotate = false,
      keyboard = true
    } = props;

    // Register/unregister events
    const isInteractive = Boolean(this.onViewStateChange);
    this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
    this.toggleEvents(EVENT_TYPES.PAN, isInteractive && (dragPan || dragRotate));
    this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && (touchZoom || touchRotate));
    this.toggleEvents(EVENT_TYPES.TRIPLE_PAN, isInteractive && touchRotate);
    this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, isInteractive && doubleClickZoom);
    this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);

    // Interaction toggles
    this.scrollZoom = scrollZoom;
    this.dragPan = dragPan;
    this.dragRotate = dragRotate;
    this.doubleClickZoom = doubleClickZoom;
    this.touchZoom = touchZoom;
    this.touchRotate = touchRotate;
    this.keyboard = keyboard;
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
            this.eventManager.on(eventName, this.handleEvent);
          } else {
            this.eventManager.off(eventName, this.handleEvent);
          }
        }
      });
    }
  }

  // Private Methods

  /* Callback util */
  // formats map state and invokes callback function
  updateViewport(newControllerState, extraProps = {}, interactionState = {}) {
    const viewState = {...newControllerState.getViewportProps(), ...extraProps};

    // TODO - to restore diffing, we need to include interactionState
    const changed = this.controllerState !== newControllerState;
    // const oldViewState = this.controllerState.getViewportProps();
    // const changed = Object.keys(viewState).some(key => oldViewState[key] !== viewState[key]);

    this._state = newControllerState.getState();
    this._setInteractionState(interactionState);

    if (changed) {
      const oldViewState = this.controllerState ? this.controllerState.getViewportProps() : null;
      if (this.onViewStateChange) {
        this.onViewStateChange({viewState, interactionState: this._interactionState, oldViewState});
      }
    }
  }

  _onTransition(params) {
    if (this.onViewStateChange) {
      params.interactionState = this._interactionState;
      this.onViewStateChange(params);
    }
  }

  _setInteractionState(newStates) {
    Object.assign(this._interactionState, newStates);
    if (this.onStateChange) {
      this.onStateChange(this._interactionState);
    }
  }

  /* Event handlers */
  // Default handler for the `panstart` event.
  _onPanStart(event) {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    let alternateMode = this.isFunctionKeyPressed(event) || event.rightButton;
    if (this.invertPan || this.dragMode === 'pan') {
      // invertPan is replaced by props.dragMode, keeping for backward compatibility
      alternateMode = !alternateMode;
    }
    const newControllerState = this.controllerState[alternateMode ? 'panStart' : 'rotateStart']({
      pos
    });
    this._panMove = alternateMode;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
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
    const newControllerState = this.controllerState.pan({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isPanning: true
    });
    return true;
  }

  _onPanMoveEnd(event) {
    const {inertia} = this;
    if (this.dragPan && inertia && event.velocity) {
      const pos = this.getCenter(event);
      const endPos = [
        pos[0] + (event.velocityX * inertia) / 2,
        pos[1] + (event.velocityY * inertia) / 2
      ];
      const newControllerState = this.controllerState.pan({pos: endPos}).panEnd();
      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps(),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isPanning: true
        }
      );
    } else {
      const newControllerState = this.controllerState.panEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false
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
    const newControllerState = this.controllerState.rotate({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true
    });
    return true;
  }

  _onPanRotateEnd(event) {
    const {inertia} = this;
    if (this.dragRotate && inertia && event.velocity) {
      const pos = this.getCenter(event);
      const endPos = [
        pos[0] + (event.velocityX * inertia) / 2,
        pos[1] + (event.velocityY * inertia) / 2
      ];
      const newControllerState = this.controllerState.rotate({pos: endPos}).rotateEnd();
      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps(),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isRotating: true
        }
      );
    } else {
      const newControllerState = this.controllerState.rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false
      });
    }
    return true;
  }

  // Default handler for the `wheel` event.
  _onWheel(event) {
    if (!this.scrollZoom) {
      return false;
    }
    event.preventDefault();

    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }

    const {speed = 0.01, smooth = false} = this.scrollZoom;
    const {delta} = event;

    // Map wheel delta to relative scale
    let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)));
    if (delta < 0 && scale !== 0) {
      scale = 1 / scale;
    }

    const newControllerState = this.controllerState.zoom({pos, scale});
    this.updateViewport(
      newControllerState,
      {...this._getTransitionProps({around: pos}), transitionDuration: smooth ? 250 : 1},
      {
        isZooming: true,
        isPanning: true
      }
    );
    return true;
  }

  _onTriplePanStart(event) {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    const newControllerState = this.controllerState.rotateStart({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
    return true;
  }

  _onTriplePan(event) {
    if (!this.touchRotate) {
      return false;
    }
    if (!this.isDragging()) {
      return false;
    }

    const pos = this.getCenter(event);
    pos[0] -= event.deltaX;

    const newControllerState = this.controllerState.rotate({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true
    });
    return true;
  }

  _onTriplePanEnd(event) {
    if (!this.isDragging()) {
      return false;
    }
    const {inertia} = this;
    if (this.touchRotate && inertia && event.velocityY) {
      const pos = this.getCenter(event);
      const endPos = [pos[0], (pos[1] += (event.velocityY * inertia) / 2)];
      const newControllerState = this.controllerState.rotate({pos: endPos});
      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps(),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isRotating: true
        }
      );
      this.blockEvents(inertia);
    } else {
      const newControllerState = this.controllerState.rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isRotating: false
      });
    }
    return true;
  }

  // Default handler for the `pinchstart` event.
  _onPinchStart(event) {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }

    const newControllerState = this.controllerState.zoomStart({pos}).rotateStart({pos});
    // hack - hammer's `rotation` field doesn't seem to produce the correct angle
    this._startPinchRotation = event.rotation;
    this._lastPinchEvent = event;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
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
      const {scale} = event;
      const pos = this.getCenter(event);
      newControllerState = newControllerState.zoom({pos, scale});
    }
    if (this.touchRotate) {
      const {rotation} = event;
      newControllerState = newControllerState.rotate({
        deltaAngleX: this._startPinchRotation - rotation
      });
    }

    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isPanning: this.touchZoom,
      isZooming: this.touchZoom,
      isRotating: this.touchRotate
    });
    this._lastPinchEvent = event;
    return true;
  }

  _onPinchEnd(event) {
    if (!this.isDragging()) {
      return false;
    }
    const {inertia, _lastPinchEvent} = this;
    if (this.touchZoom && inertia && _lastPinchEvent && event.scale !== _lastPinchEvent.scale) {
      const pos = this.getCenter(event);
      let newControllerState = this.controllerState.rotateEnd();
      const z = Math.log2(event.scale);
      const velocityZ =
        (z - Math.log2(_lastPinchEvent.scale)) / (event.deltaTime - _lastPinchEvent.deltaTime);
      const endScale = Math.pow(2, z + (velocityZ * inertia) / 2);
      newControllerState = newControllerState.zoom({pos, scale: endScale}).zoomEnd();

      this.updateViewport(
        newControllerState,
        {
          ...this._getTransitionProps({around: pos}),
          transitionDuration: inertia,
          transitionEasing: INERTIA_EASING
        },
        {
          isDragging: false,
          isPanning: this.touchZoom,
          isZooming: this.touchZoom,
          isRotating: false
        }
      );
      this.blockEvents(inertia);
    } else {
      const newControllerState = this.controllerState.zoomEnd().rotateEnd();
      this.updateViewport(newControllerState, null, {
        isDragging: false,
        isPanning: false,
        isZooming: false,
        isRotating: false
      });
    }
    this._startPinchRotation = null;
    this._lastPinchEvent = null;
    return true;
  }

  // Default handler for the `doubletap` event.
  _onDoubleTap(event) {
    if (!this.doubleClickZoom) {
      return false;
    }
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }

    const isZoomOut = this.isFunctionKeyPressed(event);

    const newControllerState = this.controllerState.zoom({pos, scale: isZoomOut ? 0.5 : 2});
    this.updateViewport(newControllerState, this._getTransitionProps({around: pos}), {
      isZooming: true,
      isPanning: true
    });
    this.blockEvents(100);
    return true;
  }

  // Default handler for the `keydown` event
  _onKeyDown(event) {
    if (!this.keyboard) {
      return false;
    }
    const funcKey = this.isFunctionKeyPressed(event);
    const {zoomSpeed, moveSpeed, rotateSpeedX, rotateSpeedY} = this.keyboard;
    const {controllerState} = this;
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
        } else {
          newControllerState = controllerState.moveLeft(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case 'ArrowRight':
        if (funcKey) {
          newControllerState = controllerState.rotateRight(rotateSpeedX);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveRight(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case 'ArrowUp':
        if (funcKey) {
          newControllerState = controllerState.rotateUp(rotateSpeedY);
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveUp(moveSpeed);
          interactionState.isPanning = true;
        }
        break;
      case 'ArrowDown':
        if (funcKey) {
          newControllerState = controllerState.rotateDown(rotateSpeedY);
          interactionState.isRotating = true;
        } else {
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
    const {_transition} = this;

    if (!_transition) {
      return NO_TRANSITION_PROPS;
    }

    // Enables Transitions on double-tap and key-down events.
    return opts
      ? {
          ..._transition,
          transitionInterpolator: new LinearInterpolator({
            ...opts,
            transitionProps: this.linearTransitionProps,
            makeViewport: this.controllerState.makeViewport
          })
        }
      : _transition;
  }
}
