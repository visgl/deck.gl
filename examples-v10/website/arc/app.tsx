// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoParquetLoader} from '@loaders.gl/tables/parquet';
import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map as MapLibre} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import {LoadingWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
import {tableFromArrays, type Table} from 'apache-arrow';
import type {Device} from '@luma.gl/core';
import {isArrowTable} from '@math.gl/core/arrow';
import {ArcLayer} from '@deck.gl/layers';
import {GeoArrowLayer} from '@deck.gl/proposals/layers';
import {queryArrowSQL} from '@math.gl/sql/query';
import {VISUALIZATION_FUNCTIONS} from '@math.gl/sql/scales';

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

/** Uses the same magnitude domain for both directions. */
function flowScale(colors: Color[]): string {
  const palette = colors.map(color =>
    color
      .slice(0, 3)
      .map(channel => channel.toString(16).padStart(2, '0'))
      .join('')
  );
  return `SCALE_QUANTILE(CASE WHEN value < 0 THEN -value ELSE value END, 7, PALETTE(${palette.map(color => `'#${color}'`).join(', ')}))`;
}

const IN_FLOW_SCALE = flowScale(inFlowColors);
const OUT_FLOW_SCALE = flowScale(outFlowColors);

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
  /** Flow map keys are destination row indices in the source Parquet table. */
  const destinations = useMemo(
    () =>
      counties?.select(['centroid']).assign(
        tableFromArrays({
          county_id: Int32Array.from({length: counties.numRows}, (_, index) => index)
        })
      ),
    [counties]
  );
  const arcs = useMemo(() => {
    const index = selectedCounty ?? defaultCounty;
    if (!counties || !destinations || index >= counties.numRows) {
      return null;
    }
    const flows = queryArrowSQL(
      `\
        SELECT c.centroid AS origin, CAST(u.key AS INTEGER) AS destination, u.value AS value
        FROM selected c CROSS JOIN UNNEST(c.flows) AS u(key, value)`,
      new Map([['selected', counties.select(['centroid', 'flows']).slice(index, index + 1)]])
    );
    if (!flows.numRows) {
      return null;
    }
    return queryArrowSQL(
      `\
        SELECT f.origin, c.centroid AS target,
          CASE WHEN f.value > 0 THEN ${IN_FLOW_SCALE} ELSE ${OUT_FLOW_SCALE} END AS source_color,
          CASE WHEN f.value > 0 THEN ${OUT_FLOW_SCALE} ELSE ${IN_FLOW_SCALE} END AS target_color
        FROM flows f JOIN counties c ON f.destination = c.county_id`,
      new Map([
        ['flows', flows],
        ['counties', destinations]
      ]),
      {functions: VISUALIZATION_FUNCTIONS}
    );
  }, [counties, destinations, selectedCounty, defaultCounty]);

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
    new ArcLayer({
      id: 'arc',
      data: arcs,
      onDataLoad: table => {
        onArcDataLoad?.(isArrowTable(table) ? table.numRows : 0);
      },
      getSourcePosition: {sql: 'ARRAY[origin[1], origin[2]]'},
      getTargetPosition: {sql: 'ARRAY[target[1], target[2]]'},
      getSourceColor: {sql: 'source_color'},
      getTargetColor: {sql: 'target_color'},
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
      <MapLibre reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

/** Mounts the standalone example. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
