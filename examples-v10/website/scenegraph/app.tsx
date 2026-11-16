// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch */
import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import type {Device} from '@luma.gl/core';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {log} from '@deck.gl/core';
import {tableFromArrays} from 'apache-arrow';
import sampleData from './all.json';

import type {ScenegraphLayerProps} from '@deck.gl/mesh-layers';
import type {PickingInfo, MapViewState, LayerData} from '@deck.gl/core';

// Live data provided by the OpenSky Network, https://opensky-network.org.
// The API may reject browser requests from other origins, so the bundled
// snapshot below remains the default and fallback data.
const DATA_URL = 'https://opensky-network.org/api/states/all';
const MODEL_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';
const DROP_IF_OLDER_THAN_SECONDS = 120;

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

// https://openskynetwork.github.io/opensky-api/rest.html#response
type Aircraft = [
  uniqueId: string,
  callSign: string,
  originCountry: string,
  timePosition: number,
  lastContact: number,
  longitude: number | null,
  latitude: number | null,
  baroAltitude: number | null,
  onGround: boolean,
  velocity: number | null,
  trueAttack: number | null,
  verticalRate: number | null,
  sensors: number[],
  geoAltitude: number | null,
  positionSource: number[],
  category: number
];

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

/** Converts the OpenSky response to named columns and makes contact times relative. */
function normalizeData<LayerDataT = LayerData<unknown>>(source: unknown): LayerDataT {
  const {time, states} = source as {time: number; states: Aircraft[]};
  return tableFromArrays({
    callSign: states.map(aircraft => aircraft[1]),
    originCountry: states.map(aircraft => aircraft[2]),
    lastContact: Float64Array.from(states, aircraft => aircraft[4] - time),
    longitude: Float64Array.from(states, aircraft => aircraft[5] ?? 0),
    latitude: Float64Array.from(states, aircraft => aircraft[6] ?? 0),
    velocity: states.map(aircraft => aircraft[9]),
    trueTrack: states.map(aircraft => aircraft[10]),
    verticalRate: states.map(aircraft => aircraft[11]),
    altitude: Float64Array.from(states, aircraft => aircraft[13] ?? 0)
  }) as LayerDataT;
}

// https://github.com/visgl/deck.gl/pull/10465 updated the live OpenSky URL,
// but the endpoint still rejects cross-origin browser requests. Start with this
// bundled snapshot so the demo can render immediately and keep it as fallback.
const DATA = sampleData as {time: number; states: Aircraft[]};

async function fetchData(signal: AbortSignal) {
  const response = await fetch(DATA_URL, {signal});
  if (!response.ok) {
    throw new Error(`OpenSky request failed with status ${response.status}`);
  }
  return (await response.json()) as {time: number; states: Aircraft[]};
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
  mapStyle = MAP_STYLE
}: {
  device?: Device;
  sizeScale?: number;
  onDataLoad?: (count: number) => void;
  mapStyle?: string;
}) {
  const [data, setData] = useState(DATA);
  useEffect(() => {
    const abortController = new AbortController();
    fetchData(abortController.signal)
      .then(setData)
      .catch(error => {
        if (!abortController.signal.aborted) {
          log.warn('Scenegraph example is using its bundled flight snapshot', error)();
        }
      });
    return () => abortController.abort();
  }, []);

  const layer = new ScenegraphLayer<AircraftRow>({
    id: 'scenegraph-layer',
    data,
    dataTransform: normalizeData,
    onDataLoad: () => onDataLoad?.(data.states.length),
    pickable: true,
    sizeScale,
    scenegraph: MODEL_URL,
    _animations: ANIMATIONS,
    sizeMinPixels: 0.1,
    sizeMaxPixels: 1.5,
    getPosition: {sql: 'FLOAT64x3(longitude, latitude, altitude)'},
    getOrientation: ({verticalRate, velocity, trueTrack}) => {
      // -90 looking up, +90 looking down
      const pitch = (-Math.atan2(verticalRate ?? 0, velocity ?? 0) * 180) / Math.PI;
      return [pitch, -(trueTrack ?? 0), 90];
    },
    getScale: ({lastContact}) => {
      return lastContact < -DROP_IF_OLDER_THAN_SECONDS ? [0, 0, 0] : [1, 1, 1];
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
