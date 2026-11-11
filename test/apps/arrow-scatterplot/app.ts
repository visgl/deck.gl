// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
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

const map = new Map({
  container: 'map',
  style: MAP_STYLE,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  interactive: false
});

const backend = new URLSearchParams(location.search).get('backend');
new Deck({
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
      data: DATA_URL,
      loaders: [CSVLoader],
      loadOptions: {
        core: {worker: false},
        csv: {shape: 'arrow-table'}
      },
      columnsQuery: {
        where: {
          op: 'and',
          args: [
            {op: 'not', args: [{op: 'isNull', args: [{property: 'LONGITUDE'}]}]},
            {op: 'not', args: [{op: 'isNull', args: [{property: 'LATITUDE'}]}]}
          ]
        },
        limit: MAX_POINTS,
        select: [
          {
            as: 'positions',
            expression: {
              type: 'CallExpression',
              callee: {type: 'Identifier', name: 'array_float64'},
              arguments: [
                {type: 'Identifier', name: 'LONGITUDE'},
                {type: 'Identifier', name: 'LATITUDE'}
              ]
            }
          },
          {
            as: 'radii',
            expression: {
              type: 'CallExpression',
              callee: {type: 'Identifier', name: 'COALESCE'},
              arguments: [
                {type: 'Identifier', name: 'CIRCONFERENCE(CM)'},
                {type: 'Literal', value: 30}
              ]
            }
          }
        ]
      },
      radiusUnits: 'pixels',
      radiusScale: 1 / 30,
      radiusMinPixels: 1,
      radiusMaxPixels: 8,
      getFillColor: [173, 221, 142, 210],
      pickable: true
    })
  ],
  getTooltip: ({object}) => object?.LIBELLEFRANCAIS ?? null
});
