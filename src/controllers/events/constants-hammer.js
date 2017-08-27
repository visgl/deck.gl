// This module contains constants that must be conditionally required
// due to `window`/`document` references downstream.
import {
  Tap,
  Press,
  Pinch,
  Rotate,
  Pan,
  Swipe
} from 'hammerjs';

export const RECOGNIZERS = [
  [Rotate, {enable: false}],
  [Pinch, {enable: false}, ['rotate']],
  [Pan, {threshold: 10, enable: false}],
  [Swipe, {enable: false}],
  [Press, {enable: false}],
  [Tap, {event: 'doubletap', taps: 2, enable: false}],
  [Tap, {enable: false}]
];
