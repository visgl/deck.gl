import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {I3SLoader} from '@loaders.gl/i3s';
import {Tile3DLayer} from '@deck.gl/geo-layers';

const TILESET_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

const INITIAL_VIEW_STATE = {
  latitude: 37.78,
  longitude: -122.4,
  zoom: 14,
  minZoom: 14,
  maxZoom: 16.5
};

export default function App({data = TILESET_URL, distance = 0, opacity = 0.2}) {

  const layers = [
    new Tile3DLayer({
      id: 'tile-3d-layer',
      data: TILESET_URL,
      loader: I3SLoader
    })
  ];

  return (
    <div>
      <DeckGL
        style={{backgroundColor: '#061714'}}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      />
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
