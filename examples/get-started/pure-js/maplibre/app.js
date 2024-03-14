/* global document */

import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: document.querySelector('#map'),
  style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center: [-122.4, 37.79],
  zoom: 15,
  pitch: 60,
  antialias: true
});

map.on('style.load', () => {
  const firstLabelLayerId = map.getStyle().layers.find(layer => layer.type === 'symbol').id;

  map.removeLayer('building');
  map.removeLayer('building-top');

  const deckOverlay = new MapboxOverlay({
    interleaved: true,
    layers: [
      new ScatterplotLayer({
        id: 'deckgl-circle',
        data: [{position: [-122.402, 37.79], color: [255, 0, 0], radius: 1000}],
        getPosition: d => d.position,
        getFillColor: d => d.color,
        getRadius: d => d.radius,
        opacity: 0.3,
        beforeId: firstLabelLayerId
      })
    ]
  });

  map.addControl(deckOverlay);
});
