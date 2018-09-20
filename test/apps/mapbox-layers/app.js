import mapboxgl from './mapbox-gl-dev';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';

import DeckLayer from '@deck.gl/mapbox-layers';

const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/pois.json'; //eslint-disable-line

// Set your mapbox token here
mapboxgl.accessToken = process.env.MapboxAccessToken; // eslint-disable-line

const mapboxBuildingLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 14,
  paint: {
    'fill-extrusion-color': '#ccc',
    'fill-extrusion-height': ['get', 'height']
  }
};

const deckPoiLayer = new DeckLayer({
  id: 'deckgl-pois',
  type: ScatterplotLayer,
  data: DATA_URL,
  pickable: true,
  autoHighlight: true,
  radiusMinPixels: 0.25,
  getPosition: d => d.coordinates,
  getColor: [255, 180],
  getRadius: 10
});

const deckRouteLayer = new DeckLayer({
  id: 'deckgl-tour-route',
  type: ArcLayer,
  data: [
    [[-73.9873197, 40.758895], [-73.9808623, 40.7587402]],
    [[-73.9808623, 40.7587402], [-73.9781814, 40.7584653]],
    [[-73.9781814, 40.7584653], [-73.982352, 40.7531874]],
    [[-73.982352, 40.7531874], [-73.9756172, 40.7516171]],
    [[-73.9756172, 40.7516171], [-73.9775753, 40.7527895]],
    [[-73.9775753, 40.7527895], [-74.0134401, 40.7115375]],
    [[-74.0134401, 40.7115375], [-74.0134535, 40.7068758]],
    [[-74.0134535, 40.7068758], [-74.0156334, 40.7055648]],
    [[-74.0156334, 40.7055648], [-74.0153384, 40.7013948]]
  ],
  getSourcePosition: d => d[0],
  getTargetPosition: d => d[1],
  getSourceColor: [0, 128, 255],
  getTargetColor: [255, 0, 128],
  getStrokeWidth: 4
});

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-74.012, 40.705],
  zoom: 15.5,
  bearing: -20,
  pitch: 45
});

map.on('load', () => {
  map.addLayer(mapboxBuildingLayer);
  map.addLayer(deckPoiLayer, getFirstTextLayerId(map.getStyle()));
  map.addLayer(deckRouteLayer);
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
