import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import {ContourLayer} from '@deck.gl/aggregation-layers';

import type {ContourLayerProps} from '@deck.gl/aggregation-layers';
import type {PickingInfo, MapViewState} from '@deck.gl/core';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/contour/covid-by-county.json'; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -100,
  latitude: 40,
  zoom: 3,
  maxZoom: 10
};

export const BANDS: ContourLayerProps["contours"] = [
  {threshold: [0.1, 1], color: [255, 255, 178]},
  {threshold: [1, 10], color: [254, 204, 92]},
  {threshold: [10, 100], color: [253, 141, 60]},
  {threshold: [100, 500], color: [240, 59, 32]},
  {threshold: [500, 2000], color: [189, 0, 38]},
  {threshold: [2000, 10000], color: [159, 0, 80]}
];

export const LINES: ContourLayerProps["contours"] = [
  {threshold: 1, color: [255, 255, 178], strokeWidth: 2},
  {threshold: 10, color: [254, 204, 92], strokeWidth: 2},
  {threshold: 100, color: [253, 141, 60], strokeWidth: 2},
  {threshold: 500, color: [240, 59, 32], strokeWidth: 2},
  {threshold: 2000, color: [189, 0, 38], strokeWidth: 2},
  {threshold: 10000, color: [159, 0, 80], strokeWidth: 2}
];

const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

type CaseReport = {
  state: string;
  county: string;
  longitude: number;
  latitude: number;
  population: number;
  casesByWeek: {[week: number]: number};
};

export default function App({
  data = DATA_URL,
  week = 35,
  contours = BANDS,
  cellSize = 60000,
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
}: {
  data?: string | CaseReport[];
  week?: number;
  contours?: ContourLayerProps["contours"];
  cellSize?: number;
  mapStyle?: string;
}) {
  const layers = [
    new ContourLayer<CaseReport>({
      data,
      id: 'contour-layer',
      getPosition: d => [d.longitude, d.latitude],
      getWeight: d => ((d.casesByWeek[week] || 0) / d.population) * 1e5,
      updateTriggers: {
        getWeight: week
      },
      pickable: true,
      aggregation: 'MAX',
      contours,
      cellSize
    })
  ];

  const getTooltip = (info: PickingInfo) => {
    if (!info.object) {
      return null;
    }
    const date = new Date(Date.UTC(2020, 0, 20) + week * MS_PER_WEEK);
    const {threshold} = info.object.contour;
    let str;
    if (threshold[1] === 1) {
      str = '<1 new case';
    } else if (threshold[0] === 2000) {
      str = '>2,000 new cases';
    } else {
      str = `${threshold[0]}-${threshold[1]} new cases`;
    }

    return `\
      Week of ${date.toJSON().slice(0, 10)}
      ${str} per 100K residents`;
  };

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      getTooltip={getTooltip}
      style={{mixBlendMode: 'lighten'}}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
