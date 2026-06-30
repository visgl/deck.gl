// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document, window */
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {PathLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';
import {createNativeMap3DEditor} from './map3d-native-editor';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAP_ID = process.env.GoogleMapsMapId; // eslint-disable-line

const INITIAL_PATH = [
  {lng: -73.98513, lat: 40.7589, altitude: 0},
  {lng: -73.98468, lat: 40.76032, altitude: 0},
  {lng: -73.98385, lat: 40.76179, altitude: 0},
  {lng: -73.98258, lat: 40.76292, altitude: 0},
  {lng: -73.98123, lat: 40.76407, altitude: 0},
  {lng: -73.98004, lat: 40.76542, altitude: 0},
  {lng: -73.97868, lat: 40.76671, altitude: 0},
  {lng: -73.9772, lat: 40.76802, altitude: 0}
];

const INITIAL_POLYGON = [
  {lng: -73.98466, lat: 40.76233, altitude: 0},
  {lng: -73.98265, lat: 40.7636, altitude: 0},
  {lng: -73.98172, lat: 40.76251, altitude: 0},
  {lng: -73.98343, lat: 40.7614, altitude: 0}
];

const INITIAL_POINTS = [
  {lng: -73.98513, lat: 40.7589, altitude: 0},
  {lng: -73.9772, lat: 40.76802, altitude: 0}
];

const demoState = {
  deckDepthMode: 'screen',
  editorState: {
    mode: 'path',
    path: INITIAL_PATH,
    points: INITIAL_POINTS,
    polygon: INITIAL_POLYGON,
    selected: null
  },
  message: '',
  showDeckDebug: true
};
const DECK_DEBUG_COLORS = {
  mesh: {
    fill: [255, 245, 0, 245],
    path: [255, 245, 0, 220],
    textBackground: [92, 58, 0, 230]
  },
  screen: {
    fill: [24, 255, 116, 245],
    path: [24, 255, 116, 220],
    textBackground: [12, 80, 38, 230]
  }
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
    map3DDepthMode: demoState.deckDepthMode,
    layers: makeLayers(demoState)
  });

  const maps3d = await loadMaps3D();
  const {Map3DElement, MapMode} = maps3d;

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
  overlay.setProps({layers: makeLayers(demoState)});

  const editor = createNativeMap3DEditor({
    map,
    maps3d,
    path: INITIAL_PATH,
    points: INITIAL_POINTS,
    polygon: INITIAL_POLYGON,
    onChange: editorState => {
      demoState.editorState = editorState;
      setDeckLayers(overlay);
      updatePanel(panel, map, overlay);
    }
  });

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

  const removePanelActions = bindPanelActions(panel, map, overlay, editor);

  return {
    remove: () => {
      removePanelActions();
      editor.destroy();
      overlay.finalize();
    }
  };
}

function bindPanelActions(panel, map, overlay, editor) {
  panel.querySelector('[data-action="spin"]').addEventListener('click', () => {
    map.heading = ((map.heading || 0) + 45) % 360;
  });
  panel.querySelector('[data-action="lower"]').addEventListener('click', () => {
    map.range = Math.max(350, (map.range || 1450) * 0.75);
  });
  panel.querySelector('[data-action="raise"]').addEventListener('click', () => {
    map.range = Math.min(4000, (map.range || 1450) * 1.3);
  });
  panel.querySelector('[data-action="toggle-deck"]').addEventListener('click', () => {
    demoState.showDeckDebug = !demoState.showDeckDebug;
    setDeckLayers(overlay);
    updateDeckButtons(panel);
    updatePanel(panel, map, overlay);
  });
  panel.querySelector('[data-action="toggle-deck-depth"]').addEventListener('click', () => {
    demoState.deckDepthMode = demoState.deckDepthMode === 'screen' ? 'mesh' : 'screen';
    overlay.setProps({
      map3DDepthMode: demoState.deckDepthMode,
      layers: makeLayers(demoState)
    });
    updateDeckButtons(panel);
    updatePanel(panel, map, overlay);
  });
  for (const modeButton of panel.querySelectorAll('[data-mode]')) {
    modeButton.addEventListener('click', () => {
      editor.setMode(modeButton.dataset.mode);
      updateModeButtons(panel);
    });
  }
  panel.querySelector('[data-action="delete"]').addEventListener('click', () => {
    demoState.message = editor.deleteSelected()
      ? 'Deleted selected vertex'
      : 'Select a handle first';
    updatePanel(panel, map, overlay);
  });
  panel.querySelector('[data-action="move"]').addEventListener('click', () => {
    demoState.message = editor.moveSelectedToNextClick()
      ? 'Click the map to move selected vertex'
      : 'Select a handle first';
    updatePanel(panel, map, overlay);
  });
  panel.querySelector('[data-action="undo"]').addEventListener('click', () => {
    demoState.message = editor.undoLast() ? 'Removed last active-mode point' : 'Nothing to undo';
    updatePanel(panel, map, overlay);
  });
  panel.querySelector('[data-action="reset"]').addEventListener('click', () => {
    editor.reset();
    demoState.message = 'Editor reset';
    updatePanel(panel, map, overlay);
  });
  panel.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    const geojson = await editor.copyGeoJSON();
    demoState.message = `GeoJSON ready (${geojson.length} chars)`;
    updatePanel(panel, map, overlay);
  });

  const onKeyDown = event => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (editor.deleteSelected()) {
        event.preventDefault();
      }
    }
  };
  window.addEventListener('keydown', onKeyDown);
  updateModeButtons(panel);
  updateDeckButtons(panel);

  return () => window.removeEventListener('keydown', onKeyDown);
}

function makeLayers({deckDepthMode, editorState, showDeckDebug}) {
  if (!showDeckDebug) {
    return [];
  }

  const path = editorState.path.map(toDeckPosition);
  const colors = DECK_DEBUG_COLORS[deckDepthMode];
  const parameters = getDeckDebugParameters(deckDepthMode);
  const points = [
    {name: 'Deck Start', position: path[0]},
    {name: 'Deck Finish', position: path[path.length - 1]}
  ].filter(point => point.position);

  return [
    new PathLayer({
      id: 'deck-route',
      data: [{path}],
      parameters,
      getPath: d => d.path,
      getColor: colors.path,
      getWidth: 9,
      widthUnits: 'pixels',
      capRounded: true,
      jointRounded: true,
      pickable: true
    }),
    new ScatterplotLayer({
      id: 'deck-route-points',
      data: points,
      parameters,
      getPosition: d => d.position,
      getRadius: 20,
      radiusUnits: 'pixels',
      getFillColor: colors.fill,
      getLineColor: [15, 23, 42, 255],
      getLineWidth: 4,
      lineWidthUnits: 'pixels',
      stroked: true,
      pickable: true
    }),
    new TextLayer({
      id: 'deck-labels',
      data: points,
      parameters,
      getPosition: d => d.position,
      getText: d => d.name,
      getSize: 14,
      getColor: [255, 255, 255, 255],
      getPixelOffset: [0, -30],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      background: true,
      getBackgroundColor: colors.textBackground,
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
      <button type="button" data-mode="path">Path</button>
      <button type="button" data-mode="polygon">Polygon</button>
      <button type="button" data-mode="point">Point</button>
    </div>
    <div class="toolbar">
      <button type="button" data-action="delete">Delete</button>
      <button type="button" data-action="move">Move Selected</button>
      <button type="button" data-action="undo">Undo</button>
      <button type="button" data-action="reset">Reset</button>
      <button type="button" data-action="copy">Copy GeoJSON</button>
    </div>
    <div class="toolbar">
      <button type="button" data-action="spin">Rotate</button>
      <button type="button" data-action="lower">Closer</button>
      <button type="button" data-action="raise">Higher</button>
      <button type="button" data-action="toggle-deck">Show Deck Debug</button>
      <button type="button" data-action="toggle-deck-depth">Deck: Screen</button>
    </div>
  `;
  return panel;
}

function updatePanel(panel, map, overlay, extra = '') {
  const center = normalizeCenter(map.center);
  const {deckDepthMode, editorState, showDeckDebug} = demoState;
  const renderMode = overlay._map3DGL ? 'shared WebGL captured' : 'DOM overlay fallback';
  const selected = editorState.selected
    ? `${editorState.selected.type} ${editorState.selected.index + 1}`
    : 'none';
  const moveStatus = editorState.moveSelectedOnNextClick ? ', move armed' : '';
  panel.querySelector('[data-status]').innerHTML = `
    <div><code>${renderMode}</code></div>
    <div>${getGeometryStatus(deckDepthMode, overlay, showDeckDebug)}</div>
    <div>mode ${editorState.mode}, path ${editorState.path.length}, polygon ${editorState.polygon.length}, points ${editorState.points.length}</div>
    <div>selected ${selected}${moveStatus}</div>
    <div>lat ${center.lat.toFixed(5)}, lng ${center.lng.toFixed(5)}</div>
    <div>range ${Math.round(map.range || 0)}m, heading ${Math.round(map.heading || 0)} deg, tilt ${Math.round(map.tilt || 0)} deg</div>
    ${demoState.message ? `<div>${demoState.message}</div>` : ''}
    <div>If Google shows "Oops", allow this origin in the Maps key referrers.</div>
    ${extra ? `<div>${extra}</div>` : ''}
  `;
}

function updateModeButtons(panel) {
  for (const modeButton of panel.querySelectorAll('[data-mode]')) {
    modeButton.classList.toggle('active', modeButton.dataset.mode === demoState.editorState.mode);
  }
}

function updateDeckButtons(panel) {
  const toggleDeckButton = panel.querySelector('[data-action="toggle-deck"]');
  const toggleDepthButton = panel.querySelector('[data-action="toggle-deck-depth"]');
  toggleDeckButton.textContent = demoState.showDeckDebug ? 'Hide Deck Debug' : 'Show Deck Debug';
  toggleDepthButton.textContent = `Deck: ${getDeckDepthLabel(demoState.deckDepthMode)}`;
  toggleDepthButton.classList.toggle('active', demoState.deckDepthMode === 'mesh');
}

function getDeckDebugParameters(deckDepthMode) {
  return deckDepthMode === 'mesh'
    ? {depthMask: false, depthTest: true}
    : {depthMask: false, depthTest: false};
}

function getDeckDepthLabel(deckDepthMode) {
  return deckDepthMode === 'mesh' ? 'Mesh Depth' : 'Screen';
}

function getDeckDepthStatus(deckDepthMode, overlay) {
  if (deckDepthMode === 'mesh') {
    return overlay._map3DGL
      ? 'deck mesh-depth debug'
      : 'deck mesh-depth requested, using aligned canvas fallback';
  }
  return overlay._map3DGL ? 'deck screen debug' : 'aligned deck canvas fallback';
}

function getGeometryStatus(deckDepthMode, overlay, showDeckDebug) {
  if (showDeckDebug) {
    return `native editor + ${getDeckDepthStatus(deckDepthMode, overlay)}`;
  }

  return `native editor locked to Map3D surface${
    overlay._map3DGL ? '' : ', Deck diagnostic hidden'
  }`;
}

function setDeckLayers(overlay) {
  overlay.setProps({layers: makeLayers(demoState)});
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

function toDeckPosition({lng, lat, altitude = 0}) {
  return [lng, lat, altitude];
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
