// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {ScatterplotLayer} from '@deck.gl/layers';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

// Sample airports in the region
const AIRPORTS = [
  {name: 'Zurich Airport', coordinates: [8.5491, 47.4647]},
  {name: 'St. Gallen-Altenrhein', coordinates: [9.5608, 47.485]},
  {name: 'Friedrichshafen', coordinates: [9.5119, 47.6712]},
  {name: 'Innsbruck', coordinates: [11.344, 47.2602]},
  {name: 'Bolzano', coordinates: [11.3264, 46.4603]}
];

// Matterhorn coordinates: 45.9763° N, 7.6586° E
const INITIAL_VIEW_STATE = {
  latitude: 47,
  longitude: 9,
  zoom: 12,
  bearing: 0,
  pitch: 60,
  position: [0, 0, 0]  // Keep camera at ground level
};

const deck = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
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
    new ScatterplotLayer({
      id: 'airports',
      data: AIRPORTS,
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 10,
      radiusMaxPixels: 100,
      lineWidthMinPixels: 1,
      getPosition: d => [...d.coordinates, 2000], // Add 2km (2000m) to z coordinate
      getRadius: d => 100,
      getFillColor: [255, 140, 0],
      getLineColor: [255, 255, 255]
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
airportsToggle.textContent = 'Hide Airports';
airportsToggle.style.padding = '5px 10px';
airportsToggle.style.cursor = 'pointer';

controls.appendChild(tilesToggle);
controls.appendChild(airportsToggle);
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
  airportsToggle.textContent = airportsVisible ? 'Hide Airports' : 'Show Airports';
  updateLayers();
};

function updateLayers() {
  deck.setProps({
    layers: [
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
      new ScatterplotLayer({
        id: 'airports',
        data: AIRPORTS,
        pickable: true,
        visible: airportsVisible,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 10,
        radiusMaxPixels: 100,
        lineWidthMinPixels: 1,
        getPosition: d => [...d.coordinates, 10000],
        getRadius: d => 100,
        getFillColor: [255, 140, 0],
        getLineColor: [255, 255, 255]
      })
    ]
  });
}
