// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {GeoJsonLayer, ArcLayer } from '@deck.gl/layers';
import { PathStyleExtension } from "@deck.gl/extensions";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [0.45, 51.47],
  zoom: 4,
  bearing: 0,
  pitch: 30,
  antialias: true
});

// basic feature collection with line from london to zurcich
const line = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'LineString', coordinates: [[1.46, 52.46], [9.54, 48.37]] } }
  ]
};

const deckOverlay = new DeckOverlay({
  interleaved: true,
  layers: [
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
      // beforeId: 'watername_ocean' // In interleaved mode, render the layer under map labels
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
    }),
    new GeoJsonLayer({
      id: 'line-og',
      data: line,
      getLineColor: [0, 128, 200],
      getLineWidth: 7,
      lineWidthMinPixels: 5
    }),
    new GeoJsonLayer({
      id: 'line',
      data: line,
      getLineColor: [128, 0, 200],
      getLineWidth: 7,
      lineWidthMinPixels: 5,
      getOffset: (f) => 3,
      extensions: [new PathStyleExtension({ offset: true })],
    })
  ]
});

map.addControl(deckOverlay);
map.addControl(new maplibregl.NavigationControl());
