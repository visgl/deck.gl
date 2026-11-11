// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {sqlParser} from '@deck.gl/core/sql';
import {ScatterplotLayer} from '@deck.gl/layers';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {JSONTableLoader} from '@loaders.gl/tables/json';
import {Field, Float64, Int8, Schema} from 'apache-arrow';
import {Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/manhattan.json';
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const INITIAL_VIEW_STATE = {longitude: -74, latitude: 40.7, zoom: 11, maxZoom: 16};
const schema = new Schema([
  new Field('longitude', new Float64(), false),
  new Field('latitude', new Float64(), false),
  new Field('gender', new Int8(), false)
]);

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
  controller: true,
  onViewStateChange: ({viewState}) => {
    const {longitude, latitude, zoom, pitch, bearing} = viewState;
    map.jumpTo({center: [longitude, latitude], zoom, pitch, bearing});
  },
  layers: [
    new ScatterplotLayer({
      id: 'ny-population',
      data: DATA_URL,
      loaders: [JSONTableLoader],
      loadOptions: {
        core: {ignoreRegisteredLoaders: true},
        json: {schema}
      },
      columnsQuery: `SELECT
        ARRAY[longitude, latitude]::DOUBLE PRECISION[2] AS positions,
        PACK_UNORM8(ARRAY[
          CASE WHEN gender = 1 THEN 0.0 ELSE 1.0 END,
          CASE WHEN gender = 1 THEN 128.0 / 255.0 ELSE 0.0 END,
          CASE WHEN gender = 1 THEN 1.0 ELSE 128.0 / 255.0 END,
          1.0
        ]) AS fillColors`,
      getRadius: 30,
      radiusMinPixels: 0.25,
      pickable: true
    })
  ],
  getTooltip: ({object}) => (object ? (object.gender === 1 ? 'Male' : 'Female') : null)
});
