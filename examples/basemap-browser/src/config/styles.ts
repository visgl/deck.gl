// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Basemap} from '../types';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v9';
const MAPLIBRE_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

/**
 * Get map style URL for a given basemap type.
 * Google Maps doesn't use a style URL (uses Map ID instead).
 */
export function getMapStyle(basemap: Basemap): string {
  switch (basemap) {
    case 'deck-only':
      return ''; // No basemap
    case 'mapbox':
      return MAPBOX_STYLE;
    case 'maplibre':
      return MAPLIBRE_STYLE;
    case 'google-maps':
      return ''; // Google Maps uses Map ID, not style URL
    default:
      return MAPLIBRE_STYLE;
  }
}
