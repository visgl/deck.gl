import {
  Manager,
  Tap,
  Press,
  Pinch,
  Rotate,
  Pan,
  Swipe
} from 'hammerjs';
import PointerMoveEventInput from './pointer-move-event-input';
import WheelInput from './wheel-input';

/**
 * Only one set of basic input events will be fired by Hammer.js:
 * either pointer, touch, or mouse, depending on system support.
 * In order to enable an application to be agnostic of system support,
 * alias basic input events into "classes" of events: down, move, and up.
 * See `_onBasicInput()` for usage of these aliases.
 */
/* eslint-disable */
const BASIC_EVENT_CLASSES = {
  down: ['pointerdown', 'touchstart', 'mousedown'],
  move: ['pointermove', 'touchmove',  'mousemove'],
  up:   ['pointerup',   'touchend',   'mouseup']
};
/* eslint-enable */

const BASIC_EVENT_ALIASES = {
  pointerdown: BASIC_EVENT_CLASSES.down,
  pointermove: BASIC_EVENT_CLASSES.move,
  pointerup: BASIC_EVENT_CLASSES.up,
  touchstart: BASIC_EVENT_CLASSES.down,
  touchmove: BASIC_EVENT_CLASSES.move,
  touchend: BASIC_EVENT_CLASSES.up,
  mousedown: BASIC_EVENT_CLASSES.down,
  mousemove: BASIC_EVENT_CLASSES.move,
  mouseup: BASIC_EVENT_CLASSES.up
};

/**
 * "Gestural" events are those that have semantic meaning beyond the basic input event,
 * e.g. a click or tap is a sequence of `down` and `up` events with no `move` event in between.
 * Hammer.js handles these with its Recognizer system;
 * this block maps event names to the Recognizers required to detect the events.
 */
const EVENT_RECOGNIZER_MAP = {
  click: 'tap',
  tap: 'tap',
  doubletap: 'tap',
  press: 'press',
  pinch: 'pinch',
  pinchin: 'pinch',
  pinchout: 'pinch',
  pinchstart: 'pinch',
  pinchmove: 'pinch',
  pinchend: 'pinch',
  pinchcancel: 'pinch',
  rotate: 'rotate',
  rotatestart: 'rotate',
  rotatemove: 'rotate',
  rotateend: 'rotate',
  rotatecancel: 'rotate',
  pan: 'pan',
  panstart: 'pan',
  panmove: 'pan',
  panup: 'pan',
  pandown: 'pan',
  panleft: 'pan',
  panright: 'pan',
  panend: 'pan',
  pancancel: 'pan',
  swipe: 'swipe',
  swipeleft: 'swipe',
  swiperight: 'swipe',
  swipeup: 'swipe',
  swipedown: 'swipe'
};

const RECOGNIZERS = {
  doubletap: new Tap({
    event: 'doubletap',
    taps: 2
  }),
  pan: new Pan({
    threshold: 10
  }),
  pinch: new Pinch(),
  press: new Press(),
  rotate: new Rotate(),
  swipe: new Swipe(),
  tap: new Tap()
};

/**
 * Map gestural events typically provided by browsers
 * that are not reported in 'hammer.input' events
 * to corresponding Hammer.js gestures.
 */
const GESTURE_EVENT_ALIASES = {
  tap: 'click'
};

/**
 * Single API for subscribing to events about both
 * basic input events (e.g. 'mousemove', 'touchstart', 'wheel')
 * and gestural input (e.g. 'click', 'tap', 'panstart').
 * Delegates event registration and handling to Hammer.js.
 */
class EventManager {
  constructor(element, options) {
    // TODO: support overriding default RECOGNIZERS by passing
    // recognizers / configs, keyed to event name.

    // how to get inputClass from createInputInstance without a Manager instance?
    // mostly just need to run logic from createInputInstance...
    // Issue filed: https://github.com/hammerjs/hammer.js/issues/1106
    const inputClass = PointerMoveEventInput;

    this._onBasicInput = this._onBasicInput.bind(this);
    this.manager = new Manager(element, {
      inputClass
    })
    .on('hammer.input', this._onBasicInput);

    this.gestureAliases = {};

    // Handle mouse wheel events as well
    this._onWheelEvent = this._onWheelEvent.bind(this);
    this.wheelInput = new WheelInput(element, this._onWheelEvent);
  }

  /**
   * Register an event handler function to be called on `event`.
   * @param {string|Object} event   An event name (String) or map of event names to handlers
   * @param {Function} [handler]    The function to be called on `event`.
   */
  on(event, handler) {
    if (typeof event === 'string') {
      // Special handling for gestural events.
      const recognizerEvent = EVENT_RECOGNIZER_MAP[event];
      if (recognizerEvent) {
        // Add recognizer for this event if not already added.
        if (!this.manager.get(recognizerEvent)) {
          this.manager.add(RECOGNIZERS[recognizerEvent]);
        }

        // Alias to a recognized gesture as necessary.
        const gestureEventAlias = GESTURE_EVENT_ALIASES[recognizerEvent];
        if (gestureEventAlias) {
          this.gestureAliases[event] = this._wrapAliasedGestureHandler(gestureEventAlias, handler);
          this.manager.on(gestureEventAlias, this.gestureAliases[event]);
        }
      }

      // Register event handler.
      this.manager.on(recognizerEvent || event, handler);
    } else {
      // If `event` is a map, call `on()` for each entry.
      for (const eventName in event) {
        this.on(eventName, event[eventName]);
      }
    }
  }

  /**
   * Deregister a previously-registered event handler.
   * @param {string|Object} event   An event name (String) or map of event names to handlers
   * @param {Function} [handler]    The function to be called on `event`.
   */
  off(event, handler) {
    if (typeof event === 'string') {
      // Clean up aliased gesture handler as necessary.
      const recognizerEvent = EVENT_RECOGNIZER_MAP[event];
      if (recognizerEvent) {
        const gestureEventAlias = GESTURE_EVENT_ALIASES[recognizerEvent];
        if (gestureEventAlias) {
          this.manager.off(gestureEventAlias, this.gestureAliases[event]);
          delete this.gestureAliases[event];
        }
      }

      // Deregister event handler.
      this.manager.off(event, handler);
    } else {
      // If `event` is a map, call `off()` for each entry.
      for (const eventName in event) {
        this.off(eventName, event[eventName]);
      }
    }
  }

  /**
   * Handle basic events using the 'hammer.input' Hammer.js API:
   * Before running Recognizers, Hammer emits a 'hammer.input' event
   * with the basic event info. This function emits all basic events
   * aliased to the "class" of event received.
   * See BASIC_EVENT_CLASSES basic event class definitions.
   */
  _onBasicInput(event) {
    const {srcEvent} = event;
    const eventAliases = BASIC_EVENT_ALIASES[srcEvent.type];
    if (eventAliases) {
      // fire all events aliased to srcEvent.type
      eventAliases.forEach(alias => {
        const emitEvent = Object.assign({}, event, {type: alias});
        this.manager.emit(alias, emitEvent);
      });
    }
  }

  _onWheelEvent(event) {
    const {srcEvent: {type}} = event;
    this.manager.emit(type, event);
  }

  _wrapAliasedGestureHandler(eventAlias) {
    return event => this.manager.emit(eventAlias, event);
  }
}

export function createEventManager(element, options = {}) {
  // TODO: should this be a Singleton?
  // conversely, is there actually a good reason to use the Factory pattern here,
  // or should we just allow direct instantiation?
  return new EventManager(element, options);
}
