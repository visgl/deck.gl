import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {LineLayer, ScatterplotLayer} from '@deck.gl/layers';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';

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

function getTooltip(info: PickingInfo) {
  const object = info.object as Airport | FlightPath;
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
    new ScatterplotLayer<Airport>({
      id: 'airports',
      data: airports,
      radiusScale: 20,
      getPosition: d => d.coordinates,
      getFillColor: [255, 140, 0],
      getRadius: d => {
        if (d.type.search('major') >= 0) {
          return 100;
        }
        if (d.type.search('small') >= 0) {
          return 30;
        }
        return 60;
      },
      pickable: true
    }),
    new LineLayer<FlightPath>({
      id: 'flight-paths',
      data: flightPaths,
      opacity: 0.8,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor: d => {
        const z = d.start[2];
        const r = z / 10000;
        return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
      },
      getWidth: lineWidth,
      pickable: true
    })
  ];

  return (
    <DeckGL
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
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
