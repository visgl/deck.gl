import React, {useState} from 'react';
import styled from 'styled-components';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {Tile3DLayer} from '@deck.gl/geo-layers';

const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const ROOT_TILE = 'CggzMDYwNDE2MxIFZWFydGgYsQciBmdyb3VuZDoFZ2VvaWRABg'; // Prague
const TILESET_URL = `https://www.googleapis.com/tile/v1/tiles3d/tilesets/${ROOT_TILE}.json?key=${GOOGLE_MAPS_API_KEY}`;

const INITIAL_VIEW_STATE = {
  latitude: 50.089,
  longitude: 14.42,
  zoom: 16,
  minZoom: 14,
  maxZoom: 16.5,
  bearing: 90,
  pitch: 60
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const DataCredit = styled.div`
  position: absolute;
  left: 8px;
  bottom: 4px;
  color: var(--ifm-color-white);
  font-size: 10px;
`;

export default function App({data = TILESET_URL, intensity = 1}) {
  const [credits, setCredits] = useState('');

  const layers = [
    new Tile3DLayer({
      id: 'google-3d-tiles',
      data: TILESET_URL,
      // THE FOLLOWING FUNCTION WILL BE REMOVED IN THE NEXT RELEASE (next week)
      onTilesetLoad: tileset3d => {
        // Required until https://github.com/visgl/loaders.gl/pull/2252 resolved
        tileset3d._queryParams = {key: GOOGLE_MAPS_API_KEY};

        tileset3d.options.onTraversalComplete = selectedTiles => {
          const credits = new Set();
          selectedTiles.forEach(tile => {
            const {copyright} = tile.content.gltf.asset;
            copyright.split(';').forEach(credits.add, credits);
            setCredits([...credits].join('; '));
          });
          return selectedTiles;
        };
      },
      operation: 'terrain+draw'
    })
  ];

  return (
    <div>
      <DeckGL
        style={{backgroundColor: '#061714'}}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      ></DeckGL>
      <DataCredit>{credits}</DataCredit>
    </div>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
