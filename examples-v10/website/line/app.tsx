// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import {LineLayer, ScatterplotLayer} from '@deck.gl/layers';
import {isArrowTable} from '@math.gl/core/arrow';
import type {Table} from 'apache-arrow';
import {FlightPathArrowLoader} from './flight-path-loader';
import {JSONTableLoader} from '@loaders.gl/tables/json';

import type {PickingInfo, MapViewState, Widget} from '@deck.gl/core';
import {Device} from '@luma.gl/core';

// JSON airports and the full encoded-polyline flight dataset
const DATA_URL = {
  AIRPORTS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/airports.json', // eslint-disable-line
  FLIGHT_PATHS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/flight-path-data.txt' // eslint-disable-line
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

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

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
  mapStyle = MAP_STYLE,
  device,
  widgets,
  onDataLoad
}: {
  airports?: string;
  flightPaths?: string | Table | null;
  lineWidth?: number;
  mapStyle?: string;
  device?: Device;
  widgets?: Widget[];
  onDataLoad?: (count: number) => void;
}) {
  const layers = [
    airports &&
      new ScatterplotLayer({
        id: 'airports',
        // Sample row: {coordinates: [-0.4531566, 51.4709959], type: 'major', name: 'London Heathrow', abbrev: 'LHR'}
        data: airports,
        loaders: [JSONTableLoader],
        radiusScale: 20,
        getPosition: {sql: 'coordinates::ARRAY[2]'},
        getFillColor: [255, 140, 0],
        getRadius: {
          sql: "CASE WHEN type = 'major' THEN 100 WHEN type = 'small' THEN 30 ELSE 60 END"
        },
        pickable: true
      }),
    flightPaths &&
      new LineLayer({
        id: 'flight-paths',
        // Sample row: {name: '0x342090', country: 'Spain', start: [-0.4855, 51.4727, 0], end: [-0.4592, 51.4776, 15.2]}
        data: flightPaths,
        loaders: [FlightPathArrowLoader],
        onDataLoad: table => {
          if (isArrowTable(table)) {
            onDataLoad?.(table.numRows);
          }
        },
        opacity: 0.8,
        getSourcePosition: {sql: 'start::ARRAY[3]'},
        getTargetPosition: {sql: '"end"::ARRAY[3]'},
        getColor: {
          sql: `\
            RGBA8(
              1 - start[3] / 5000,
              128 * start[3] / (255 * 10000),
              start[3] / 10000,
              1 - start[3] / 10000
            )`
        },
        getWidth: lineWidth,
        pickable: true
      })
  ];

  const isWebGPU = device?.type === 'webgpu';

  return (
    <DeckGL
      device={device}
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      widgets={widgets}
      pickingRadius={5}
      parameters={{
        blendColorOperation: 'add',
        // WebGPU shaders output premultiplied color, so use `one` here to match
        // the legacy WebGL visual intensity instead of multiplying alpha twice.
        blendColorSrcFactor: isWebGPU ? 'one' : 'src-alpha',
        blendColorDstFactor: 'one',
        blendAlphaOperation: 'add',
        blendAlphaSrcFactor: 'one-minus-dst-alpha',
        blendAlphaDstFactor: 'one'
      }}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

/** Mounts the standalone demo. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
