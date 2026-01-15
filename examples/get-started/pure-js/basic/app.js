// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {ScatterplotLayer} from '@deck.gl/layers';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';
const AIRPLANE_MODEL_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';

// NYC area airports
const AIRPORTS = [
  {name: 'JFK', coordinates: [-73.7781, 40.6413]},
  {name: 'LaGuardia', coordinates: [-73.874, 40.7769]},
  {name: 'Newark', coordinates: [-74.1745, 40.6895]},
  {name: 'Teterboro', coordinates: [-74.0608, 40.8501]},
  {name: 'Westchester County', coordinates: [-73.7076, 41.067]}
];

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
let currentRotatePivot = '3d';

const deck = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: {rotatePivot: currentRotatePivot},
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
    if (info.picked && info.coordinate && info.coordinate.length === 3) {
      const altitude = info.coordinate[2];
      return {
        html: `<div style="background: rgba(0, 0, 0, 0.8); color: white; padding: 8px 12px; border-radius: 4px; font-family: monospace;">
          Altitude: ${altitude.toFixed(1)} m
        </div>`,
        style: {
          padding: '0'
        }
      };
    }
    return null;
  },
  layers: [
    new Tile3DLayer({
      id: 'google-3d-tiles',
      data: TILESET_URL,
      pickable: '3d',
      onTilesetLoad: tileset3d => {
        tileset3d.options.onTraversalComplete = selectedTiles => {
          return selectedTiles;
          const uniqueCredits = new Set();
          selectedTiles.forEach(tile => {
            const {copyright} = tile.content.gltf.asset;
            copyright.split(';').forEach(uniqueCredits.add, uniqueCredits);
          });
          const creditsText = [...uniqueCredits].join('; ');
          // Display credits in console
          return selectedTiles;
        };
      },
      loadOptions: {
        fetch: {headers: {'X-GOOG-API-KEY': GOOGLE_MAPS_API_KEY}}
      },
      operation: 'terrain+draw'
    }),
    new ScenegraphLayer({
      id: 'airports',
      data: AIRPORTS,
      pickable: true,
      scenegraph: AIRPLANE_MODEL_URL,
      sizeScale: 10,
      sizeMinPixels: 2,
      sizeMaxPixels: 50,
      _animations: {
        '*': {speed: 1}
      },
      getPosition: d => [...d.coordinates, 2000],
      getOrientation: d => [0, 0, 90], // pitch, yaw, roll
      getScale: [1, 1, 1],
      _lighting: 'pbr'
    })
  ]
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

const airportsToggle = document.createElement('button');
airportsToggle.textContent = 'Hide Planes';
airportsToggle.style.padding = '5px 10px';
airportsToggle.style.cursor = 'pointer';

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
  radio.name = 'rotatePivot';
  radio.value = mode;
  radio.checked = mode === currentRotatePivot;
  radio.onchange = () => {
    currentRotatePivot = mode;
    deck.setProps({
      controller: {rotatePivot: mode}
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
controls.appendChild(airportsToggle);
controls.appendChild(pivotLabel);
controls.appendChild(pivotOptions);
document.body.appendChild(controls);

let tilesVisible = true;
let airportsVisible = true;

tilesToggle.onclick = () => {
  tilesVisible = !tilesVisible;
  tilesToggle.textContent = tilesVisible ? 'Hide 3D Tiles' : 'Show 3D Tiles';
  updateLayers();
};

airportsToggle.onclick = () => {
  airportsVisible = !airportsVisible;
  airportsToggle.textContent = airportsVisible ? 'Hide Planes' : 'Show Planes';
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
    new ScenegraphLayer({
      id: 'airports',
      data: AIRPORTS,
      pickable: true,
      visible: airportsVisible,
      scenegraph: AIRPLANE_MODEL_URL,
      sizeScale: 10,
      sizeMinPixels: 2,
      sizeMaxPixels: 50,
      _animations: {
        '*': {speed: 1}
      },
      getPosition: d => [...d.coordinates, 2000],
      getOrientation: d => [0, 0, 90], // pitch, yaw, roll
      getScale: [1, 1, 1],
      _lighting: 'pbr'
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
