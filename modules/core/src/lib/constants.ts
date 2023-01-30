// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Note: The numeric values here are matched by shader code in the
// "project" and "project64" shader modules. Both places need to be
// updated.
import log from '../utils/log';

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

export const EVENTS = {
  click: {handler: 'onClick'},
  panstart: {handler: 'onDragStart'},
  panmove: {handler: 'onDrag'},
  panend: {handler: 'onDragEnd'}
} as const;

/**
 * @deprecated Use string constants directly
 */
export const OPERATION = {
  DRAW: 'draw',
  MASK: 'mask',
  TERRAIN: 'terrain'
} as const;
