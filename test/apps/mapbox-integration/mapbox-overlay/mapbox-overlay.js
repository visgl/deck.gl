// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global process */
import mapboxgl from 'mapbox-gl';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {mapboxBuildingLayer, deckPoiLayer, deckRouteLayer} from '../layers';

// Set your mapbox token here
mapboxgl.accessToken = process.env.MapboxAccessToken; // eslint-disable-line

const map = new mapboxgl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [-74.012, 40.705],
  zoom: 15.5,
  bearing: -20,
  pitch: 45
});

const overlay = new MapboxOverlay({
  interleaved: true,
  layers: [new ScatterplotLayer(deckPoiLayer), new ArcLayer(deckRouteLayer)]
});

map.addControl(overlay);

map.on('load', () => {
  map.addLayer(mapboxBuildingLayer);
  overlay.setProps({
    layers: [
      new ScatterplotLayer({
        ...deckPoiLayer,
        beforeId: getFirstTextLayerId(map.getStyle())
      }),
      new ArcLayer(deckRouteLayer)
    ]
  });

  // overlay.finalize();
  map.setCenter({lng: -74.013, lat: 40.706});
  // map.remove();
});

function getFirstTextLayerId(style) {
  const layers = style.layers;
  // Find the index of the first symbol (i.e. label) layer in the map style
  let firstSymbolId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  return firstSymbolId;
}
