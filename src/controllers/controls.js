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

import assert from 'assert';

// EVENT HANDLING PARAMETERS
const ZOOM_ACCEL = 0.01;

const EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap'],
  KEYBOARD: ['keydown', 'keyup']
};

export default class Controls {
  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  constructor(StateClass, options = {}) {
    assert(StateClass);
    this.StateClass = StateClass;

    this._state = {
      isDragging: false
    };

    this.handleEvent = this.handleEvent.bind(this);

    this.setOptions(options);
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */
  handleEvent(event) {
    this.viewportState =
      new this.StateClass(Object.assign({}, this.viewportStateProps, this._state));

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

  /* Event utils */
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
    return this._state.isDragging;
  }

  setState(newState) {
    Object.assign(this._state, newState);
    if (this.onStateChange) {
      this.onStateChange(this._state);
    }
  }

  /* Callback util */
  // formats map state and invokes callback function
  updateViewport(newViewportState, extraState = {}) {
    const oldViewport = this.viewportState.getViewportProps();
    const newViewport = newViewportState.getViewportProps();

    if (this.onViewportChange &&
      Object.keys(newViewport).some(key => oldViewport[key] !== newViewport[key])) {
      // Viewport has changed
      this.onViewportChange(newViewport, this.viewportState.getViewport());
    }

    this.setState(Object.assign({}, newViewportState.getInteractiveState(), extraState));
  }

  /**
   * Extract interactivity options
   */
  setOptions(options) {
    const {
      onViewportChange,
      onStateChange = this.onStateChange,
      eventManager = this.eventManager,
      scrollZoom = true,
      dragPan = true,
      dragRotate = true,
      doubleClickZoom = true,
      touchZoomRotate = true,
      keyboard = true
    } = options;

    this.onViewportChange = onViewportChange;
    this.onStateChange = onStateChange;
    this.viewportStateProps = options;

    if (this.eventManager !== eventManager) {
      // EventManager has changed
      this.eventManager = eventManager;
      this._events = {};
    }

    // Register/unregister events
    const isInteractive = Boolean(this.onViewportChange);
    this.toggleEvents(EVENT_TYPES.WHEEL, isInteractive && scrollZoom);
    this.toggleEvents(EVENT_TYPES.PAN, isInteractive && (dragPan || dragRotate));
    this.toggleEvents(EVENT_TYPES.PINCH, isInteractive && touchZoomRotate);
    this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, isInteractive && doubleClickZoom);
    this.toggleEvents(EVENT_TYPES.KEYBOARD, isInteractive && keyboard);

    this.scrollZoom = scrollZoom;
    this.dragPan = dragPan;
    this.dragRotate = dragRotate;
    this.doubleClickZoom = doubleClickZoom;
    this.touchZoomRotate = touchZoomRotate;
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

  /* Event handlers */
  // Default handler for the `panstart` event.
  _onPanStart(event) {
    const pos = this.getCenter(event);
    const newViewportState = this.viewportState.panStart({pos}).rotateStart({pos});
    return this.updateViewport(newViewportState, {isDragging: true});
  }

  // Default handler for the `panmove` event.
  _onPan(event) {
    return this.isFunctionKeyPressed(event) ? this._onPanMove(event) : this._onPanRotate(event);
  }

  // Default handler for the `panend` event.
  _onPanEnd(event) {
    const newViewportState = this.viewportState.panEnd().rotateEnd();
    return this.updateViewport(newViewportState, {isDragging: false});
  }

  // Default handler for panning to move.
  // Called by `_onPan` when panning without function key pressed.
  _onPanMove(event) {
    if (!this.dragPan) {
      return false;
    }
    const pos = this.getCenter(event);
    const newViewportState = this.viewportState.pan({pos});
    return this.updateViewport(newViewportState);
  }

  // Default handler for panning to rotate.
  // Called by `_onPan` when panning with function key pressed.
  _onPanRotate(event) {
    if (!this.dragRotate) {
      return false;
    }

    const {deltaX, deltaY} = event;
    const {width, height} = this.viewportState.getViewportProps();

    const deltaScaleX = deltaX / width;
    const deltaScaleY = deltaY / height;

    const newViewportState = this.viewportState.rotate({deltaScaleX, deltaScaleY});
    return this.updateViewport(newViewportState);
  }

  // Default handler for the `wheel` event.
  _onWheel(event) {
    if (!this.scrollZoom) {
      return false;
    }
    event.srcEvent.preventDefault();

    const pos = this.getCenter(event);
    const {delta} = event;

    // Map wheel delta to relative scale
    let scale = 2 / (1 + Math.exp(-Math.abs(delta * ZOOM_ACCEL)));
    if (delta < 0 && scale !== 0) {
      scale = 1 / scale;
    }

    const newViewportState = this.viewportState.zoom({pos, scale});
    return this.updateViewport(newViewportState);
  }

  // Default handler for the `pinchstart` event.
  _onPinchStart(event) {
    const pos = this.getCenter(event);
    const newViewportState = this.viewportState.zoomStart({pos});
    return this.updateViewport(newViewportState, {isDragging: true});
  }

  // Default handler for the `pinch` event.
  _onPinch(event) {
    if (!this.touchZoomRotate) {
      return false;
    }
    const pos = this.getCenter(event);
    const {scale} = event;
    const newViewportState = this.viewportState.zoom({pos, scale});
    return this.updateViewport(newViewportState);
  }

  // Default handler for the `pinchend` event.
  _onPinchEnd(event) {
    const newViewportState = this.viewportState.zoomEnd();
    return this.updateViewport(newViewportState, {isDragging: false});
  }

  // Default handler for the `doubletap` event.
  _onDoubleTap(event) {
    if (!this.doubleClickZoom) {
      return false;
    }
    const pos = this.getCenter(event);
    const isZoomOut = this.isFunctionKeyPressed(event);

    const newViewportState = this.viewportState.zoom({pos, scale: isZoomOut ? 0.5 : 2});
    return this.updateViewport(newViewportState);
  }

  _onKeyDown(event) {
    if (this.viewportState.isDragging) {
      return;
    }

    const KEY_BINDINGS = {
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

    // keyCode is deprecated from web standards
    // code is not supported by IE/Edge
    const key = event.key;
    const handler = KEY_BINDINGS[key];
    if (this.viewportState[handler]) {
      const newViewportState = this.viewportState[handler]();
      this.updateViewport(newViewportState);
    }
  }
  /* eslint-enable complexity */

  _onKeyUp(event) {
  }
}
