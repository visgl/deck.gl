// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {webgpuAdapter} from '@luma.gl/webgpu';
import DeckGL from '@deck.gl/react';
import {PointCloudLayer} from '@deck.gl/layers';

import type {PickingInfo, MapViewState} from '@deck.gl/core';

// Source data CSV
const DATA_URL = {
  AIRPORTS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/airports.json', // eslint-disable-line
  FLIGHT_PATHS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/heathrow-flights.json' // eslint-disable-line
};

type Airport = {
  type: 'major' | 'mid' | 'small';
  name: string;
  abbrev: string; // airport code
  coordinates: [longitude: number, latitude: number];
};

type FlightPath = {
  start: [longitude: number, latitude: number, altitude: number];
  end: [longitude: number, latitude: number, altitude: number];
  country: string;
  name: string; // tail number
};

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

function getTooltip({object}: PickingInfo) {
  return (
    object &&
    `\
  ${(object as FlightPath).country || (object as Airport).abbrev || ''}
  ${object.name.indexOf('0x') >= 0 ? '' : object.name}`
  );
}

export default function App({
  airports = DATA_URL.AIRPORTS,
  flightPaths = DATA_URL.FLIGHT_PATHS,
  lineWidth = 3,
  mapStyle = MAP_STYLE
}: {
  airports?: string | Airport[];
  flightPaths?: string | FlightPath[];
  lineWidth?: number;
  mapStyle?: string;
}) {
  const layers = [
    new PointCloudLayer<Airport>({
      id: 'airports',
      data: airports,
      radiusScale: 200,
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
    // new LineLayer<FlightPath>({
    //   id: 'flight-paths',
    //   data: flightPaths,
    //   opacity: 0.8,
    //   getSourcePosition: d => d.start,
    //   getTargetPosition: d => d.end,
    //   getColor: d => {
    //     const z = d.start[2];
    //     const r = z / 10000;
    //     return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
    //   },
    //   getWidth: d => lineWidth,
    //   pickable: true
    // })
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
      getTooltip={getTooltip}
    ></DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement, airports, flightPaths) {
  createRoot(container).render(<App airports={airports} flightPaths={flightPaths} />);
}
