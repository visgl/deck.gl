// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {sqlParser} from '@deck.gl/core/sql';
import {ScatterplotLayer} from '@deck.gl/layers';
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/tables/csv';
import {Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {webgpuAdapter} from '@luma.gl/core/webgpu';

// The Zoom Bands example uses this same City of Paris dataset.
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/les-arbres.csv';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const INITIAL_VIEW_STATE = {
  longitude: 2.345,
  latitude: 48.857,
  zoom: 11.5,
  minZoom: 9,
  maxZoom: 20
};
const MAX_POINTS = 20000;

const data = load(DATA_URL, CSVLoader, {
  core: {worker: false},
  csv: {shape: 'arrow-table'}
}).then(result => {
  if (result.shape !== 'arrow-table') {
    throw new Error('Expected an Arrow table from the CSV loader');
  }
  return result;
});

const map = new Map({
  container: 'map',
  style: MAP_STYLE,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  interactive: false
});

const backend = new URLSearchParams(location.search).get('backend');
new Deck({
  sqlParser,
  parent: document.querySelector<HTMLDivElement>('#deck'),
  deviceProps: backend === 'webgpu' ? {type: 'webgpu', adapters: [webgpuAdapter]} : {type: 'webgl'},
  initialViewState: INITIAL_VIEW_STATE,
  onViewStateChange: ({viewState}) => {
    const {longitude, latitude, zoom, pitch, bearing} = viewState;
    map.jumpTo({center: [longitude, latitude], zoom, pitch, bearing});
  },
  controller: true,
  layers: [
    new ScatterplotLayer({
      id: 'paris-trees',
      data,
      columnsQuery: {
        where: '"LONGITUDE" IS NOT NULL AND "LATITUDE" IS NOT NULL',
        limit: MAX_POINTS,
        select: [
          {as: 'positions', expression: 'ARRAY["LONGITUDE", "LATITUDE"]::DOUBLE PRECISION[2]'},
          {
            as: 'radii',
            expression: `CASE
              WHEN "CIRCONFERENCE(CM)" > 240 THEN 8.0
              WHEN "CIRCONFERENCE(CM)" > 30 THEN "CIRCONFERENCE(CM)" / 30.0
              ELSE 1.0
            END`
          }
        ]
      },
      radiusUnits: 'pixels',
      radiusMinPixels: 1,
      getFillColor: [173, 221, 142, 210],
      pickable: true
    })
  ],
  getTooltip: ({object}) => object?.LIBELLEFRANCAIS ?? null
});
