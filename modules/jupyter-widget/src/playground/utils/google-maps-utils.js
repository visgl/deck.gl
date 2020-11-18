/* global window */
import * as deck from '../../deck-bundle';

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
    deck.log.warn('No Google Maps API key set')();
    return null;
  }
  const deckOverlay = new deck.GoogleMapsOverlay({layers});
  const view = {
    center: {lat: initialViewState.latitude, lng: initialViewState.longitude},
    mapTypeId: mapStyle,
    zoom: initialViewState.zoom
  };

  const map = new window.google.maps.Map(container, view);
  deckOverlay.setMap(map);
  return deckOverlay;
}
