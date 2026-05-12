// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';

import {TerrainLayer, TerrainLayerProps} from '@deck.gl/geo-layers';
import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import type {GlobeViewState, MapViewState} from '@deck.gl/core';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE: GlobeViewState & MapViewState = {
  latitude: 46.24,
  longitude: -122.18,
  // GlobeView falls back to WebMercatorViewport above zoom 12.
  zoom: 5.6,
  bearing: 140,
  pitch: 60,
  maxPitch: 89
};

const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;

// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
// Note - the elevation rendered by this example is greatly exagerated!
const ELEVATION_DECODER: TerrainLayerProps['elevationDecoder'] = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

export default function App({
  texture = SURFACE_IMAGE,
  wireframe = false,
  initialViewState = INITIAL_VIEW_STATE
}: {
  texture?: string;
  wireframe?: boolean;
  initialViewState?: GlobeViewState & MapViewState;
}) {
  const [viewMode, setViewMode] = useState<'globe' | 'map'>('globe');
  const isGlobe = viewMode === 'globe';
  const layer = new TerrainLayer({
    id: 'terrain',
    minZoom: 0,
    maxZoom: 14,
    refinementStrategy: 'best-available',
    elevationDecoder: ELEVATION_DECODER,
    elevationData: TERRAIN_IMAGE,
    texture,
    wireframe,
    color: [255, 255, 255],
    pickable: '3d'
  });

  return (
    <>
      <DeckGL
        views={isGlobe ? new GlobeView() : new MapView()}
        initialViewState={initialViewState}
        controller={true}
        parameters={{cull: true}}
        layers={[layer]}
        getTooltip={info => {
          if (info.picked && info.coordinate && info.coordinate.length === 3) {
            const elevation = info.coordinate[2];
            return `Elevation: ${elevation.toFixed(0)} m`;
          }
          return null;
        }}
      />
      <div style={{position: 'absolute', top: 16, left: 16, display: 'flex'}}>
        {(['globe', 'map'] as const).map(mode => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            style={{
              padding: '8px 12px',
              border: '1px solid #fff',
              background: viewMode === mode ? '#fff' : '#000',
              color: viewMode === mode ? '#000' : '#fff',
              cursor: 'pointer'
            }}
          >
            {mode === 'globe' ? 'Globe' : 'Map'}
          </button>
        ))}
      </div>
    </>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
