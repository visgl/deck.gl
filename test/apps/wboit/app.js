import {Deck} from '@deck.gl/core';
import geojson from 'data/sf.zip.geo.json';
import WBOITLayer from './wboit-layer/wboit-layer';

const INITIAL_VIEW_STATE = {
  latitude: 37.78,
  longitude: -122.45,
  zoom: 12,
  bearing: 0,
  pitch: 30
};

export const deck = new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    new WBOITLayer({
      data: geojson.features,
      getPolygon: f => f.geometry.coordinates,
      getFillColor: f => [200 + Math.random() * 55, 0, 0],
      getLineColor: f => [0, 0, 0, 255],
      getLineDashArray: f => [20, 0],
      getLineWidth: f => 20,
      getElevation: f => Math.random() * 1000,
      extruded: true,
      opacity: 0.5,
      pickable: false
    })
  ]
});

// For automated test cases
/* global document */
document.body.style.margin = '0px';
