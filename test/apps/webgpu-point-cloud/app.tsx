// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {webgpuAdapter} from '@luma.gl/webgpu';
import DeckGL from '@deck.gl/react';
import {PointCloudLayer} from '@deck.gl/layers';

import type {MapViewState} from '@deck.gl/core';

// Source data CSV
const DATA_URL = {
  AIRPORTS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/airports.json', // eslint-disable-line
};

type Airport = {
  type: 'major' | 'mid' | 'small';
  name: string;
  abbrev: string; // airport code
  coordinates: [longitude: number, latitude: number];
};

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

export default function App({
  airports = DATA_URL.AIRPORTS,
}: {
  airports?: string | Airport[];
}) {
  const layers = [
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
    <DeckGL
      deviceProps={{
        adapters: [webgpuAdapter]
        // onError: (error) => {
        //   debugger
        // }
      }}
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      pickingRadius={5}
      parameters={{
        blendColorOperation: 'add',
        blendColorSrcFactor: 'src-alpha',
        blendColorDstFactor: 'one',
        blendAlphaOperation: 'add',
        blendAlphaSrcFactor: 'one-minus-dst-alpha',
        blendAlphaDstFactor: 'one'
      }}
    ></DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement, airports) {
  createRoot(container).render(<App airports={airports} />);
}
