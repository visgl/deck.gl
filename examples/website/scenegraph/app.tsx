// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch */
import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {log} from '@deck.gl/core';
import sampleData from './all.json';

import type {ScenegraphLayerProps} from '@deck.gl/mesh-layers';
import type {PickingInfo, MapViewState} from '@deck.gl/core';
import type {Device} from '@luma.gl/core';

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

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

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

const DATA_INDEX = {
  UNIQUE_ID: 0,
  CALL_SIGN: 1,
  ORIGIN_COUNTRY: 2,
  LAST_CONTACT: 4,
  LONGITUDE: 5,
  LATITUDE: 6,
  BARO_ALTITUDE: 7,
  VELOCITY: 9,
  TRUE_TRACK: 10,
  VERTICAL_RATE: 11,
  GEO_ALTITUDE: 13,
  CATEGORY: 17
} as const;

function normalizeData({time, states}: {time: number; states: Aircraft[]}): Aircraft[] {
  // make lastContact timestamp relative to response time
  return states.map(state => {
    const aircraft = [...state] as Aircraft;
    aircraft[DATA_INDEX.LAST_CONTACT] -= time;
    return aircraft;
  });
}

// https://github.com/visgl/deck.gl/pull/10465 updated the live OpenSky URL,
// but the endpoint still rejects cross-origin browser requests. Start with this
// bundled snapshot so the demo can render immediately and keep it as fallback.
const DATA = normalizeData(sampleData as {time: number; states: Aircraft[]});

async function fetchData(signal: AbortSignal): Promise<Aircraft[]> {
  const response = await fetch(DATA_URL, {signal});
  if (!response.ok) {
    throw new Error(`OpenSky request failed with status ${response.status}`);
  }
  return normalizeData((await response.json()) as {time: number; states: Aircraft[]});
}

function getTooltip({object}: PickingInfo<Aircraft>) {
  return (
    object &&
    `\
    Call Sign: ${object[DATA_INDEX.CALL_SIGN] || ''}
    Country: ${object[DATA_INDEX.ORIGIN_COUNTRY] || ''}
    Vertical Rate: ${object[DATA_INDEX.VERTICAL_RATE] || 0} m/s
    Velocity: ${object[DATA_INDEX.VELOCITY] || 0} m/s
    Direction: ${object[DATA_INDEX.TRUE_TRACK] || 0}`
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
  const onDataLoadRef = useRef(onDataLoad);

  useEffect(() => {
    onDataLoadRef.current = onDataLoad;
  }, [onDataLoad]);

  useEffect(() => {
    onDataLoadRef.current?.(data.length);
  }, [data]);

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

  const layer = new ScenegraphLayer<Aircraft>({
    id: 'scenegraph-layer',
    data,
    pickable: true,
    sizeScale,
    scenegraph: MODEL_URL,
    _animations: ANIMATIONS,
    sizeMinPixels: 0.1,
    sizeMaxPixels: 1.5,
    getPosition: d => [
      d[DATA_INDEX.LONGITUDE] ?? 0,
      d[DATA_INDEX.LATITUDE] ?? 0,
      d[DATA_INDEX.GEO_ALTITUDE] ?? 0
    ],
    getOrientation: d => {
      const verticalRate = d[DATA_INDEX.VERTICAL_RATE] ?? 0;
      const velocity = d[DATA_INDEX.VELOCITY] ?? 0;
      // -90 looking up, +90 looking down
      const pitch = (-Math.atan2(verticalRate, velocity) * 180) / Math.PI;
      const yaw = -d[DATA_INDEX.TRUE_TRACK] ?? 0;
      return [pitch, yaw, 90];
    },
    getScale: d => {
      const lastContact = d[DATA_INDEX.LAST_CONTACT];
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
