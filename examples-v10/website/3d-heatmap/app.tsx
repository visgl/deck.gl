// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {DeckGL} from '@deck.gl/react';
import {CSVLoader} from '@loaders.gl/tables/csv';
import {sqlParser} from '@deck.gl/core/sql';
import {isArrowTable} from '@math.gl/arrow';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';
import type {Device} from '@luma.gl/core';

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -1.415727,
  latitude: 52.232395,
  zoom: 6.6,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

export const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

function getTooltip({object}: PickingInfo) {
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.count;

  return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    ${count} Accidents`;
}

/** Coordinates selected by the CSV query. */
type DataPoint = {lng: number; lat: number};

export default function App({
  mapStyle = MAP_STYLE,
  radius = 1000,
  upperPercentile = 100,
  coverage = 1,
  device,
  onDataLoad
}: {
  mapStyle?: string;
  radius?: number;
  upperPercentile?: number;
  coverage?: number;
  device?: Device;
  onDataLoad?: (count: number) => void;
}) {
  const [hasData, setHasData] = useState(false);
  const layers = [
    new HexagonLayer<DataPoint>({
      id: 'heatmap',
      gpuAggregation: true,
      colorRange,
      coverage,
      // Sample row (lng,lat): -0.198465,51.505538
      data: DATA_URL,
      loaders: [CSVLoader],
      query: 'SELECT lng, lat WHERE lng IS NOT NULL AND lat IS NOT NULL',
      elevationRange: [0, 3000],
      elevationScale: hasData ? 50 : 0,
      onDataLoad: table => {
        if (isArrowTable(table)) {
          setHasData(true);
          onDataLoad?.(table.numRows);
        }
      },
      extruded: true,
      getPosition: ({lng, lat}) => [lng, lat],
      pickable: true,
      radius,
      upperPercentile,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51]
      },

      transitions: {
        elevationScale: 3000
      }
    })
  ];

  return (
    <DeckGL
      sqlParser={sqlParser}
      device={device}
      layers={layers}
      effects={[lightingEffect]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
