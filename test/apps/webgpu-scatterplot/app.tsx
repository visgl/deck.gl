// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {Map} from 'react-map-gl/maplibre';

import type {Color, MapViewState} from '@deck.gl/core';

const MALE_COLOR: Color = [0, 128, 255];
const FEMALE_COLOR: Color = [255, 0, 128];

// Source data CSV

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

type DataPoint = [longitude: number, latitude: number, gender: number];

export default function App({
  data,
  radius = 30,
  maleColor = MALE_COLOR,
  femaleColor = FEMALE_COLOR,
  mapStyle = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'
}: {
  data?: DataPoint[];
  radius?: number;
  maleColor?: Color;
  femaleColor?: Color;
  mapStyle?: string;
}) {
  const layers = [
    // new TriangleLayer({}),
    new ScatterplotLayer<DataPoint>({
      id: 'scatter-plot',
      data,
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getFillColor: d => (d[2] === 1 ? maleColor : femaleColor),
      getLineColor: [0, 0, 0, 0],
      getLineWidth: 1,
      getRadius: 1,
      updateTriggers: {
        getFillColor: [maleColor, femaleColor]
      },
      pickable: true
    })
  ];

  return (
    /* Map won't show through until we adopt premultiplied colors https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html */
    <DeckGL
      deviceProps={{
        createCanvasContext: {alphaMode: 'premultiplied'},
        adapters: [webgpuAdapter]
      }}
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement, data) {
  createRoot(container).render(<App data={data} />);
}
