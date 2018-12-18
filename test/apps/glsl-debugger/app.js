/* global document */
import {Deck, MapController} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer} from '@deck.gl/layers';
import LayerDebugger from './layer-debugger';

/* eslint-disable */
const DATA_URL = {
  stations:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/bart-stations.json',
  lines: 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/bart-lines.json'
};
/* eslint-enable */

/* Deck */
const deck = new Deck({
  width: '100%',
  height: '100%',
  layers: [
    new PathLayer({
      id: 'bart-lines',
      data: DATA_URL.lines,
      getPath: d => d.path,
      getWidth: 50,
      getColor: d =>
        d.color
          .slice(1)
          .match(/\w\w/g)
          .map(x => parseInt(x, 16))
    }),
    new ScatterplotLayer({
      id: 'bart-stations',
      data: DATA_URL.stations,
      getPosition: d => d.coordinates,
      getRadius: d => Math.sqrt(d.exits),
      radiusScale: 2,
      getColor: [0, 0, 0, 80]
    })
  ],
  initialViewState: {
    latitude: 37.78,
    longitude: -122.4,
    zoom: 13,
    pitch: 30
  },
  controller: MapController
});

const layerDebugger = new LayerDebugger(deck);

/* Debug Controls */
addCallback('debug-enabled', enabled => ({enabled}));
addCallback('color-mode-none', () => ({colorMode: 0}));
addCallback('color-mode-depth', () => ({colorMode: 1}));
addCallback('color-mode-fragment', () => ({colorMode: 2}));

function addCallback(id, getOptions) {
  document.getElementById(id).onclick = evt => {
    layerDebugger.setOptions(getOptions(evt.target.checked));
  };
}
