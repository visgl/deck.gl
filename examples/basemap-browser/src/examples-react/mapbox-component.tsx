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

// Mapbox Overlay wrapper
function MapboxDeckOverlay(props: MapboxOverlayProps & {interleaved: boolean}) {
  const overlay = useMapboxControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapboxComponentProps = {
  example: BasemapExample;
  interleaved: boolean;
};

export default function MapboxComponent({example, interleaved}: MapboxComponentProps) {
  const {mapStyle, initialViewState, getLayers} = example;

  return (
    <div style={{width: '100%', height: '100%'}}>
      <MapboxMap
        key={`mapbox-${interleaved}`}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialViewState}
      >
        <MapboxDeckOverlay layers={getLayers(interleaved)} interleaved={interleaved} />
      </MapboxMap>
    </div>
  );
}
