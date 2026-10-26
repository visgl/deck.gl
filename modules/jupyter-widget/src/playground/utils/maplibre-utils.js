// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global ResizeObserver */
/* eslint-disable import/namespace */
import {log} from '@deck.gl/core';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {Map, NavigationControl, getVersion} from 'maplibre-gl';

import {loadCSS} from './css-utils';
import {forwardLayerUpdates} from './overlay-utils';

const MAPLIBRE_CSS_URL = `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl.css`;

export function loadMapLibreCSS(url = MAPLIBRE_CSS_URL) {
  loadCSS(url);
}

/**
 * Resizes the map once its container has a size, if it had none when the map was created.
 * A map created in a container without a size falls back to 400x300. MapLibre's `trackResize`
 * observer skips its first notification, so when the container is attached before that
 * notification is sent, as in a Jupyter widget view, the map keeps the fallback size.
 */
export function resizeMapWhenContainerSized(map) {
  const container = map.getContainer();
  if (container.clientWidth && container.clientHeight) {
    return;
  }
  const observer = new ResizeObserver(() => {
    if (container.clientWidth && container.clientHeight) {
      observer.disconnect();
      map.resize();
    }
  });
  observer.observe(container);
  map.once('remove', () => observer.disconnect());
}

export function createMapLibreDeckOverlay({
  container,
  onClick,
  onHover,
  onResize,
  onViewStateChange,
  onDragStart,
  onDrag,
  onDragEnd,
  onError,
  getTooltip,
  layers,
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  initialViewState = {latitude: 0, longitude: 0, zoom: 1},
  mapProjection = 'mercator'
}) {
  log.info('Using MapLibre')();

  // Create MapLibre map
  const map = new Map({
    container,
    style: mapStyle,
    center: [initialViewState.longitude, initialViewState.latitude],
    zoom: initialViewState.zoom,
    pitch: initialViewState.pitch || 0,
    bearing: initialViewState.bearing || 0
  });
  resizeMapWhenContainerSized(map);

  // Create deck overlay with interleaved mode for globe
  const deckOverlay = new MapLibreOverlay({
    interleaved: mapProjection === 'globe',
    layers,
    getTooltip,
    onClick,
    onHover,
    onDragStart,
    onDrag,
    onDragEnd,
    onError
  });

  // Set up projection and add overlay when map loads
  map.on('load', () => {
    if (mapProjection === 'globe') {
      map.setProjection({type: 'globe'});
    }
    map.addControl(deckOverlay);
    map.addControl(new NavigationControl());
  });

  // Handle view state change events
  if (onViewStateChange) {
    map.on('move', () => {
      const center = map.getCenter();
      const viewState = {
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
      };
      onViewStateChange({viewState});
    });
  }

  // Handle resize events
  if (onResize) {
    map.on('resize', () => {
      const canvas = map.getCanvas();
      onResize({width: canvas.width, height: canvas.height});
    });
  }

  forwardLayerUpdates(deckOverlay);

  return deckOverlay;
}
