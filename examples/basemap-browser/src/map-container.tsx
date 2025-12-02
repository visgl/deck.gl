// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useMemo} from 'react';
import {Map as MapLibreMap, useControl as useMapLibreControl} from 'react-map-gl/maplibre';
import {Map as MapboxMap, useControl as useMapboxControl} from 'react-map-gl/mapbox';
import {APIProvider, Map as GoogleMap, useMap} from '@vis.gl/react-google-maps';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import PureJSContainer from './pure-js-container';
import type {BasemapExample} from './types';
import type {MapboxOverlayProps} from '@deck.gl/mapbox';

import 'maplibre-gl/dist/maplibre-gl.css';
import 'mapbox-gl/dist/mapbox-gl.css';

type MapContainerProps = {
  example: BasemapExample | null;
  interleaved: boolean;
};

// Set your Mapbox token here or via environment variable
// eslint-disable-next-line no-process-env
const MAPBOX_TOKEN = process.env.MapboxAccessToken;

// MapLibre Overlay wrapper
function MapLibreOverlay(props: MapboxOverlayProps & {interleaved: boolean}) {
  const overlay = useMapLibreControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

// Mapbox Overlay wrapper
function MapboxOverlayWrapper(props: MapboxOverlayProps & {interleaved: boolean}) {
  const overlay = useMapboxControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

// MapLibre component (React)
function MapLibreComponent({
  example,
  interleaved
}: {
  example: BasemapExample;
  interleaved: boolean;
}) {
  const {mapStyle, initialViewState, getLayers, globe} = example;
  const [overlayReady, setOverlayReady] = React.useState(!globe);

  return (
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
  );
}

// Mapbox component
function MapboxComponent({example, interleaved}: {example: BasemapExample; interleaved: boolean}) {
  const {mapStyle, initialViewState, getLayers} = example;

  return (
    <MapboxMap
      key={`mapbox-${interleaved}`}
      mapStyle={mapStyle}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={initialViewState}
    >
      <MapboxOverlayWrapper layers={getLayers(interleaved)} interleaved={interleaved} />
    </MapboxMap>
  );
}

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

// Google Maps React component - using @vis.gl/react-google-maps
function GoogleMapsComponent({
  example,
  interleaved
}: {
  example: BasemapExample;
  interleaved: boolean;
}) {
  // eslint-disable-next-line no-process-env
  const apiKey = process.env.GoogleMapsAPIKey!;
  // eslint-disable-next-line no-process-env
  const mapId = process.env.GoogleMapsMapId || 'DEMO_MAP_ID';
  const {initialViewState, getLayers} = example;

  return (
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
  );
}

// Main container - routes to Pure JS or React implementations
export default function MapContainer({example, interleaved}: MapContainerProps) {
  if (!example) {
    return (
      <div style={{padding: 20, width: '100vw', height: '100vh'}}>
        <p>No example selected</p>
      </div>
    );
  }

  const {mapType, framework} = example;

  // Pure JS examples are completely isolated - no React component wrappers
  if (framework === 'pure-js') {
    return (
      <div style={{width: '100vw', height: '100vh'}}>
        <PureJSContainer example={example} interleaved={interleaved} />
      </div>
    );
  }

  // React examples use React components
  return (
    <div style={{width: '100vw', height: '100vh'}}>
      {mapType === 'maplibre' && <MapLibreComponent example={example} interleaved={interleaved} />}
      {mapType === 'mapbox' && <MapboxComponent example={example} interleaved={interleaved} />}
      {mapType === 'google-maps' && (
        <GoogleMapsComponent example={example} interleaved={interleaved} />
      )}
    </div>
  );
}
