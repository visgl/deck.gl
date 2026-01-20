// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay} from '@deck.gl/mapbox';
import mapboxgl from 'mapbox-gl';
import type {Layer} from '@deck.gl/core';

export function mount(
  container: HTMLElement,
  getLayers: (interleaved?: boolean) => Layer[],
  initialViewState: any,
  mapStyle: string,
  interleaved: boolean,
  batched: boolean
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

  const deckOverlay = new MapboxOverlay({
    interleaved,
    _renderLayersInGroups: batched,
    layers: getLayers(interleaved)
  });

  map.addControl(deckOverlay as any);
  map.addControl(new mapboxgl.NavigationControl());

  return () => {
    map.remove();
  };
}
