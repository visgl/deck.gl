import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

import type {Color, MapViewState, PickingInfo} from '@deck.gl/core';
import type {Feature, Geometry} from 'geojson';
import type {TerrainLayerProps} from '@deck.gl/geo-layers';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/terrain/tour_de_france_2023_mountain_stages.json'; // eslint-disable-line

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
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
const ELEVATION_DECODER: TerrainLayerProps["elevationDecoder"] = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

const COLOR_SCHEME: Color = [255, 255, 0];

type FeatureProperties = {
  name: string;
  location: string;
  tooltip?: string;
};

function getTooltip({object}: PickingInfo<Feature<Geometry, FeatureProperties>>) {
  return (
    object && {
      html: `\
  <div style="margin-bottom: 0.5rem"><b>${object.properties.tooltip ? 'Stage' : 'Route'}</b></div>
  <div>${object.properties.tooltip || object.properties.location}</div>
  `
    }
  );
}

export default function App({initialViewState = INITIAL_VIEW_STATE}: {
  initialViewState?: MapViewState;
}) {
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
    new GeoJsonLayer<FeatureProperties>({
      id: 'gpx-routes',
      data: DATA_URL,
      getFillColor: COLOR_SCHEME,
      getLineColor: COLOR_SCHEME,
      getLineWidth: 30,
      stroked: false,
      lineWidthMinPixels: 2,
      pickable: true,
      autoHighlight: false,
      // text properties
      pointType: 'text',
      getText: d => d.properties.location,
      getTextColor: d => (d.properties.tooltip ? [255, 255, 255] : COLOR_SCHEME),
      getTextSize: d => (d.properties.tooltip ? 16 : 17),
      getTextPixelOffset: [0, -45],
      getTextAngle: 0,
      textOutlineWidth: 5,
      textFontSettings: {
        sdf: true
      },
      getTextAlignmentBaseline: 'top',
      extensions: [new TerrainExtension()]
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

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
