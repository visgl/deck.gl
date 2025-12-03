// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {Map as MapLibreMap, useControl as useMapLibreControl} from 'react-map-gl/maplibre';
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {BasemapExample} from '../types';
import type {MapboxOverlayProps} from '@deck.gl/mapbox';

import 'maplibre-gl/dist/maplibre-gl.css';

// MapLibre Overlay wrapper
function MapLibreOverlay(props: MapboxOverlayProps & {interleaved: boolean}) {
  const overlay = useMapLibreControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapLibreComponentProps = {
  example: BasemapExample;
  interleaved: boolean;
};

export default function MapLibreComponent({example, interleaved}: MapLibreComponentProps) {
  const {mapStyle, initialViewState, getLayers, globe} = example;
  const [overlayReady, setOverlayReady] = React.useState(!globe);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <MapLibreMap
        key={`maplibre-${interleaved}-${globe || false}`}
        mapStyle={mapStyle}
        initialViewState={initialViewState}
        onLoad={e => {
          if (globe) {
            // Set projection before rendering overlay (critical for globe + interleaved mode)
            e.target.setProjection({type: 'globe'});
            setOverlayReady(true);
          }
        }}
      >
        {overlayReady && (
          <MapLibreOverlay layers={getLayers(interleaved)} interleaved={interleaved} />
        )}
      </MapLibreMap>
    </div>
  );
}
