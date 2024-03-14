/* global document */

import {MapboxOverlay} from '@deck.gl/mapbox';
import {ArcLayer, ScatterplotLayer} from '@deck.gl/layers';
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
  map.addLayer(
    {
      id: '3d-buildings',
      source: 'carto',
      'source-layer': 'building',
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'render_height']
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'render_min_height']
        ],
        'fill-extrusion-opacity': 0.6
      }
    },
    firstLabelLayerId
  );

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
      }),
      new ArcLayer({
        id: 'deckgl-arc',
        data: [
          {
            source: [-122.3998664, 37.7883697],
            target: [-122.400068, 37.7900503]
          }
        ],
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [255, 208, 0],
        getTargetColor: [0, 128, 255],
        getWidth: 8
      })
    ]
  });

  map.addControl(deckOverlay);
});
