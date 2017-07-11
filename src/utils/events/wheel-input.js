import {window} from '../globals';

const ua = typeof window.navigator !== 'undefined' ?
  window.navigator.userAgent.toLowerCase() : '';
const firefox = ua.indexOf('firefox') !== -1;

const WHEEL_EVENTS = [
  // Chrome, Safari
  'wheel',
  // IE
  'mousewheel',
  // legacy Firefox
  'DOMMouseScroll'
];
const EVENT_TYPE = 'wheel';

// Constants for normalizing input delta
const WHEEL_DELTA_MAGIC_SCALER = 4.000244140625;
const WHEEL_DELTA_PER_LINE = 40;
const TRACKPAD_MAX_DELTA = 4;
const TRACKPAD_MAX_DELTA_PER_TIME = 200;
// Slow down zoom if shift key is held for more precise zooming
const SHIFT_MULTIPLIER = 0.25;

export default class WheelInput {

  constructor(element, callback, options = {}) {
    this.element = element;
    this.callback = callback;

    const events = WHEEL_EVENTS.concat(options.events || []);
    this.options = Object.assign({enable: true}, options, {events});

    this.time = 0;
    this.wheelPosition = null;
    this.type = null;
    this.timeout = null;
    this.lastValue = 0;

    this.handleEvent = this.handleEvent.bind(this);
    this.options.events.forEach(event => element.addEventListener(event, this.handleEvent));
  }

  destroy() {
    this.options.events.forEach(event => this.element.removeEventListener(event, this.handleEvent));
  }

  set(options) {
    Object.assign(this.options, options);
  }

  /**
   * Enable this input (begin processing events)
   * if the specified event type is among those handled by this input.
   */
  toggleIfEventSupported(eventType, enabled) {
    if (eventType === EVENT_TYPE) {
      this.options.enable = enabled;
    }
  }

  /* eslint-disable complexity, max-statements */
  handleEvent(event) {
    if (!this.options.enable) {
      return;
    }
    event.preventDefault();

    let value = event.deltaY;
    if (window.WheelEvent) {
      // Firefox doubles the values on retina screens...
      if (firefox && event.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
        value /= window.devicePixelRatio;
      }
      if (event.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
        value *= WHEEL_DELTA_PER_LINE;
      }
    }

    let {
      type,
      timeout,
      lastValue,
      time
    } = this;

    const now = ((window && window.performance) || Date).now();
    const timeDelta = now - (time || 0);

    this.wheelPosition = {
      x: event.clientX,
      y: event.clientY
    };
    time = now;

    if (value !== 0 && value % WHEEL_DELTA_MAGIC_SCALER === 0) {
      // This one is definitely a mouse wheel event.
      type = 'wheel';
      // Normalize this value to match trackpad.
      value = Math.floor(value / WHEEL_DELTA_MAGIC_SCALER);
    } else if (value !== 0 && Math.abs(value) < TRACKPAD_MAX_DELTA) {
      // This one is definitely a trackpad event because it is so small.
      type = 'trackpad';
    } else if (timeDelta > 400) {
      // This is likely a new scroll action.
      type = null;
      lastValue = value;
      // Start a timeout in case this was a singular event,
      // and delay it by up to 40ms.
      timeout = window.setTimeout(function setTimeout() {
        this._onWheel(event, -lastValue, this.wheelPosition);
        type = 'wheel';
      }.bind(this), 40);
    } else if (!type) {
      // This is a repeating event, but we don't know the type of event just yet.
      // If the delta per time is small, we assume it's a fast trackpad;
      // otherwise we switch into wheel mode.
      type = Math.abs(timeDelta * value) < TRACKPAD_MAX_DELTA_PER_TIME ? 'trackpad' : 'wheel';

      // Make sure our delayed event isn't fired again, because we accumulate
      // the previous event (which was less than 40ms ago) into this event.
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
        value += lastValue;
      }
    }

    if (event.shiftKey && value) {
      value = value * SHIFT_MULTIPLIER;
    }

    // Only fire the callback if we actually know
    // what type of scrolling device the user uses.
    if (type) {
      this._onWheel(event, -value, this.wheelPosition);
    }
  }

  _onWheel(srcEvent, delta, position) {
    this.callback({
      type: EVENT_TYPE,
      center: position,
      delta,
      srcEvent,
      pointerType: 'mouse',
      target: srcEvent.target
    });
  }
}
