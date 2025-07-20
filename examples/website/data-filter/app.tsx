// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {MapView} from '@deck.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';
import RangeInput from './range-input';

import type {PickingInfo, MapViewState} from '@deck.gl/core';
import type {DataFilterExtensionProps} from '@deck.gl/extensions';

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-web/kepler.gl-data/master/earthquakes/data.csv'; // eslint-disable-line

// This is only needed for this particular dataset - the default view assumes
// that the furthest geometries are on the ground. Because we are drawing the
// circles at the depth of the earthquakes, i.e. below sea level, we need to
// push the far plane away to avoid clipping them.
const MAP_VIEW = new MapView({
  repeat: true,
  // 1 is the distance between the camera and the ground
  farZMultiplier: 100
});

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 36.5,
  longitude: -120,
  zoom: 5.5,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const MS_PER_DAY = 8.64e7;

type Earthquake = {
  timestamp: number;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
};

const dataFilter = new DataFilterExtension({
  filterSize: 1,
  // Enable for higher precision, e.g. 1 second granularity
  // See DataFilterExtension documentation for how to pick precision
  fp64: false
});

function formatLabel(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`;
}

function getTimeRange(data?: Earthquake[]): [minTime: number, maxTime: number] | null {
  if (!data) {
    return null;
  }
  return data.reduce(
    (range, d) => {
      const t = d.timestamp;
      range[0] = Math.min(range[0], t);
      range[1] = Math.max(range[1], t);
      return range;
    },
    [Infinity, -Infinity]
  );
}

function getTooltip({object}: PickingInfo<Earthquake>) {
  return (
    object &&
    `\
    Time: ${new Date(object.timestamp).toUTCString()}
    Magnitude: ${object.magnitude}
    Depth: ${object.depth}
    `
  );
}

export default function App({
  data,
  mapStyle = MAP_STYLE
}: {
  data?: Earthquake[];
  mapStyle?: string;
}) {
  const [filter, setFilter] = useState<[start: number, end: number] | null>(null);

  const timeRange = useMemo(() => getTimeRange(data), [data]);
  const filterValue = filter || timeRange;

  const layers = [
    filterValue &&
      new ScatterplotLayer<Earthquake, DataFilterExtensionProps<Earthquake>>({
        id: 'earthquakes',
        data,
        opacity: 0.8,
        radiusScale: 100,
        radiusMinPixels: 1,
        wrapLongitude: true,

        getPosition: d => [d.longitude, d.latitude, -d.depth * 1000],
        getRadius: d => Math.pow(2, d.magnitude),
        getFillColor: d => {
          const r = Math.sqrt(Math.max(d.depth, 0));
          return [255 - r * 15, r * 5, r * 10];
        },

        getFilterValue: d => d.timestamp,
        filterRange: [filterValue[0], filterValue[1]],
        filterSoftRange: [
          filterValue[0] * 0.9 + filterValue[1] * 0.1,
          filterValue[0] * 0.1 + filterValue[1] * 0.9
        ],
        extensions: [dataFilter],

        pickable: true
      })
  ];

  return (
    <>
      <DeckGL
        views={MAP_VIEW}
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapStyle={mapStyle} />
      </DeckGL>

      {timeRange && (
        <RangeInput
          min={timeRange[0]}
          max={timeRange[1]}
          value={filterValue}
          animationSpeed={MS_PER_DAY * 30}
          formatLabel={formatLabel}
          onChange={setFilter}
        />
      )}
    </>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const data = (await load(DATA_URL, CSVLoader)).data;

  const earthquakes = data.map(row => ({
    timestamp: new Date(`${row.DateTime} UTC`).getTime(),
    latitude: row.Latitude,
    longitude: row.Longitude,
    depth: row.Depth,
    magnitude: row.Magnitude
  }));
  root.render(<App data={earthquakes} />);
}
