// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

const NY_DISTRICTS_DATA =
  'https://raw.githubusercontent.com/nycehs/NYC_geography/master/CD.geo.json';

// Colors for the 5 boroughs
const BOROUGH_COLORS = {
  Manhattan: [255, 100, 100, 160],
  Bronx: [100, 255, 100, 160],
  Brooklyn: [100, 100, 255, 160],
  Queens: [255, 200, 50, 160],
  'Staten Island': [200, 100, 255, 160]
};

const INITIAL_VIEW_STATE = {
  latitude: 40.7128,
  longitude: -74.006,
  zoom: 12,
  bearing: 0,
  pitch: 60,
  position: [0, 0, 0] // Keep camera at ground level
};

// Track rotation pivot for visual feedback
let rotationPivotPosition = null;
let currentRotationPivot = '3d';

const deck = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: {rotationPivot: currentRotationPivot},
  onInteractionStateChange: state => {
    rotationPivotPosition = state.rotationPivotPosition || null;
    updateLayers();
  },
  onClick: info => {
    console.log('=== CLICK INFO ===');
    console.log('picked:', info.picked);
    console.log('coordinate:', info.coordinate);
    console.log('object:', info.object);
    console.log('layer:', info.layer?.id);

    if (info.picked && info.coordinate && info.coordinate.length === 3) {
      console.log('3D coordinate - altitude:', info.coordinate[2], 'meters');
    }
  },
  getTooltip: info => {
    //if (info.object?.properties) {
    //  const {GEONAME, BOROUGH} = info.object.properties;
    //  return {
    //    html: `<div style="background: rgba(0, 0, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-family: monospace;">
    //      <b>${GEONAME}</b><br/>${BOROUGH}
    //    </div>`,
    //    style: {padding: '0'}
    //  };
    //}
    if (info.picked && info.coordinate && info.coordinate.length === 3) {
      const altitude = info.coordinate[2];
      return {
        html: `<div style="background: rgba(0, 0, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-family: monospace;">
          Altitude: ${altitude.toFixed(1)} m
        </div>`,
        style: {padding: '0'}
      };
    }
    return null;
  },
  layers: []
});

// Export for debugging
window.deck = deck;

// Add toggle controls
const controls = document.createElement('div');
controls.style.position = 'absolute';
controls.style.top = '10px';
controls.style.left = '10px';
controls.style.zIndex = '1000';
controls.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
controls.style.padding = '10px';
controls.style.borderRadius = '4px';
controls.style.fontFamily = 'monospace';
controls.style.color = 'white';

const tilesToggle = document.createElement('button');
tilesToggle.textContent = 'Hide 3D Tiles';
tilesToggle.style.marginRight = '10px';
tilesToggle.style.padding = '5px 10px';
tilesToggle.style.cursor = 'pointer';

const districtsToggle = document.createElement('button');
districtsToggle.textContent = 'Hide Districts';
districtsToggle.style.padding = '5px 10px';
districtsToggle.style.cursor = 'pointer';

// Add rotation pivot mode selector
const pivotLabel = document.createElement('div');
pivotLabel.textContent = 'Rotation Pivot:';
pivotLabel.style.marginTop = '10px';
pivotLabel.style.marginBottom = '5px';

const pivotOptions = document.createElement('div');
pivotOptions.style.display = 'flex';
pivotOptions.style.flexDirection = 'column';
pivotOptions.style.gap = '5px';

['center', '2d', '3d'].forEach(mode => {
  const label = document.createElement('label');
  label.style.cursor = 'pointer';
  label.style.display = 'flex';
  label.style.alignItems = 'center';
  label.style.gap = '5px';

  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'rotationPivot';
  radio.value = mode;
  radio.checked = mode === currentRotationPivot;
  radio.onchange = () => {
    currentRotationPivot = mode;
    deck.setProps({
      controller: {rotationPivot: mode}
    });
  };

  const text = document.createElement('span');
  text.textContent =
    mode === 'center'
      ? 'Center (default)'
      : mode === '2d'
        ? '2D (ground level)'
        : '3D (picked altitude)';

  label.appendChild(radio);
  label.appendChild(text);
  pivotOptions.appendChild(label);
});

controls.appendChild(tilesToggle);
controls.appendChild(districtsToggle);
controls.appendChild(pivotLabel);
controls.appendChild(pivotOptions);
document.body.appendChild(controls);

let tilesVisible = true;
let districtsVisible = true;

tilesToggle.onclick = () => {
  tilesVisible = !tilesVisible;
  tilesToggle.textContent = tilesVisible ? 'Hide 3D Tiles' : 'Show 3D Tiles';
  updateLayers();
};

districtsToggle.onclick = () => {
  districtsVisible = !districtsVisible;
  districtsToggle.textContent = districtsVisible ? 'Hide Districts' : 'Show Districts';
  updateLayers();
};

function updateLayers() {
  const layers = [
    new Tile3DLayer({
      id: 'google-3d-tiles',
      data: TILESET_URL,
      pickable: '3d',
      visible: tilesVisible,
      onTilesetLoad: tileset3d => {
        tileset3d.options.onTraversalComplete = selectedTiles => {
          return selectedTiles;
        };
      },
      loadOptions: {
        fetch: {headers: {'X-GOOG-API-KEY': GOOGLE_MAPS_API_KEY}}
      },
      operation: 'terrain+draw'
    }),
    new GeoJsonLayer({
      id: 'ny-districts',
      data: NY_DISTRICTS_DATA,
      visible: districtsVisible,
      extensions: [new TerrainExtension()],
      stroked: true,
      filled: true,
      getFillColor: ({properties}) => BOROUGH_COLORS[properties.BOROUGH] || [200, 200, 200, 160],
      getLineColor: [255, 255, 255, 200],
      getLineWidth: 50,
      pickable: true,
      opacity: 0.6
    })
  ];

  // Add rotation pivot indicator when rotating
  if (rotationPivotPosition) {
    layers.push(
      new ScatterplotLayer({
        id: 'rotation-pivot',
        data: [rotationPivotPosition],
        getPosition: d => d,
        getRadius: 8,
        radiusUnits: 'pixels',
        getLineColor: [255, 255, 255, 180],
        getLineWidth: 1,
        lineWidthUnits: 'pixels',
        stroked: true,
        filled: false,
        billboard: true,
        parameters: {depthWriteEnabled: false, depthCompare: 'always'}
      })
    );
  }

  deck.setProps({layers});
}

updateLayers();
