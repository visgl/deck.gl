// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {sqlParser} from '@deck.gl/core/sql';
import {JSONTableLoader} from '@loaders.gl/tables/json';
import {ScatterplotLayer} from '@deck.gl/layers';

import type {Color, MapViewState, Widget} from '@deck.gl/core';
import type {Device, DeviceProps} from '@luma.gl/core';

/** Converts a color channel to the normalized range expected by RGBA8. */
function normalizedChannel(color: Color, index: number): number {
  return (color[index] ?? 255) / 255;
}

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

type DataPoint = [longitude: number, latitude: number, gender: number];

export default function App({
  device,
  deviceProps,
  data = DATA_URL,
  radius = 30,
  maleColor = MALE_COLOR,
  femaleColor = FEMALE_COLOR,
  mapStyle = 'https://tiles.openfreemap.org/styles/positron',
  widgets,
  onDataLoad
}: {
  device?: Device;
  deviceProps?: DeviceProps;
  data?: string | DataPoint[];
  radius?: number;
  maleColor?: Color;
  femaleColor?: Color;
  mapStyle?: string;
  widgets?: Widget[];
  onDataLoad?: (count: number) => void;
}) {
  const layers = [
    new ScatterplotLayer<DataPoint>({
      id: 'scatter-plot',
      data,
      loaders: [JSONTableLoader],
      // Source row: [-73.986022, 40.730743, 2]
      query:
        typeof data === 'string'
          ? 'SELECT column1 AS longitude, column2 AS latitude, column3 AS gender'
          : null,
      onDataLoad: table => {
        if (typeof data === 'string') {
          onDataLoad?.((table as {numRows: number}).numRows);
        }
      },
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition:
        typeof data === 'string' ? {sql: 'FLOAT64x2(longitude, latitude)'} : d => [d[0], d[1], 0],
      getFillColor:
        typeof data === 'string'
          ? {
              sql: `RGBA8(${[0, 1, 2, 3]
                .map(
                  index =>
                    `CASE WHEN gender = 1 THEN ${normalizedChannel(maleColor, index)} ELSE ${normalizedChannel(femaleColor, index)} END`
                )
                .join(', ')})`
            }
          : d => (d[2] === 1 ? maleColor : femaleColor),
      getRadius: 1,
      updateTriggers: {
        getFillColor: [maleColor, femaleColor]
      },
      pickable: true
    })
  ];

  return (
    <DeckGL
      sqlParser={sqlParser}
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
