// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import log from '../utils/log';
import {Pan, InputDirection, Pinch, Tap} from 'mjolnir.js';
import type {PanRecognizerOptions, PinchRecognizerOptions, TapRecognizerOptions} from 'mjolnir.js';

/**
 * The coordinate system that positions/dimensions are defined in.
 */
export type CoordinateSystem =
  | 'default'
  | 'lnglat'
  | 'meter-offsets'
  | 'lnglat-offsets'
  | 'cartesian';

/**
 * The coordinate system that positions/dimensions are defined in.
 * String constants are the public API.
 * @deprecated Use string constants directly.
 */
export const COORDINATE_SYSTEM = {
  /**
   * `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
   */
  DEFAULT: 'default',
  /**
   * Positions are interpreted as [longitude, latitude, elevation]
   * longitude/latitude are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT: 'lnglat',

  /**
   * Positions are interpreted as [x, y, z] in meter offsets from the coordinate origin.
   * Dimensions are in meters.
   */
  METER_OFFSETS: 'meter-offsets',

  /**
   * Positions are interpreted as [deltaLng, deltaLat, elevation] from the coordinate origin.
   * deltaLng/deltaLat are in degrees, elevation is in meters.
   * Dimensions are in meters.
   */
  LNGLAT_OFFSETS: 'lnglat-offsets',

  /**
   * Positions and dimensions are in the common units of the viewport.
   */
  CARTESIAN: 'cartesian'
} as const;

// Deprecated
/* eslint-disable accessor-pairs */
Object.defineProperty(COORDINATE_SYSTEM, 'IDENTITY', {
  get: () => {
    log.deprecated('COORDINATE_SYSTEM.IDENTITY', 'COORDINATE_SYSTEM.CARTESIAN')();
    return COORDINATE_SYSTEM.CARTESIAN;
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

export const EVENT_HANDLERS = {
  click: 'onClick',
  dblclick: 'onClick',
  panstart: 'onDragStart',
  panmove: 'onDrag',
  panend: 'onDragEnd'
} as const satisfies {[eventName: string]: string};

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
