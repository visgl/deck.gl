import WheelInput from './wheel-input';
import MoveInput from './move-input';
import {isBrowser} from '../globals';

// Hammer.js directly references `document` and `window`,
// which means that importing it in environments without
// those objects throws errors. Therefore, instead of
// directly `import`ing 'hammerjs' and './constants'
// (which imports Hammer.js) we conditionally require it
// depending on support for those globals, and provide mocks
// for environments without `document`/`window`.
function ManagerMock(m) {
  const instance = {};
  const chainedNoop = () => instance;
  instance.get = () => null;
  instance.on = chainedNoop;
  instance.off = chainedNoop;
  instance.destroy = chainedNoop;
  instance.emit = chainedNoop;
  return instance;
}

const Manager = isBrowser ? require('hammerjs').Manager : ManagerMock;
const {
  BASIC_EVENT_ALIASES,
  EVENT_RECOGNIZER_MAP,
  RECOGNIZERS,
  GESTURE_EVENT_ALIASES
} = isBrowser ? require('./constants') : {
  BASIC_EVENT_ALIASES: {},
  EVENT_RECOGNIZER_MAP: {},
  GESTURE_EVENT_ALIASES: {}
};

/**
 * Single API for subscribing to events about both
 * basic input events (e.g. 'mousemove', 'touchstart', 'wheel')
 * and gestural input (e.g. 'click', 'tap', 'panstart').
 * Delegates event registration and handling to Hammer.js.
 * @param {DOM Element} element         DOM element on which event handlers will be registered.
 * @param {Object} options              Options for instantiation
 * @param {Object} options.events       Map of {event name: handler} to register on init.
 * @param {Object} options.recognizers  Gesture recognizers from Hammer.js to register,
 *                                      as an Array in Hammer.Recognizer format.
 *                                      (http://hammerjs.github.io/api/#hammermanager)
 */
export default class EventManager {
  constructor(element, options = {}) {
    this.element = element;
    this._onBasicInput = this._onBasicInput.bind(this);
    this.manager = new Manager(element, {recognizers: options.recognizers || RECOGNIZERS})
      .on('hammer.input', this._onBasicInput);

    this.eventHandlers = [];

    // Handle events not handled by Hammer.js:
    // - mouse wheel
    // - pointer/touch/mouse move
    this._onOtherEvent = this._onOtherEvent.bind(this);
    this.wheelInput = new WheelInput(element, this._onOtherEvent, {enable: false});
    this.moveInput = new MoveInput(element, this._onOtherEvent, {enable: false});

    // Register all passed events.
    const {events} = options;
    if (events) {
      this.on(events);
    }
  }

  /**
   * Tear down internal event management implementations.
   */
  destroy() {
    this.wheelInput.destroy();
    this.moveInput.destroy();
    this.manager.destroy();
  }

  /**
   * Register an event handler function to be called on `event`.
   * @param {string|Object} event   An event name (String) or map of event names to handlers.
   * @param {Function} [handler]    The function to be called on `event`.
   */
  on(event, handler) {
    if (typeof event === 'string') {
      this._addEventHandler(event, handler);
    } else {
      // If `event` is a map, call `on()` for each entry.
      for (const eventName in event) {
        this._addEventHandler(eventName, event[eventName]);
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
      this._removeEventHandler(event, handler);
    } else {
      // If `event` is a map, call `off()` for each entry.
      for (const eventName in event) {
        this._removeEventHandler(eventName, event[eventName]);
      }
    }
  }

  /*
   * Enable/disable recognizer for the given event
   */
  _toggleRecognizer(name, enabled) {
    const recognizer = this.manager.get(name);
    if (recognizer) {
      recognizer.set({enable: enabled});
    }
    this.wheelInput.toggleIfEventSupported(name, enabled);
    this.moveInput.toggleIfEventSupported(name, enabled);
  }

  /**
   * Process the event registration for a single event + handler.
   */
  _addEventHandler(event, handler) {
    const wrappedHandler = this._wrapEventHandler(event, handler);
    // Alias to a recognized gesture as necessary.
    const eventAlias = GESTURE_EVENT_ALIASES[event] || event;
    // Get recognizer for this event
    const recognizerName = EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
    // Enable recognizer for this event.
    this._toggleRecognizer(recognizerName, true);

    // Save wrapped handler
    this.eventHandlers.push({event, eventAlias, recognizerName, handler, wrappedHandler});

    this.manager.on(eventAlias, wrappedHandler);
  }

  /**
   * Process the event deregistration for a single event + handler.
   */
  _removeEventHandler(event, handler) {
    let eventHandlerRemoved = false;

    // Find saved handler if any.
    for (let i = this.eventHandlers.length; i--;) {
      const entry = this.eventHandlers[i];
      if (entry.event === event && entry.handler === handler) {
        // Deregister event handler.
        this.manager.off(entry.eventAlias, entry.wrappedHandler);
        // Delete saved handler
        this.eventHandlers.splice(i, 1);
        eventHandlerRemoved = true;
      }
    }

    if (eventHandlerRemoved) {
      // Alias to a recognized gesture as necessary.
      const eventAlias = GESTURE_EVENT_ALIASES[event] || event;
      // Get recognizer for this event
      const recognizerName = EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
      // Disable recognizer if no more handlers are attached to its events
      const isRecognizerUsed = this.eventHandlers.find(
        entry => entry.recognizerName === recognizerName
      );
      if (!isRecognizerUsed) {
        this._toggleRecognizer(recognizerName, false);
      }
    }
  }

  /**
   * Returns an event handler that aliases events and add props before passing
   * to the real handler.
   */
  _wrapEventHandler(type, handler) {
    return event => {
      const {element} = this;
      const {srcEvent} = event;

      const center = event.center || {
        x: srcEvent.clientX,
        y: srcEvent.clientY
      };

      // Calculate center relative to the root element
      // TODO/xiaoji - avoid using getBoundingClientRect for perf?
      const rect = element.getBoundingClientRect();
      const offsetCenter = {
        x: center.x - rect.left - element.clientLeft,
        y: center.y - rect.top - element.clientTop
      };

      handler(Object.assign({}, event, {
        type,
        center,
        offsetCenter,
        rootElement: element
      }));
    };
  }

  /**
   * Handle basic events using the 'hammer.input' Hammer.js API:
   * Before running Recognizers, Hammer emits a 'hammer.input' event
   * with the basic event info. This function emits all basic events
   * aliased to the "class" of event received.
   * See constants.BASIC_EVENT_CLASSES basic event class definitions.
   */
  _onBasicInput(event) {
    const {srcEvent} = event;
    const alias = BASIC_EVENT_ALIASES[srcEvent.type];
    if (alias) {
      // fire all events aliased to srcEvent.type
      const emitEvent = Object.assign({}, event, {isDown: true, type: alias});
      this.manager.emit(alias, emitEvent);
    }
  }

  /**
   * Handle events not supported by Hammer.js,
   * and pipe back out through same (Hammer) channel used by other events.
   */
  _onOtherEvent(event) {
    this.manager.emit(event.type, event);
  }

}
