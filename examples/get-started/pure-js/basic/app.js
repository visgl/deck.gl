// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const TILESET_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json';

// Matterhorn coordinates: 45.9763° N, 7.6586° E
const INITIAL_VIEW_STATE = {
  latitude: 45.9763,
  longitude: 7.6586,
  zoom: 12,
  bearing: 0,
  pitch: 60,
  position: [0, 0, 4000]
};

const deck = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  unproject3D: true,
  onClick: (info) => {
    console.log('=== CLICK INFO ===');
    console.log('picked:', info.picked);
    console.log('coordinate:', info.coordinate);
    console.log('object:', info.object);
    console.log('layer:', info.layer?.id);

    if (info.picked && info.coordinate && info.coordinate.length === 3) {
      console.log('3D coordinate - altitude:', info.coordinate[2], 'meters');
    }
  },
  layers: [
    new Tile3DLayer({
      id: 'google-3d-tiles',
      data: TILESET_URL,
      pickable: true,
      onTilesetLoad: tileset3d => {
        tileset3d.options.onTraversalComplete = selectedTiles => {
          const uniqueCredits = new Set();
          selectedTiles.forEach(tile => {
            const {copyright} = tile.content.gltf.asset;
            copyright.split(';').forEach(uniqueCredits.add, uniqueCredits);
          });
          const creditsText = [...uniqueCredits].join('; ');
          // Display credits in console
          console.log('Credits:', creditsText);
          return selectedTiles;
        };
      },
      loadOptions: {
        fetch: {headers: {'X-GOOG-API-KEY': GOOGLE_MAPS_API_KEY}}
      },
      operation: 'terrain+draw'
    })
  ]
});

// Export for debugging
window.deck = deck;
