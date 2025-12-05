// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {MapType} from '../types';
import GoogleMapsComponent from './google-maps-component';
import MapboxComponent from './mapbox-component';
import MapLibreComponent from './maplibre-component';

export function getComponent(mapType: MapType) {
  switch (mapType) {
    case 'google-maps':
      return GoogleMapsComponent;
    case 'mapbox':
      return MapboxComponent;
    case 'maplibre':
      return MapLibreComponent;
    default:
      throw new Error(`Unknown map type: ${mapType}`);
  }
}
