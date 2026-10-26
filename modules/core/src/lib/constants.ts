// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {TypeScriptCRSInput} from '@math.gl/projection/core';

import {Pan, DoubleClickDrag, Pinch, Tap} from 'mjolnir.js';
import type {
  DoubleClickDragRecognizerOptions,
  InputCoherenceCondition,
  PanRecognizerOptions,
  PinchRecognizerOptions,
  TapRecognizerOptions
} from 'mjolnir.js';

/**
 * The coordinate system that positions/dimensions are defined in.
 */
export type CoordinateSystem = TypeScriptCRSInput;

export const UNIT = {
  common: 0,
  meters: 1,
  pixels: 2
} as const;

export const EVENT_HANDLERS = {
  click: 'onClick',
  dblclick: 'onClick',
  panstart: 'onDragStart',
  panmove: 'onDrag',
  panend: 'onDragEnd'
} as const satisfies {[eventName: string]: string};

// Touch pointers rarely report movement in the same frame. A transient scale or
// rotation from one pointer moving ahead of the other must not claim a pinch, so
// wait until both pointers have moved, or one pointer has moved deliberately for
// 40ms, before choosing between two-finger translation and pinch/twist.
const PINCH_COHERENCE: InputCoherenceCondition[] = [
  {movementDeltaTime: 40, distance: 2, scale: 0.03},
  {movementDeltaTime: 40, distance: 2, rotation: 3},
  {distancePerPointer: 1, scale: 0.03},
  {distancePerPointer: 1, rotation: 3}
];
const MULTIPAN_COHERENCE: InputCoherenceCondition[] = [{distancePerPointer: 1}];

// Order matters: recognizeWith/requireFailure resolve by name, so a recognizer
// must be registered before any later entry can reference it. On the same input,
// the first recognizer to qualify claims the gesture.
export const RECOGNIZERS = {
  multipan: [Pan, {threshold: 10, pointers: 2, trackpad: true, coherent: MULTIPAN_COHERENCE}],
  pinch: [Pinch, {trackpad: true, coherent: PINCH_COHERENCE}, null, ['multipan']],
  dblclick: [Tap, {event: 'dblclick', taps: 2, enable: false}],
  // Register before pan so the second touch can claim double-tap-drag before
  // the ordinary one-pointer pan recognizer sees the same movement.
  dblclickdrag: [
    DoubleClickDrag,
    {event: 'dblclickdrag', enable: false, time: 750},
    ['dblclick'],
    null
  ],
  pan: [Pan, {threshold: 1}, ['pinch'], ['multipan']],
  click: [Tap, {event: 'click'}, ['dblclickdrag'], ['dblclick', 'dblclickdrag']]
} as const;

export type RecognizerOptions = {
  pinch?: Omit<PinchRecognizerOptions, 'event' | 'enable'>;
  multipan?: Omit<PanRecognizerOptions, 'event' | 'enable'>;
  pan?: Omit<PanRecognizerOptions, 'event' | 'enable'>;
  dblclick?: Omit<TapRecognizerOptions, 'event' | 'enable'>;
  /** Options for continuous zoom with double-click/tap followed by vertical drag. */
  dblclickdrag?: Omit<DoubleClickDragRecognizerOptions, 'event' | 'enable'>;
  click?: Omit<TapRecognizerOptions, 'event' | 'enable'>;
};

/**
 * @deprecated Use string constants directly
 */
export const OPERATION = {
  DRAW: 'draw',
  MASK: 'mask',
  TERRAIN: 'terrain'
} as const;
