// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document, window */
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {PathLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAP_ID = process.env.GoogleMapsMapId; // eslint-disable-line

const ROUTE = [
  [-73.98513, 40.7589, 0],
  [-73.98468, 40.76032, 0],
  [-73.98385, 40.76179, 0],
  [-73.98258, 40.76292, 0],
  [-73.98123, 40.76407, 0],
  [-73.98004, 40.76542, 0],
  [-73.97868, 40.76671, 0],
  [-73.9772, 40.76802, 0]
];

const POINTS = [
  {name: 'Times Sq', position: ROUTE[0]},
  {name: 'Finish', position: ROUTE[ROUTE.length - 1]}
];

const demoState = {
  showDeckDebug: false
};

export async function renderToDOM(container) {
  if (!GOOGLE_MAPS_API_KEY) {
    renderError(container, 'Missing GoogleMapsAPIKey. Set it before starting Vite.');
    return {remove: () => {}};
  }

  window.gm_authFailure = () => {
    renderError(
      container,
      'Google Maps rejected this API key for the standalone dev origin. Allow http://127.0.0.1:5173/* in the key referrers, then reload.'
    );
  };

  container.style.position = 'relative';
  const panel = createPanel();
  container.appendChild(panel);

  const overlay = new GoogleMapsOverlay({
    interleaved: true,
    layers: makeLayers(demoState)
  });

  const {Map3DElement, MapMode, AltitudeMode, Polyline3DElement} = await loadMaps3D();

  const map = new Map3DElement({
    center: {lat: 40.7631, lng: -73.9817, altitude: 0},
    range: 1450,
    tilt: 66,
    heading: 32,
    fov: 45,
    mode: MapMode.SATELLITE,
    defaultUIHidden: false,
    ...(GOOGLE_MAP_ID && {mapId: GOOGLE_MAP_ID})
  });

  map.addEventListener('gmp-error', event => {
    renderError(container, `Map3D error: ${event.error?.message || event.type}`);
  });
  map.addEventListener('gmp-map-id-error', event => {
    updatePanel(panel, map, overlay, `Map ID warning: ${event.type}`);
  });

  container.appendChild(map);
  overlay.setMap(map);

  const nativeRoute = new Polyline3DElement({
    altitudeMode: AltitudeMode.CLAMP_TO_GROUND,
    strokeColor: '#ff7a00',
    strokeWidth: 8,
    outerColor: '#111827',
    outerWidth: 0.6
  });
  nativeRoute.setAttribute(
    'path',
    ROUTE.map(([lng, lat, altitude]) => `${lat},${lng},${altitude}`).join(' ')
  );
  map.appendChild(nativeRoute);

  const onCameraChange = () => updatePanel(panel, map, overlay);
  for (const eventName of [
    'gmp-centerchange',
    'gmp-rangechange',
    'gmp-headingchange',
    'gmp-tiltchange',
    'gmp-fovchange',
    'gmp-steadychange'
  ]) {
    map.addEventListener(eventName, onCameraChange);
  }
  updatePanel(panel, map, overlay);

  bindPanelActions(panel, map, overlay);

  return {
    remove: () => overlay.finalize()
  };
}

function bindPanelActions(panel, map, overlay) {
  panel.querySelector('[data-action="spin"]').addEventListener('click', () => {
    map.heading = ((map.heading || 0) + 45) % 360;
  });
  panel.querySelector('[data-action="lower"]').addEventListener('click', () => {
    map.range = Math.max(350, (map.range || 1450) * 0.75);
  });
  panel.querySelector('[data-action="raise"]').addEventListener('click', () => {
    map.range = Math.min(4000, (map.range || 1450) * 1.3);
  });
  panel.querySelector('[data-action="toggle-deck"]').addEventListener('click', event => {
    demoState.showDeckDebug = !demoState.showDeckDebug;
    event.currentTarget.textContent = demoState.showDeckDebug
      ? 'Hide Deck Debug'
      : 'Show Deck Debug';
    overlay.setProps({layers: makeLayers(demoState)});
    updatePanel(panel, map, overlay);
  });
}

function makeLayers({showDeckDebug}) {
  if (!showDeckDebug) {
    return [];
  }

  return [
    new PathLayer({
      id: 'deck-route',
      data: [{path: ROUTE}],
      getPath: d => d.path,
      getColor: [0, 210, 255, 190],
      getWidth: 5,
      widthUnits: 'pixels',
      capRounded: true,
      jointRounded: true,
      pickable: true
    }),
    new ScatterplotLayer({
      id: 'deck-route-points',
      data: POINTS,
      getPosition: d => d.position,
      getRadius: 16,
      radiusUnits: 'pixels',
      getFillColor: [255, 255, 255, 240],
      getLineColor: [0, 210, 255, 255],
      getLineWidth: 3,
      lineWidthUnits: 'pixels',
      stroked: true,
      pickable: true
    }),
    new TextLayer({
      id: 'deck-labels',
      data: POINTS,
      getPosition: d => d.position,
      getText: d => d.name,
      getSize: 14,
      getColor: [255, 255, 255, 255],
      getPixelOffset: [0, -30],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      background: true,
      getBackgroundColor: [15, 23, 42, 220],
      backgroundPadding: [5, 3]
    })
  ];
}

function createPanel() {
  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = `
    <strong>Map3D + GoogleMapsOverlay prototype</strong>
    <div data-status>Booting...</div>
    <div class="toolbar">
      <button type="button" data-action="spin">Rotate</button>
      <button type="button" data-action="lower">Closer</button>
      <button type="button" data-action="raise">Higher</button>
      <button type="button" data-action="toggle-deck">Show Deck Debug</button>
    </div>
  `;
  return panel;
}

function updatePanel(panel, map, overlay, extra = '') {
  const center = normalizeCenter(map.center);
  const renderMode = overlay._map3DGL ? 'shared WebGL captured' : 'DOM overlay fallback';
  const geometryMode = demoState.showDeckDebug
    ? 'native route + approximate deck debug'
    : 'native route locked to Map3D surface';
  panel.querySelector('[data-status]').innerHTML = `
    <div><code>${renderMode}</code></div>
    <div>${geometryMode}</div>
    <div>lat ${center.lat.toFixed(5)}, lng ${center.lng.toFixed(5)}</div>
    <div>range ${Math.round(map.range || 0)}m, heading ${Math.round(map.heading || 0)} deg, tilt ${Math.round(map.tilt || 0)} deg</div>
    <div>If Google shows "Oops", allow this origin in the Maps key referrers.</div>
    ${extra ? `<div>${extra}</div>` : ''}
  `;
}

function normalizeCenter(center) {
  if (!center) {
    return {lat: 0, lng: 0};
  }
  const value = typeof center.toJSON === 'function' ? center.toJSON() : center;
  return {
    lat: Number(value.lat || 0),
    lng: Number(value.lng || 0)
  };
}

async function loadMaps3D() {
  if (!window.google?.maps?.importLibrary) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=alpha&libraries=maps3d`;
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load Google Maps JavaScript API'));
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }
  return window.google.maps.importLibrary('maps3d');
}

function renderError(container, message) {
  container.innerHTML = `<div class="error">${message}</div>`;
}
