// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

import type {MapViewState} from '@deck.gl/core';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/screen-grid/uber-pickup-locations.json'; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.33,
  latitude: 47.6,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

type DataPoint = [longitude: number, latitude: number, count: number];

export default function App({
  data = DATA_URL,
  intensity = 1,
  threshold = 0.03,
  radiusPixels = 30,
  mapStyle = MAP_STYLE,
  testBinaryData = false
}: {
  data?: string | DataPoint[];
  intensity?: number;
  threshold?: number;
  radiusPixels?: number;
  mapStyle?: string;
  testBinaryData?: boolean;
}) {
  // Test case for binary data bug - pointCount = 1 works, pointCount >= 2 fails with GL error
  const binaryTestData = testBinaryData ? (() => {
    const pointCount = 100; // Change this to 1 to see working case, 2+ to reproduce bug
    const positions = new Float32Array(pointCount * 2);
    const weights = new Float32Array(pointCount);

    // Generate random test data around Seattle
    for (let i = 0; i < pointCount; i++) {
      positions[i * 2] = -122.33 + (Math.random() - 0.5) * 0.1;     // lng ± 0.05
      positions[i * 2 + 1] = 47.6 + (Math.random() - 0.5) * 0.1;   // lat ± 0.05
      weights[i] = Math.random() * 100 + 10; // Random weight 10-110
    }

    return {
      length: pointCount,
      attributes: {
        getPosition: {
          value: positions,
          size: 2
        },
        getWeight: {
          value: weights,
          size: 1
        }
      }
    };
  })() : null;

  const layers = [
    new HeatmapLayer<DataPoint>({
      data: binaryTestData || data,
      id: 'heatmap-layer',
      pickable: false,
      getPosition: binaryTestData ? undefined : (d => [d[0], d[1]]),
      getWeight: binaryTestData ? undefined : (d => d[2]),
      radiusPixels,
      intensity,
      threshold
    })
  ];

  return (
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  // Set testBinaryData=true to reproduce the bug
  createRoot(container).render(<App testBinaryData={true} />);
}
