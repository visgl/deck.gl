// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {ParquetLoader} from '@loaders.gl/tables/parquet';
import parquetWorkerUrl from '@loaders.gl/tables/parquet/parquet-worker.js?url';
import {isArrowTable} from '@math.gl/core/arrow';
import {ScreenGridLayer} from '@deck.gl/aggregation-layers';

import type {Color, MapViewState} from '@deck.gl/core';
import type {Device} from '@luma.gl/core';

const DATA_URL =
  'https://media.githubusercontent.com/media/visgl/deck.gl-data/ea4a0a0a3fa71ee94ed381ce2691431cca864f88/website/uber-pickups-nyc.parquet';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -73.75,
  latitude: 40.73,
  zoom: 9.6,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

const colorRange: Color[] = [
  [255, 255, 178, 25],
  [254, 217, 118, 85],
  [254, 178, 76, 127],
  [253, 141, 60, 170],
  [240, 59, 32, 212],
  [189, 0, 38, 255]
];

export default function App({
  data = DATA_URL,
  onDataLoad,
  cellSize = 20,
  gpuAggregation = true,
  aggregation = 'SUM',
  mapStyle = MAP_STYLE,
  device
}: {
  data?: string;
  onDataLoad?: (count: number) => void;
  cellSize?: number;
  gpuAggregation?: boolean;
  aggregation?: 'SUM' | 'MEAN' | 'MIN' | 'MAX';
  mapStyle?: string;
  device?: Device;
}) {
  const layers = [
    new ScreenGridLayer({
      id: 'grid',
      // Sample row: {longitude: -72.0666, latitude: 42.1166, count: 1}
      data,
      loaders: [ParquetLoader],
      loadOptions: {parquet: {workerUrl: parquetWorkerUrl}},
      onDataLoad: table => {
        if (isArrowTable(table)) {
          onDataLoad?.(table.numRows);
        }
      },
      opacity: 0.8,
      getPosition: {sql: 'ARRAY_FLOAT64(longitude, latitude)'},
      getWeight: {sql: 'count'},
      cellSizePixels: cellSize,
      colorRange,
      gpuAggregation,
      aggregation
    })
  ];

  return (
    <DeckGL device={device} layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
