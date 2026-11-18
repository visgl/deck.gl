// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoParquetLoader} from '@loaders.gl/tables/parquet';
import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {tableFromArrays} from 'apache-arrow';
import type {Device} from '@luma.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {scaleQuantile} from 'd3-scale';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';
import type {Feature, Polygon, MultiPolygon} from 'geojson';

// Full website geometry in GeoParquet; properties retain their original names.
const DATA_URL =
  'https://media.githubusercontent.com/media/visgl/deck.gl-data/886cf5ab469bba3816aa5a32d4454835e0ce5951/examples/arc/counties.parquet'; // eslint-disable-line

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

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

type CountyProperties = {
  /** county name */
  name: string;
  /** county index -> net flow */
  flows: Record<string, number>;
  /** geographical centroid */
  centroid: Iterable<number>;
};

type County = Feature<Polygon | MultiPolygon, CountyProperties>;

type MigrationFlow = {
  source: County;
  target: County;
  /** Number of migrants */
  value: number;
  quantile: number;
};

/** Builds columnar arc endpoints and styling values for the selected county. */
function makeArcTable(data: County[] | undefined, selectedCounty?: County) {
  if (!data || !data.length) {
    return null;
  }
  if (!selectedCounty) {
    selectedCounty = data.find(f => f.properties.name === 'Los Angeles, CA')!;
  }
  const {flows} = selectedCounty.properties;

  const arcs: MigrationFlow[] = Object.keys(flows).map(toId => {
    const f = data[Number(toId)];
    return {
      source: selectedCounty,
      target: f,
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

  return tableFromArrays({
    source_longitude: Float64Array.from(arcs, arc => Array.from(arc.source.properties.centroid)[0]),
    source_latitude: Float64Array.from(arcs, arc => Array.from(arc.source.properties.centroid)[1]),
    target_longitude: Float64Array.from(arcs, arc => Array.from(arc.target.properties.centroid)[0]),
    target_latitude: Float64Array.from(arcs, arc => Array.from(arc.target.properties.centroid)[1]),
    value: Float64Array.from(arcs, arc => arc.value),
    quantile: Uint8Array.from(arcs, arc => arc.quantile)
  });
}

function getTooltip({object}: PickingInfo<County>) {
  return object && object.properties.name;
}

/* eslint-disable react/no-deprecated */
export default function App({
  device,
  data = DATA_URL,
  strokeWidth = 1,
  mapStyle = MAP_STYLE,
  onSelectCounty,
  onDataLoad
}: {
  device?: Device;
  data?: string | County[];
  strokeWidth?: number;
  mapStyle?: string;
  onSelectCounty?: (county: County) => void;
  /** Reports county and directed flow counts to the website controls. */
  onDataLoad?: (stats: {count: number; flowCount: number}) => void;
}) {
  const [selectedCounty, selectCounty] = useState<County>();

  const [counties, setCounties] = useState<County[]>();
  const arcs = useMemo(() => makeArcTable(counties, selectedCounty), [counties, selectedCounty]);

  const layers = [
    new GeoJsonLayer<CountyProperties>({
      id: 'geojson',
      data,
      loaders: [GeoParquetLoader],
      loadOptions: {parquet: {shape: 'geojson-table'}},
      onDataLoad: loaded => {
        const features: County[] = Array.isArray(loaded) ? loaded : loaded.features;
        setCounties(features);
        selectCounty(undefined);
        onDataLoad?.({
          count: features.length,
          flowCount: features.reduce(
            (sum, feature) => sum + Object.keys(feature.properties.flows).length,
            0
          )
        });
      },
      stroked: false,
      filled: true,
      getFillColor: [0, 0, 0, 0],
      onClick: ({object}) => {
        if (object) {
          selectCounty(object);
          onSelectCounty?.(object);
        }
      },
      pickable: true
    }),
    arcs &&
      new ArcLayer<MigrationFlow>({
        id: 'arc',
        data: arcs,
        getSourcePosition: {sql: 'ARRAY_FLOAT64(source_longitude, source_latitude)'},
        getTargetPosition: {sql: 'ARRAY_FLOAT64(target_longitude, target_latitude)'},
        getSourceColor: d => (d.value > 0 ? inFlowColors : outFlowColors)[d.quantile],
        getTargetColor: d => (d.value > 0 ? outFlowColors : inFlowColors)[d.quantile],
        getWidth: strokeWidth
      })
  ];

  return (
    <DeckGL
      device={device}
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

/** Mounts the standalone example. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
