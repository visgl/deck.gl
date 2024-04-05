import React, {useState, useEffect, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer, IconLayer, TextLayer} from '@deck.gl/layers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

import type {Color, MapViewState, PickingInfo} from '@deck.gl/core';
import type {FeatureCollection, Feature, LineString} from 'geojson';
import type {TerrainLayerProps} from '@deck.gl/geo-layers';

const DATA_URL_BASE = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/terrain';
const DATA_URL = `${DATA_URL_BASE}/tour_de_france_2023.json`;

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 43.09822,
  longitude: -0.6194,
  zoom: 10,
  pitch: 55,
  maxZoom: 13.5,
  bearing: 0,
  maxPitch: 89
};

const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;

// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
// Note - the elevation rendered by this example is greatly exagerated!
const ELEVATION_DECODER: TerrainLayerProps["elevationDecoder"] = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

const COLOR_SCHEME: Color[] = [
  [166, 206, 227],
  [31, 120, 180],
  [178, 223, 138],
  [51, 160, 44],
  [251, 154, 153],
  [227, 26, 28],
  [253, 191, 111]
];

type RouteProperties = {
  day: number;
  start: string;
  finish: string;
  km: number;
  type: string;
};
type Route = Feature<LineString, RouteProperties>;

type Stage = {
  day: number;
  name: string;
  coordinates: [number, number];
  type: 'start' | 'finish';
};

function getTooltip({object}: PickingInfo<Route>) {
  if (!object) return null;

  const {day, start, finish, km, type} = object.properties;
  return `\
    Day ${day}: ${start} - ${finish}
    ${km} km (${type})
    `;
}

export default function App({initialViewState = INITIAL_VIEW_STATE}: {
  initialViewState?: MapViewState;
}) {
  const [routes, setRoutes] = useState<FeatureCollection<LineString, RouteProperties>>();

  useEffect(() => {
    fetch(DATA_URL)
      .then(resp => resp.json())
      .then(setRoutes);
  }, []);

  const stages = useMemo(() => {
    return routes?.features.flatMap(f => {
      const {coordinates} = f.geometry;
      const {day, start, finish} = f.properties;
      return [
        {type: 'start', name: start, day, coordinates: coordinates[0]},
        {type: 'finish', name: finish, day, coordinates: coordinates[coordinates.length - 1]}
      ] as Stage[];
    })
  }, [routes])

  const layers = [
    new TerrainLayer({
      id: 'terrain',
      minZoom: 0,
      strategy: 'no-overlap',
      elevationDecoder: ELEVATION_DECODER,
      elevationData: TERRAIN_IMAGE,
      texture: SURFACE_IMAGE,
      wireframe: false,
      color: [255, 255, 255],
      operation: 'terrain+draw'
    }),
    new GeoJsonLayer<RouteProperties>({
      id: 'gpx-routes',
      data: routes,
      getLineColor: f => COLOR_SCHEME[f.properties.day % COLOR_SCHEME.length],
      getLineWidth: 30,
      lineWidthMinPixels: 6,
      pickable: true,
      extensions: [new TerrainExtension()]
    }),
    new IconLayer<Stage>({
      id: 'stage-icon',
      data: stages,
      iconAtlas: `${DATA_URL_BASE}/flag-icons.png`,
      iconMapping: `${DATA_URL_BASE}/flag-icons.json`,
      getPosition: d => d.coordinates,
      getIcon: d => d.type === 'start' ? 'green' : 'checker',
      getSize: 32,
      extensions: [new TerrainExtension()]
    }),
    new TextLayer<Stage>({
      id: 'stage-label',
      data: stages,
      characterSet: 'auto',
      parameters: {
        // should not be occluded by terrain
        depthCompare: 'always'
      },
      getPosition: d => d.coordinates,
      getText: d => d.name,
      getColor: [255, 255, 255],
      getSize: 18,
      getAlignmentBaseline: 'top',
      extensions: [new TerrainExtension()]
    })
  ];

  return (
    <DeckGL
      initialViewState={initialViewState}
      controller={true}
      layers={layers}
      pickingRadius={5}
      getTooltip={getTooltip}
    />
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
