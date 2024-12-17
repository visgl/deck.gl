// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// OL
import Map from 'ol/Map';
import {OSM} from 'ol/source';
import {Layer, Tile as TileLayer} from 'ol/layer';
import View from 'ol/View';
import {fromLonLat, toLonLat} from 'ol/proj';

// DECK
import {Deck} from '@deck.gl/core';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

// Datasource: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const deck = new Deck({
  initialViewState: {longitude: 0, latitude: 0, zoom: 1},
  controller: false,
  parent: document.getElementById('map'),
  style: {pointerEvents: 'none', 'z-index': 1},
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

// Sync deck view with OL view
const deckLayer = new Layer({
  render({size, viewState}) {
    const [width, height] = size;
    const [longitude, latitude] = toLonLat(viewState.center);
    const zoom = viewState.zoom - 1;
    const bearing = (-viewState.rotation * 180) / Math.PI;
    const deckViewState = {bearing, longitude, latitude, zoom};
    deck.setProps({width, height, viewState: deckViewState});
    deck.redraw();
  }
});

// Create OL map with native OSM basemap and deck.gl overlay
const view = new View({center: fromLonLat([0, 0]), zoom: 1});
new Map({
  target: 'map',
  view,
  layers: [new TileLayer({source: new OSM()}), deckLayer]
});

// For automated test cases
/* global document */
document.body.style.margin = '0px';
