// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global window */
/* eslint-disable import/namespace */
import {log} from '@deck.gl/core';
import {MapboxOverlay} from '@deck.gl/mapbox';
import maplibregl from 'maplibre-gl';

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
  const map = new maplibregl.Map({
    container,
    style: mapStyle,
    center: [initialViewState.longitude, initialViewState.latitude],
    zoom: initialViewState.zoom,
    pitch: initialViewState.pitch || 0,
    bearing: initialViewState.bearing || 0
  });

  // Create deck overlay with interleaved mode for globe
  const deckOverlay = new MapboxOverlay({
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
    map.addControl(new maplibregl.NavigationControl());
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

  // Expose setProps method to update layers
  deckOverlay.setProps = function(props) {
    if (props.layers) {
      deckOverlay.setProps({layers: props.layers});
    }
  };

  return deckOverlay;
}
