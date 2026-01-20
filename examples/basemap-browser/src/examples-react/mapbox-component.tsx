// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {Map as MapboxMap, useControl as useMapboxControl} from 'react-map-gl/mapbox';
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {BasemapExample} from '../types';
import type {MapboxOverlayProps} from '@deck.gl/mapbox';

import 'mapbox-gl/dist/mapbox-gl.css';

// Set your Mapbox token here or via environment variable
// eslint-disable-next-line no-process-env
const MAPBOX_TOKEN = process.env.MapboxAccessToken;

function MapboxDeckOverlay(
  props: MapboxOverlayProps & {interleaved: boolean; batched: boolean; initialViewState?: any}
) {
  const overlay = useMapboxControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapboxComponentProps = {
  example: BasemapExample;
  interleaved: boolean;
  batched: boolean;
};

export default function MapboxComponent({example, interleaved, batched}: MapboxComponentProps) {
  const {mapStyle, initialViewState, getLayers, views, layerFilter} = example;

  // For multi-view examples, extract the mapbox view state for the base map
  const mapInitialViewState =
    initialViewState && typeof initialViewState === 'object' && 'mapbox' in initialViewState
      ? initialViewState.mapbox
      : initialViewState;

  return (
    <div style={{width: '100%', height: '100%'}}>
      <MapboxMap
        key={`mapbox-${interleaved}-${batched}`}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={mapInitialViewState}
      >
        <MapboxDeckOverlay
          layers={getLayers(interleaved)}
          interleaved={interleaved}
          batched={batched}
          _renderLayersInGroups={batched}
          {...(views && {views})}
          {...(layerFilter && {layerFilter})}
          {...(views && {initialViewState})}
        />
      </MapboxMap>
    </div>
  );
}
