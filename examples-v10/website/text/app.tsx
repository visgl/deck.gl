// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-len */
import React from 'react';
import {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import type {Device} from '@luma.gl/core';
import {MapView} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {LOG10} from '@math.gl/sql/math-functions';
import {ParquetLoader} from '@loaders.gl/tables/parquet';
import parquetWorkerUrl from '@loaders.gl/tables/parquet/parquet-worker.js?url';
import {isArrowTable} from '@math.gl/core/arrow';

import type {MapViewState} from '@deck.gl/core';
import type {CollisionFilterExtensionProps} from '@deck.gl/extensions';

// Full GeoNames cities table
const DATA_URL =
  'https://media.githubusercontent.com/media/visgl/deck.gl-data/479ec6c4c9788b2e80df9a1fe3e42443208523e2/examples/text-layer/cities-1000.parquet';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

type City = {
  name: string;
  population: number;
  longitude: number;
  latitude: number;
};

export default function App({
  device,
  data = DATA_URL,
  onDataLoad,
  noOverlap = true,
  fontSize = 32,
  mapStyle = MAP_STYLE
}: {
  device?: Device;
  data?: string;
  /** Called after data loads with the total row count, before visibility or filtering. */
  onDataLoad?: (count: number) => void;
  noOverlap?: boolean;
  fontSize?: number;
  mapStyle?: string;
}) {
  const [zoom, setZoom] = useState<number>(INITIAL_VIEW_STATE.zoom);

  const onViewStateChange = useCallback(({viewState}) => {
    setZoom(viewState.zoom);
  }, []);

  const scale = 2 ** zoom;
  const sizeMaxPixels = (scale / 3) * fontSize;
  const sizeMinPixels = Math.min(scale / 1000, 0.5) * fontSize;

  const textLayer = new TextLayer<City, CollisionFilterExtensionProps<City>>({
    id: 'world-cities',
    // Sample row: {name: 'Quillacollo', population: 172405, longitude: -66.27838, latitude: -17.39228}
    data,
    loaders: [ParquetLoader],
    loadOptions: {parquet: {workerUrl: parquetWorkerUrl}},
    onDataLoad: table => {
      if (isArrowTable(table)) {
        onDataLoad?.(table.numRows);
      }
    },
    characterSet: 'auto',
    fontSettings: {
      buffer: 8
    },

    // TextLayer options
    getText: {sql: 'name'},
    getPosition: {sql: 'ARRAY[longitude, latitude]'},
    sqlFunctions: [LOG10],
    getColor: {
      sql: `\
        SCALE_COLOR(
          LOG10(CASE WHEN population > 0 THEN population ELSE 1 END),
          DOMAIN(3, 4, 5, 6, 7),
          PALETTE('#1d91c0', '#41b6c4', '#7fcdbb', '#c7e9b4', '#edf8b1')
        )`
    },
    getSize: {sql: 'SQRT(SQRT(population)) / 40'},
    sizeScale: fontSize,
    sizeMaxPixels,
    sizeMinPixels,
    maxWidth: 64 * 12,

    // CollideExtension options
    collisionEnabled: noOverlap,
    getCollisionPriority: {sql: 'LOG10(CASE WHEN population > 0 THEN population ELSE 1 END)'},
    collisionTestProps: {
      sizeScale: fontSize * 2,
      sizeMaxPixels: sizeMaxPixels * 2,
      sizeMinPixels: sizeMinPixels * 2
    },
    // CollisionFilterExtension has not been ported to WebGPU yet.
    extensions: device?.type === 'webgpu' ? [] : [new CollisionFilterExtension()]
  });

  return (
    <DeckGL
      device={device}
      views={new MapView({repeat: true})}
      layers={[textLayer]}
      initialViewState={INITIAL_VIEW_STATE}
      onViewStateChange={onViewStateChange}
      controller={{dragRotate: false}}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

/** Mounts the standalone example. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
