import {createGestureManager, EVENT_RECOGNIZER_MAP} from './gesture-manager';

const EVENT_HANDLER_MAP = {
  pointerdown: 'mousedown',
  pointermove: 'mousemove',
  pointerup: 'mouseup',
  mousedown: 'mousedown',
  mousemove: 'mousemove',
  mouseup: 'mouseup'
};
const GESTURE_ALIASES = {
  click: 'tap'
};

const DEFAULT_OPTIONS = {
  handleRawEventsWithGestureManager: true
};

/**
 * Single API for subscribing to events about both "raw" input (e.g. 'mousemove', 'click')
 * and gestural input (e.g. 'panstart', 'tap').
 */
class EventManager {
  constructor(element, options) {
    this.element = element;
    this.handlers = {};
    this.gestureManager = createGestureManager(element, options);

    // If specified, use GestureManager for raw event handling
    // as well as for gesture recognition.
    if (options.handleRawEventsWithGestureManager) {
      this._onRawInput = this._onRawInput.bind(this);
      this.gestureManager.startHandlingRawEvents(this._onRawInput);
    }
  }

  on(event, handler) {
    if (typeof event === 'string') {
      // wrap and store handler
      if (!this.handlers[event]) {
        this.handlers[event] = [];
      }
      const handlersForEvent = this.handlers[event];
      let handlerForEvent = handlersForEvent.find(h => h.handler === handler);
      if (!handlerForEvent) {
        handlerForEvent = {
          handler,
          wrapper: e => handler(this._wrapEvent(e, 'srcEvent'))
        };
        handlersForEvent.push(handlerForEvent);
      }

      // Handle as a gestural event if appropriate
      const aliasedEvent = GESTURE_ALIASES[event] || event;
      if (EVENT_RECOGNIZER_MAP[aliasedEvent]) {
        this.gestureManager.on(aliasedEvent, handlerForEvent.wrapper);
      }
    } else {
      for (const eventName in event) {
        this.on(eventName, event[eventName]);
      }
    }
  }

  off(event, handler) {
    if (typeof event === 'string') {
      // find wrapped handler
      const handlersForEvent = this.handlers[event];
      if (handlersForEvent) {
        const i = handlersForEvent.findIndex(h => h.handler === handler);
        let wrapper;
        if (i !== -1) {
          wrapper = handlersForEvent.splice(i, 1)[0].wrapper;
        }
        if (!handlersForEvent.length) {
          delete this.handlers[event];
        }

        // Handle as a gestural event if appropriate
        const aliasedEvent = GESTURE_ALIASES[event] || event;
        if (wrapper && EVENT_RECOGNIZER_MAP[aliasedEvent]) {
          this.gestureManager.off(aliasedEvent, wrapper);
        }
      }
    } else {
      for (const eventName in event) {
        this.off(eventName, event[eventName]);
      }
    }
  }

  _onRawInput(event) {
    if (EVENT_RECOGNIZER_MAP[event.type]) {
      // let GestureManager handle these events
      return;
    }

    const {srcEvent} = event;
    const normalizedEventType = srcEvent && EVENT_HANDLER_MAP[srcEvent.type];
    if (!normalizedEventType) {
      // not a recognized event type
      return;
    }

    const handlersForEvent = this.handlers[normalizedEventType];
    if (handlersForEvent) {
      handlersForEvent.forEach(handler => handler.wrapper(event));
    }
  }

  _wrapEvent(event, srcEventPropName) {
    // TODO: decide on how best to wrap for cross-browser compatibility
    // possible options:
    // - luma.gl's `EventsProxy.eventInfo()` wrapper
    //    (https://github.com/uber/luma.gl/blob/master/src/addons/event.js#L171)
    // - npm `synthetic-dom-event`
    //    (https://www.npmjs.com/package/synthetic-dom-events))
    // - hammer.js `compute-input-data` wrapper + additional info
    //    (https://github.com/hammerjs/hammer.js/blob/master/src/inputjs/compute-input-data.js)

    // TODO: consider refactoring deck.gl to look for `srcEvent` instead of `event`
    // for original/source event object;
    // `event.srcEvent` is more descriptive than `event.event`

    return {
      event: event[srcEventPropName]
    };
  }
}

export function createEventManager(element, options = {}) {
  // TODO: should this be a Singleton?
  // conversely, is actually a good reason to use the Factory pattern here,
  // or should we allow direct instantiation?
  options = Object.assign({}, DEFAULT_OPTIONS, options);
  return new EventManager(element, options);
}
