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

import ViewState from '../lib/view-state';
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import LinearInterpolator from '../transitions/linear-interpolator';
import {TRANSITION_EVENTS} from '../lib/transition-manager';
import assert from 'assert';

const NO_TRANSITION_PROPS = {
  transitionDuration: 0
};
const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: t => t,
  transitionInterpolator: new LinearInterpolator(),
  transitionInterruption: TRANSITION_EVENTS.BREAK
};

// EVENT HANDLING PARAMETERS
const PITCH_MOUSE_THRESHOLD = 5;
const PITCH_ACCEL = 1.2;
const ZOOM_ACCEL = 0.01;

const EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown']
};

const noop = viewState => viewState;

const DEFAULT_EVENT_REDUCERS = {
  panStart: noop,
  pan: noop,
  panEnd: noop,
  rotateStart: noop,
  rotate: noop,
  rotateEnd: noop,
  zoomStart: noop,
  zoom: noop,
  zoomEnd: noop,
  zoomIn: noop,
  zoomOut: noop,
  moveLeft: noop,
  moveRight: noop,
  moveForward: noop,
  moveBackward: noop
};

const KEY_TO_REDUCER_BINDINGS = {
  w: 'moveForward',
  W: 'moveForward',
  ArrowUp: 'moveForward',

  s: 'moveBackward',
  S: 'moveBackward',
  ArrowDown: 'moveBackward',

  a: 'moveLeft',
  A: 'moveLeft',
  ArrowLeft: 'moveLeft',

  d: 'moveRight',
  D: 'moveRight',
  ArrowRight: 'moveRight',

  '=': 'zoomIn',
  '+': 'zoomIn',

  '-': 'zoomOut',

  '[': 'moveDown',
  ']': 'moveUp'
};

// A base class that handles events and updates view state parameters
export default class Controller {
  constructor(options = {}, {defaultReducers = {}, defaultConstraints = {}} = {}) {
    // assert(ViewportState);
    // this.ViewportState = ViewportState;
    // this.viewportState = null;
    // this.viewportStateProps = null;
    // this.eventManager = null;
    // this._events = null;
    // this._state = {
    //   isDragging: false
    // };
    // this.events = [];
    this.eventManager = null;
    this.events = null;
    this.viewState = null;

    this.eventReducers = Object.assign(
      {},
      DEFAULT_EVENT_REDUCERS,
      defaultReducers,
      options.reducers
    );
    this.constraints = defaultConstraints;
    this.limits = defaultConstraints;

    this.handleEvent = this.handleEvent.bind(this);

    this.state = {
      isDragging: false,
      isPanning: false,
      isRotating: false,
      isZooming: false
    };

    this.setOptions(options);
  }

  // Event utils

  getSize() {
    const width = this.width || 100;
    const height = this.height || 100;
    return {width, height};
  }

  // Event object: http://hammerjs.github.io/api/#event-object
  getCenter(event) {
    const {offsetCenter: {x, y}} = event;
    return [x, y];
  }

  isFunctionKeyPressed(event) {
    const {srcEvent} = event;
    return Boolean(srcEvent.metaKey || srcEvent.altKey || srcEvent.ctrlKey || srcEvent.shiftKey);
  }

  isDragging() {
    return this.state.isDragging;
  }

  unproject(pos) {
    const viewport = new WebMercatorViewport(this.viewState);
    return viewport.unproject(pos);
  }

  // Extract interactivity options
  setOptions(options) {
    const {
      width = this.width,
      height = this.height,
      viewState,
      onViewStateChange,
      onViewportChange,
      onStateChange = this.onStateChange,
      eventManager = this.eventManager,
      scrollZoom = true,
      dragPan = true,
      dragRotate = true,
      doubleClickZoom = true,
      touchZoom = true,
      touchRotate = false,
      keyboard = true
    } = options;

    this.width = width;
    this.height = height;

    this.viewState =
      viewState instanceof ViewState ? viewState : new ViewState(options.viewState || options);

    // Update callbacks
    if (onViewStateChange) {
      this.onViewStateChange = onViewStateChange;
    }
    this.onViewportChange = onViewportChange;
    this.onStateChange = onStateChange;

    // Update event manager and event settings
    if (this.eventManager !== eventManager) {
      // EventManager has changed
      this.eventManager = eventManager;
      this._events = {};
      // this.events = {};
      this.toggleEvents(this.events, true);
    }

    // Register/unregister events
    const isInteractive = Boolean(this.onViewportChange || this.onViewStateChange);
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

  toggleEvents(eventNames, enabled) {
    if (this.eventManager) {
      eventNames.forEach(eventName => {
        if (this.events[eventName] !== enabled) {
          this.events[eventName] = enabled;
          if (enabled) {
            this.eventManager.on(eventName, this.handleEvent);
          } else {
            this.eventManager.off(eventName, this.handleEvent);
          }
        }
      });
    }
  }

  // Callback for events
  handleEvent(event) {
    switch (event.type) {
      case 'panstart':
        return this._onPanStart(event);
      case 'panmove':
        return this._onPan(event);
      case 'panend':
        return this._onPanEnd(event);
      case 'pinchstart':
        return this._onPinchStart(event);
      case 'pinch':
        return this._onPinch(event);
      case 'pinchend':
        return this._onPinchEnd(event);
      case 'doubletap':
        return this._onDoubleTap(event);
      case 'wheel':
        return this._onWheel(event);
      case 'keydown':
        return this._onKeyDown(event);
      case 'keyup':
        return this._onKeyUp(event);
      default:
        return false;
    }
  }

  // Private Methods

  setState(newState) {
    Object.assign(this.state, newState);
    // Clean up state object
    for (const key in newState) {
      if (newState[key] === null) {
        delete this.state.key;
      }
    }
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  // Callback util

  // formats map state and invokes callback function
  updateViewport(newViewState, interactionState = {}) {
    this.setState(interactionState);
    if (newViewState !== this.viewState) {
      // this.onViewportChange && Object.keys(newViewport).some(key => oldViewport[key] !== newViewport[key])
      // log.log(`${newViewState}`, this.state, interactionState);

      if (this.onViewStateChange) {
        this.onViewStateChange(
          Object.assign(
            {
              viewState: newViewState,
              controller: this
            },
            interactionState
          )
        );
      }
      // Classic deck.gl callback
      if (this.onViewportChange) {
        // Viewport has changed
        // const viewport = this.viewportState.getViewport ? this.viewportState.getViewport() : null;
        // this.onViewportChange(newViewport, viewport);
        this.onViewportChange(this.getViewportProps(newViewState), interactionState);
      }
    } else {
      // log.log('no change');
    }
  }

  getViewportProps(viewState) {
    assert(false, 'getViewportProps is not implemented');
  }

  // Event handlers

  // Default handler for the `panstart` event.
  _onPanStart(event) {
    const pos = this.getCenter(event);
    const state = Object.assign({pos}, this.state);

    let newViewState;
    newViewState = this.eventReducers.panStart(this.viewState, state);
    newViewState = this.eventReducers.rotateStart(newViewState, state);
    return this.updateViewport(newViewState, NO_TRANSITION_PROPS, {
      isDragging: true,
      startViewState: this.viewState,
      startPos: pos,
      startPosition: pos
    });
  }

  // Default handler for the `panmove` event.
  _onPan(event) {
    return this.isFunctionKeyPressed(event) || event.rightButton
      ? this._onPanRotate(event)
      : this._onPanMove(event);
  }

  // Default handler for the `panend` event.
  _onPanEnd(event) {
    const state = Object.assign({}, this.state);

    let newViewState = this.viewState;
    newViewState = this.eventReducers.panEnd(newViewState, state);
    newViewState = this.eventReducers.rotateEnd(newViewState, state);
    return this.updateViewport(newViewState, null, {
      isDragging: false,
      isPanning: false,
      isRotating: false,
      startViewState: null,
      startPos: null,
      startPosition: null
    });
  }

  // Default handler for panning to move.
  // Called by `_onPan` when panning without function key pressed.
  _onPanMove(event) {
    if (!this.dragPan) {
      return false;
    }
    this.setState({isPanning: true});
    const pos = this.getCenter(event);
    const parameters = this._getReducerParameters({pos});

    const newViewState = this.eventReducers.pan(this.viewState, parameters);
    return this.updateViewport(newViewState, NO_TRANSITION_PROPS, {isDragging: true});
  }

  // Default handler for panning to rotate.
  // Called by `_onPan` when panning with function key pressed.
  _onPanRotate(event) {
    if (!this.dragRotate) {
      return false;
    }
    this.setState({isRotating: true});
    return this.mapMode ? this._onPanRotateMap(event) : this._onPanRotateStandard(event);
  }

  // Normal pan to rotate
  _onPanRotateStandard(event) {
    const {width, height} = this.getSize();
    const {deltaX, deltaY} = event;

    const deltaScaleX = deltaX / width;
    const deltaScaleY = deltaY / height;
    const parameters = this._getReducerParameters({deltaScaleX, deltaScaleY});

    const newViewState = this.eventReducers.rotate(this.viewState, parameters);
    return this.updateViewport(newViewState, NO_TRANSITION_PROPS, {isDragging: true});
  }

  _onPanRotateMap(event) {
    const {width, height} = this.getSize();
    const {deltaX, deltaY} = event;

    const [, centerY] = this.getCenter(event);
    const startY = centerY - deltaY;

    const deltaScaleX = deltaX / width;
    let deltaScaleY = 0;

    if (deltaY > 0) {
      if (Math.abs(height - startY) > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to -1 as we drag upwards
        deltaScaleY = deltaY / (startY - height) * PITCH_ACCEL;
      }
    } else if (deltaY < 0) {
      if (startY > PITCH_MOUSE_THRESHOLD) {
        // Move from 0 to 1 as we drag upwards
        deltaScaleY = 1 - centerY / startY;
      }
    }
    deltaScaleY = Math.min(1, Math.max(-1, deltaScaleY));

    const parameters = this._getReducerParameters({deltaScaleX, deltaScaleY});

    const newViewState = this.eventReducers.rotate(this.viewState, parameters);
    return this.updateViewport(newViewState, NO_TRANSITION_PROPS, {isDragging: true});
  }

  // Default handler for the `wheel` event.
  _onWheel(event) {
    if (!this.scrollZoom) {
      return false;
    }

    const pos = this.getCenter(event);
    const {delta} = event;

    // Map wheel delta to relative scale
    // TODO - could mjolnir handle this?
    let scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
    if (delta < 0 && scale !== 0) {
      scale = 1 / scale;
    }

    const parameters = this._getReducerParameters({pos, scale});

    const newViewState = this.eventReducers.zoom(this.viewState, parameters);
    return this.updateViewport(newViewState, NO_TRANSITION_PROPS);
  }

  // Default handler for the `pinchstart` event.
  _onPinchStart(event) {
    const pos = this.getCenter(event);

    // TODO - hack - hammer's `rotation` field doesn't seem to produce the correct angle
    this._state.startPinchRotation = event.rotation;

    const parameters = this._getReducerParameters({pos});

    const newViewState = this.eventReducers.zoomStart(this.viewState, parameters);
    return this.updateViewport(newViewState, NO_TRANSITION_PROPS, {
      isDragging: true,
      startViewState: this.viewState,
      startPos: pos
    });
  }

  // Default handler for the `pinch` event.
  _onPinch(event) {
    if (!this.touchZoom && !this.touchRotate) {
      return false;
    }

	/*
	// Unmerged
    let newViewportState = this.viewportState;
    if (this.touchZoom) {
      const {scale} = event;
      const pos = this.getCenter(event);
      newViewportState = newViewportState.zoom({pos, scale});
    }
    if (this.touchRotate) {
      const {rotation} = event;
      const {startPinchRotation} = this._state;
      newViewportState = newViewportState.rotate({
        deltaScaleX: -(rotation - startPinchRotation) / 180
      });
    }
	*/

    const pos = this.getCenter(event);
    const {scale} = event;
    const parameters = this._getReducerParameters({pos, scale});

    const newViewState = this.eventReducers.zoom(this.viewState, parameters);
    return this.updateViewport(newViewState, NO_TRANSITION_PROPS, {isDragging: true});
  }

  // Default handler for the `pinchend` event.
  _onPinchEnd(event) {
    this._state.startPinchRotation = 0;

    const newViewState = this.eventReducers.zoomEnd(this.viewState, {});
    return this.updateViewport(newViewState, null, {
      isDragging: false,
      startViewState: null,
      startPos: null
    });
  }

  // Default handler for the `doubletap` event.
  _onDoubleTap(event) {
    if (!this.doubleClickZoom) {
      return false;
    }
    const pos = this.getCenter(event);
    const isZoomOut = this.isFunctionKeyPressed(event);

    const newViewportState = this.viewportState.zoom({pos, scale: isZoomOut ? 0.5 : 2});

    const parameters = this._getReducerParameters({
      pos,
      startPos: pos,
      scale: isZoomOut ? 0.5 : 2,
      startViewState: this.viewState
    });
    const newViewState = this.eventReducers.zoom(this.viewState, parameters);
    return this.updateViewport(newViewState, LINEAR_TRANSITION_PROPS);
  }

  /* eslint-disable complexity */
  // Default handler for the `keydown` event
  _onKeyDown(event) {
    if (!this.keyboard) {
      return this.viewState;
    }
    if (this.viewState.isDragging) {
      return this.viewState;
    }

    const funcKey = this.isFunctionKeyPressed(event);
    const {viewportState} = this;
    let newViewState;

    switch (event.srcEvent.keyCode) {
      case 189: // -
        newViewState = funcKey ? viewportState.zoomOut().zoomOut() : viewportState.zoomOut();
        break;
      case 187: // +
        newViewState = funcKey ? viewportState.zoomIn().zoomIn() : viewportState.zoomIn();
        break;
      case 37: // left
        newViewState = funcKey ? viewportState.rotateLeft() : viewportState.moveLeft();
        break;
      case 39: // right
        newViewState = funcKey ? viewportState.rotateRight() : viewportState.moveRight();
        break;
      case 38: // up
        newViewState = funcKey ? viewportState.rotateUp() : viewportState.moveUp();
        break;
      case 40: // down
        newViewState = funcKey ? viewportState.rotateDown() : viewportState.moveDown();
        break;
      default:
        return this.viewState;
    }
    return this.updateViewport(newViewState, LINEAR_TRANSITION_PROPS);

    // TODO - Unmerged, REMOVE

    // // keyCode is deprecated from web standards: code is not supported by IE/Edge
    // const key = event.key;
    // const reducerName = KEY_TO_REDUCER_BINDINGS[key];
    // const eventReducer = this.eventReducers[reducerName];
    // if (eventReducer) {
    //   const parameters = this._getReducerParameters({});
    //   const newViewState = eventReducer(this.viewState, parameters);
    //   return this.updateViewport(newViewState);
    // }
  }
  /* eslint-enable complexity */

  _onKeyUp(event) {}

  _getReducerParameters(parameters) {
    const defaults = {
      controller: this,
      width: this.width,
      height: this.height
    };
    return Object.assign(defaults, this.state, parameters);
  }
}
