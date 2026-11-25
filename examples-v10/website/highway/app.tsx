// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useMemo, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Map as MapLibre} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import {LoadingWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
import type {Device} from '@luma.gl/core';
import {isArrowTable} from '@math.gl/core/arrow';
import {GeoArrowLayer} from '@deck.gl/proposals/layers';
import {
  Field,
  FixedSizeList,
  Uint8,
  vectorFromArray,
  tableFromJSON,
  type Table
} from 'apache-arrow';
import {scaleThreshold} from 'd3-scale';
import {queryArrowSQL} from '@math.gl/sql/query';
import {GeoParquetLoader} from '@loaders.gl/tables/parquet';
import {CSVLoader} from '@loaders.gl/tables/csv';
import {load} from '@loaders.gl/core';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';

// Full website geometry in GeoParquet; properties retain their original names.
const DATA_URL = {
  ACCIDENTS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/886cf5ab469bba3816aa5a32d4454835e0ce5951/examples/highway/accidents-full.csv',
  ROADS:
    'https://media.githubusercontent.com/media/visgl/deck.gl-data/886cf5ab469bba3816aa5a32d4454835e0ce5951/examples/highway/roads.parquet'
};

export const COLOR_SCALE = scaleThreshold<number, Color>()
  .domain([0, 4, 8, 12, 20, 32, 52, 84, 136, 220])
  .range([
    [26, 152, 80],
    [102, 189, 99],
    [166, 217, 106],
    [217, 239, 139],
    [255, 255, 191],
    [254, 224, 139],
    [253, 174, 97],
    [244, 109, 67],
    [215, 48, 39],
    [168, 0, 0]
  ]);

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 38,
  longitude: -100,
  zoom: 4,
  minZoom: 2,
  maxZoom: 8
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark';

type Accident = {
  state: string;
  type: string;
  id: string;
  year: number;
  incidents: number;
  fatalities: number;
};

type RoadProperties = {
  state: string;
  type: string;
  id: string;
  name: string;
  length: number;
};

type Road = RoadProperties;

const ROAD_KEY = "CONCAT(state, '-', type, '-', id)";

function renderTooltip(
  hoverInfo: PickingInfo<Road> | undefined,
  statistics: Table | null,
  year: number
) {
  if (!hoverInfo?.object || !statistics) {
    return null;
  }

  const {object: props, x, y, index} = hoverInfo;
  const row = statistics.get(index);
  const f = row?.fatalities;
  const r = row?.incidents;

  const content = r ? (
    <div>
      <b>{f}</b> people died in <b>{r}</b> crashes on{' '}
      {props.type === 'SR' ? props.state : props.type}-{props.id} in <b>{year}</b>
    </div>
  ) : (
    <div>
      no accidents recorded in <b>{year}</b>
    </div>
  );

  return (
    <div className="tooltip" style={{left: x, top: y}}>
      <big>
        {props.name} ({props.state})
      </big>
      {content}
    </div>
  );
}

export default function App({
  device,
  roads = DATA_URL.ROADS,
  year = 1990,
  accidents,
  mapStyle = MAP_STYLE,
  onDataLoad
}: {
  device?: Device;
  roads?: string | Table;
  accidents?: Accident[] | Table;
  year?: number;
  mapStyle?: string;
  /** Reports the loaded road feature count to the website controls. */
  onDataLoad?: (stats: {count: number}) => void;
}) {
  const widgets = useMemo(() => [new LoadingWidget()], []);
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Road>>();
  /** Road table supplied by the geometry layer after loading. */
  const [loadedRoads, setLoadedRoads] = useState<Table>();
  /** Source rows used to build the per-road styles. */
  const roadTable = typeof roads === 'string' ? loadedRoads : roads;
  /** Accident records loaded as a native Arrow table. */
  const [loadedAccidents, setLoadedAccidents] = useState<Table>();
  useEffect(() => {
    if (accidents) {
      return;
    }
    let active = true;
    load(DATA_URL.ACCIDENTS, CSVLoader).then(table => {
      if (active && isArrowTable(table)) {
        setLoadedAccidents(table);
      }
    });
    return () => {
      active = false;
    };
  }, [accidents]);
  const accidentTable = useMemo(
    () => (Array.isArray(accidents) ? tableFromJSON(accidents) : (accidents ?? loadedAccidents)),
    [accidents, loadedAccidents]
  );
  const roadKeys = useMemo(
    () =>
      roadTable &&
      queryArrowSQL(
        `SELECT ${ROAD_KEY} AS road_key, length FROM roads`,
        new Map([['roads', roadTable]])
      ),
    [roadTable]
  );

  /** LEFT JOIN preserves the source road order used by styling and picking. */
  const statistics = useMemo(() => {
    if (!roadKeys || !accidentTable?.numRows || !Number.isFinite(year)) {
      return null;
    }
    const events = queryArrowSQL(
      `SELECT ${ROAD_KEY} AS road_key, incidents, fatalities FROM accidents WHERE year = ${year}`,
      new Map([['accidents', accidentTable]])
    );
    if (!events.numRows) {
      return null;
    }
    return queryArrowSQL(
      `\
        SELECT COALESCE(a.incidents, 0) AS incidents,
          COALESCE(a.fatalities, 0) AS fatalities,
          COALESCE(a.fatalities, 0) * 1000 / r.length AS fatality_rate,
          CASE
            WHEN a.incidents IS NULL OR a.incidents <= 0 THEN 10
            WHEN a.incidents >= r.length / 5 THEN 2000
            ELSE 10 + 9950 * a.incidents / r.length
          END AS width
        FROM roads r LEFT JOIN events a ON r.road_key = a.road_key`,
      new Map([
        ['roads', roadKeys],
        ['events', events]
      ])
    );
  }, [roadKeys, accidentTable, year]);

  /** Arrow color and width columns share the road table's row indices. */
  const colors = useMemo(
    () =>
      statistics &&
      vectorFromArray(
        Array.from(statistics.getChild('fatality_rate')!, rate => [
          ...COLOR_SCALE(Number(rate)),
          255
        ]),
        new FixedSizeList(4, new Field('channel', new Uint8()))
      ),
    [statistics]
  );

  const layers = [
    new GeoArrowLayer({
      id: 'roads',
      data: roads,
      loaders: [GeoParquetLoader],
      onDataLoad: table => {
        if (isArrowTable(table)) {
          setLoadedRoads(table);
          onDataLoad?.({count: table.numRows});
        }
      },
      colors: colors ?? [200, 200, 200, 255],
      widths: statistics?.getChild('width') ?? 10,
      widthUnits: 'meters',
      widthMinPixels: 0.5,
      transitions: {getLineColor: 1000, getLineWidth: 1000},
      pickable: true,
      onHover: setHoverInfo
    })
  ];

  return (
    <DeckGL
      widgets={widgets}
      device={device}
      layers={layers}
      pickingRadius={5}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
    >
      <MapLibre reuseMaps mapStyle={mapStyle} />

      {renderTooltip(hoverInfo, statistics, year)}
    </DeckGL>
  );
}

/** Mounts the standalone example. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
