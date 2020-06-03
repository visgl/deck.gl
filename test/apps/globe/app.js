import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer, ColumnLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 0
};

export const deck = new Deck({
  views: new GlobeView(),
  initialViewState: INITIAL_VIEW_STATE,
  controller: {minZoom: -2},
  parameters: {
    cull: true
  },
  layers: [
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      // Styles
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [60, 60, 60],
      getFillColor: [200, 200, 200]
    }),
    new ColumnLayer({
      id: 'airports-extruded',
      data: AIR_PORTS,
      dataTransform: geojson => geojson.features,
      // Styles
      radius: 10000,
      extruded: true,
      getPosition: f => f.geometry.coordinates,
      getElevation: f => f.properties.scalerank * 100000,
      getFillColor: [200, 0, 80, 180]
    }),
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getRadius: f => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 80, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick: info =>
        // eslint-disable-next-line
        info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
    }),
    new ArcLayer({
      id: 'arcs',
      data: AIR_PORTS,
      dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
      // Styles
      getSourcePosition: f => [-0.4531566, 51.4709959], // London
      getTargetPosition: f => f.geometry.coordinates,
      getSourceColor: [0, 128, 200],
      getTargetColor: [200, 0, 80],
      getWidth: 1
    })
  ]
});

// For automated test cases
/* global document */
document.body.style.margin = '0px';
