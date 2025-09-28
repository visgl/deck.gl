// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global window */
/* eslint-disable import/namespace */
import {log} from '@deck.gl/core';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

export function createGoogleMapsDeckOverlay({
  container,
  onClick,
  onComplete,
  getTooltip,
  googleMapsKey,
  layers,
  mapStyle = 'satellite',
  initialViewState = {latitude: 0, longitude: 0, zoom: 1}
}) {
  if (!googleMapsKey) {
    log.warn('No Google Maps API key set')();
    return null;
  }
  const deckOverlay = new GoogleMapsOverlay({layers});
  const view = {
    center: {lat: initialViewState.latitude, lng: initialViewState.longitude},
    mapTypeId: mapStyle,
    zoom: initialViewState.zoom
  };

  const map = new window.google.maps.Map(container, view);
  deckOverlay.setMap(map);
  return deckOverlay;
}
