import mapboxgl from './mapbox-gl-dev';
import {GeoJsonLayer} from '@deck.gl/layers';

import DeckLayer from '@deck.gl/mapbox-layers';

// Outlines of US States. Source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const US_MAP_GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 40.70708981756565,
  longitude: -74.01194070150844,
  zoom: 15.2,
  bearing: 20,
  pitch: 60
};

// Set your mapbox token here
mapboxgl.accessToken = process.env.MapboxAccessToken; // eslint-disable-line

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch
});

map.on('load', () => {
  map.addLayer({
    id: '3d-buildings',
    source: 'composite',
    'source-layer': 'building',
    filter: ['==', 'extrude', 'true'],
    type: 'fill-extrusion',
    minzoom: 15,
    paint: {
      'fill-extrusion-color': '#ccc',
      'fill-extrusion-height': ['get', 'height']
    }
  });

  map.addLayer(
    new DeckLayer({
      layers: [
        new GeoJsonLayer({
          data: US_MAP_GEOJSON,
          stroked: true,
          filled: true,
          lineWidthMinPixels: 2,
          opacity: 0.4,
          getLineColor: () => [255, 100, 100],
          getFillColor: () => [200, 160, 0, 180]
        })
      ]
    })
  );
});
