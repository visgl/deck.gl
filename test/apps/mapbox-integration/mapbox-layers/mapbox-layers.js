import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {MapboxLayer} from '../../../modules/mapbox/src/mapbox-layer';

import {mapboxBuildingLayer, deckPoiLayer, deckRouteLayer} from '../layers';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [-74.012, 40.705],
  zoom: 15.5,
  bearing: -20,
  pitch: 45
});

map.on('load', () => {
  map.addLayer(mapboxBuildingLayer);
  map.addLayer(new MapboxLayer(deckPoiLayer), getFirstTextLayerId(map.getStyle()));
  map.addLayer(new MapboxLayer(deckRouteLayer));
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
