// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {Map as MapLibreMap, useControl as useMapLibreControl} from 'react-map-gl/maplibre';
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {BasemapExample} from '../types';

import 'maplibre-gl/dist/maplibre-gl.css';

function MapLibreDeckOverlay(props: any) {
  const overlay = useMapLibreControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapLibreComponentProps = {
  example: BasemapExample;
  interleaved: boolean;
  batched: boolean;
  globe: boolean;
  multiView: boolean;
};

export default function MapLibreComponent({
  example,
  interleaved,
  batched,
  globe,
  multiView
}: MapLibreComponentProps) {
  const {mapStyle, initialViewState, getLayers, views, layerFilter} = example;
  const [overlayReady, setOverlayReady] = React.useState(!globe);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // For multi-view examples, extract the mapbox view state for the base map
  const mapInitialViewState =
    initialViewState && typeof initialViewState === 'object' && 'mapbox' in initialViewState
      ? initialViewState.mapbox
      : initialViewState;

  return (
    <div style={{width: '100%', height: '100%'}}>
      <MapLibreMap
        key={`maplibre-${interleaved}-${batched}-${globe || false}`}
        mapStyle={mapStyle}
        initialViewState={mapInitialViewState}
        onLoad={e => {
          if (globe && isMountedRef.current) {
            // Set projection before rendering overlay (critical for globe + interleaved mode)
            e.target.setProjection({type: 'globe'});
            setOverlayReady(true);
          }
        }}
      >
        {overlayReady &&
          (multiView && views ? (
            <MapLibreDeckOverlay
              layers={getLayers(interleaved)}
              interleaved={interleaved}
              batched={batched}
              _renderLayersInGroups={batched}
              views={views as any}
              layerFilter={layerFilter as any}
              initialViewState={initialViewState as any}
            />
          ) : (
            <MapLibreDeckOverlay
              layers={getLayers(interleaved)}
              interleaved={interleaved}
              batched={batched}
              _renderLayersInGroups={batched}
            />
          ))}
      </MapLibreMap>
    </div>
  );
}
