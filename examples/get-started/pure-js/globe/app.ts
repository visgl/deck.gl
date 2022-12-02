import {Deck, _GlobeView as GlobeView} from '@deck.gl/core';
import {SolidPolygonLayer, GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 20,
  longitude: 30,
  zoom: 0
};

export const deck = new Deck({
  views: new GlobeView(),
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    // A GeoJSON polygon that covers the entire earth
    // See /docs/api-reference/globe-view.md#remarks
    new SolidPolygonLayer({
      id: 'background',
      data: [
        // prettier-ignore
        [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
      ],
      opacity: 0.5,
      getPolygon: d => d,
      stroked: false,
      filled: true,
      getFillColor: [5, 10, 40]
    }),
    new GeoJsonLayer({
      id: 'base-map',
      data: COUNTRIES,
      // Styles
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      getLineColor: [5, 10, 40],
      getFillColor: [15, 40, 80]
    }),
    new GeoJsonLayer({
      id: 'airports',
      data: AIR_PORTS,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: f => 11 - f.properties.scalerank,
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
document.body.style.background = '#111';
