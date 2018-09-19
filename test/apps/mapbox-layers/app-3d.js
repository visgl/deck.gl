import mapboxgl from './mapbox-gl-dev';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';

import DeckLayer from '@deck.gl/mapbox-layers';

const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json'; //eslint-disable-line

// Set your mapbox token here
mapboxgl.accessToken = process.env.MapboxAccessToken; // eslint-disable-line

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-74.012, 40.707],
  zoom: 15,
  bearing: 20,
  pitch: 60
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
      id: 'manhattan',
      layers: [
        new ScatterplotLayer({
          data: DATA_URL,
          radiusMinPixels: 0.25,
          getPosition: d => [d[0], d[1], 0],
          getColor: d => (d[2] === 1 ? [0, 128, 255] : [255, 0, 128]),
          getRadius: 10
        }),
        new ArcLayer({
          data: [{source: [-74.012, 40.707], target: [-74.002, 40.712]}],
          getSourcePosition: d => d.source,
          getTargetPosition: d => d.target,
          getSourceColor: [0, 128, 255],
          getTargetColor: [255, 0, 128],
          getStrokeWidth: 3
        })
      ]
    })
  );
});
