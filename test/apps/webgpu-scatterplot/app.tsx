// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {PointCloudLayer, ScatterplotLayer} from '@deck.gl/layers';
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

type Airport = {
  type: 'major' | 'mid' | 'small';
  name: string;
  abbrev: string; // airport code
  coordinates: [longitude: number, latitude: number];
};

export default function App({
  data,
  airports,
  radius = 30,
  maleColor = MALE_COLOR,
  femaleColor = FEMALE_COLOR,
  mapStyle = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'
}: {
  data?: DataPoint[];
  airports?: Airport[];
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
    }),
    new PointCloudLayer<Airport>({
      id: 'airports',
      data: airports,
      pointSize: 4,
      getPosition: d => d.coordinates,
      getColor: d => {
        switch (d.type) {
          case 'major':
            return [255, 0, 0, 255];
          case 'mid':
            return [0, 255, 0, 255];
          case 'small':
            return [0, 0, 255, 255];
          default:
            return [255, 255, 255, 255];
        }
      }
      // pickable: true
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

export function renderToDOM(container: HTMLDivElement, data, airports) {
  createRoot(container).render(<App data={data} airports={airports} />);
}
