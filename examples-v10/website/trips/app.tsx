// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {DeckGL} from '@deck.gl/react/legacy';
import type {Device} from '@luma.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';
import {animate} from 'popmotion';
import {ParquetLoader} from '@loaders.gl/tables/parquet';
import parquetWorkerUrl from '@loaders.gl/tables/parquet/parquet-worker.js?url';
import {isArrowTable} from '@math.gl/core/arrow';
import {expandTrips, LOOP_LENGTH} from './trip-data';

import type {Position, Color, LayerData, Material, MapViewState} from '@deck.gl/core';

const DATA_URL = {
  BUILDINGS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/buildings.json',
  TRIPS:
    'https://media.githubusercontent.com/media/visgl/deck.gl-data/72dc29976856f5a9d01b3eb394818d66e3a0bf00/website/trips.parquet'
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

type Theme = {
  buildingColor: Color;
  trailColor0: Color;
  trailColor1: Color;
  material: Material;
  effects: [LightingEffect];
};

const DEFAULT_THEME: Theme = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material: {
    ambient: 0.1,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [60, 64, 70]
  },
  effects: [lightingEffect]
};

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  pitch: 45,
  bearing: 0
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

const landCover: Position[][] = [
  [
    [-74.0, 40.7],
    [-74.02, 40.7],
    [-74.02, 40.72],
    [-74.0, 40.72]
  ]
];

type Building = {
  polygon: Position[];
  height: number;
};

type Trip = {
  vendor: number;
  path: Position[];
  timestamps: number[];
};

/** Counts of rendered trips and path vertices. */
type TripStats = {trips: number; vertices: number};

/** Expands the shared segment dictionary into TripsLayer rows after loading. */
function unpackTrips<LayerDataT = LayerData<unknown>>(source: unknown): LayerDataT {
  if (!isArrowTable(source)) {
    throw new Error('Expected an Arrow table for Trips');
  }
  return expandTrips(source) as LayerDataT;
}

export default function App({
  device,
  buildings = DATA_URL.BUILDINGS,
  onDataLoad,
  trailLength = 180,
  initialViewState = INITIAL_VIEW_STATE,
  mapStyle = MAP_STYLE,
  theme = DEFAULT_THEME,
  loopLength = LOOP_LENGTH,
  animationSpeed = 1
}: {
  device?: Device;
  buildings?: string | Building[];
  onDataLoad?: (stats: TripStats) => void;
  trailLength?: number;
  loopLength?: number;
  animationSpeed?: number;
  initialViewState?: MapViewState;
  mapStyle?: string;
  theme?: Theme;
}) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const animation = animate({
      from: 0,
      to: loopLength,
      duration: (loopLength * 60) / animationSpeed,
      repeat: Infinity,
      onUpdate: setTime
    });
    return () => animation.stop();
  }, [loopLength, animationSpeed]);

  const layers = [
    // This is only needed when using shadow effects
    new PolygonLayer<Position[]>({
      id: 'ground',
      data: landCover,
      getPolygon: f => f,
      stroked: false,
      getFillColor: [0, 0, 0, 0]
    }),
    new TripsLayer<Trip>({
      id: 'trips',
      // Route row: {vendor: 0, start: 197, end: 3845, segment_ids: [36501, ...]}
      data: DATA_URL.TRIPS,
      loaders: [ParquetLoader],
      loadOptions: {parquet: {workerUrl: parquetWorkerUrl}},
      dataTransform: unpackTrips,
      onDataLoad: table => {
        if (onDataLoad && isArrowTable(table)) {
          let vertices = 0;
          for (const {path} of table) {
            vertices += path.length;
          }
          onDataLoad({trips: table.numRows, vertices});
        }
      },
      getPath: {sql: 'path'},
      getTimestamps: {sql: 'timestamps'},
      getColor: d => (d.vendor === 0 ? theme.trailColor0 : theme.trailColor1),
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength,
      currentTime: time,

      shadowEnabled: false
    }),
    new PolygonLayer<Building>({
      id: 'buildings',
      data: buildings,
      extruded: true,
      wireframe: false,
      opacity: 0.5,
      getPolygon: f => f.polygon,
      getElevation: f => f.height,
      getFillColor: theme.buildingColor,
      material: theme.material
    })
  ];

  return (
    <DeckGL
      device={device}
      layers={layers}
      effects={theme.effects}
      initialViewState={initialViewState}
      controller={true}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
