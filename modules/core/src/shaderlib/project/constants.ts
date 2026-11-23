// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/** Packed attribute frames bound to the project uniform block, not layer CRS identifiers. */
export const COORDINATE_SYSTEM = {
  IDENTITY: 0,
  GEODETIC: 1,
  PROJECTED: 2,
  GEOCENTRIC: 3
} as const;

/** Shader algorithms, including local offset projections. Internal to shaderlib. */
export const PROJECTION_MODE = {
  IDENTITY: 0,
  WEB_MERCATOR: 1,
  GLOBE: 2,
  CUSTOM_GEOSPATIAL: 3,
  WEB_MERCATOR_AUTO_OFFSET: 4,
  METER_OFFSETS: 5,
  GLOBE_METER_OFFSETS: 6,
  GEODETIC_OFFSETS: 7
} as const;
