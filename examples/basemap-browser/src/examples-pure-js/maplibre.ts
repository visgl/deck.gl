// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay} from '@deck.gl/mapbox';
import maplibregl from 'maplibre-gl';
import type {Layer} from '@deck.gl/core';

// eslint-disable-next-line max-params
export function mount(
  container: HTMLElement,
  getLayers: (interleaved?: boolean) => Layer[],
  initialViewState: any,
  mapStyle: string,
  interleaved: boolean,
  globe?: boolean
): () => void {
  const map = new maplibregl.Map({
    container,
    style: mapStyle,
    center: [initialViewState.longitude, initialViewState.latitude],
    zoom: initialViewState.zoom,
    bearing: initialViewState.bearing || 0,
    pitch: initialViewState.pitch || 0
  });

  const deckOverlay = new MapboxOverlay({
    interleaved,
    layers: getLayers(interleaved)
  });

  let cancelled = false;

  map.on('load', () => {
    if (cancelled) return;

    // Set projection before adding overlay (critical for globe + interleaved mode)
    if (globe) {
      map.setProjection({type: 'globe'} as any);
    }
    map.addControl(deckOverlay as any);
    map.addControl(new maplibregl.NavigationControl());
  });

  return () => {
    cancelled = true;
    map.remove();
  };
}
