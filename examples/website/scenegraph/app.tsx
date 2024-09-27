// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch, setTimeout, clearTimeout */
import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';

import type {ScenegraphLayerProps} from '@deck.gl/mesh-layers';
import type {PickingInfo, MapViewState} from '@deck.gl/core';

// Data provided by the OpenSky Network, http://www.opensky-network.org
const DATA_URL = 'https://opensky-network.org/api/states/all';
// For local debugging
// const DATA_URL = './all.json';
const MODEL_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb';
const REFRESH_TIME_SECONDS = 60;
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

async function fetchData(): Promise<Aircraft[]> {
  const resp = await fetch(DATA_URL);
  const {time, states} = (await resp.json()) as {time: number; states: Aircraft[]};
  // make lastContact timestamp relative to response time
  for (const a of states) {
    a[DATA_INDEX.LAST_CONTACT] -= time;
  }
  return states;
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
  sizeScale = 25,
  onDataLoad,
  mapStyle = MAP_STYLE
}: {
  sizeScale?: number;
  onDataLoad?: (count: number) => void;
  mapStyle?: string;
}) {
  const [data, setData] = useState<Aircraft[]>();
  const [timer, setTimer] = useState<{id: number | null}>({id: null});

  useEffect(() => {
    timer.id++;
    fetchData()
      .then(newData => {
        if (timer.id === null) {
          // Component has unmounted
          return;
        }
        // In order to keep the animation smooth we need to always return the same
        // object at a given index. This function will discard new objects
        // and only update existing ones.
        if (data) {
          const dataById: Record<string, Aircraft> = {};
          newData.forEach(entry => (dataById[entry[DATA_INDEX.UNIQUE_ID]] = entry));
          newData = data.map(entry => dataById[entry[DATA_INDEX.UNIQUE_ID]] || entry);
        }

        setData(newData);

        if (onDataLoad) {
          onDataLoad(newData.length);
        }
      })
      .finally(() => {
        const timeoutId = setTimeout(() => setTimer({id: timeoutId}), REFRESH_TIME_SECONDS * 1000);
        timer.id = timeoutId;
      });

    return () => {
      clearTimeout(timer.id);
      timer.id = null;
    };
  }, [timer, data]);

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
    },
    transitions: {
      getPosition: REFRESH_TIME_SECONDS * 1000
    }
  });

  return (
    <DeckGL
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
