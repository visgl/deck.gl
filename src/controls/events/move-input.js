const MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];
const MOVE_EVENT_TYPE = 'pointermove';
const LEAVE_EVENT_TYPE = 'pointerleave';

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

    this.options = Object.assign({enable: true}, options);
    this.enableMoveEvent = this.options.enable;
    this.enableLeaveEvent = this.options.enable;

    this.events = MOUSE_EVENTS.concat(options.events || []);

    this.handleEvent = this.handleEvent.bind(this);
    this.events.forEach(event => element.addEventListener(event, this.handleEvent));
  }

  destroy() {
    this.events.forEach(event => this.element.removeEventListener(event, this.handleEvent));
  }

  /**
   * Enable this input (begin processing events)
   * if the specified event type is among those handled by this input.
   */
  enableEventType(eventType, enabled) {
    if (eventType === MOVE_EVENT_TYPE) {
      this.enableMoveEvent = enabled;
    }
    if (eventType === LEAVE_EVENT_TYPE) {
      this.enableLeaveEvent = enabled;
      console.log(this.enableLeaveEvent); // eslint-disable-line
    }
  }

  handleEvent(event) {
    if (this.enableLeaveEvent) {
      console.log(this.enableLeaveEvent, event); // eslint-disable-line
      if (event.type === 'mouseleave') {
        this.callback({
          type: LEAVE_EVENT_TYPE,
          srcEvent: event,
          pointerType: 'mouse',
          target: event.target
        });
      }
    }

    if (this.enableMoveEvent) {
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
            type: MOVE_EVENT_TYPE,
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
}
