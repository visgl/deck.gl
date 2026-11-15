// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {sqlParser} from '@deck.gl/core/sql';
import {tableFromArrays} from 'apache-arrow';
import {LineLayer, ScatterplotLayer} from '@deck.gl/layers';

import type {PickingInfo, MapViewState, Widget} from '@deck.gl/core';
import {Device} from '@luma.gl/core';

// Source JSON data
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
  airports,
  flightPaths,
  lineWidth = 3,
  mapStyle = MAP_STYLE,
  device,
  widgets
}: {
  airports?: Airport[];
  flightPaths?: FlightPath[];
  lineWidth?: number;
  mapStyle?: string;
  device?: Device;
  widgets?: Widget[];
}) {
  const airportTable = useMemo(
    () =>
      airports &&
      tableFromArrays({
        longitude: Float64Array.from(airports, airport => airport.coordinates[0]),
        latitude: Float64Array.from(airports, airport => airport.coordinates[1]),
        name: airports.map(airport => airport.name),
        abbrev: airports.map(airport => airport.abbrev),
        type: airports.map(airport => airport.type)
      }),
    [airports]
  );
  const flightTable = useMemo(
    () =>
      flightPaths &&
      tableFromArrays({
        start_longitude: Float64Array.from(flightPaths, flight => flight.start[0]),
        start_latitude: Float64Array.from(flightPaths, flight => flight.start[1]),
        start_altitude: Float64Array.from(flightPaths, flight => flight.start[2]),
        end_longitude: Float64Array.from(flightPaths, flight => flight.end[0]),
        end_latitude: Float64Array.from(flightPaths, flight => flight.end[1]),
        end_altitude: Float64Array.from(flightPaths, flight => flight.end[2]),
        name: flightPaths.map(flight => flight.name),
        country: flightPaths.map(flight => flight.country)
      }),
    [flightPaths]
  );

  const layers = [
    airportTable &&
      new ScatterplotLayer({
        id: 'airports',
        data: airportTable,
        radiusScale: 20,
        getPosition: {sql: 'FLOAT64x2(longitude, latitude)'},
        getFillColor: [255, 140, 0],
        getRadius: {
          sql: "CASE WHEN type = 'major' THEN 100 WHEN type = 'small' THEN 30 ELSE 60 END"
        },
        pickable: true
      }),
    flightTable &&
      new LineLayer({
        id: 'flight-paths',
        data: flightTable,
        opacity: 0.8,
        getSourcePosition: {sql: 'FLOAT64x3(start_longitude, start_latitude, start_altitude)'},
        getTargetPosition: {sql: 'FLOAT64x3(end_longitude, end_latitude, end_altitude)'},
        getColor: {
          sql: `RGBA8(
            1 - start_altitude / 5000,
            (128 / 255) * start_altitude / 10000,
            start_altitude / 10000,
            1 - start_altitude / 10000
          )`
        },
        getWidth: lineWidth,
        pickable: true
      })
  ];

  const isWebGPU = device?.type === 'webgpu';

  return (
    <DeckGL
      sqlParser={sqlParser}
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

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);
  const [airports, flightPaths] = await Promise.all([
    fetch(DATA_URL.AIRPORTS).then(response => response.json()),
    fetch(DATA_URL.FLIGHT_PATHS).then(response => response.json())
  ]);
  root.render(<App airports={airports} flightPaths={flightPaths} />);
}
