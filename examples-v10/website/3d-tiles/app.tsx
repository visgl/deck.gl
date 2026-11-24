// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import type {Device} from '@luma.gl/core';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {
  resolveCesiumIonTileset,
  type CesiumIonTilesetMetadata
} from '@loaders.gl/tiles-3d/3d-tiles';

import type {MapViewState} from '@deck.gl/core';
import type {Tileset3D} from '@loaders.gl/tiles-3d';

const ION_ASSET_ID = 43978;
const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGMyMDVmMS0zNjIyLTRkMDQtYTQ2MS05YmQ3MTc5ZDJhOTAiLCJpZCI6MjYxMzMsImlhdCI6MTc3NjA4NzkxNX0.wfqN4Vu94UsALYDIunRGWO8wKFYMoe67ooozJwDAo-c';

const INITIAL_VIEW_STATE: MapViewState = {
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
  device,
  mapStyle = 'https://tiles.openfreemap.org/styles/dark',
  updateAttributions
}: {
  device?: Device;
  mapStyle?: string;
  updateAttributions?: (attributions: any) => void;
}) {
  const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE);
  const [ionTileset, setIonTileset] = useState<CesiumIonTilesetMetadata | null>(null);

  useEffect(() => {
    // Resolves the tileset url of the ion asset and a credential for its endpoint
    resolveCesiumIonTileset(ION_TOKEN, ION_ASSET_ID).then(setIonTileset, console.error);
  }, []);

  const onTilesetLoad = (tileset: Tileset3D) => {
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

  const tile3DLayer =
    ionTileset &&
    new Tile3DLayer({
      id: 'tile-3d-layer',
      pointSize: 2,
      data: ionTileset.url,
      loadOptions: {core: {credentials: ionTileset.credentials}},
      onTilesetLoad
    });

  return (
    <DeckGL
      device={device}
      layers={tile3DLayer ? [tile3DLayer] : []}
      initialViewState={initialViewState}
      controller={true}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
