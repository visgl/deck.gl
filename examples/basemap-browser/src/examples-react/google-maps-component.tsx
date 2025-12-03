// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useMemo} from 'react';
import {APIProvider, Map as GoogleMap, useMap} from '@vis.gl/react-google-maps';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import type {BasemapExample} from '../types';

// Google Maps DeckGL Overlay - from get-started/react/google-maps
function GoogleMapsDeckOverlay({
  getLayers,
  interleaved
}: {
  getLayers: (interleaved?: boolean) => any[];
  interleaved: boolean;
}) {
  const map = useMap();
  const overlay = useMemo(() => new GoogleMapsOverlay({interleaved}), [interleaved]);

  useEffect(() => {
    if (map) {
      overlay.setMap(map);
    }
    return () => overlay.setMap(null);
  }, [map, overlay]);

  overlay.setProps({layers: getLayers(interleaved)});
  return null;
}

type GoogleMapsComponentProps = {
  example: BasemapExample;
  interleaved: boolean;
};

export default function GoogleMapsComponent({example, interleaved}: GoogleMapsComponentProps) {
  // eslint-disable-next-line no-process-env
  const apiKey = process.env.GoogleMapsAPIKey!;
  // eslint-disable-next-line no-process-env
  const mapId = process.env.GoogleMapsMapId || 'DEMO_MAP_ID';
  const {initialViewState, getLayers} = example;

  return (
    <div style={{width: '100%', height: '100%'}}>
      <APIProvider apiKey={apiKey} version="weekly">
        <GoogleMap
          defaultCenter={{lat: initialViewState.latitude, lng: initialViewState.longitude}}
          defaultZoom={initialViewState.zoom}
          defaultHeading={initialViewState.bearing || 0}
          defaultTilt={initialViewState.pitch || 0}
          mapId={mapId}
          style={{width: '100%', height: '100%'}}
        >
          <GoogleMapsDeckOverlay getLayers={getLayers} interleaved={interleaved} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
