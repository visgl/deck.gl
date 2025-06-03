// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {PostProcessEffect} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {zoomBlur, vignette} from '@luma.gl/effects';
import {points} from '../../../examples/layer-browser/src/data-samples';

import type {MapViewState} from '@deck.gl/core';

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

type DataPoint = {
  COORDINATES: [number, number];
  SPACES: number;
};

export default function App({
  data = points,
  radius = 30,
  mapStyle = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'
}: {
  data?: typeof points;
  radius?: number;
  mapStyle?: string;
}) {
  const effects = [
    new PostProcessEffect(zoomBlur, {strength: 0.6}),
    new PostProcessEffect(vignette, {})
  ];

  const layers = [
    new ScatterplotLayer<DataPoint>({
      id: 'scatter-plot',
      data,
      radiusScale: radius,
      radiusMinPixels: 1,
      radiusMaxPixels: 30,
      getPosition: d => d.COORDINATES,
      getFillColor: [255, 128, 0],
      getRadius: d => d.SPACES,
      pickable: true
    })
  ];

  return (
    <DeckGL 
      layers={layers} 
      initialViewState={INITIAL_VIEW_STATE} 
      controller={true}
      effects={effects}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
