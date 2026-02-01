// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay} from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import type {Config} from '../../types';
import {getBaseMapViewState} from '../../config';

export function mount(container: HTMLElement, config: Config): () => void {
  const {
    mapStyle,
    initialViewState,
    layers,
    interleaved,
    batched,
    multiView,
    views,
    layerFilter,
    onViewStateChange
  } = config;

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

  // For multi-view, extract the mapbox view state for the base map
  const mapInitialViewState = getBaseMapViewState(initialViewState);

  const map = new mapboxgl.Map({
    container,
    style: mapStyle,
    center: [mapInitialViewState.longitude, mapInitialViewState.latitude],
    zoom: mapInitialViewState.zoom,
    bearing: mapInitialViewState.bearing || 0,
    pitch: mapInitialViewState.pitch || 0
  });

  const overlayConfig: any = {
    interleaved,
    _renderLayersInGroups: batched,
    layers
  };

  if (multiView && views) {
    overlayConfig.views = views;
    overlayConfig.initialViewState = initialViewState;
  }
  if (multiView && layerFilter) {
    overlayConfig.layerFilter = layerFilter;
  }

  const deckOverlay = new MapboxOverlay(overlayConfig);

  map.addControl(deckOverlay as any);
  map.addControl(new mapboxgl.NavigationControl());

  if (onViewStateChange) {
    map.on('move', () => {
      const center = map.getCenter();
      onViewStateChange({
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch()
      });
    });
  }

  return () => {
    map.remove();
  };
}
