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

// Describes the format of positions
export const COORDINATE_SYSTEM = {
  // `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
  DEFAULT: -1,
  // Positions are interpreted as [lng, lat, elevation]
  // lng lat are degrees, elevation is meters. distances as meters.
  LNGLAT: 1,

  // Positions are interpreted as meter offsets, distances as meters
  METER_OFFSETS: 2,

  // Positions are interpreted as lng lat offsets: [deltaLng, deltaLat, elevation]
  // deltaLng, deltaLat are delta degrees, elevation is meters.
  // distances as meters.
  LNGLAT_OFFSETS: 3,

  // Non-geospatial
  CARTESIAN: 0
};

// Deprecated
/* eslint-disable accessor-pairs */
Object.defineProperty(COORDINATE_SYSTEM, 'IDENTITY', {
  get: () => log.deprecated('COORDINATE_SYSTEM.IDENTITY', 'COORDINATE_SYSTEM.CARTESIAN')() || 0
});
/* eslint-enable accessor-pairs */

// Describes the common space
export const PROJECTION_MODE = {
  WEB_MERCATOR: 1,

  // This is automatically assigned by the project module
  WEB_MERCATOR_AUTO_OFFSET: 4,

  IDENTITY: 0
};

export const EVENTS = {
  click: {handler: 'onClick'},
  panstart: {handler: 'onDragStart'},
  panmove: {handler: 'onDrag'},
  panend: {handler: 'onDragEnd'}
};
