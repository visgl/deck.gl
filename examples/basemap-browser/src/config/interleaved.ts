// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Basemap} from '../types';

/**
 * Get interleaved layer positioning props based on basemap.
 */
export function getInterleavedProps(basemap: Basemap, interleaved: boolean): Record<string, any> {
  if (!interleaved) {
    return {};
  }

  switch (basemap) {
    case 'mapbox':
      return {slot: 'middle'};
    case 'maplibre':
      return {beforeId: 'watername_ocean'};
    case 'google-maps':
      // Google Maps doesn't support slot/beforeId
      return {};
    default:
      return {};
  }
}
