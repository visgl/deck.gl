// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';

import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';

import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';

import AnimatedArcLayer from './animated-arc-group-layer';
import RangeInput from './range-input';
import type {MapViewState} from '@deck.gl/core';
import type {AnimatedArcLayerProps} from './animated-arc-layer';

// Data source
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/globe/2020-01-14.csv';
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -40,
  latitude: 40,
  zoom: 2,
  maxZoom: 6
};

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

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  mapStyle = MAP_STYLE,
  showFlights = true,
  timeWindow = 30,
  animationSpeed = 3
}: {
  data?: Flight[];
  mapStyle?: string;
  showFlights?: boolean;
  timeWindow?: number;
  animationSpeed?: number;
}) {
  const [currentTime, setCurrentTime] = useState(0);

  const citiesLayers = useMemo(
    () => [
      new GeoJsonLayer({
        id: 'cities',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson',

        pointType: 'circle',
        pointRadiusUnits: 'pixels',
        getFillColor: [255, 232, 180]
      }),

      new GeoJsonLayer({
        id: 'cities-highlight',
        data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_populated_places_simple.geojson',

        pointType: 'circle',
        pointRadiusUnits: 'common',
        pointRadiusScale: 0.3,
        pointRadiusMinPixels: 2,
        pointRadiusMaxPixels: 30,
        getLineColor: [255, 232, 180, 90],
        getLineWidth: 3,
        lineWidthUnits: 'pixels',
        filled: false,
        stroked: true,

        extensions: [new MaskExtension()],
        maskId: 'flight-mask'
      })
    ],
    []
  );

  const flightLayerProps: Partial<AnimatedArcLayerProps<Flight>> = {
    data,
    greatCircle: true,
    getSourcePosition: d => [d.lon1, d.lat1],
    getTargetPosition: d => [d.lon2, d.lat2],
    getSourceTimestamp: d => d.time1,
    getTargetTimestamp: d => d.time2,
    getHeight: 0
  };

  const flightPathsLayer =
    showFlights &&
    new AnimatedArcLayer<Flight>({
      ...flightLayerProps,
      id: 'flight-paths',
      timeRange: [currentTime - 600, currentTime], // 10 minutes
      getWidth: 0.2,
      widthMinPixels: 1,
      widthMaxPixels: 4,
      widthUnits: 'common',
      getSourceColor: [180, 232, 255],
      getTargetColor: [180, 232, 255],
      parameters: {depthCompare: 'always'}
    });

  const flightMaskLayer = new AnimatedArcLayer<Flight>({
    ...flightLayerProps,
    id: 'flight-mask',
    timeRange: [currentTime - timeWindow * 60, currentTime],
    operation: 'mask',
    getWidth: 5000,
    widthUnits: 'meters'
  });

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={[flightPathsLayer, flightMaskLayer, citiesLayers]}
      >
        <Map reuseMaps mapStyle={mapStyle} />
      </DeckGL>
      {data && (
        <RangeInput
          min={0}
          max={86400}
          value={currentTime}
          animationSpeed={animationSpeed}
          formatLabel={formatTimeLabel}
          onChange={setCurrentTime}
        />
      )}
    </>
  );
}

function formatTimeLabel(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) % 60;
  const s = seconds % 60;
  return [h, m, s].map(x => x.toString().padStart(2, '0')).join(':');
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const flights = (await load(DATA_URL, CSVLoader)).data;
  root.render(<App data={flights} showFlights />);
}
