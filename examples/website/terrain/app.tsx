// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';

import {TerrainLayer, TerrainLayerProps} from '@deck.gl/geo-layers';
import {MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import type {MapViewState} from '@deck.gl/core';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 46.24,
  longitude: -122.18,
  zoom: 11.5,
  bearing: 140,
  pitch: 60,
  maxPitch: 89
};

const GLOBE_VIEW_STATE: MapViewState = {
  latitude: 46.24,
  longitude: -122.18,
  zoom: 5.6,
  bearing: 0,
  pitch: 0,
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

type ViewMode = 'map' | 'globe';

export default function App({
  texture = SURFACE_IMAGE,
  wireframe = false,
  initialViewState = INITIAL_VIEW_STATE
}: {
  texture?: string;
  wireframe?: boolean;
  initialViewState?: MapViewState;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [viewState, setViewState] = useState<MapViewState>(initialViewState);
  const isGlobe = viewMode === 'globe';

  const setView = (mode: ViewMode) => {
    setViewMode(mode);
    setViewState(mode === 'globe' ? GLOBE_VIEW_STATE : initialViewState);
  };

  const layer = new TerrainLayer({
    id: 'terrain',
    minZoom: 0,
    maxZoom: 23,
    strategy: 'no-overlap',
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
        key={viewMode}
        views={isGlobe ? new GlobeView() : new MapView()}
        viewState={viewState}
        onViewStateChange={({viewState: nextViewState}) =>
          setViewState(nextViewState as MapViewState)
        }
        controller={true}
        parameters={isGlobe ? {cull: true} : undefined}
        layers={[layer]}
        getTooltip={info => {
          if (info.picked && info.coordinate && info.coordinate.length === 3) {
            const elevation = info.coordinate[2];
            return `Elevation: ${elevation.toFixed(0)} m`;
          }
          return null;
        }}
      />
      <div style={TOGGLE_STYLE}>
        <button
          type="button"
          aria-pressed={!isGlobe}
          onClick={() => setView('map')}
          style={getToggleButtonStyle(!isGlobe)}
        >
          Map
        </button>
        <button
          type="button"
          aria-pressed={isGlobe}
          onClick={() => setView('globe')}
          style={getToggleButtonStyle(isGlobe)}
        >
          Globe
        </button>
      </div>
    </>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}

const TOGGLE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  display: 'flex',
  gap: 2,
  padding: 3,
  borderRadius: 4,
  background: 'rgba(20, 24, 32, 0.78)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
};

function getToggleButtonStyle(active: boolean): React.CSSProperties {
  return {
    border: 0,
    borderRadius: 3,
    padding: '6px 10px',
    color: active ? '#0b1020' : '#ffffff',
    background: active ? '#ffffff' : 'transparent',
    cursor: 'pointer',
    font: '600 12px/1 system-ui, sans-serif'
  };
}
