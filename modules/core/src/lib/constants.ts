// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {TypeScriptCRSInput} from '@math.gl/projection/core';

import {Pan, DoubleClickDrag, Tap} from 'mjolnir.js';
import {TwoFingerPan, TwoFingerPinch, TWO_FINGER_PINCH_THRESHOLD} from './two-finger-recognizers';
import type {
  DoubleClickDragRecognizerOptions,
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

// Order matters: recognizeWith/requireFailure resolve by name, so a recognizer
// must be registered before any later entry can reference it.
export const RECOGNIZERS = {
  multipan: [TwoFingerPan, {threshold: 10, pointers: 2, trackpad: true}],
  pinch: [
    TwoFingerPinch,
    {threshold: TWO_FINGER_PINCH_THRESHOLD, trackpad: true},
    null,
    ['multipan']
  ],
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
