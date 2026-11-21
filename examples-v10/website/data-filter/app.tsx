// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import type {Device} from '@luma.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {MapView} from '@deck.gl/core';
import {ParquetLoader} from '@loaders.gl/tables/parquet';
import parquetWorkerUrl from '@loaders.gl/tables/parquet/parquet-worker.js?url';
import {isArrowTable} from '@math.gl/core/arrow';
import {POWER} from '@math.gl/sql/math-functions';
import RangeInput from './range-input';

import type {PickingInfo, MapViewState} from '@deck.gl/core';
import type {DataFilterExtensionProps} from '@deck.gl/extensions';

// Full USGS earthquake table
const DATA_URL =
  'https://media.githubusercontent.com/media/visgl/deck.gl-data/479ec6c4c9788b2e80df9a1fe3e42443208523e2/examples/data-filter/earthquakes.parquet';

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

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

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
  device,
  data = DATA_URL,
  onDataLoad,
  mapStyle = MAP_STYLE
}: {
  device?: Device;
  data?: string;
  /** Called after data loads with the total row count, before visibility or filtering. */
  onDataLoad?: (count: number) => void;
  mapStyle?: string;
}) {
  const [filter, setFilter] = useState<[start: number, end: number] | null>(null);

  const [timeRange, setTimeRange] = useState<[number, number] | null>(null);
  const filterValue = filter || timeRange || [0, 0];

  const layers = [
    new ScatterplotLayer<Earthquake, DataFilterExtensionProps<Earthquake>>({
      id: 'earthquakes',
      // Sample row: {timestamp: 283998078600, latitude: 32.43, longitude: 141.651, depth: 32, magnitude: 5.2}
      data,
      loaders: [ParquetLoader],
      loadOptions: {parquet: {workerUrl: parquetWorkerUrl}},
      onDataLoad: table => {
        const rows = isArrowTable(table) || Array.isArray(table) ? table : [];
        let min = Infinity;
        let max = -Infinity;
        for (const row of rows) {
          min = Math.min(min, row.timestamp);
          max = Math.max(max, row.timestamp);
        }
        setTimeRange(Number.isFinite(min) ? [min, max] : null);
        onDataLoad?.(isArrowTable(table) ? table.numRows : rows.length);
      },
      opacity: 0.8,
      radiusScale: 100,
      radiusMinPixels: 1,
      wrapLongitude: true,

      sqlFunctions: [POWER],
      getPosition: {sql: 'ARRAY[longitude, latitude, -1000 * depth]'},
      getRadius: {sql: 'POWER(2, magnitude)'},
      getFillColor: {
        sql: `\
          RGBA8(
            (255 - 15 * SQRT(CASE WHEN depth > 0 THEN depth ELSE 0 END)) / 255,
            5 * SQRT(CASE WHEN depth > 0 THEN depth ELSE 0 END) / 255,
            10 * SQRT(CASE WHEN depth > 0 THEN depth ELSE 0 END) / 255,
            1
          )`
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
        device={device}
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

/** Mounts the standalone example. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
