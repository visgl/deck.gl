// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {useState, useMemo, useCallback} from 'react';
import maplibregl from 'maplibre-gl/dist/maplibre-gl-dev';
import {Map} from '@vis.gl/react-maplibre';

import {createRoot} from 'react-dom/client';

import DeckGL from '@deck.gl/react';
import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  LightingEffect,
  AmbientLight,
  _SunLight as SunLight
} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {SphereGeometry} from '@luma.gl/engine';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import AnimatedArcLayer from './animated-arc-group-layer';
import RangeInput from './range-input';
import type {GlobeViewState} from '@deck.gl/core';

// Data source
const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/globe';

const INITIAL_VIEW_STATE: GlobeViewState = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  minZoom: 1,
  maxZoom: 3
};

const ANIMATION_SPEED = 60;
const TIME_WINDOW = 1800; // 30 minutes
const EARTH_RADIUS_METERS = 6370972;
const SEC_PER_DAY = 60 * 60 * 24;

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.5
});
const sunLight = new SunLight({
  color: [255, 255, 255],
  intensity: 2.0,
  timestamp: 0
});
// create lighting effect with light sources
const lightingEffect = new LightingEffect({ambientLight, sunLight});

type Flight = {
  // Departure
  time1: number;
  lon1: number;
  lat1: number;
  alt1: number;

  // Arrival
  time2: number;
  lon2: number;
  lat2: number;
  alt2: number;
};

type DailyFlights = {
  date: string;
  flights: Flight[];
};

export default function App({data}: {data?: DailyFlights[]}) {
  const [currentTime, setCurrentTime] = useState(0);

  const timeRange: [number, number] = [currentTime, currentTime + TIME_WINDOW];

  const formatLabel = useCallback((t: number) => getDate(data, t).toUTCString(), [data]);

  if (data) {
    sunLight.timestamp = getDate(data, currentTime);
  }

  const backgroundLayers = useMemo(
    () => [
      new SimpleMeshLayer({
        id: 'earth-sphere',
        data: [0],
        mesh: new SphereGeometry({radius: EARTH_RADIUS_METERS, nlat: 18, nlong: 36}),
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: [0, 0, 0],
        getColor: [255, 255, 255, 0]
      })
    ],
    []
  );

  const dataLayers =
    data &&
    data.map(
      ({date, flights}) =>
        new AnimatedArcLayer<Flight>({
          id: `flights-${date}`,
          data: flights,
          getSourcePosition: d => [d.lon1, d.lat1, d.alt1],
          getTargetPosition: d => [d.lon2, d.lat2, d.alt2],
          getSourceTimestamp: d => d.time1,
          getTargetTimestamp: d => d.time2,
          getHeight: 0.3,
          getWidth: 2,
          timeRange,
          getSourceColor: [63, 81, 181],
          getTargetColor: [63, 181, 173]
        })
    );

  return (
    <>
      <DeckGL
        views={new GlobeView()}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        effects={[lightingEffect]}
        layers={[backgroundLayers, dataLayers]}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          projection={'globe'}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        />
      </DeckGL>
      {data && (
        <RangeInput
          min={0}
          max={data.length * SEC_PER_DAY}
          value={currentTime}
          animationSpeed={ANIMATION_SPEED}
          formatLabel={formatLabel}
          onChange={setCurrentTime}
        />
      )}
    </>
  );
}

function getDate(data: DailyFlights[], t: number) {
  const index = Math.min(data.length - 1, Math.floor(t / SEC_PER_DAY));
  const date = data[index].date;
  const timestamp = new Date(`${date}T00:00:00Z`).getTime() + (t % SEC_PER_DAY) * 1000;
  return new Date(timestamp);
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const dates = [
    '2020-01-14',
    '2020-02-11',
    '2020-03-10',
    '2020-04-14',
    '2020-05-12',
    '2020-06-09',
    '2020-07-14',
    '2020-08-11',
    '2020-09-08',
    '2020-10-13',
    '2020-11-10',
    '2020-12-08'
  ];

  const data: DailyFlights[] = [];
  for (const date of dates) {
    const url = `${DATA_URL}/${date}.csv`;
    const flights: Flight[] = (await load(url, CSVLoader, {csv: {skipEmptyLines: true}})).data;

    // Join flight data from multiple dates into one continuous animation
    const offset = SEC_PER_DAY * data.length;
    for (const f of flights) {
      f.time1 += offset;
      f.time2 += offset;
    }
    data.push({flights, date});
    root.render(<App data={data} />);
  }
}
