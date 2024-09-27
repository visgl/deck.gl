// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-len */
import React from 'react';
import {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {scaleLog} from 'd3-scale';
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';

import type {Color, MapViewState} from '@deck.gl/core';
import type {CollisionFilterExtensionProps} from '@deck.gl/extensions';

// Sample data
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/text-layer/cities-1000.csv';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

type City = {
  name: string;
  population: number;
  longitude: number;
  latitude: number;
};

const colorScale = scaleLog<Color>()
  .domain([1e3, 1e4, 1e5, 1e6, 1e7])
  .range([
    [29, 145, 192],
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177]
  ]);

export default function App({
  data,
  noOverlap = true,
  fontSize = 32,
  mapStyle = MAP_STYLE
}: {
  data?: City[];
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
    data,
    characterSet: 'auto',
    fontSettings: {
      buffer: 8
    },

    // TextLayer options
    getText: d => d.name,
    getPosition: d => [d.longitude, d.latitude],
    getColor: d => colorScale(d.population),
    getSize: d => Math.pow(d.population, 0.25) / 40,
    sizeScale: fontSize,
    sizeMaxPixels,
    sizeMinPixels,
    maxWidth: 64 * 12,

    // CollideExtension options
    collisionEnabled: noOverlap,
    getCollisionPriority: d => Math.log10(d.population),
    collisionTestProps: {
      sizeScale: fontSize * 2,
      sizeMaxPixels: sizeMaxPixels * 2,
      sizeMinPixels: sizeMinPixels * 2
    },
    extensions: [new CollisionFilterExtension()]
  });

  return (
    <DeckGL
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

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const cities = (await load(DATA_URL, CSVLoader)).data;
  root.render(<App data={cities} />);
}
