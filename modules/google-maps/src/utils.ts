// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global google, document */
import {Deck, MapView} from '@deck.gl/core';
import {Matrix4, Vector2} from '@math.gl/core';
import type {MjolnirGestureEvent, MjolnirPointerEvent} from 'mjolnir.js';
export const POSITIONING_CONTAINER_ID = 'deck-gl-google-maps-container';
export const MAP3D_CONTAINER_ID = 'deck-gl-google-maps-3d-container';

// https://en.wikipedia.org/wiki/Web_Mercator_projection#Formulas
const MAX_LATITUDE = 85.05113;
const EARTH_CIRCUMFERENCE_METERS = 40075016.68557849;
const DEFAULT_MAP3D_FOV = 25;

type WebGLContext = WebGL2RenderingContext | WebGLRenderingContext;

type UserData = {
  _googleMap?: google.maps.Map;
  _googleMap3D?: GoogleMapsMap3DElement;
  _eventListeners: Record<string, GoogleMapsEventListener | null>;
};

type GoogleMapsEventListener = {
  remove: () => void;
};

type GoogleMapsLatLngLike =
  | google.maps.LatLng
  | {
      lat?: number | (() => number);
      lng?: number | (() => number);
      altitude?: number;
      toJSON?: () => {lat: number; lng: number; altitude?: number};
    };

export type GoogleMapsMap3DElement = HTMLElement & {
  cameraPosition?: GoogleMapsLatLngLike;
  center?: GoogleMapsLatLngLike;
  range?: number;
  heading?: number;
  tilt?: number;
  roll?: number;
  fov?: number;
};

let isMap3DContextCaptureInstalled = false;
const map3DCanvasContexts = new WeakMap<HTMLCanvasElement, WebGLContext>();
const map3DHostContexts = new WeakMap<Element, WebGLContext>();

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
    if (deck.userData._googleMap === map) {
      return deck;
    }
    // deck instance was created for a different map
    destroyDeckInstance(deck);
  }

  const eventListeners = {
    click: null,
    rightclick: null,
    dblclick: null,
    mousemove: null,
    mouseout: null
  };

  const newDeck = new Deck({
    ...props,
    // The basemap owns the shared canvas in interleaved mode; Deck only forwards the preferred DPR.
    // In non-interleaved mode this still feeds the luma canvas context that Deck creates.
    useDevicePixels: props.useDevicePixels ?? true,
    style: props.interleaved ? null : {pointerEvents: 'none'},
    parent: getContainer(overlay, props.style),
    views: new MapView({repeat: true}),
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    controller: false
  });

  // Register event listeners
  for (const eventType in eventListeners) {
    eventListeners[eventType] = map.addListener(eventType, evt =>
      handleMouseEvent(newDeck, eventType, evt)
    );
  }

  // Attach userData directly to Deck instance
  (newDeck.userData as UserData)._googleMap = map;
  (newDeck.userData as UserData)._eventListeners = eventListeners;

  return newDeck;
}

/**
 * Get a new deck instance for a Maps 3D web component.
 * This is intentionally separate from the 2D Google Maps path because Map3D
 * exposes DOM camera events instead of OverlayView/WebGLOverlayView hooks.
 */
export function createDeckInstanceForMap3D(
  map: GoogleMapsMap3DElement,
  deck: Deck | null | undefined,
  props
): Deck {
  if (deck) {
    if (deck.userData._googleMap3D === map) {
      return deck;
    }
    // deck instance was created for a different map
    destroyDeckInstance(deck);
  }

  const newDeck = new Deck({
    ...props,
    useDevicePixels: props.useDevicePixels ?? true,
    style: props.gl ? null : {pointerEvents: 'none'},
    parent: getMap3DContainer(map, props.style),
    views: new MapView({repeat: true}),
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    controller: false
  });

  const eventListeners = {
    click: addDOMEventListener(map, 'click', evt => handleMap3DEvent(newDeck, 'click', evt, map)),
    dblclick: addDOMEventListener(map, 'dblclick', evt =>
      handleMap3DEvent(newDeck, 'dblclick', evt, map)
    ),
    contextmenu: addDOMEventListener(map, 'contextmenu', evt =>
      handleMap3DEvent(newDeck, 'rightclick', evt, map)
    ),
    pointermove: addDOMEventListener(map, 'pointermove', evt =>
      handleMap3DEvent(newDeck, 'mousemove', evt, map)
    ),
    pointerleave: addDOMEventListener(map, 'pointerleave', evt =>
      handleMap3DEvent(newDeck, 'mouseout', evt, map)
    )
  };

  (newDeck.userData as UserData)._googleMap3D = map;
  (newDeck.userData as UserData)._eventListeners = eventListeners;

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

  const googleMapsContainer = (overlay.getMap() as google.maps.Map).getDiv();

  // Check if there's a pre-created positioning container (for vector maps)
  const positioningContainer = googleMapsContainer.querySelector(`#${POSITIONING_CONTAINER_ID}`);

  if (positioningContainer) {
    // Vector maps (both interleaved and non-interleaved): Use positioning container
    positioningContainer.appendChild(container);
  } else if ('getPanes' in overlay) {
    // Raster maps: Append to overlayLayer pane
    overlay.getPanes()?.overlayLayer.appendChild(container);
  }
  return container;
}

function getMap3DContainer(
  map: GoogleMapsMap3DElement,
  style?: Partial<CSSStyleDeclaration>
): HTMLElement {
  const container = document.createElement('div');
  container.id = MAP3D_CONTAINER_ID;
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  Object.assign(container.style, style);

  const parent = map.parentElement;
  if (parent) {
    const parentStyle = parent.style;
    if (!parentStyle.position) {
      parentStyle.position = 'relative';
    }
    parent.appendChild(container);
  } else {
    map.appendChild(container);
  }
  return container;
}

/**
 * Safely remove a deck instance
 * @param deck (Deck) - a previously created instances
 */
export function destroyDeckInstance(deck: Deck) {
  const {_eventListeners: eventListeners = {}} = deck.userData;

  // Unregister event listeners
  for (const eventType in eventListeners) {
    // Check that event listener was set before trying to remove.
    if (eventListeners[eventType]) {
      eventListeners[eventType].remove();
    }
  }

  deck.finalize();
}

export function isMap3DElement(map: unknown): map is GoogleMapsMap3DElement {
  if (!map || typeof map !== 'object') {
    return false;
  }

  const candidate = map as Partial<GoogleMapsMap3DElement> & {
    localName?: string;
    tagName?: string;
    constructor?: {name?: string};
  };
  const tagName = (candidate.localName || candidate.tagName || '').toLowerCase();

  return (
    tagName === 'gmp-map-3d' ||
    candidate.constructor?.name === 'Map3DElement' ||
    ('range' in candidate && 'center' in candidate && !('getRenderingType' in candidate))
  );
}

export function captureMap3DWebGLContext(map: GoogleMapsMap3DElement): WebGLContext | null {
  const hostContext = map3DHostContexts.get(map);
  if (hostContext) {
    return hostContext;
  }

  const roots = [
    map,
    (map as {shadowRoot?: ShadowRoot | null}).shadowRoot,
    (map as {renderRoot?: ParentNode | null}).renderRoot
  ].filter(Boolean) as ParentNode[];

  for (const root of roots) {
    const canvas = root.querySelector?.<HTMLCanvasElement>('canvas');
    const gl = canvas && map3DCanvasContexts.get(canvas);
    if (gl) {
      return gl;
    }
  }

  return null;
}

export function installMap3DWebGLContextCapture() {
  if (isMap3DContextCaptureInstalled || !globalThis.HTMLCanvasElement) {
    return;
  }

  isMap3DContextCaptureInstalled = true;
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function patchedGetContext(
    type: string,
    ...args: any[]
  ) {
    const context = getContext.call(this, type as any, ...args);

    if (context && (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl')) {
      const host = getMap3DCanvasHost(this);
      if (host) {
        const gl = context as WebGLContext;
        map3DCanvasContexts.set(this, gl);
        map3DHostContexts.set(host, gl);
      }
    }

    return context;
  } as typeof HTMLCanvasElement.prototype.getContext;
}

/**
 * Get the current view state from a Google Maps 3D web component.
 */
export function getViewPropsFromMap3D(map: GoogleMapsMap3DElement) {
  const {width, height} = getMap3DSize(map);
  const center = normalizeLatLng(map.center);
  const fovy = map.fov || DEFAULT_MAP3D_FOV;
  const aspect = height ? width / height : 1;
  const near = 0.75;
  const far = 300000000000000;
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
      bearing: map.heading || 0,
      latitude: center.lat,
      longitude: center.lng,
      pitch: map.tilt || 0,
      position: [0, 0, center.altitude || 0],
      projectionMatrix,
      repeat: true,
      zoom: getZoomFromMap3DCamera(map, center, height, fovy)
    }
  };
}

export function addMap3DCameraChangeListener(
  map: GoogleMapsMap3DElement,
  callback: () => void
): GoogleMapsEventListener {
  const listeners = [
    'gmp-centerchange',
    'gmp-rangechange',
    'gmp-headingchange',
    'gmp-tiltchange',
    'gmp-rollchange',
    'gmp-fovchange',
    'gmp-animationend'
  ].map(eventType => addDOMEventListener(map, eventType, callback));

  return {
    remove: () => {
      for (const listener of listeners) {
        listener.remove();
      }
    }
  };
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
  const centerLngLat = pixelToLngLat(projection, width / 2, height / 2);
  const centerH = new google.maps.LatLng(0, centerLngLat[0]);
  const centerContainerPx = projection.fromLatLngToContainerPixel(centerH);
  const centerDivPx = projection.fromLatLngToDivPixel(centerH);

  if (!topRight || !bottomLeft || !centerDivPx || !centerContainerPx) {
    return {width, height, left: 0, top: 0};
  }
  const leftOffset = Math.round(centerDivPx.x - centerContainerPx.x);
  let topOffset = centerDivPx.y - centerContainerPx.y;

  const topLngLat = pixelToLngLat(projection, width / 2, 0);
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
  topOffset = Math.round(topOffset);

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

function getMap3DSize(map: GoogleMapsMap3DElement): {width: number; height: number} {
  const rect = map.getBoundingClientRect();
  return {
    width: map.clientWidth || rect.width,
    height: map.clientHeight || rect.height
  };
}

function getMap3DCanvasHost(canvas: HTMLCanvasElement): Element | null {
  const lightDOMHost = canvas.closest?.('gmp-map-3d');
  if (lightDOMHost) {
    return lightDOMHost;
  }

  const root = canvas.getRootNode?.();
  const shadowHost = root && 'host' in root ? (root as ShadowRoot).host : null;
  return shadowHost?.localName === 'gmp-map-3d' ? shadowHost : null;
}

function getZoomFromMap3DCamera(
  map: GoogleMapsMap3DElement,
  center: {lat: number; altitude: number},
  height: number,
  fovy: number
): number {
  const cameraPosition = normalizeLatLng(map.cameraPosition);
  const cameraHeight = cameraPosition.altitude - center.altitude;
  if (cameraHeight > 0 && height) {
    const focalDistance = 0.5 / Math.tan((fovy * Math.PI) / 360);
    const metersPerWorldUnit =
      (EARTH_CIRCUMFERENCE_METERS * Math.cos((center.lat * Math.PI) / 180)) / 512;
    const scale = (focalDistance * height * metersPerWorldUnit) / cameraHeight;
    return Math.log2(scale);
  }

  return getZoomFromMap3DRange(map, center.lat, height, fovy);
}

function getZoomFromMap3DRange(
  map: GoogleMapsMap3DElement,
  latitude: number,
  height: number,
  fovy: number
): number {
  const range = map.range || 0;
  if (!range || !height) {
    return 1;
  }

  const visibleMeters = 2 * range * Math.tan((fovy * Math.PI) / 360);
  const metersPerPixel = visibleMeters / height;
  const metersPerPixelAtZoom0 =
    (EARTH_CIRCUMFERENCE_METERS * Math.cos((latitude * Math.PI) / 180)) / 256;

  return Math.log2(metersPerPixelAtZoom0 / metersPerPixel);
}

function normalizeLatLng(center?: GoogleMapsLatLngLike): {
  lat: number;
  lng: number;
  altitude: number;
} {
  if (!center) {
    return {lat: 0, lng: 0, altitude: 0};
  }

  const value = 'toJSON' in center && center.toJSON ? center.toJSON() : center;
  const lat = typeof value.lat === 'function' ? value.lat() : value.lat;
  const lng = typeof value.lng === 'function' ? value.lng() : value.lng;

  return {
    lat: lat || 0,
    lng: lng || 0,
    altitude: value.altitude || 0
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

function getDOMEventPixel(
  event: Event | google.maps.MapMouseEvent,
  map: GoogleMapsMap3DElement
): {x: number; y: number} {
  if ('pixel' in event && event.pixel) {
    return event.pixel as {x: number; y: number};
  }

  const srcEvent = ('srcEvent' in event ? event.srcEvent : event) as MouseEvent;
  const rect = map.getBoundingClientRect();
  return {
    x: srcEvent.clientX - rect.left,
    y: srcEvent.clientY - rect.top
  };
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

function addDOMEventListener(
  target: EventTarget,
  eventType: string,
  callback: (event: Event) => void
): GoogleMapsEventListener {
  target.addEventListener(eventType, callback);
  return {
    remove: () => target.removeEventListener(eventType, callback)
  };
}

// Triggers picking on a mouse event
function handleMouseEvent(deck: Deck, type: string, event) {
  if (!deck.isInitialized) {
    return;
  }

  const mockEvent: Record<string, any> = {
    type,
    offsetCenter: getEventPixel(event, deck),
    srcEvent: event
  };

  switch (type) {
    case 'click':
    case 'rightclick':
      mockEvent.type = 'click';
      mockEvent.tapCount = 1;
      // Hack: because we do not listen to pointer down, perform picking now
      deck._onPointerDown(mockEvent as MjolnirPointerEvent);
      deck._onEvent(mockEvent as MjolnirGestureEvent);
      break;

    case 'dblclick':
      mockEvent.type = 'click';
      mockEvent.tapCount = 2;
      deck._onEvent(mockEvent as MjolnirGestureEvent);
      break;

    case 'mousemove':
      mockEvent.type = 'pointermove';
      deck._onPointerMove(mockEvent as MjolnirPointerEvent);
      break;

    case 'mouseout':
      mockEvent.type = 'pointerleave';
      deck._onPointerMove(mockEvent as MjolnirPointerEvent);
      break;

    default:
      return;
  }
}

function handleMap3DEvent(
  deck: Deck,
  type: string,
  event: Event | google.maps.MapMouseEvent,
  map: GoogleMapsMap3DElement
) {
  if (!deck.isInitialized) {
    return;
  }

  const mockEvent: Record<string, any> = {
    type,
    offsetCenter: getDOMEventPixel(event, map),
    srcEvent: event
  };

  switch (type) {
    case 'click':
    case 'rightclick':
      mockEvent.type = 'click';
      mockEvent.tapCount = 1;
      deck._onPointerDown(mockEvent as MjolnirPointerEvent);
      deck._onEvent(mockEvent as MjolnirGestureEvent);
      break;

    case 'dblclick':
      mockEvent.type = 'click';
      mockEvent.tapCount = 2;
      deck._onEvent(mockEvent as MjolnirGestureEvent);
      break;

    case 'mousemove':
      mockEvent.type = 'pointermove';
      deck._onPointerMove(mockEvent as MjolnirPointerEvent);
      break;

    case 'mouseout':
      mockEvent.type = 'pointerleave';
      deck._onPointerMove(mockEvent as MjolnirPointerEvent);
      break;

    default:
      return;
  }
}
