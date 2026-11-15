// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {isArrowTable} from '@math.gl/arrow';
import {JSONTableLoader} from '@loaders.gl/tables/json';
import {ScatterplotLayer} from '@deck.gl/layers';

import type {Color, MapViewState, Widget} from '@deck.gl/core';
import type {Device, DeviceProps} from '@luma.gl/core';

const MALE_COLOR: Color = [0, 128, 255, 255];
const FEMALE_COLOR: Color = [255, 0, 128, 255];

// Source data JSON
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -74,
  latitude: 40.7,
  zoom: 11,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export default function App({
  device,
  deviceProps,
  radius = 30,
  maleColor = MALE_COLOR,
  femaleColor = FEMALE_COLOR,
  mapStyle = 'https://tiles.openfreemap.org/styles/positron',
  widgets,
  onDataLoad
}: {
  device?: Device;
  deviceProps?: DeviceProps;
  radius?: number;
  maleColor?: Color;
  femaleColor?: Color;
  mapStyle?: string;
  widgets?: Widget[];
  onDataLoad?: (count: number) => void;
}) {
  const [maleRed, maleGreen, maleBlue, maleAlpha = 255] = maleColor;
  const [femaleRed, femaleGreen, femaleBlue, femaleAlpha = 255] = femaleColor;

  const layers = [
    new ScatterplotLayer({
      id: 'scatter-plot',
      // Sample row: [-73.986022, 40.730743, 2]
      data: DATA_URL,
      loaders: [JSONTableLoader],
      query: 'SELECT column1 AS longitude, column2 AS latitude, column3 AS gender',
      onDataLoad: table => {
        if (isArrowTable(table)) {
          onDataLoad?.(table.numRows);
        }
      },
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: {sql: 'FLOAT64x2(longitude, latitude)'},
      getFillColor: {
        sql: `RGBA8(
          (CASE WHEN gender = 1 THEN ${maleRed} ELSE ${femaleRed} END) / 255,
          (CASE WHEN gender = 1 THEN ${maleGreen} ELSE ${femaleGreen} END) / 255,
          (CASE WHEN gender = 1 THEN ${maleBlue} ELSE ${femaleBlue} END) / 255,
          (CASE WHEN gender = 1 THEN ${maleAlpha} ELSE ${femaleAlpha} END) / 255
        )`
      },
      getRadius: 1,
      pickable: true
    })
  ];

  return (
    <DeckGL
      device={device}
      deviceProps={deviceProps}
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      widgets={widgets}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement, device?: Device, deviceProps?: DeviceProps) {
  createRoot(container).render(<App deviceProps={deviceProps} />);
}
