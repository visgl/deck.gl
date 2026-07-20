// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document, localStorage */

import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer, ColumnLayer, BitmapLayer, PathLayer} from '@deck.gl/layers';
import {ResetViewWidget as _ResetViewWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';
// source: https://commons.wikimedia.org/wiki/File:PathfinderMap_hires_(4996917742).jpg
const WORLD_MAP = './map.jpg';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  minZoom: 1,
  zoom: 1
};

const ZOOM_AROUND_STORAGE_KEY = 'deckgl-test-app-globe-zoom-around';

let currentViewState = {...INITIAL_VIEW_STATE};
let zoomAround = getInitialZoomAround();

const GRATICULES = getGraticules(30);

export const deck = new Deck({
  views: new GlobeView(),
  initialViewState: INITIAL_VIEW_STATE,
  controller: {inertia: 500, zoomAround},
  parameters: {
    cull: true
  },
  layers: [
    new BitmapLayer({
      id: 'base-map-raster',
      image: WORLD_MAP,
      bounds: [-180, -90, 180, 90]
    }),
    new PathLayer({
      id: 'graticules',
      data: GRATICULES,
      getPath: d => d,
      widthMinPixels: 1,
      getColor: [128, 128, 128]
    }),
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      // Styles
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    }),
    new ColumnLayer({
      id: 'airports-extruded',
      data: AIR_PORTS,
      dataTransform: geojson => geojson.features,
      // Styles
      radius: 10000,
      extruded: true,
      getPosition: f => f.geometry.coordinates,
      getElevation: f => f.properties.scalerank * 100000,
      getFillColor: [200, 0, 80, 180]
    }),
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: info =>
        // eslint-disable-next-line
        info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ]
});

function getGraticules(resolution) {
  const graticules = [];
  for (let lat = 0; lat < 90; lat += resolution) {
    const path1 = [];
    const path2 = [];
    for (let lon = -180; lon <= 180; lon += 90) {
      path1.push([lon, lat]);
      path2.push([lon, -lat]);
    }
    graticules.push(path1);
    graticules.push(path2);
  }
  for (let lon = -180; lon < 180; lon += resolution) {
    const path = [];
    for (let lat = -90; lat <= 90; lat += 90) {
      path.push([lon, lat]);
    }
    graticules.push(path);
  }
  return graticules;
}

// For automated test cases
document.body.style.margin = '0px';

// Debug overlay
const overlay = document.createElement('div');
Object.assign(overlay.style, {
  position: 'fixed',
  top: '10px',
  left: '10px',
  background: 'rgba(0,0,0,0.7)',
  color: '#fff',
  padding: '8px 12px',
  fontFamily: 'monospace',
  fontSize: '13px',
  borderRadius: '4px',
  zIndex: '1000',
  pointerEvents: 'none',
  lineHeight: '1.6',
  whiteSpace: 'pre'
});
document.body.appendChild(overlay);

const controls = document.createElement('div');
controls.innerHTML = `
  <div class="label">Zoom anchor</div>
  <div class="button-row" role="group" aria-label="Zoom anchor">
    <button type="button" data-zoom-around="center" aria-pressed="true">Center</button>
    <button type="button" data-zoom-around="pointer" aria-pressed="false">Pointer</button>
  </div>
  <div class="button-row" role="group" aria-label="View presets">
    <button type="button" data-view-preset="reset">Reset</button>
    <button type="button" data-view-preset="high-zoom">Zoom 13</button>
  </div>
`;
Object.assign(controls.style, {
  position: 'fixed',
  top: '10px',
  right: '10px',
  background: 'rgba(0,0,0,0.72)',
  color: '#fff',
  padding: '10px',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  borderRadius: '4px',
  zIndex: '1000',
  lineHeight: '1.4'
});
for (const row of controls.querySelectorAll('.button-row')) {
  Object.assign(row.style, {
    display: 'flex',
    gap: '6px',
    marginTop: '6px'
  });
}
for (const button of controls.querySelectorAll('button')) {
  Object.assign(button.style, {
    padding: '5px 8px',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    cursor: 'pointer'
  });
}
document.body.appendChild(controls);

function updateOverlay(vs) {
  const {longitude = 0, latitude = 0, zoom = 0, bearing = 0, pitch = 0} = vs;
  overlay.textContent =
    `lat: ${latitude.toFixed(2)}  lng: ${longitude.toFixed(2)}\n` +
    `zoom: ${zoom.toFixed(2)}  bearing: ${bearing.toFixed(2)}  pitch: ${pitch.toFixed(2)}\n` +
    `zoomAround: ${zoomAround}`;
}
updateOverlay(INITIAL_VIEW_STATE);

function setViewState(nextViewState) {
  currentViewState = {...currentViewState, ...nextViewState};
  deck.setProps({viewState: currentViewState});
  updateOverlay(currentViewState);
}

function setZoomAround(nextZoomAround) {
  if (!isZoomAroundMode(nextZoomAround)) {
    return;
  }
  zoomAround = nextZoomAround;
  deck.setProps({controller: {inertia: 500, zoomAround}});
  try {
    localStorage.setItem(ZOOM_AROUND_STORAGE_KEY, zoomAround);
  } catch {
    // Ignore storage failures in sandboxed test apps.
  }
  for (const button of controls.querySelectorAll('[data-zoom-around]')) {
    button.setAttribute('aria-pressed', String(button.dataset.zoomAround === zoomAround));
    button.style.background =
      button.dataset.zoomAround === zoomAround ? 'rgba(70,120,255,0.85)' : 'rgba(255,255,255,0.12)';
  }
  updateOverlay(currentViewState);
}

function isZoomAroundMode(value) {
  return value === 'center' || value === 'pointer';
}

function getInitialZoomAround() {
  try {
    const storedZoomAround = localStorage.getItem(ZOOM_AROUND_STORAGE_KEY);
    return isZoomAroundMode(storedZoomAround) ? storedZoomAround : 'center';
  } catch {
    return 'center';
  }
}

controls.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }
  if (button.dataset.zoomAround) {
    setZoomAround(button.dataset.zoomAround);
  } else if (button.dataset.viewPreset === 'reset') {
    setViewState(INITIAL_VIEW_STATE);
  } else if (button.dataset.viewPreset === 'high-zoom') {
    setViewState({...currentViewState, zoom: 13});
  }
});
setZoomAround(zoomAround);

deck.setProps({
  widgets: [
    new _ResetViewWidget({
      placement: 'bottom-right',
      initialViewState: {...INITIAL_VIEW_STATE, transitionDuration: 300}
    })
  ],
  onViewStateChange: ({viewState}) => {
    setViewState(viewState);
  }
});
