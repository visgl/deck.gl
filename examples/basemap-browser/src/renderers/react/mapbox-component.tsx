// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {Map as MapboxMap, useControl as useMapboxControl} from 'react-map-gl/mapbox';
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {Config} from '../../types';
import {getBaseMapViewState} from '../../config';

import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token here or via environment variable
// eslint-disable-next-line no-process-env
const MAPBOX_TOKEN = process.env.MapboxAccessToken;

function MapboxDeckOverlay(props: any) {
  const overlay = useMapboxControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapboxComponentProps = {
  config: Config;
};

export default function MapboxComponent({config}: MapboxComponentProps) {
  const {
    mapStyle,
    initialViewState,
    layers,
    interleaved,
    batched,
    multiView,
    views,
    layerFilter,
    onViewStateChange
  } = config;

  // For multi-view, extract the mapbox view state for the base map
  const mapInitialViewState = getBaseMapViewState(initialViewState);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <MapboxMap
        key={`mapbox-${interleaved}-${batched}-${multiView}`}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={mapInitialViewState}
        onMove={e => {
          onViewStateChange?.({
            latitude: e.viewState.latitude,
            longitude: e.viewState.longitude,
            zoom: e.viewState.zoom,
            bearing: e.viewState.bearing,
            pitch: e.viewState.pitch
          });
        }}
      >
        <MapboxDeckOverlay
          layers={layers}
          interleaved={interleaved}
          _renderLayersInGroups={batched}
          views={multiView ? views : undefined}
          layerFilter={multiView ? layerFilter : undefined}
          initialViewState={multiView ? initialViewState : undefined}
        />
      </MapboxMap>
    </div>
  );
}
