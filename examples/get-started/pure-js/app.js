import {Deck, MapController} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import Map from './mapbox';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line
// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 40,
  longitude: -100,
  zoom: 3,
  bearing: 30,
  pitch: 30
};

const map = new Map({
  mapboxApiAccessToken: MAPBOX_TOKEN,
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  viewState: INITIAL_VIEW_STATE
});

export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: MapController,
  onViewportChange: viewState => {
    map.setProps({viewState});
  },
  layers: [
    new GeoJsonLayer({
      data: GEOJSON,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: () => [255, 100, 100],
      getFillColor: () => [200, 160, 0, 180]
    })
  ]
});
