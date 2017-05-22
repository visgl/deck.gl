import {Manager} from 'hammerjs';

import {
  BASIC_EVENT_ALIASES,
  EVENT_RECOGNIZER_MAP,
  RECOGNIZERS,
  GESTURE_EVENT_ALIASES
} from './constants';
import WheelInput from './wheel-input';
import MoveInput from './move-input';

/**
 * Single API for subscribing to events about both
 * basic input events (e.g. 'mousemove', 'touchstart', 'wheel')
 * and gestural input (e.g. 'click', 'tap', 'panstart').
 * Delegates event registration and handling to Hammer.js.
 * @param {DOM Element} element         DOM element on which event handlers will be registered.
 * @param {Object} options              Options for instantiation
 * @param {Object} options.events       Map of {event name: handler} to register on init.
 * @param {Object} options.recognizers  Gesture recognizers from Hammer.js to register.
 *                                      Not yet implemented.
 */
export default class EventManager {
  constructor(element, options) {
    // TODO: support overriding default RECOGNIZERS by passing
    // recognizers / configs, keyed to event name.

    this._onBasicInput = this._onBasicInput.bind(this);
    this.manager = new Manager(element, {recognizers: RECOGNIZERS})
      .on('hammer.input', this._onBasicInput);

    this.aliasedEventHandlers = {};

    // Handle events not handled by Hammer.js:
    // - mouse wheel
    // - pointer/touch/mouse move
    this._onOtherEvent = this._onOtherEvent.bind(this);
    this.wheelInput = new WheelInput(element, this._onOtherEvent);
    this.moveInput = new MoveInput(element, this._onOtherEvent);

    // Register all passed events.
    const {events} = options;
    if (events) {
      this.on(events);
    }
  }

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
      // Special handling for gestural events.
      const recognizerEvent = EVENT_RECOGNIZER_MAP[event];
      if (recognizerEvent) {
        // Enable recognizer for this event.
        this.manager.get(recognizerEvent).set({enable: true});

        // Alias to a recognized gesture as necessary.
        const eventAlias = GESTURE_EVENT_ALIASES[event];
        if (eventAlias && !this.aliasedEventHandlers[event]) {
          const aliasedEventHandler = this._aliasEventHandler(event);
          this.manager.on(eventAlias, aliasedEventHandler);
          // TODO: multiple handlers for the same aliased event will override one another.
          // This should be an array of aliased handlers instead.
          this.aliasedEventHandlers[event] = aliasedEventHandler;
        }
      }

      // Register event handler.
      this.manager.on(event, handler);
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
        const eventAlias = GESTURE_EVENT_ALIASES[event];
        if (eventAlias && this.aliasedEventHandlers[event]) {
          this.manager.off(eventAlias, this.aliasedEventHandlers[event]);
          delete this.aliasedEventHandlers[event];
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
   * See constants.BASIC_EVENT_CLASSES basic event class definitions.
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

  /**
   * Handle events not supported by Hammer.js,
   * and pipe back out through same (Hammer) channel used by other events.
   */
  _onOtherEvent(event) {
    const {srcEvent: {type}} = event;
    this.manager.emit(type, event);
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
