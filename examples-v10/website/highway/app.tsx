// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState, useMemo, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react/legacy';
import {LoadingWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
import type {Device} from '@luma.gl/core';
import {isArrowTable} from '@math.gl/core/arrow';
import {GeoArrowLayer} from '@deck.gl/proposals/layers';
import {
  Field,
  FixedSizeList,
  Float32,
  Uint8,
  tableFromArrays,
  vectorFromArray,
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

function getKey({state, type, id}: Accident | RoadProperties) {
  return `${state}-${type}-${id}`;
}

function aggregateAccidents(accidents?: Accident[] | Table) {
  const incidents: {[year: number]: Record<string, number>} = {};
  const fatalities: {[year: number]: Record<string, number>} = {};

  if (accidents) {
    for (const a of accidents as Iterable<Accident>) {
      const r = (incidents[a.year] = incidents[a.year] || {});
      const f = (fatalities[a.year] = fatalities[a.year] || {});
      const key = getKey(a);
      r[key] = a.incidents;
      f[key] = a.fatalities;
    }
  }
  return {incidents, fatalities};
}

function renderTooltip({
  fatalities,
  incidents,
  year,
  hoverInfo
}: {
  fatalities: {[year: number]: Record<string, number>};
  incidents: {[year: number]: Record<string, number>};
  year: number;
  hoverInfo?: PickingInfo<Road>;
}) {
  if (!hoverInfo?.object || !incidents[year] || !fatalities[year]) {
    return null;
  }

  const {object, x, y} = hoverInfo;
  const props = object;
  const key = getKey(props);
  const f = fatalities[year][key];
  const r = incidents[year][key];

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
  const {incidents, fatalities} = useMemo(
    () => aggregateAccidents(accidents || loadedAccidents),
    [accidents, loadedAccidents]
  );

  /** Arrow color and width columns in the source road order. */
  const styles = useMemo(() => {
    if (!roadTable) {
      return null;
    }
    const roadFatalities = fatalities[year];
    const roadIncidents = incidents[year];
    if (!roadFatalities || !roadIncidents) {
      return null;
    }

    // Keep the lookup aligned to the GeoArrow geometry, including roads with no accidents.
    const rows = tableFromArrays({
      length: roadTable.getChild('length')!,
      fatalities: Float64Array.from(roadTable, road => roadFatalities[getKey(road)] || 0),
      incidents: Float64Array.from(roadTable, road => roadIncidents[getKey(road)] || 0)
    });
    const styles = queryArrowSQL(
      `\
        SELECT fatalities * 1000 / length AS fatality_rate,
          CASE
            WHEN incidents <= 0 THEN 10
            WHEN incidents >= length / 5 THEN 2000
            ELSE 10 + 9950 * incidents / length
          END AS width
        FROM roads`,
      new Map([['roads', rows]])
    );
    const colors = Array.from(styles.getChild('fatality_rate')!, rate => {
      const [red, green, blue] = COLOR_SCALE(Number(rate));
      return [red, green, blue, 255];
    });
    return {
      colors: vectorFromArray(colors, new FixedSizeList(4, new Field('channel', new Uint8()))),
      widths: vectorFromArray(Float32Array.from(styles.getChild('width')!, Number), new Float32())
    };
  }, [roadTable, year, fatalities, incidents]);

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
      colors: styles?.colors ?? [200, 200, 200, 255],
      widths: styles?.widths ?? 10,
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
      <Map reuseMaps mapStyle={mapStyle} />

      {renderTooltip({incidents, fatalities, year, hoverInfo})}
    </DeckGL>
  );
}

/** Mounts the standalone example. */
export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
