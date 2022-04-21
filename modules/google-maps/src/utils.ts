/* global google, document */
import {Deck} from '@deck.gl/core';
import {Matrix4, Vector2} from '@math.gl/core';

// https://en.wikipedia.org/wiki/Web_Mercator_projection#Formulas
const MAX_LATITUDE = 85.05113;

/**
 * Get a new deck instance
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 * @param [deck] (Deck) - a previously created instances
 */
export function createDeckInstance(
  map: google.maps.Map,
  overlay: google.maps.OverlayView | google.maps.WebGLOverlayView,
  deck: Deck | null | undefined,
  props
): Deck {
  if (deck) {
    if (deck.props.userData._googleMap === map) {
      return deck;
    }
    // deck instance was created for a different map
    destroyDeckInstance(deck);
  }

  const eventListeners = {
    click: null,
    dblclick: null,
    mousemove: null,
    mouseout: null
  };

  const newDeck = new Deck({
    ...props,
    style: props.interleaved ? null : {pointerEvents: 'none'},
    parent: getContainer(overlay, props.style),
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
      handleMouseEvent(newDeck, eventType, evt)
    );
  }

  return newDeck;
}

// Create a container that will host the deck canvas and tooltip
function getContainer(
  overlay: google.maps.OverlayView | google.maps.WebGLOverlayView,
  style?: Partial<CSSStyleDeclaration>
): HTMLElement {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  Object.assign(container.style, style);

  // The DOM structure has a different structure depending on whether
  // the Google map is rendered as vector or raster
  if ('getPanes' in overlay) {
    overlay.getPanes()?.overlayLayer.appendChild(container);
  } else {
    overlay.getMap()?.getDiv().appendChild(container);
  }
  return container;
}

/**
 * Safely remove a deck instance
 * @param deck (Deck) - a previously created instances
 */
export function destroyDeckInstance(deck: Deck) {
  const {_eventListeners: eventListeners} = deck.props.userData;

  // Unregister event listeners
  for (const eventType in eventListeners) {
    eventListeners[eventType].remove();
  }

  deck.finalize();
}

/* eslint-disable max-statements */
/**
 * Get the current view state
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 */
// eslint-disable-next-line complexity
export function getViewPropsFromOverlay(map: google.maps.Map, overlay: google.maps.OverlayView) {
  const {width, height} = getMapSize(map);

  // Canvas position relative to draggable map's container depends on
  // overlayView's projection, not the map's. Have to use the center of the
  // map for this, not the top left, for the same reason as above.
  const projection = overlay.getProjection();

  const bounds = map.getBounds();
  if (!bounds) {
    return {width, height, left: 0, top: 0};
  }

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

  if (!topRight || !bottomLeft || !nwDivPx) {
    return {width, height, left: 0, top: 0};
  }

  let leftOffset = nwDivPx.x;
  let topOffset = nwDivPx.y;

  // Adjust horizontal offset - position the viewport at the map in the center
  const mapWidth = projection.getWorldWidth();
  const mapCount = Math.ceil(width / mapWidth);
  leftOffset -= Math.floor(mapCount / 2) * mapWidth;

  const topLngLat = pixelToLngLat(projection, width / 2, 0);
  const centerLngLat = pixelToLngLat(projection, width / 2, height / 2);
  const bottomLngLat = pixelToLngLat(projection, width / 2, height);

  // Compute fractional center.
  let latitude = centerLngLat[1];
  const longitude = centerLngLat[0];

  // Adjust vertical offset - limit latitude
  if (Math.abs(latitude) > MAX_LATITUDE) {
    latitude = latitude > 0 ? MAX_LATITUDE : -MAX_LATITUDE;
    const center = new google.maps.LatLng(latitude, longitude);
    const centerPx = projection.fromLatLngToContainerPixel(center);
    // @ts-ignore (TS2531) Object is possibly 'null'
    topOffset += centerPx.y - height / 2;
  }

  // Compute fractional bearing
  const delta = new Vector2(topLngLat).sub(bottomLngLat);
  let bearing = (180 * delta.verticalAngle()) / Math.PI;
  if (bearing < 0) bearing += 360;

  // Maps sometimes returns undefined instead of 0
  const heading = map.getHeading() || 0;

  let zoom = (map.getZoom() as number) - 1;

  let scale;

  if (bearing === 0) {
    // At full world view (always unrotated) simply compare height, as diagonal
    // is incorrect due to multiple world copies
    scale = height ? (bottomLeft.y - topRight.y) / height : 1;
  } else if (bearing === heading) {
    // Fractional zoom calculation only correct when bearing is not animating
    const viewDiagonal = new Vector2([topRight.x, topRight.y])
      .sub([bottomLeft.x, bottomLeft.y])
      .len();
    const mapDiagonal = new Vector2([width, -height]).len();
    scale = mapDiagonal ? viewDiagonal / mapDiagonal : 1;
  }

  // When resizing aggressively, occasionally ne and sw are the same points
  // See https://github.com/visgl/deck.gl/issues/4218
  zoom += Math.log2(scale || 1);

  return {
    width,
    height,
    left: leftOffset,
    top: topOffset,
    zoom,
    bearing,
    pitch: map.getTilt(),
    latitude,
    longitude
  };
}

/* eslint-enable max-statements */

/**
 * Get the current view state
 * @param map (google.maps.Map) - The parent Map instance
 * @param transformer (google.maps.CoordinateTransformer) - A CoordinateTransformer instance
 */
export function getViewPropsFromCoordinateTransformer(
  map: google.maps.Map,
  transformer: google.maps.CoordinateTransformer
) {
  const {width, height} = getMapSize(map);
  const {center, heading: bearing, tilt: pitch, zoom} = transformer.getCameraParams();

  // Match Google projection matrix
  const fovy = 25;
  const aspect = height ? width / height : 1;

  // Match depth range (crucial for correct z-sorting)
  const near = 0.75;
  const far = 300000000000000;
  // const far = Infinity;

  const projectionMatrix = new Matrix4().perspective({
    fovy: (fovy * Math.PI) / 180,
    aspect,
    near,
    far
  });
  const focalDistance = 0.5 * projectionMatrix[5];

  return {
    width,
    height,
    viewState: {
      altitude: focalDistance,
      bearing,
      latitude: center.lat(),
      longitude: center.lng(),
      pitch,
      projectionMatrix,
      repeat: true,
      zoom: zoom - 1
    }
  };
}

function getMapSize(map: google.maps.Map): {width: number; height: number} {
  // The map fills the container div unless it's in fullscreen mode
  // at which point the first child of the container is promoted
  const container = map.getDiv().firstChild as HTMLElement | null;
  return {
    // @ts-ignore (TS2531) Object is possibly 'null'
    width: container.offsetWidth,
    // @ts-ignore (TS2531) Object is possibly 'null'
    height: container.offsetHeight
  };
}

function pixelToLngLat(
  projection: google.maps.MapCanvasProjection,
  x: number,
  y: number
): [longitude: number, latitude: number] {
  const point = new google.maps.Point(x, y);
  const latLng = projection.fromContainerPixelToLatLng(point);
  // @ts-ignore (TS2531) Object is possibly 'null'
  return [latLng.lng(), latLng.lat()];
}

function getEventPixel(event, deck: Deck): {x: number; y: number} {
  if (event.pixel) {
    return event.pixel;
  }
  // event.pixel may not exist when clicking on a POI
  // https://developers.google.com/maps/documentation/javascript/reference/map#MouseEvent
  const point = deck.getViewports()[0].project([event.latLng.lng(), event.latLng.lat()]);
  return {
    x: point[0],
    y: point[1]
  };
}

// Triggers picking on a mouse event
function handleMouseEvent(deck: Deck, type: string, event) {
  const mockEvent: Record<string, any> = {
    type,
    offsetCenter: getEventPixel(event, deck),
    srcEvent: event
  };

  switch (type) {
    case 'click':
      // Hack: because we do not listen to pointer down, perform picking now
      deck._lastPointerDownInfo = deck.pickObject({
        ...mockEvent.offsetCenter,
        radius: deck.props.pickingRadius
      });
      mockEvent.tapCount = 1;
      deck._onEvent(mockEvent);
      break;

    case 'dblclick':
      mockEvent.type = 'click';
      mockEvent.tapCount = 2;
      deck._onEvent(mockEvent);
      break;

    case 'mousemove':
      mockEvent.type = 'pointermove';
      deck._onPointerMove(mockEvent);
      break;

    case 'mouseout':
      mockEvent.type = 'pointerleave';
      deck._onPointerMove(mockEvent);
      break;

    default:
      return;
  }
}
