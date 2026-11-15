// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapLibreOverlay as DeckOverlay} from '@deck.gl/maplibre';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {sqlParser} from '@deck.gl/core/sql';
import {JSONTableLoader} from '@loaders.gl/tables/json';
import {Map, NavigationControl, setWorkerUrl} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(maplibreWorkerUrl);

// Natural Earth airport coordinates and attributes.
const AIRPORTS = new URL('./airports.json', import.meta.url).href;

const map = new Map({
  container: 'map',
  style: 'https://tiles.openfreemap.org/styles/positron',
  center: [0.45, 51.47],
  zoom: 4,
  bearing: 0,
  pitch: 30
});

const deckOverlay = new DeckOverlay({
  interleaved: true,
  sqlParser,
  layers: [
    new ScatterplotLayer({
      id: 'airports',
      loaders: [JSONTableLoader],
      data: AIRPORTS,
      // Sahnewal (LUH), rank 9, longitude 75.95707224036518, latitude 30.850359856170176
      query: 'SELECT *',
      getPosition: {sql: 'FLOAT64x2(longitude, latitude)'},
      getRadius: {sql: 'FLOAT32(11 - scalerank)'},
      radiusMinPixels: 2,
      radiusScale: 2000,
      getFillColor: [200, 0, 80, 180],
      pickable: true,
      autoHighlight: true,
      onClick: ({object}) => {
        if (object) alert(`${object.name} (${object.abbrev})`);
      }
    }),
    new ArcLayer({
      id: 'arcs',
      loaders: [JSONTableLoader],
      data: AIRPORTS,
      // Sahnewal (LUH), rank 9, longitude 75.95707224036518, latitude 30.850359856170176
      query: 'SELECT * WHERE scalerank < 4',
      getTargetPosition: {sql: 'FLOAT64x2(longitude, latitude)'},
      getSourcePosition: [-0.4531566, 51.4709959],
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ]
});

map.addControl(deckOverlay);
map.addControl(new NavigationControl());
