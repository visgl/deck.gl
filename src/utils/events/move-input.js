const MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup'];

/**
 * Hammer.js swallows 'move' events (for pointer/touch/mouse)
 * when the pointer is not down. This class sets up a handler
 * specifically for these events to work around this limitation.
 * Note that this could be extended to more intelligently handle
 * move events across input types, e.g. storing multiple simultaneous
 * pointer/touch events, calculating speed/direction, etc.
 */
export default class MoveInput {

  constructor(element, callback, events = MOUSE_EVENTS) {
    this.element = element;
    this.callback = callback;
    this.events = events;
    this.pressed = false;

    this.handler = this.handler.bind(this);
    this.events.forEach(event => element.addEventListener(event, this.handler));
  }

  destroy() {
    this.events.forEach(event => this.element.removeEventListener(event, this.handler));
  }

  handler(event) {
    switch (event.type) {
    case 'mousedown':
      if (event.button === 0) {
        this.pressed = true;
      }
      break;
    case 'mousemove':
      if (event.which !== 1) {
        this.pressed = false;
      }
      if (!this.pressed) {
        // Drag events are emitted by hammer already, we just need the hover event
        this.callback({
          srcEvent: event,
          target: this.element
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
