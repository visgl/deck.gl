// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {Map as MapLibreMap, useControl as useMapLibreControl} from 'react-map-gl/maplibre';
import {MapboxOverlay} from '@deck.gl/mapbox';
import type {Config} from '../../types';
import {getBaseMapViewState} from '../../config';

import 'maplibre-gl/dist/maplibre-gl.css';

function MapLibreDeckOverlay(props: any) {
  const overlay = useMapLibreControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

type MapLibreComponentProps = {
  config: Config;
};

export default function MapLibreComponent({config}: MapLibreComponentProps) {
  const {
    mapStyle,
    initialViewState,
    layers,
    interleaved,
    batched,
    globe,
    multiView,
    views,
    layerFilter,
    onViewStateChange
  } = config;

  const [overlayReady, setOverlayReady] = React.useState(!globe);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset overlayReady when globe changes (belt and suspenders with key remount)
  React.useEffect(() => {
    if (globe) {
      setOverlayReady(false);
    } else {
      setOverlayReady(true);
    }
  }, [globe]);

  // For multi-view, extract the mapbox view state for the base map
  const mapInitialViewState = getBaseMapViewState(initialViewState);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <MapLibreMap
        key={`maplibre-${interleaved}-${batched}-${globe}-${multiView}`}
        mapStyle={mapStyle}
        initialViewState={mapInitialViewState}
        onLoad={e => {
          if (globe && isMountedRef.current) {
            // Set projection before rendering overlay (critical for globe + interleaved mode)
            e.target.setProjection({type: 'globe'});
            // Re-apply center/zoom after projection change (setProjection resets to 0,0)
            e.target.setCenter([mapInitialViewState.longitude, mapInitialViewState.latitude]);
            e.target.setZoom(mapInitialViewState.zoom);
            // Wait for projection to be fully applied before rendering overlay
            requestAnimationFrame(() => {
              if (isMountedRef.current) {
                setOverlayReady(true);
              }
            });
          }
        }}
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
        {overlayReady && (
          <MapLibreDeckOverlay
            layers={layers}
            interleaved={interleaved}
            _renderLayersInGroups={batched}
            views={multiView ? views : undefined}
            layerFilter={multiView ? layerFilter : undefined}
            initialViewState={multiView ? initialViewState : undefined}
          />
        )}
      </MapLibreMap>
    </div>
  );
}
