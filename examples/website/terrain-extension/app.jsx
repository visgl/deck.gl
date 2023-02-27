/* eslint-disable max-statements */
import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';

import {TerrainLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';
import data from './data/data';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken;

const INITIAL_VIEW_STATE = {
  latitude: 43.09822,
  longitude: -0.6194,
  zoom: 10,
  pitch: 55,
  maxZoom: 13.5,
  bearing: 0,
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

const COLOR_SCHEME = [242, 183, 1]; // yellow

function getTooltip({object}) {
  return (
    object && {
      html: `\
  <div><b>Stage</b></div>
  <div>${object.properties.tooltip}</div>
  `
    }
  );
}

export default function App({initialViewState = INITIAL_VIEW_STATE}) {
  const labels = data.features.filter(f => f.geometry.type === 'Point');
  console.log('labels', data);
  const layers = [
    new TerrainLayer({
      id: 'terrain',
      minZoom: 0,
      strategy: 'no-overlap',
      elevationDecoder: ELEVATION_DECODER,
      elevationData: TERRAIN_IMAGE,
      texture: SURFACE_IMAGE,
      wireframe: false,
      color: [255, 255, 255],
      operation: 'terrain+draw'
    }),
    new GeoJsonLayer({
      id: 'terrain-routes',
      data,
      getLineColor: () => COLOR_SCHEME,
      getFillColor: () => COLOR_SCHEME,
      getLineWidth: 20,
      stroked: false,
      getPointRadius: d => d.properties.location.includes('Day') ? 0 : 75,
      lineWidthMinPixels: 2,
      pointType: 'circle',
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 200, 0],
      extensions: [new TerrainExtension()]
    }),
    new TextLayer({
      id: 'gpx-labels',
      data: labels,
      getText: d => d.properties.location,
      getPosition: d => d.geometry.coordinates,
      getColor: d => !d.properties.tooltip ? COLOR_SCHEME : [255, 255, 255],
      getSize: d => !d.properties.tooltip ? 14 : 12,
      getAngle: 0,
      getPixelOffset: [0, -25],
      outlineWidth: 10,
      fontSettings:{
        sdf: true,
      },
      getAlignmentBaseline: 'top',
      extensions: [new TerrainExtension()],
      parameters: {depthTest: false} // Avoid labels intersecting with terrain
    })
  ];

  return (
    <DeckGL
      initialViewState={initialViewState}
      controller={true}
      layers={layers}
      getTooltip={getTooltip}
    />
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
