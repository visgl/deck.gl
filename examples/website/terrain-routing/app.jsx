/* eslint-disable max-statements */
import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';

import { TerrainLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import { _TerrainExtension } from '@deck.gl/extensions';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: 7.785,
  latitude: 45.985,
  zoom: 12,
  pitch: 55,
  // maxZoom: 14,
  bearing: 110,
  maxPitch: 89
};

const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;

// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
// Note - the elevation rendered by this example is greatly exagerated!
const ELEVATION_DECODER = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

const COLOR_SCHEME = {
  easy: [20, 200, 0],
  intermediate: [0, 80, 240],
  advanced: [235, 40, 0],
  other: [100, 100, 100]
};

export default function App({
  texture = SURFACE_IMAGE,
  wireframe = false,
  initialViewState = INITIAL_VIEW_STATE
}) {
  const layers = [
    new TerrainLayer({
      id: 'terrain',
      minZoom: 0,
      strategy: 'no-overlap',
      elevationDecoder: ELEVATION_DECODER,
      elevationData: TERRAIN_IMAGE,
      texture,
      wireframe,
      color: [255, 255, 255],
      operation: 'terrain+draw'
    }),
    new GeoJsonLayer({
      id: 'terrain-routes',
      data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/ski.geojson',
      getLineColor: f => COLOR_SCHEME[f.properties.difficulty] || COLOR_SCHEME.other,
      getFillColor: f => COLOR_SCHEME[f.properties.difficulty] || COLOR_SCHEME.other,
      getLineWidth: 20,
      stroked: false,
      getPointRadius: 50,
      lineWidthMinPixels: 2,
      pointType: 'circle',
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 200, 0],
      extensions: [new _TerrainExtension()]
    })
  ];

  return <DeckGL initialViewState={initialViewState} controller={true} layers={layers} />;
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
