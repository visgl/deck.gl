// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Map as MaplibreMap, setWorkerUrl} from 'maplibre-gl';
import {INITIAL_VIEW_STATE} from './constants';

// MapLibre v6 cannot locate its worker inside a bundle. Turbopack and webpack emit this
// literal `new URL(..., import.meta.url)` as a hashed asset; see
// https://maplibre.org/maplibre-gl-js/docs/#esm. Requires maplibre-gl >= 6.13.
setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString());

/**
 * Creates the Maplibre map in `container`. deck.gl attaches to it through the `map` prop of
 * `DeckGL`, so the map is created once and outlives any overlay the root recreates.
 */
export function createMap(container: HTMLElement): MaplibreMap {
  return new MaplibreMap({
    canvasContextAttributes: {antialias: true},
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    container,
    pixelRatio: window.devicePixelRatio,
    style: {
      layers: [
        {
          id: 'simple-tiles',
          maxzoom: 22,
          minzoom: 0,
          source: 'raster-tiles',
          type: 'raster'
        }
      ],
      sources: {
        'raster-tiles': {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          tileSize: 256,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          type: 'raster'
        }
      },
      version: 8
    },
    zoom: INITIAL_VIEW_STATE.zoom
  });
}
