/* global document, google, window */
import {Deck} from '@deck.gl/core';

/**
 * Get a new deck instance
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 * @param [deck] (Deck) - a previously created instances
 */
export function createDeckInstance(map, overlay, deck) {
  if (deck) {
    if (deck.props.userData._googleMap === map) {
      return deck;
    }
    // deck instance was created for a different map
    destroyDeckInstance(deck);
  }

  const eventListeners = {
    click: null,
    mousemove: null,
    mouseout: null
  };

  deck = new Deck({
    canvas: createDeckCanvas(overlay),
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    controller: false,
    userData: {
      _googleMap: map,
      _eventListeners: eventListeners
    }
  });

  // Register event listeners
  for (const eventType in eventListeners) {
    eventListeners[eventType] = map.addListener(eventType, evt =>
      handleMouseEvent(deck, eventType, evt, map)
    );
  }

  return deck;
}

function createDeckCanvas(overlay) {
  const container = overlay.getPanes().overlayLayer;
  const deckCanvas = document.createElement('canvas');
  Object.assign(deckCanvas.style, {
    // map container position is always non-static
    position: 'absolute'
  });

  container.appendChild(deckCanvas);
  return deckCanvas;
}

/**
 * Safely remove a deck instance
 * @param deck (Deck) - a previously created instances
 */
export function destroyDeckInstance(deck) {
  const {_eventListeners: eventListeners} = deck.props.userData;

  // Unregister event listeners
  for (const eventType in eventListeners) {
    eventListeners[eventType].remove();
  }

  deck.finalize();

  // Remove canvas
  deck.canvas.parentNode.removeChild(deck.canvas);
}

/**
 * Get the current view state
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 */
export function getViewState(map, overlay) {
  // The map fills the container div unless it's in fullscreen mode
  // at which point the first child of the container is promoted
  const container = map.getDiv().firstChild;
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

  // google maps places overlays in a container anchored at the map center.
  // the container CSS is manipulated during dragging.
  // We need to update left/top of the deck canvas to match the base map.
  const nwContainerPx = new google.maps.Point(0, 0);
  const nw = projection.fromContainerPixelToLatLng(nwContainerPx);
  const nwDivPx = projection.fromLatLngToDivPixel(nw);

  // Compute fractional zoom.
  const scale = (topRight.x - bottomLeft.x) / width;
  const zoom = Math.log2(scale) + map.getZoom() - 1;

  // Compute fractional center.
  const centerPx = new google.maps.Point(width / 2, height / 2);
  const centerContainer = projection.fromContainerPixelToLatLng(centerPx);
  const latitude = centerContainer.lat();
  const longitude = centerContainer.lng();

  return {
    width,
    height,
    left: nwDivPx.x,
    top: nwDivPx.y,
    zoom,
    pitch: map.getTilt(),
    latitude,
    longitude
  };
}

function getNativeMouseEvent(event) {
  for (const i in event) {
    if (event[i] instanceof window.MouseEvent) {
      return event[i];
    }
  }
  return undefined;
}

function getXYFromLatLng(latLng, map) {
  const numTiles = 1 << map.getZoom();
  const projection = map.getProjection();
  const worldCoordinate = projection.fromLatLngToPoint(latLng);
  const pixelCoordinate = new google.maps.Point(
    worldCoordinate.x * numTiles,
    worldCoordinate.y * numTiles
  );
  return pixelCoordinate;
}

// Calculate google event pixel coordinate
// Pixel and and original MouseEvent presence in event are undocumented feature
// and not present in all google events
// https://developers.google.com/maps/documentation/javascript/reference/map#MouseEvent
//
// latLng is is documented but does not always return position of mouse.
// It returns position of google POI if clicked on it. Thus using it as fallback.
function getEventPixel(event, map) {
  let pixel;

  if (event.pixel) {
    pixel = {
      x: event.pixel.x,
      y: event.pixel.y
    };
  } else {
    // Clicking on google POI icon does not return pixel coordinates.
    // Trying to calculate these using google map element and provided
    // mouse event details.

    const mapDiv = map.getDiv();
    if (!mapDiv) {
      // Map not rendered or something wrong,
      // thus not wise to continue.
      return undefined;
    }

    const mapRect = mapDiv.getBoundingClientRect();
    const mouseEvent = getNativeMouseEvent(event);

    if (mouseEvent) {
      // Calculating by sutracting map top corner coordinate in window
      // from mouse coordinate in window
      pixel = {
        x: mouseEvent.clientX - mapRect.left,
        y: mouseEvent.clientY - mapRect.top
      };
    } else {
      const point = getXYFromLatLng(event.latLng, map);
      pixel = {
        x: point.x,
        y: point.y
      };
    }
  }
  return pixel;
}

// Triggers picking on a mouse event
function handleMouseEvent(deck, type, event, map) {
  let callback;
  const pixel = getEventPixel(event, map);

  switch (type) {
    case 'click':
      // If pixel calulations all fail, do not push through the event
      if (!pixel) {
        return;
      }
      // Hack: because we do not listen to pointer down, perform picking now
      deck._lastPointerDownInfo = deck.pickObject(pixel);
      callback = deck._onEvent;
      break;

    case 'mousemove':
      type = 'pointermove';
      callback = deck._onPointerMove;
      break;

    case 'mouseout':
      type = 'pointerleave';
      callback = deck._onPointerMove;
      break;

    default:
      return;
  }

  callback({
    type,
    offsetCenter: pixel,
    srcEvent: event
  });
}
