// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {DeckGL} from '@deck.gl/react';
import type {Device} from '@luma.gl/core';
import React, {useCallback, useState} from 'react';
import {createRoot} from 'react-dom/client';

import type {MapViewState} from '@deck.gl/core';
import {_GlobeView as GlobeView, MapView} from '@deck.gl/core';
import {TerrainLayer, TerrainLayerProps} from '@deck.gl/geo-layers';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 46.24,
  longitude: -122.18,
  zoom: 11.5,
  bearing: 140,
  pitch: 60,
  maxPitch: 89
};

const TERRAIN_IMAGE = 'https://tiles.mapterhorn.com/{z}/{x}/{y}.webp';
const SURFACE_IMAGE = 'https://tiles.versatiles.org/tiles/satellite/{z}/{x}/{y}.webp';

// Mapterhorn serves Terrarium-encoded elevation tiles.
const ELEVATION_DECODER: TerrainLayerProps['elevationDecoder'] = {
  rScaler: 256,
  gScaler: 1,
  bScaler: 1 / 256,
  offset: -32768
};

export default function App({
  device,
  texture = SURFACE_IMAGE,
  wireframe = false,
  globeView = false,
  zoomOffset = 0,
  minZoom = 0,
  maxZoom = 12,
  visibleMinZoom = 0,
  visibleMaxZoom = 16,
  initialViewState = INITIAL_VIEW_STATE,
  onZoomChange
}: {
  device?: Device;
  texture?: string;
  wireframe?: boolean;
  globeView?: boolean;
  zoomOffset?: number;
  minZoom?: number;
  maxZoom?: number;
  visibleMinZoom?: number;
  visibleMaxZoom?: number;
  initialViewState?: MapViewState;
  onZoomChange?: (zoom: number) => void;
}) {
  const [viewState, setViewState] = useState(initialViewState);
  const onViewStateChange = useCallback(
    ({viewState: vs}) => {
      setViewState(vs);
      onZoomChange?.(vs.zoom);
    },
    [onZoomChange]
  );

  const layer = new TerrainLayer({
    id: 'terrain',
    minZoom,
    maxZoom,
    visibleMinZoom,
    visibleMaxZoom,
    tileSize: 512,
    refinementStrategy: 'best-available',
    elevationDecoder: ELEVATION_DECODER,
    elevationData: TERRAIN_IMAGE,
    texture,
    wireframe,
    zoomOffset,
    color: [255, 255, 255],
    pickable: '3d'
  });

  return (
    <DeckGL
      device={device}
      views={globeView ? new GlobeView() : new MapView()}
      viewState={viewState}
      onViewStateChange={onViewStateChange}
      controller={true}
      parameters={{cullMode: 'back'}}
      layers={[layer]}
      getTooltip={info => {
        if (info.picked && info.coordinate && info.coordinate.length === 3) {
          const elevation = info.coordinate[2];
          return `Elevation: ${elevation.toFixed(0)} m`;
        }
        return null;
      }}
    />
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
