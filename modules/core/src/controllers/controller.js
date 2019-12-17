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

import TransitionManager from './transition-manager';
import log from '../utils/log';
import assert from '../utils/assert';

const NO_TRANSITION_PROPS = {
  transitionDuration: 0
};

// EVENT HANDLING PARAMETERS
const ZOOM_ACCEL = 0.01;

const EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown']
};

export default class Controller {
  constructor(ControllerState, options = {}) {
    assert(ControllerState);
    this.ControllerState = ControllerState;
    this.controllerState = null;
    this.controllerStateProps = null;
    this.eventManager = null;
    this.transitionManager = new TransitionManager(ControllerState, options);
    this._events = null;
    this._state = {
      isDragging: false
    };
    this._customEvents = [];
    this.onViewStateChange = null;
    this.onStateChange = null;
    this.invertPan = false;

    this.handleEvent = this.handleEvent.bind(this);

    this.setProps(options);
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
    this.controllerState = new ControllerState(
      Object.assign({}, this.controllerStateProps, this._state)
    );

    switch (event.type) {
      case 'panstart':
        return this._onPanStart(event);
      case 'panmove':
        return this._onPan(event);
      case 'panend':
        return this._onPanEnd(event);
      case 'pinchstart':
        return this._onPinchStart(event);
      case 'pinchmove':
        return this._onPinch(event);
      case 'pinchend':
        return this._onPinchEnd(event);
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
    return this._state.isDragging;
  }

  /**
   * Extract interactivity options
   */
  /* eslint-disable complexity, max-statements */
  setProps(props) {
    if ('onViewportChange' in props) {
      log.removed('onViewportChange')();
    }
    if ('onViewStateChange' in props) {
      this.onViewStateChange = props.onViewStateChange;
    }
    if ('onStateChange' in props) {
      this.onStateChange = props.onStateChange;
    }
    this.controllerStateProps = props;

    if ('eventManager' in props && this.eventManager !== props.eventManager) {
      // EventManager has changed
      this.eventManager = props.eventManager;
      this._events = {};
      this.toggleEvents(this._customEvents, true);
    }

    this.transitionManager.processViewStateChange(this.controllerStateProps);

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
  /* eslint-enable complexity, max-statements */

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
    const viewState = Object.assign({}, newControllerState.getViewportProps(), extraProps);

    // TODO - to restore diffing, we need to include interactionState
    const changed = this.controllerState !== newControllerState;
    // const oldViewState = this.controllerState.getViewportProps();
    // const changed = Object.keys(viewState).some(key => oldViewState[key] !== viewState[key]);

    if (changed) {
      const oldViewState = this.controllerState ? this.controllerState.getViewportProps() : null;
      if (this.onViewStateChange) {
        this.onViewStateChange({viewState, interactionState, oldViewState});
      }
    }

    Object.assign(this._state, newControllerState.getInteractiveState(), interactionState);

    if (this.onStateChange) {
      this.onStateChange(this._state);
    }
  }

  /* Event handlers */
  // Default handler for the `panstart` event.
  _onPanStart(event) {
    const pos = this.getCenter(event);
    if (!this.isPointInBounds(pos, event)) {
      return false;
    }
    const newControllerState = this.controllerState.panStart({pos}).rotateStart({pos});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
    return true;
  }

  // Default handler for the `panmove` event.
  _onPan(event) {
    if (!this.isDragging()) {
      return false;
    }
    let alternateMode = this.isFunctionKeyPressed(event) || event.rightButton;
    alternateMode = this.invertPan ? !alternateMode : alternateMode;
    return alternateMode ? this._onPanMove(event) : this._onPanRotate(event);
  }

  // Default handler for the `panend` event.
  _onPanEnd(event) {
    const newControllerState = this.controllerState.panEnd().rotateEnd();
    this.updateViewport(newControllerState, null, {
      isDragging: false,
      isPanning: false,
      isRotating: false
    });
    return true;
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

  // Default handler for panning to rotate.
  // Called by `_onPan` when panning with function key pressed.
  _onPanRotate(event) {
    if (!this.dragRotate) {
      return false;
    }

    const {deltaX, deltaY} = event;
    const {width, height} = this.controllerState.getViewportProps();

    const deltaScaleX = deltaX / width;
    const deltaScaleY = deltaY / height;

    const newControllerState = this.controllerState.rotate({deltaScaleX, deltaScaleY});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isRotating: true
    });
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

    const {delta} = event;

    // Map wheel delta to relative scale
    let scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
    if (delta < 0 && scale !== 0) {
      scale = 1 / scale;
    }

    const newControllerState = this.controllerState.zoom({pos, scale});
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isZooming: true,
      isPanning: true
    });
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
    this._state.startPinchRotation = event.rotation;
    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {isDragging: true});
    return true;
  }

  // Default handler for the `pinch` event.
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
      const {startPinchRotation} = this._state;
      newControllerState = newControllerState.rotate({
        deltaScaleX: -(rotation - startPinchRotation) / 180
      });
    }

    this.updateViewport(newControllerState, NO_TRANSITION_PROPS, {
      isDragging: true,
      isPanning: this.touchZoom,
      isZooming: this.touchZoom,
      isRotating: this.touchRotate
    });
    return true;
  }

  // Default handler for the `pinchend` event.
  _onPinchEnd(event) {
    const newControllerState = this.controllerState.zoomEnd().rotateEnd();
    this._state.startPinchRotation = 0;
    this.updateViewport(newControllerState, null, {
      isDragging: false,
      isPanning: false,
      isZooming: false,
      isRotating: false
    });
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
    this.updateViewport(newControllerState, this._getTransitionProps(), {
      isZooming: true,
      isPanning: true
    });
    return true;
  }

  /* eslint-disable complexity, max-statements */
  // Default handler for the `keydown` event
  _onKeyDown(event) {
    if (!this.keyboard) {
      return false;
    }
    const funcKey = this.isFunctionKeyPressed(event);
    const {controllerState} = this;
    let newControllerState;
    const interactionState = {};

    switch (event.srcEvent.keyCode) {
      case 189: // -
        newControllerState = funcKey
          ? controllerState.zoomOut().zoomOut()
          : controllerState.zoomOut();
        interactionState.isZooming = true;
        break;
      case 187: // +
        newControllerState = funcKey ? controllerState.zoomIn().zoomIn() : controllerState.zoomIn();
        interactionState.isZooming = true;
        break;
      case 37: // left
        if (funcKey) {
          newControllerState = controllerState.rotateLeft();
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveLeft();
          interactionState.isPanning = true;
        }
        break;
      case 39: // right
        if (funcKey) {
          newControllerState = controllerState.rotateRight();
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveRight();
          interactionState.isPanning = true;
        }
        break;
      case 38: // up
        if (funcKey) {
          newControllerState = controllerState.rotateUp();
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveUp();
          interactionState.isPanning = true;
        }
        break;
      case 40: // down
        if (funcKey) {
          newControllerState = controllerState.rotateDown();
          interactionState.isRotating = true;
        } else {
          newControllerState = controllerState.moveDown();
          interactionState.isPanning = true;
        }
        break;
      default:
        return false;
    }
    this.updateViewport(newControllerState, this._getTransitionProps(), interactionState);
    return true;
  }
  /* eslint-enable complexity */

  _getTransitionProps() {
    // Transitions on double-tap and key-down are only supported by MapController
    return NO_TRANSITION_PROPS;
  }
}
