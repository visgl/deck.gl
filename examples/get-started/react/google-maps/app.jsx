import React, {useMemo, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {APIProvider, Map, useMap} from '@vis.gl/react-google-maps';
import {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// Set your Google Maps API key here or via environment variable
const GOOGLE_MAPS_API_KEY = process.env.GoogleMapsAPIKey; // eslint-disable-line
const GOOGLE_MAP_ID = process.env.GoogleMapsMapId; // eslint-disable-line

function DeckGLOverlay(props) {
  const map = useMap();
  const overlay = useMemo(() => new DeckOverlay(props));

  useEffect(() => {
    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map])

  overlay.setProps(props);
  return null;
}

function Root() {
  const onClick = info => {
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
    }
  };

  const layers = [
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ];

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={{lat: 51.47, lng: 0.45}}
        defaultZoom={4}
        mapId={GOOGLE_MAP_ID} >
        <DeckGLOverlay layers={layers} />
      </Map>
    </APIProvider>
  );
}

/* global document */
const container = document.getElementById('app');
createRoot(container).render(<Root />);
