import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map, useControl} from 'react-map-gl';
import * as maptilersdk from '@maptiler/sdk';
import {GeoJsonLayer, ArcLayer} from 'deck.gl';
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import '@maptiler/sdk/dist/maptiler-sdk.css';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

// Set your MapTiler API key here or via environment variable
maptilersdk.config.apiKey = process.env.MapTilerApiKey; // eslint-disable-line

const MAP_STYLE = maptilersdk.MapStyle.DATAVIZ.DARK;
function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
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
      getFillColor: [118, 31, 232, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick
      // beforeId: 'River labels' // In interleaved mode, render the layer under map labels
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [241, 23, 93],
      getTargetColor: [5, 208, 223],
      getWidth: 1
    })
  ];

  return (
    <Map initialViewState={INITIAL_VIEW_STATE} mapLib={maptilersdk} mapStyle={MAP_STYLE}>
      <DeckGLOverlay layers={layers} /* interleaved={true}*/ />
    </Map>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
