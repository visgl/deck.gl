import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {scaleLinear, scaleThreshold} from 'd3-scale';
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';

import {Feature, LineString, MultiLineString} from 'geojson';
import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';

// Source data GeoJSON
const DATA_URL = {
  ACCIDENTS:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/highway/accidents.csv',
  ROADS: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/highway/roads.json'
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

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

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

type Road = Feature<LineString | MultiLineString, RoadProperties>;

function getKey({state, type, id}: Accident | RoadProperties) {
  return `${state}-${type}-${id}`;
}

function aggregateAccidents(accidents?: Accident[]) {
  const incidents: {[year: number]: Record<string, number>} = {};
  const fatalities: {[year: number]: Record<string, number>} = {};

  if (accidents) {
    for (const a of accidents) {
      const r = (incidents[a.year] = incidents[a.year] || {});
      const f = (fatalities[a.year] = fatalities[a.year] || {});
      const key = getKey(a);
      r[key] = a.incidents;
      f[key] = a.fatalities;
    }
  }
  return {incidents, fatalities};
}

function renderTooltip({fatalities, incidents, year, hoverInfo}: {
  fatalities: {[year: number]: Record<string, number>};
  incidents: {[year: number]: Record<string, number>};
  year: number;
  hoverInfo?: PickingInfo<Road>;
}) {
  if (!hoverInfo?.object) {
    return null;
  }

  const {object, x, y} = hoverInfo;
  const props = object.properties;
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
  roads = DATA_URL.ROADS,
  year,
  accidents,
  mapStyle = MAP_STYLE
}: {
  roads?: string | Road[];
  accidents?: Accident[];
  year?: number;
  mapStyle?: string;
}) {
  const [hoverInfo, setHoverInfo] = useState<PickingInfo<Road>>();
  const {incidents, fatalities} = useMemo(() => aggregateAccidents(accidents), [accidents]);


  const layers = [
    new GeoJsonLayer<RoadProperties>({
      id: 'geojson',
      data: roads,
      lineWidthMinPixels: 0.5,

      getLineColor: (f: Road) => {
        if (!fatalities[year]) {
          return [200, 200, 200];
        }
        const key = getKey(f.properties);
        const fatalitiesPer1KMile = ((fatalities[year][key] || 0) / f.properties.length) * 1000;
        return COLOR_SCALE(fatalitiesPer1KMile);
      },
      getLineWidth: (f: Road) => {
        if (!incidents[year]) {
          return 10;
        }
        const key = getKey(f.properties);
        const incidentsPer1KMile = ((incidents[year][key] || 0) / f.properties.length) * 1000;
        return WIDTH_SCALE(incidentsPer1KMile);
      },

      pickable: true,
      onHover: setHoverInfo,

      updateTriggers: {
        getLineColor: {year},
        getLineWidth: {year}
      },

      transitions: {
        getLineColor: 1000,
        getLineWidth: 1000
      }
    })
  ];

  return (
    <DeckGL
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

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const accidents = (await load(DATA_URL.ACCIDENTS, CSVLoader)).data;

  root.render(<App accidents={accidents} year={accidents[0].year} />);
}
