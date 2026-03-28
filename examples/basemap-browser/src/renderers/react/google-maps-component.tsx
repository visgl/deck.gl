// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useMemo} from 'react';
import {APIProvider, Map as GoogleMap, useMap} from '@vis.gl/react-google-maps';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import type {Config, InitialViewState} from '../../types';
import {getBaseMapViewState} from '../../config';

// Google Maps DeckGL Overlay
function GoogleMapsDeckOverlay({
  layers,
  interleaved,
  onViewStateChange
}: {
  layers: any[];
  interleaved: boolean;
  onViewStateChange?: (vs: InitialViewState) => void;
}) {
  const map = useMap();
  const overlay = useMemo(() => new GoogleMapsOverlay({interleaved}), [interleaved]);

  useEffect(() => {
    if (map) {
      overlay.setMap(map);

      // Listen to camera changes
      if (onViewStateChange) {
        const listener = map.addListener('bounds_changed', () => {
          const center = map.getCenter();
          if (center) {
            onViewStateChange({
              latitude: center.lat(),
              longitude: center.lng(),
              zoom: map.getZoom() || 0,
              bearing: map.getHeading() || 0,
              pitch: map.getTilt() || 0
            });
          }
        });
        return () => {
          google.maps.event.removeListener(listener);
          overlay.finalize();
        };
      }
    }
    return () => overlay.finalize();
  }, [map, overlay, onViewStateChange]);

  overlay.setProps({layers});
  return null;
}

type GoogleMapsComponentProps = {
  config: Config;
};

export default function GoogleMapsComponent({config}: GoogleMapsComponentProps) {
  // eslint-disable-next-line no-process-env
  const apiKey = process.env.GoogleMapsAPIKey!;
  // eslint-disable-next-line no-process-env
  const mapId = process.env.GoogleMapsMapId || 'DEMO_MAP_ID';

  const {initialViewState, layers, interleaved, onViewStateChange} = config;
  const viewState = getBaseMapViewState(initialViewState);

  return (
    <div style={{width: '100%', height: '100%'}}>
      <APIProvider apiKey={apiKey} version="weekly">
        <GoogleMap
          defaultCenter={{lat: viewState.latitude, lng: viewState.longitude}}
          defaultZoom={viewState.zoom}
          defaultHeading={viewState.bearing || 0}
          defaultTilt={viewState.pitch || 0}
          mapId={mapId}
          style={{width: '100%', height: '100%'}}
        >
          <GoogleMapsDeckOverlay
            layers={layers}
            interleaved={interleaved}
            onViewStateChange={onViewStateChange}
          />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
