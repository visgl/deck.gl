// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch */
import React, {useEffect, useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import type {Device} from '@luma.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {tableFromJSON, type Table} from 'apache-arrow';
import {ATAN2, DEGREES} from '@math.gl/sql/math-functions';
import sampleData from './all.json';
import {watchFlightData, type Aircraft} from './flight-data';

import type {ScenegraphLayerProps} from '@deck.gl/mesh-layers';
import type {PickingInfo, MapViewState} from '@deck.gl/core';

// Live data provided by the OpenSky Network, https://opensky-network.org.
// The API may reject browser requests from other origins, so the bundled
// snapshot below remains the default and fallback data.
const DATA_URL = 'https://opensky-network.org/api/states/all';
const MODEL_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';
const DROP_IF_OLDER_THAN_SECONDS = 120;

/** Numeric functions used by the SQL orientation accessor. */
const SQL_FUNCTIONS = [ATAN2, DEGREES];

const ANIMATIONS: ScenegraphLayerProps['_animations'] = {
  '*': {speed: 1}
};

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

/** Named flight fields used for styling and tooltips after Arrow conversion. */
type AircraftRow = {
  /** Aircraft call sign reported by OpenSky. */
  callSign: string;
  /** Country associated with the aircraft's transponder address. */
  originCountry: string;
  /** Seconds from the response timestamp to the last contact. */
  lastContact: number;
  /** Ground speed in meters per second, when reported. */
  velocity: number | null;
  /** Track angle in degrees clockwise from true north, when reported. */
  trueTrack: number | null;
  /** Vertical speed in meters per second, when reported. */
  verticalRate: number | null;
};

/** Unpacks the heterogeneous OpenSky tuples into named Arrow columns. */
function normalizeData(source: {time: number; states: Aircraft[]}): Table {
  const {time, states} = source;
  return tableFromJSON(
    states.map(aircraft => ({
      callSign: aircraft[1],
      originCountry: aircraft[2],
      snapshotTime: time,
      lastContact: aircraft[4],
      longitude: aircraft[5],
      latitude: aircraft[6],
      velocity: aircraft[9],
      trueTrack: aircraft[10],
      verticalRate: aircraft[11],
      altitude: aircraft[13]
    }))
  );
}

// https://github.com/visgl/deck.gl/pull/10465 updated the live OpenSky URL,
// but the endpoint may reject browser requests. Replay this bundled snapshot
// with simulated positional updates whenever live polling is unavailable.
const DATA = {
  ...(sampleData as {time: number; states: Aircraft[]}),
  length: sampleData.states.length
};

async function fetchData(signal: AbortSignal) {
  const response = await fetch(DATA_URL, {signal});
  if (!response.ok) {
    throw new Error(`OpenSky request failed with status ${response.status}`);
  }
  const responseData = (await response.json()) as {time: number; states: Aircraft[]};
  return {...responseData, length: responseData.states.length};
}

function getTooltip({object}: PickingInfo<AircraftRow>) {
  return (
    object &&
    `\
    Call Sign: ${object.callSign || ''}
    Country: ${object.originCountry || ''}
    Vertical Rate: ${object.verticalRate || 0} m/s
    Velocity: ${object.velocity || 0} m/s
    Direction: ${object.trueTrack || 0}`
  );
}

export default function App({
  device,
  sizeScale = 25,
  onDataLoad,
  onDataSource,
  mapStyle = MAP_STYLE
}: {
  device?: Device;
  sizeScale?: number;
  onDataLoad?: (count: number) => void;
  /** Reports whether the example uses live positions or simulated replay. */
  onDataSource?: (source: 'live' | 'replay') => void;
  mapStyle?: string;
}) {
  const [data, setData] = useState(DATA);
  useEffect(
    () =>
      watchFlightData(DATA, fetchData, (snapshot, source) => {
        setData({...snapshot, length: snapshot.states.length});
        onDataSource?.(source);
      }),
    []
  );

  const aircraft = useMemo(() => normalizeData(data), [data]);

  const layer = new ScenegraphLayer<AircraftRow>({
    id: 'scenegraph-layer',
    data: aircraft,
    sqlFunctions: SQL_FUNCTIONS,
    query: `SELECT callSign, originCountry, velocity, trueTrack, verticalRate,
      lastContact - snapshotTime AS lastContact,
      COALESCE(longitude, 0) AS longitude,
      COALESCE(latitude, 0) AS latitude,
      COALESCE(altitude, 0) AS altitude,
      CASE WHEN lastContact - snapshotTime < -${DROP_IF_OLDER_THAN_SECONDS}
        THEN 0 ELSE 1 END AS visible`,
    onDataLoad: () => onDataLoad?.(data.states.length),
    pickable: true,
    sizeScale,
    scenegraph: MODEL_URL,
    _animations: ANIMATIONS,
    sizeMinPixels: 0.1,
    sizeMaxPixels: 1.5,
    getPosition: {sql: 'ARRAY_FLOAT64(longitude, latitude, altitude)'},
    getOrientation: {
      sql: `FLOAT32x3(
        -DEGREES(ATAN2(COALESCE(verticalRate, 0), COALESCE(velocity, 0))),
        -COALESCE(trueTrack, 0), 90)`
    },
    getScale: {
      sql: 'FLOAT32x3(visible, visible, visible)'
    }
  });

  return (
    <DeckGL
      device={device}
      layers={[layer]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
