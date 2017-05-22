import {
  Tap,
  Press,
  Pinch,
  Rotate,
  Pan,
  Swipe
} from 'hammerjs';

/**
 * Only one set of basic input events will be fired by Hammer.js:
 * either pointer, touch, or mouse, depending on system support.
 * In order to enable an application to be agnostic of system support,
 * alias basic input events into "classes" of events: down, move, and up.
 * See `_onBasicInput()` for usage of these aliases.
 */
/* eslint-disable */
export const BASIC_EVENT_CLASSES = {
  down: ['pointerdown', 'touchstart', 'mousedown'],
  move: ['pointermove', 'touchmove',  'mousemove'],
  up:   ['pointerup',   'touchend',   'mouseup']
};
/* eslint-enable */

export const BASIC_EVENT_ALIASES = {
  pointerdown: BASIC_EVENT_CLASSES.down,
  pointermove: BASIC_EVENT_CLASSES.move,
  pointerup: BASIC_EVENT_CLASSES.up,
  touchstart: BASIC_EVENT_CLASSES.down,
  touchmove: BASIC_EVENT_CLASSES.move,
  touchend: BASIC_EVENT_CLASSES.up,
  mousedown: BASIC_EVENT_CLASSES.down,
  mousemove: BASIC_EVENT_CLASSES.move,
  mouseup: BASIC_EVENT_CLASSES.up
};

/**
 * "Gestural" events are those that have semantic meaning beyond the basic input event,
 * e.g. a click or tap is a sequence of `down` and `up` events with no `move` event in between.
 * Hammer.js handles these with its Recognizer system;
 * this block maps event names to the Recognizers required to detect the events.
 */
export const EVENT_RECOGNIZER_MAP = {
  click: 'tap',
  tap: 'tap',
  doubletap: 'doubletap',
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

export const RECOGNIZERS = [
  [Rotate, {enable: false}],
  [Pinch, {enable: false}, ['rotate']],
  [Pan, {threshold: 10, enable: false}],
  [Swipe, {enable: false}],
  [Press, {enable: false}],
  [Tap, {event: 'doubletap', taps: 2, enable: false}],
  [Tap, {enable: false}]
];

/**
 * Map gestural events typically provided by browsers
 * that are not reported in 'hammer.input' events
 * to corresponding Hammer.js gestures.
 */
export const GESTURE_EVENT_ALIASES = {
  click: 'tap'
};
