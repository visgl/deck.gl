// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoParquetLoader} from '@loaders.gl/tables/parquet';
import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import {LoadingWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
import {tableFromArrays, type Table} from 'apache-arrow';
import type {Device} from '@luma.gl/core';
import {isArrowTable} from '@math.gl/core/arrow';
import {ArcLayer} from '@deck.gl/layers';
import {GeoArrowLayer} from '../../../modules/proposals/src/layers/geoarrow-layer';
import {scaleQuantile} from 'd3-scale';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';

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

type County = {
  /** county name */
  name: string;
  /** county index -> net flow */
  flows: Record<string, number>;
  /** geographical centroid */
  centroid: Iterable<number>;
};

type MigrationFlow = {
  source: County;
  target: County;
  /** Number of migrants */
  value: number;
  quantile: number;
};

/** Builds columnar arc endpoints and styling values for the selected county. */
function makeArcTable(data: Table, selectedCounty: County) {
  const {flows} = selectedCounty;

  const arcs: MigrationFlow[] = Object.keys(flows).map(toId => {
    const f = data.get(Number(toId)) as County;
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
    source_longitude: Float64Array.from(arcs, arc => Array.from(arc.source.centroid)[0]),
    source_latitude: Float64Array.from(arcs, arc => Array.from(arc.source.centroid)[1]),
    target_longitude: Float64Array.from(arcs, arc => Array.from(arc.target.centroid)[0]),
    target_latitude: Float64Array.from(arcs, arc => Array.from(arc.target.centroid)[1]),
    value: Float64Array.from(arcs, arc => arc.value),
    quantile: Uint8Array.from(arcs, arc => arc.quantile)
  });
}

function getTooltip({object}: PickingInfo<County>) {
  return object && object.name;
}

/* eslint-disable react/no-deprecated */
export default function App({
  device,
  data = DATA_URL,
  strokeWidth = 1,
  mapStyle = MAP_STYLE,
  onSelectCounty,
  onDataLoad,
  onArcDataLoad
}: {
  device?: Device;
  data?: string | Table;
  strokeWidth?: number;
  mapStyle?: string;
  onSelectCounty?: (county: County) => void;
  /** Reports the loaded county count to the website controls. */
  onDataLoad?: (stats: {count: number}) => void;
  /** Reports the number of arcs for the current county. */
  onArcDataLoad?: (count: number) => void;
}) {
  const widgets = useMemo(() => [new LoadingWidget()], []);
  /** Index of the county selected by picking. */
  const [selectedCounty, selectCounty] = useState<number>();

  /** County table supplied by the geometry layer after loading. */
  const [loadedCounties, setLoadedCounties] = useState<Table>();
  /** County table used for the migration destination lookup. */
  const counties = typeof data === 'string' ? loadedCounties : data;
  /** Index of Los Angeles, or the first row when absent. */
  const defaultCounty = useMemo(() => {
    /** County names in source row order. */
    const names = counties?.getChild('name');
    return Math.max(0, names ? [...names].indexOf('Los Angeles, CA') : -1);
  }, [counties]);
  /** One source row whose identity changes with county selection. */
  const arcSource = useMemo(() => {
    /** Source row for the current selection. */
    const index = selectedCounty ?? defaultCounty;
    return counties && index < counties.numRows ? counties.slice(index, index + 1) : null;
  }, [counties, selectedCounty, defaultCounty]);

  const layers = [
    new GeoArrowLayer({
      id: 'counties',
      data,
      loaders: [GeoParquetLoader],
      onDataLoad: table => {
        if (isArrowTable(table)) {
          setLoadedCounties(table);
          selectCounty(undefined);
          onDataLoad?.({count: table.numRows});
        }
      },
      getFillColor: [0, 0, 0, 0],
      onClick: ({object, index}) => {
        if (object) {
          selectCounty(index);
          onSelectCounty?.(object);
        }
      },
      pickable: true
    }),
    new ArcLayer<MigrationFlow>({
      id: 'arc',
      data: arcSource,
      dataTransform: <LayerDataT,>(source: unknown): LayerDataT => {
        /** Source county whose flow map supplies the arcs. */
        const county = isArrowTable(source) ? source.get(0) : null;
        return (counties && county ? makeArcTable(counties, county as County) : []) as LayerDataT;
      },
      onDataLoad: table => {
        onArcDataLoad?.(isArrowTable(table) ? table.numRows : 0);
      },
      getSourcePosition: {sql: 'ARRAY[source_longitude, source_latitude]'},
      getTargetPosition: {sql: 'ARRAY[target_longitude, target_latitude]'},
      getSourceColor: d => (d.value > 0 ? inFlowColors : outFlowColors)[d.quantile],
      getTargetColor: d => (d.value > 0 ? outFlowColors : inFlowColors)[d.quantile],
      getWidth: strokeWidth
    })
  ];

  return (
    <DeckGL
      widgets={widgets}
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
