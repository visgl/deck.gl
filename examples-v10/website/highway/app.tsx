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
import {GeoArrowLayer} from '../../../modules/proposals/src/layers/geoarrow-layer';
import {Field, FixedSizeList, Float32, Uint8, vectorFromArray, type Table} from 'apache-arrow';
import {scaleLinear, scaleThreshold} from 'd3-scale';
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

const WIDTH_SCALE = scaleLinear().clamp(true).domain([0, 200]).range([10, 2000]);

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
  const [loadedRoads, setLoadedRoads] = useState<Table>();
  const roadTable = typeof roads === 'string' ? loadedRoads : roads;
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

  const styles = useMemo(() => {
    if (!roadTable) {
      return null;
    }
    const colors: number[][] = [];
    const widths = new Float32Array(roadTable.numRows);
    const roadFatalities = fatalities[year];
    const roadIncidents = incidents[year];
    let index = 0;
    for (const road of roadTable) {
      const key = getKey(road);
      const color = roadFatalities
        ? COLOR_SCALE(((roadFatalities[key] || 0) / road.length) * 1000)
        : [200, 200, 200];
      colors.push([color[0], color[1], color[2], 255]);
      widths[index++] = roadIncidents
        ? WIDTH_SCALE(((roadIncidents[key] || 0) / road.length) * 1000)
        : 10;
    }
    return {
      colors: vectorFromArray(colors, new FixedSizeList(4, new Field('channel', new Uint8()))),
      widths: vectorFromArray(widths, new Float32())
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
      colors: styles?.colors,
      widths: styles?.widths,
      widthUnits: 'meters',
      widthMinPixels: 0.5,
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
