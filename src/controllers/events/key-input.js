const KEY_EVENTS = ['keydown', 'keyup'];
const EVENT_TYPE = 'KeyboardEvent';

/**
 * Hammer.js swallows 'move' events (for pointer/touch/mouse)
 * when the pointer is not down. This class sets up a handler
 * specifically for these events to work around this limitation.
 * Note that this could be extended to more intelligently handle
 * move events across input types, e.g. storing multiple simultaneous
 * pointer/touch events, calculating speed/direction, etc.
 */
export default class KeyInput {

  constructor(element, callback, options = {}) {
    this.element = element;
    this.callback = callback;
    this.pressed = false;

    const events = KEY_EVENTS.concat(options.events || []);
    this.options = Object.assign({enable: true}, options, {events});

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
    if (EVENT_TYPE === eventType) {
      this.options.enable = enabled;
    }
  }

  handleEvent(event) {
    if (!this.options.enable) {
      return;
    }

    switch (event.type) {
    case 'keydown':
      this.pressed = true;
      break;
    case 'keyup':
      this.pressed = false;
      break;
    default:
    }
  }
}
