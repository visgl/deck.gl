/* global document, google */
import {Deck} from '@deck.gl/core';

export function createDeckInstance(map) {
  const container = map.getDiv();

  const deckCanvas = document.createElement('canvas');
  container.appendChild(deckCanvas);
  Object.assign(deckCanvas.style, {
    // map container position is always non-static
    position: 'absolute',
    pointerEvents: 'none',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
  });

  const eventListeners = {
    click: null,
    mousemove: null,
    mouseout: null
  };

  const deck = new Deck({
    canvas: deckCanvas,
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    controller: false,
    userData: {
      map,
      eventListeners
    }
  });

  // Register event listeners
  for (const eventType in eventListeners) {
    eventListeners[eventType] = map.addListener(eventType, evt =>
      handleMouseEvent(deck, eventType, evt)
    );
  }

  return deck;
}

export function destroyDeckInstance(deck) {
  const {map, eventListeners} = deck.props.userData;

  // Unregister event listeners
  for (const eventType in eventListeners) {
    map.removeListener(eventListeners[eventType]);
  }

  deck.finalize();
}

export function getViewState(map, overlay) {
  const container = map.getDiv();
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // Canvas position relative to draggable map's container depends on
  // overlayView's projection, not the map's. Have to use the center of the
  // map for this, not the top left, for the same reason as above.
  const projection = overlay.getProjection();

  const bounds = map.getBounds();
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  const topRight = projection.fromLatLngToDivPixel(ne);
  const bottomLeft = projection.fromLatLngToDivPixel(sw);

  // Compute fractional zoom.
  const scale = (topRight.x - bottomLeft.x) / width;
  const zoom = Math.log2(scale) + map.getZoom() - 1;

  // Compute fractional center.
  const centerPx = new google.maps.Point(width / 2, height / 2);
  const centerContainer = projection.fromContainerPixelToLatLng(centerPx);
  const latitude = centerContainer.lat();
  const longitude = centerContainer.lng();

  return {
    zoom,
    pitch: map.getTilt(),
    latitude,
    longitude
  };
}

// Triggers picking on a mouse event
function handleMouseEvent(deck, type, event) {
  let callback;
  switch (type) {
    case 'click':
      callback = deck._onEvent;
      break;

    case 'mousemove':
      callback = deck._onPointerMove;
      break;

    case 'mouseout':
      callback = deck._onPointerLeave;
      break;

    default:
      return;
  }

  callback({
    type,
    offsetCenter: event.pixel,
    srcEvent: event
  });
}
