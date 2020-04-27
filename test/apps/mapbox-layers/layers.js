import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';

export const mapboxBuildingLayer = {
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

export const deckPoiLayer = {
  id: 'deckgl-pois',
  type: ScatterplotLayer,
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/pois.json',
  pickable: true,
  autoHighlight: true,
  radiusMinPixels: 0.25,
  getPosition: d => d.coordinates,
  getFillColor: [255, 180],
  getRadius: 10
};

export const deckRouteLayer = {
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
  getWidth: 4
};
