const MOVE_EVENTS = ['pointermove', 'touchmove', 'mousemove'];

/**
 * Hammer.js swallows 'move' events (for pointer/touch/mouse)
 * when the pointer is not down. This class sets up a handler
 * specifically for these events to work around this limitation.
 * Note that this could be extended to more intelligently handle
 * move events across input types, e.g. storing multiple simultaneous
 * pointer/touch events, calculating speed/direction, etc.
 */
export default class MoveInput {

  constructor(element, callback, events = MOVE_EVENTS) {
    this.element = element;
    this.callback = callback;
    this.events = events;

    this.handler = this.handler.bind(this);
    this.events.forEach(event => element.addEventListener(event, this.handler));
  }

  destroy() {
    this.events.forEach(event => this.element.removeEventListener(event, this.handler));
  }

  handler(event) {
    this.callback({
      srcEvent: event,
      target: this.element
    });
  }
}
