import WheelInput from './wheel-input';
import MoveInput from './move-input';
import {isBrowser} from '../../controllers/globals';

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

    this.aliasedEventHandlerCounts = {};

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

  /**
   * Process the event registration for a single event + handler.
   */
  _addEventHandler(event, handler) {
    // Special handling for gestural events.
    const recognizerEvent = EVENT_RECOGNIZER_MAP[event];
    if (recognizerEvent) {
      // Enable recognizer for this event.
      const recognizer = this.manager.get(recognizerEvent);
      recognizer.set({enable: true});

      // Alias to a recognized gesture as necessary.
      const eventAlias = GESTURE_EVENT_ALIASES[event];
      if (eventAlias) {
        if (!this.aliasedEventHandlerCounts[event]) {
          // Alias the event type and register the alias with Hammer.
          const aliasedEventHandler = this._aliasEventHandler(event);
          this.manager.on(eventAlias, aliasedEventHandler);
          this.aliasedEventHandlerCounts[event] = 0;
        }
        // Keep track of the number of aliased event handlers.
        // (The original handler is added below.)
        this.aliasedEventHandlerCounts[event]++;
      }
    }

    this.wheelInput.enableIfEventSupported(event);
    this.moveInput.enableIfEventSupported(event);

    // Register event handler.
    this.manager.on(event, handler);
  }

  /**
   * Process the event deregistration for a single event + handler.
   */
  _removeEventHandler(event, handler) {
    // Clean up aliased gesture handler as necessary.
    const recognizerEvent = EVENT_RECOGNIZER_MAP[event];
    if (recognizerEvent) {
      const eventAlias = GESTURE_EVENT_ALIASES[event];
      if (eventAlias && this.aliasedEventHandlerCounts[event]) {
        if (--this.aliasedEventHandlerCounts[event] <= 0) {
          // If no aliased handlers remaining for this event,
          // remove the aliased handler from Hammer.
          // (The original handler is removed below.)
          this.manager.off(eventAlias);
          delete this.aliasedEventHandlerCounts[event];
        }
      }
    }

    // Deregister event handler.
    this.manager.off(event, handler);
  }

  /**
   * Handle basic events using the 'hammer.input' Hammer.js API:
   * Before running Recognizers, Hammer emits a 'hammer.input' event
   * with the basic event info. This function emits all basic events
   * aliased to the "class" of event received.
   * See constants.BASIC_EVENT_CLASSES basic event class definitions.
   */
  _onBasicInput(event) {
    // For calculating pointer position relative to the canvas
    event.rootElement = this.element;

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

  /**
   * Handle events not supported by Hammer.js,
   * and pipe back out through same (Hammer) channel used by other events.
   */
  _onOtherEvent(event) {
    // For calculating pointer position relative to the canvas
    event.rootElement = this.element;

    this.manager.emit(event.type, event);
  }

  /**
   * Alias one event name to another,
   * to support events supported by Hammer.js under a different name.
   * See constants.GESTURE_EVENT_ALIASES.
   */
  _aliasEventHandler(eventAlias) {
    return event => this.manager.emit(eventAlias, event);
  }
}
