// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
// import {ScatterplotLayer} from '@deck.gl/layers';
import {TriangleLayer} from './triangle-layer';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {CanvasContext} from '@luma.gl/core';

import type {Color, MapViewState} from '@deck.gl/core';

CanvasContext.prototype.getDrawingBufferSize = function getDrawingBufferSize() {
  return this.getPixelSize();
};

const MALE_COLOR: Color = [0, 128, 255];
const FEMALE_COLOR: Color = [255, 0, 128];

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

type DataPoint = [longitude: number, latitude: number, gender: number];

const points = await fetch(DATA_URL).then(response => response.json());

export default function App({
  data = points,
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
    new TriangleLayer({})
    /*
    new ScatterplotLayer<DataPoint>({
      id: 'scatter-plot',
      data,
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getFillColor: d => (d[2] === 1 ? maleColor : femaleColor),
      // getRadius: 1,
      getLineColor: d => [0, 0, 0, 0],
      getLineWidth: d => 1,
      getRadius: d => 1,
      updateTriggers: {
        getFillColor: [maleColor, femaleColor]
      },
      pickable: true
    })
      */
  ];

  return (
    <DeckGL
      deviceProps={{
        adapters: [webgpuAdapter]
      }}
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    />
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
