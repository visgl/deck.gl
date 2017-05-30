const MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup'];
const MOVE_EVENT_TYPES = ['mousemove', 'pointermove'];

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

    this.handleEvent = this.handleEvent.bind(this);
    this.events.forEach(event => element.addEventListener(event, this.handleEvent));
  }

  destroy() {
    this.events.forEach(event => this.element.removeEventListener(event, this.handleEvent));
  }

  handleEvent(event) {
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
        MOVE_EVENT_TYPES.forEach(type => this.callback({
          type,
          srcEvent: event,
          target: this.element
        }));
      }
      break;
    case 'mouseup':
      this.pressed = false;
      break;
    default:
    }
  }
}

MoveInput.isSourceOf = eventName => MOVE_EVENT_TYPES.indexOf(eventName) >= 0;
