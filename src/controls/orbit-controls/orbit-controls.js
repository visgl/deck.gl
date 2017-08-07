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

import OrbitState from './orbit-state';

// EVENT HANDLING PARAMETERS
const ZOOM_ACCEL = 0.01;

const EVENT_TYPES = {
  WHEEL: ['wheel'],
  PAN: ['panstart', 'panmove', 'panend'],
  PINCH: ['pinchstart', 'pinchmove', 'pinchend'],
  DOUBLE_TAP: ['doubletap']
};

export default class OrbitControls {
  /**
   * @classdesc
   * A class that handles events and updates mercator style viewport parameters
   */
  constructor() {
    this._state = {
      isDragging: false
    };
    this.handleEvent = this.handleEvent.bind(this);
  }

  /**
   * Callback for events
   * @param {hammer.Event} event
   */
  handleEvent(event) {
    this.orbitState = new OrbitState(Object.assign({}, this.orbitStateProps, this._state));

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
    return Boolean(srcEvent.metaKey || srcEvent.altKey ||
      srcEvent.ctrlKey || srcEvent.shiftKey);
  }

  setState(newState) {
    Object.assign(this._state, newState);
    if (this.onStateChange) {
      this.onStateChange(this._state);
    }
  }

  /* Callback util */
  // formats map state and invokes callback function
  updateViewport(newOrbitState, extraState = {}) {
    const oldViewport = this.orbitState.getViewportProps();
    const newViewport = newOrbitState.getViewportProps();

    if (this.onViewportChange &&
      Object.keys(newViewport).some(key => oldViewport[key] !== newViewport[key])) {
      // Viewport has changed
      this.onViewportChange(newViewport);
    }

    this.setState(Object.assign({}, newOrbitState.getInteractiveState(), extraState));
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
      touchZoomRotate = true
    } = options;
    this.onViewportChange = onViewportChange;
    this.onStateChange = onStateChange;
    this.orbitStateProps = options;
    if (this.eventManager !== eventManager) {
      // EventManager has changed
      this.eventManager = eventManager;
      this._events = {};
    }

    // Register/unregister events
    this.toggleEvents(EVENT_TYPES.WHEEL, scrollZoom);
    this.toggleEvents(EVENT_TYPES.PAN, dragPan || dragRotate);
    this.toggleEvents(EVENT_TYPES.PINCH, touchZoomRotate);
    this.toggleEvents(EVENT_TYPES.DOUBLE_TAP, doubleClickZoom);

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
    const newOrbitState = this.orbitState.panStart({pos}).rotateStart({pos});
    return this.updateViewport(newOrbitState, {isDragging: true});
  }

  // Default handler for the `panmove` event.
  _onPan(event) {
    return this.isFunctionKeyPressed(event) ? this._onPanMove(event) : this._onPanRotate(event);
  }

  // Default handler for the `panend` event.
  _onPanEnd(event) {
    const newOrbitState = this.orbitState.panEnd().rotateEnd();
    return this.updateViewport(newOrbitState, {isDragging: false});
  }

  // Default handler for panning to move.
  // Called by `_onPan` when panning without function key pressed.
  _onPanMove(event) {
    if (!this.dragPan) {
      return false;
    }
    const pos = this.getCenter(event);
    const newOrbitState = this.orbitState.pan({pos});
    return this.updateViewport(newOrbitState);
  }

  // Default handler for panning to rotate.
  // Called by `_onPan` when panning with function key pressed.
  _onPanRotate(event) {
    if (!this.dragRotate) {
      return false;
    }

    const {deltaX, deltaY} = event;
    const {width, height} = this.orbitState.getViewportProps();

    const deltaScaleX = deltaX / width;
    const deltaScaleY = deltaY / height;

    const newOrbitState = this.orbitState.rotate({deltaScaleX, deltaScaleY});
    return this.updateViewport(newOrbitState);
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

    const newOrbitState = this.orbitState.zoom({pos, scale});
    return this.updateViewport(newOrbitState);
  }

  // Default handler for the `pinchstart` event.
  _onPinchStart(event) {
    const pos = this.getCenter(event);
    const newOrbitState = this.orbitState.zoomStart({pos});
    return this.updateViewport(newOrbitState, {isDragging: true});
  }

  // Default handler for the `pinch` event.
  _onPinch(event) {
    if (!this.touchZoomRotate) {
      return false;
    }
    const pos = this.getCenter(event);
    const {scale} = event;
    const newOrbitState = this.orbitState.zoom({pos, scale});
    return this.updateViewport(newOrbitState);
  }

  // Default handler for the `pinchend` event.
  _onPinchEnd(event) {
    const newOrbitState = this.orbitState.zoomEnd();
    return this.updateViewport(newOrbitState, {isDragging: false});
  }

  // Default handler for the `doubletap` event.
  _onDoubleTap(event) {
    if (!this.doubleClickZoom) {
      return false;
    }
    const pos = this.getCenter(event);
    const isZoomOut = this.isFunctionKeyPressed(event);

    const newOrbitState = this.orbitState.zoom({pos, scale: isZoomOut ? 0.5 : 2});
    return this.updateViewport(newOrbitState);
  }
}
