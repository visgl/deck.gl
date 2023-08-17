import {Deck} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';
import {FullscreenWidget} from '@deck.gl/widgets';
import '@deck.gl/widgets/stylesheet.css';
import {luma} from '@luma.gl/api';
import {WebGLDevice} from '@luma.gl/webgl';

luma.registerDevices([WebGLDevice]);

const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const widgetTheme = prefersDarkScheme.matches ? {
  // Dark Glass Theme
  '--button-background': 'rgba(18, 18, 20, 0.75)',
  '--button-stroke': 'rgba(18, 18, 20, 0.30)',
  '--button-inner-stroke': '1px solid rgba(18, 18, 20, 0.75)',
  '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset',
  '--button-backdrop-filter': 'blur(4px)'
} : {
  // Light Glass Theme
  '--button-background': 'rgba(255, 255, 255, 0.6)',
  '--button-stroke': 'rgba(255, 255, 255, 0.3)',
  '--button-inner-stroke': '1px solid rgba(255, 255, 255, 0.6)',
  '--button-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.25), 0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset',
  '--button-backdrop-filter': 'blur(4px)'
}

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 4,
  bearing: 0,
  pitch: 30
};

new Deck({
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
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
  ],
  widgets: [new FullscreenWidget({style: widgetTheme})]
});
