// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay} from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import type {Layer, View} from '@deck.gl/core';

// eslint-disable-next-line max-params
export function mount(
  container: HTMLElement,
  getLayers: (interleaved?: boolean) => Layer[],
  initialViewState: any,
  mapStyle: string,
  interleaved: boolean,
  batched: boolean,
  multiView?: boolean,
  views?: View[],
  layerFilter?: (args: {layer: Layer; viewport: any}) => boolean
): () => void {
  // eslint-disable-next-line no-process-env
  const mapboxToken = process.env.MapboxAccessToken;

  if (!mapboxToken) {
    container.innerHTML = `
      <div style="padding: 20px; color: red; background-color: #ffebee; height: 100%;">
        <h3>Mapbox Configuration Required</h3>
        <p>Set MapboxAccessToken environment variable.</p>
      </div>
    `;
    return () => {};
  }

  (mapboxgl as any).accessToken = mapboxToken;

  const map = new mapboxgl.Map({
    container,
    style: mapStyle,
    center: [initialViewState.longitude, initialViewState.latitude],
    zoom: initialViewState.zoom,
    bearing: initialViewState.bearing || 0,
    pitch: initialViewState.pitch || 0
  });

  const overlayConfig: any = {
    interleaved,
    _renderLayersInGroups: batched,
    layers: getLayers(interleaved)
  };

  if (multiView && views) {
    overlayConfig.views = views;
  }
  if (multiView && layerFilter) {
    overlayConfig.layerFilter = layerFilter;
  }

  const deckOverlay = new MapboxOverlay(overlayConfig);

  map.addControl(deckOverlay as any);
  map.addControl(new mapboxgl.NavigationControl());

  return () => {
    map.remove();
  };
}
