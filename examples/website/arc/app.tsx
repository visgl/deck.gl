/* global fetch */
import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {scaleQuantile} from 'd3-scale';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';
import type {Feature, Polygon, MultiPolygon} from 'geojson';

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line

export const inFlowColors: Color[] = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132]
];

export const outFlowColors: Color[] = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38]
];

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
  pitch: 30,
  bearing: 30
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

type CountyProperties = {
  /** county name */
  name: string;
  /** county index -> net flow */
  flows: Record<string, number>;
  /** geographical centroid */
  centroid: [number, number];
};

type County = Feature<Polygon|MultiPolygon, CountyProperties>;

type MigrationFlow = {
  /** from county centroid */
  source: [number, number];
  /** to county centroid */
  target: [number, number];
  /** net gain */
  value: number;
  quantile: number;
}

function calculateArcs(data: County[] | undefined, selectedCounty?: County) {
  if (!data || !data.length) {
    return null;
  }
  if (!selectedCounty) {
    selectedCounty = data.find(f => f.properties.name === 'Los Angeles, CA')!;
  }
  const {flows, centroid} = selectedCounty.properties;

  const arcs: MigrationFlow[] = Object.keys(flows).map(toId => {
    const f = data[Number(toId)];
    return {
      source: centroid,
      target: f.properties.centroid,
      value: flows[toId],
      quantile: 0
    };
  });

  const scale = scaleQuantile()
    .domain(arcs.map(a => Math.abs(a.value)))
    .range(inFlowColors.map((c, i) => i));

  arcs.forEach(a => {
    a.quantile = scale(Math.abs(a.value));
  });

  return arcs;
}

function getTooltip(info: PickingInfo) {
  const object: County = info.object;
  return object && object.properties.name;
}

/* eslint-disable react/no-deprecated */
export default function App({data, strokeWidth = 1, mapStyle = MAP_STYLE}: {
  data?: County[];
  strokeWidth?: number;
  mapStyle?: string;
}) {
  const [selectedCounty, selectCounty] = useState<County>();

  const arcs = useMemo(() => calculateArcs(data, selectedCounty), [data, selectedCounty]);

  const layers = [
    new GeoJsonLayer<CountyProperties>({
      id: 'geojson',
      data,
      stroked: false,
      filled: true,
      getFillColor: [0, 0, 0, 0],
      onClick: ({object}) => selectCounty(object),
      pickable: true
    }),
    new ArcLayer<MigrationFlow>({
      id: 'arc',
      data: arcs,
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      getSourceColor: d => (d.value > 0 ? inFlowColors : outFlowColors)[d.quantile],
      getTargetColor: d => (d.value > 0 ? outFlowColors : inFlowColors)[d.quantile],
      getWidth: strokeWidth
    })
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  fetch(DATA_URL)
    .then(response => response.json())
    .then(({features}) => {
      root.render(<App data={features} />);
    });
}
