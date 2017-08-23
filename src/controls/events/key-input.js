/* global window */
import {INPUT_EVENT_TYPES} from './constants';
import {isBrowser} from '../../utils/globals';

const {KEY_EVENTS} = INPUT_EVENT_TYPES;
const DOWN_EVENT_TYPE = 'keydown';
const UP_EVENT_TYPE = 'keyup';

export default class KeyInput {
  constructor(element, callback, options = {}) {
    this.element = element;
    this.callback = callback;

    this.options = Object.assign({enable: true}, options);
    this.enableDownEvent = this.options.enable;
    this.enableUpEvent = this.options.enable;

    this.events = KEY_EVENTS.concat(options.events || []);

    this.handleEvent = this.handleEvent.bind(this);

    // Use mock in test environment
    const parent = isBrowser ? window : element;
    this.events.forEach(event => parent.addEventListener(event, this.handleEvent));
  }

  destroy() {
    const parent = isBrowser ? window : this.element;
    this.events.forEach(event => parent.removeEventListener(event, this.handleEvent));
  }

  /**
   * Enable this input (begin processing events)
   * if the specified event type is among those handled by this input.
   */
  enableEventType(eventType, enabled) {
    if (eventType === DOWN_EVENT_TYPE) {
      this.enableDownEvent = enabled;
    }
    if (eventType === UP_EVENT_TYPE) {
      this.enableUpEvent = enabled;
    }
  }

  handleEvent(event) {
    if (this.enableDownEvent && event.type === 'keydown') {
      this.callback({
        type: DOWN_EVENT_TYPE,
        srcEvent: event,
        key: event.key,
        target: event.target
      });
    }

    if (this.enableUpEvent && event.type === 'keyup') {
      this.callback({
        type: UP_EVENT_TYPE,
        srcEvent: event,
        key: event.key,
        target: event.target
      });
    }
  }
}
