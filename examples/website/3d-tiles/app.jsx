import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {Tile3DLayer} from '@deck.gl/geo-layers';

import {CesiumIonLoader} from '@loaders.gl/3d-tiles';

const ION_ASSET_ID = 43978;
const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3NjEwMjA4Ni00YmVkLTQyMjgtYjRmZS1lY2M3ZWFiMmFmNTYiLCJpZCI6MjYxMzMsImlhdCI6MTY3NTM2ODY4NX0.chGkGL6DkDNv5wYJQDMzWIvi9iDoVa27dgng_5ARDmo';
const TILESET_URL = `https://assets.ion.cesium.com/${ION_ASSET_ID}/tileset.json`;

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -75,
  pitch: 45,
  maxPitch: 60,
  bearing: 0,
  minZoom: 2,
  maxZoom: 30,
  zoom: 17
};

export default function App({
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  updateAttributions
}) {
  const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE);

  const onTilesetLoad = tileset => {
    // Recenter view to cover the new tileset
    const {cartographicCenter, zoom} = tileset;
    setInitialViewState({
      ...INITIAL_VIEW_STATE,
      longitude: cartographicCenter[0],
      latitude: cartographicCenter[1],
      zoom
    });

    if (updateAttributions) {
      updateAttributions(tileset.credits && tileset.credits.attributions);
    }
  };

  const tile3DLayer = new Tile3DLayer({
    id: 'tile-3d-layer',
    pointSize: 2,
    data: TILESET_URL,
    loader: CesiumIonLoader,
    loadOptions: {'cesium-ion': {accessToken: ION_TOKEN}},
    onTilesetLoad
  });

  return (
    <DeckGL layers={[tile3DLayer]} initialViewState={initialViewState} controller={true}>
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
