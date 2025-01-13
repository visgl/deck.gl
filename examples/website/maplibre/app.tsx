// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {useState, useMemo, useCallback, useEffect} from 'react';
import maplibregl from 'maplibre-gl/dist/maplibre-gl-dev';
import {Map, useControl} from '@vis.gl/react-maplibre';
import type {ViewState} from '@vis.gl/react-maplibre';
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';

import {createRoot} from 'react-dom/client';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import AnimatedArcLayer from './animated-arc-group-layer';
import RangeInput from './range-input';

// Data source
const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/globe';

const INITIAL_VIEW_STATE: ViewState & {width: number; height: number} = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  padding: {top: 0, bottom: 0, left: 0, right: 0},
  width: window.innerWidth,
  height: window.innerHeight
};

const ANIMATION_SPEED = 60;
const TIME_WINDOW = 1800; // 30 minutes
const SEC_PER_DAY = 60 * 60 * 24;

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

function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function App({data}: {data?: DailyFlights[]}) {
  const [currentTime, setCurrentTime] = useState(0);
  const timeRange: [number, number] = [currentTime, currentTime + TIME_WINDOW];

  const formatLabel = useCallback((t: number) => getDate(data, t).toUTCString(), [data]);
  const layers =
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
          getTargetColor: [63, 181, 173],
          parameters: {cullMode: 'none'}
        })
    );

  return (
    <div
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        background: 'linear-gradient(0, #000, #223)'
      }}
    >
      <Map
        reuseMaps
        mapLib={maplibregl}
        projection="globe"
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      >
        <DeckGLOverlay layers={layers} interleaved/>
      </Map>
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
    </div>
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
    const flights: Flight[] = (await load(url, CSVLoader, {csv: {skipEmptyLines: true}})).data as Flight[];

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
