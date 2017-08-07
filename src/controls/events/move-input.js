const MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup'];
const EVENT_TYPE = 'pointermove';

/**
 * Hammer.js swallows 'move' events (for pointer/touch/mouse)
 * when the pointer is not down. This class sets up a handler
 * specifically for these events to work around this limitation.
 * Note that this could be extended to more intelligently handle
 * move events across input types, e.g. storing multiple simultaneous
 * pointer/touch events, calculating speed/direction, etc.
 */
export default class MoveInput {

  constructor(element, callback, options = {}) {
    this.element = element;
    this.callback = callback;
    this.pressed = false;

    const events = MOUSE_EVENTS.concat(options.events || []);
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
    case 'mousedown':
      if (event.button === 0) {
        // Left button is down
        this.pressed = true;
      }
      break;
    case 'mousemove':
      // Move events use `which` to track the button being pressed
      if (event.which !== 1) {
        // Left button is not down
        this.pressed = false;
      }
      if (!this.pressed) {
        // Drag events are emitted by hammer already
        // we just need to emit the move event on hover
        this.callback({
          type: EVENT_TYPE,
          srcEvent: event,
          isDown: this.pressed,
          pointerType: 'mouse',
          target: event.target
        });
      }
      break;
    case 'mouseup':
      this.pressed = false;
      break;
    default:
    }
  }
}
