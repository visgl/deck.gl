// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Basemap} from '../../types';
import DeckOnlyComponent from './deck-only-component';
import GoogleMapsComponent from './google-maps-component';
import MapboxComponent from './mapbox-component';
import MapLibreComponent from './maplibre-component';

export function getComponent(basemap: Basemap) {
  switch (basemap) {
    case 'deck-only':
      return DeckOnlyComponent;
    case 'google-maps':
      return GoogleMapsComponent;
    case 'mapbox':
      return MapboxComponent;
    case 'maplibre':
      return MapLibreComponent;
    default:
      throw new Error(`Unknown basemap: ${basemap}`);
  }
}
