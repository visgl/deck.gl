import {
  Manager,
  Tap,
  Press,
  Pinch,
  Rotate,
  Pan,
  Swipe
} from 'hammerjs';
import WheelInput from './wheel-input';
import log from '../lib/utils/log';

export const EVENT_RECOGNIZER_MAP = {
  tap: 'tap',
  doubletap: 'tap',
  press: 'press',
  pinch: 'pinch',
  pinchin: 'pinch',
  pinchout: 'pinch',
  pinchstart: 'pinch',
  pinchmove: 'pinch',
  pinchend: 'pinch',
  pinchcancel: 'pinch',
  rotate: 'rotate',
  rotatestart: 'rotate',
  rotatemove: 'rotate',
  rotateend: 'rotate',
  rotatecancel: 'rotate',
  pan: 'pan',
  panstart: 'pan',
  panmove: 'pan',
  panup: 'pan',
  pandown: 'pan',
  panleft: 'pan',
  panright: 'pan',
  panend: 'pan',
  pancancel: 'pan',
  swipe: 'swipe',
  swipeleft: 'swipe',
  swiperight: 'swipe',
  swipeup: 'swipe',
  swipedown: 'swipe'
};

const RECOGNIZERS = {
  doubletap: new Tap({
    event: 'doubletap',
    taps: 2
  }),
  pan: new Pan({
    threshold: 10
  }),
  pinch: new Pinch(),
  press: new Press(),
  rotate: new Rotate(),
  swipe: new Swipe(),
  tap: new Tap()
};

class GestureManager {

  constructor(element, options) {
    // TODO: support overriding default RECOGNIZERS by passing
    // recognizers / configs, keyed to event name.

    // how to get inputClass from createInputInstance without a Manager instance?
    // mostly just need to run logic from createInputInstance...
    // Issue filed: https://github.com/hammerjs/hammer.js/issues/1106
    const inputClass = WheelInput;

    this.manager = new Manager(element, {
      inputClass
    });
  }

  on(event, handler) {
    const recognizerEvent = this._getRecognizerEvent(event);
    if (!recognizerEvent) {
      return;
    }

    // add recognizer for this event if not already added.
    if (!this.manager.get(recognizerEvent)) {
      this.manager.add(RECOGNIZERS[recognizerEvent]);
    }

    // TODO: verify event+handler not already registered.
    // https://github.com/hammerjs/hammer.js/issues/1107
    this.manager.on(event, handler);
  }

  off(event, handler) {
    const recognizerEvent = this._getRecognizerEvent(event);
    if (!recognizerEvent) {
      return;
    }

    this.manager.off(event, handler);
  }

  startHandlingRawEvents(handler) {
    this.manager.on('hammer.input', handler);
  }

  stopHandlingRawEvents(handler) {
    this.manager.off('hammer.input', handler);
  }

  _getRecognizerEvent(event) {
    const recognizerEvent = EVENT_RECOGNIZER_MAP[event];
    if (!recognizerEvent) {
      log(1, 'no gesture recognizer available for event', event);
    }
    return recognizerEvent;
  }
}

export function createGestureManager(element, options = {}) {
  return new GestureManager(element, options);
}
