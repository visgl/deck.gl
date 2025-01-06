// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Note: The numeric values here are matched by shader code in the
// "project" and "project64" shader modules. Both places need to be
// updated.
import log from '../utils/log';
import {Pan, InputDirection, Pinch, Tap} from 'mjolnir.js';
import type {PanRecognizerOptions, PinchRecognizerOptions, TapRecognizerOptions} from 'mjolnir.js';

/**
 * The coordinate system that positions/dimensions are defined in.
 */
export const COORDINATE_SYSTEM = {
  /**
   * `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
   */
  DEFAULT: -1,
  /**
   * Positions are interpreted as [longitude, latitude, elevation]
   * longitude/latitude are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT: 1,

  /**
   * Positions are interpreted as [x, y, z] in meter offsets from the coordinate origin.
   * Dimensions are in meters.
   */
  METER_OFFSETS: 2,

  /**
   * Positions are interpreted as [deltaLng, deltaLat, elevation] from the coordinate origin.
   * deltaLng/deltaLat are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT_OFFSETS: 3,

  /**
   * Positions and dimensions are in the common units of the viewport.
   */
  CARTESIAN: 0
} as const;

// Enums cannot be directly exported as they are not transpiled correctly into ES5, see https://github.com/visgl/deck.gl/issues/7130
export type CoordinateSystem = -1 | 0 | 1 | 2 | 3;

// Deprecated
/* eslint-disable accessor-pairs */
Object.defineProperty(COORDINATE_SYSTEM, 'IDENTITY', {
  get: () => {
    log.deprecated('COORDINATE_SYSTEM.IDENTITY', 'COORDINATE_SYSTEM.CARTESIAN')();
    return 0;
  }
});
/* eslint-enable accessor-pairs */

/**
 * How coordinates are transformed from the world space into the common space.
 */
export const PROJECTION_MODE = {
  /**
   * Render geospatial data in Web Mercator projection
   */
  WEB_MERCATOR: 1,
  /**
   * Render geospatial data as a 3D globe
   */
  GLOBE: 2,

  /**
   * (Internal use only) Web Mercator projection at high zoom
   */
  WEB_MERCATOR_AUTO_OFFSET: 4,

  /**
   * No transformation
   */
  IDENTITY: 0
} as const;

export const UNIT = {
  common: 0,
  meters: 1,
  pixels: 2
} as const;

export const EVENT_HANDLERS: {[eventName: string]: string} = {
  click: 'onClick',
  panstart: 'onDragStart',
  panmove: 'onDrag',
  panend: 'onDragEnd'
} as const;

export const RECOGNIZERS = {
  multipan: [Pan, {threshold: 10, direction: InputDirection.Vertical, pointers: 2}],
  pinch: [Pinch, {}, null, ['multipan']],
  pan: [Pan, {threshold: 1}, ['pinch'], ['multipan']],
  dblclick: [Tap, {event: 'dblclick', taps: 2}],
  click: [Tap, {event: 'click'}, null, ['dblclick']]
} as const;
export type RecognizerOptions = {
  pinch?: Omit<PinchRecognizerOptions, 'event' | 'enable'>;
  multipan?: Omit<PanRecognizerOptions, 'event' | 'enable'>;
  pan?: Omit<PanRecognizerOptions, 'event' | 'enable'>;
  dblclick?: Omit<TapRecognizerOptions, 'event' | 'enable'>;
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
