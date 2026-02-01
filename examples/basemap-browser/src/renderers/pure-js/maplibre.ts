// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay} from '@deck.gl/mapbox';
import maplibregl from 'maplibre-gl';
import type {Config} from '../../types';
import {getBaseMapViewState} from '../../config';

export function mount(container: HTMLElement, config: Config): () => void {
  const {
    mapStyle,
    initialViewState,
    layers,
    interleaved,
    batched,
    globe,
    multiView,
    views,
    layerFilter,
    onViewStateChange
  } = config;

  // For multi-view, extract the mapbox view state for the base map
  const mapInitialViewState = getBaseMapViewState(initialViewState);

  const map = new maplibregl.Map({
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

  let cancelled = false;

  map.on('load', () => {
    if (cancelled) return;

    // Set projection before adding overlay (critical for globe + interleaved mode)
    if (globe) {
      map.setProjection({type: 'globe'} as any);
      // Re-apply center/zoom after projection change (setProjection resets to 0,0)
      map.setCenter([mapInitialViewState.longitude, mapInitialViewState.latitude]);
      map.setZoom(mapInitialViewState.zoom);
      // Wait for projection to be fully applied before adding overlay
      requestAnimationFrame(() => {
        if (cancelled) return;
        map.addControl(deckOverlay as any);
        map.addControl(new maplibregl.NavigationControl());
      });
    } else {
      map.addControl(deckOverlay as any);
      map.addControl(new maplibregl.NavigationControl());
    }
  });

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
    cancelled = true;
    map.remove();
  };
}
