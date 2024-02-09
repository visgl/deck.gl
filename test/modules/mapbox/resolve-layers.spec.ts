import test from 'tape-promise/tape';

import {Deck} from '@deck.gl/core';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {resolveLayers} from '@deck.gl/mapbox/resolve-layers';
import {device} from '@deck.gl/test-utils';

import MockMapboxMap from './mapbox-gl-mock/map';

test('MapboxOverlay#resolveLayers', async t => {
  const MAP_STYLE = {
    layers: [
      {id: 'water'},
      {id: 'water_label'},
      {id: 'road'},
      {id: 'road_label'},
      {id: 'park'},
      {id: 'building'}
    ]
  };
  const DEFAULT_LAYERS = ['water', 'water_label', 'road', 'road_label', 'park', 'building'];

  const TEST_CASES = [
    {
      title: 'Initial add',
      layers: [new ScatterplotLayer({id: 'poi'})],
      expected: ['water', 'water_label', 'road', 'road_label', 'park', 'building', 'poi']
    },
    {
      title: 'Move layer',
      layers: [new ScatterplotLayer({id: 'poi', beforeId: 'park'})],
      expected: ['water', 'water_label', 'road', 'road_label', 'poi', 'park', 'building']
    },
    {
      title: 'Add layer',
      layers: [
        new ScatterplotLayer({id: 'poi', beforeId: 'park'}),
        new ArcLayer({id: 'connection'})
      ],
      expected: [
        'water',
        'water_label',
        'road',
        'road_label',
        'poi',
        'park',
        'building',
        'connection'
      ]
    },
    {
      title: 'Insert layer',
      layers: [
        [
          new ScatterplotLayer({id: 'poi', beforeId: 'park'}),
          new ScatterplotLayer({id: 'poi2', beforeId: 'park'})
        ],
        new ArcLayer({id: 'connection'})
      ],
      expected: [
        'water',
        'water_label',
        'road',
        'road_label',
        'poi',
        'poi2',
        'park',
        'building',
        'connection'
      ]
    },
    {
      title: 'Reorder layer',
      layers: [
        [
          new ScatterplotLayer({id: 'poi2', beforeId: 'park'}),
          new ScatterplotLayer({id: 'poi', beforeId: 'park'})
        ],
        new ArcLayer({id: 'connection'})
      ],
      expected: [
        'water',
        'water_label',
        'road',
        'road_label',
        'poi2',
        'poi',
        'park',
        'building',
        'connection'
      ]
    },
    {
      title: 'Reorder layer',
      layers: [
        [
          new ScatterplotLayer({id: 'poi2', beforeId: 'park'}),
          new ScatterplotLayer({id: 'poi', beforeId: 'park'})
        ],
        new ArcLayer({id: 'connection', beforeId: 'park'})
      ],
      expected: [
        'water',
        'water_label',
        'road',
        'road_label',
        'poi2',
        'poi',
        'connection',
        'park',
        'building'
      ]
    },
    {
      title: 'Remove and add layer',
      layers: [
        [
          new ScatterplotLayer({id: 'poi2', beforeId: 'park'}),
          new ScatterplotLayer({id: 'poi', beforeId: 'park'})
        ],
        new ArcLayer({id: 'connection2'})
      ],
      expected: [
        'water',
        'water_label',
        'road',
        'road_label',
        'poi2',
        'poi',
        'park',
        'building',
        'connection2'
      ]
    }
  ];

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12,
    style: MAP_STYLE
  });
  const deck = new Deck({
    device,
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    }
  });

  t.doesNotThrow(() => resolveLayers(), 'All parameters missing');
  t.doesNotThrow(() => resolveLayers(map, deck, 'Map is not done loading'));

  // Wait for style to load
  await sleep(10);

  let lastLayers;
  for (const testCase of TEST_CASES) {
    resolveLayers(map, deck, lastLayers, testCase.layers);
    t.deepEqual(map.style._order, testCase.expected, testCase.title);
    lastLayers = testCase.layers;
  }

  map.setStyle({...MAP_STYLE});
  t.deepEqual(map.style._order, DEFAULT_LAYERS, 'Style is reset');

  // Wait for style to load
  await sleep(10);

  resolveLayers(map, deck, lastLayers, lastLayers);
  t.deepEqual(
    map.style._order,
    TEST_CASES[TEST_CASES.length - 1].expected,
    'Layers restored after style change'
  );

  resolveLayers(map, deck, lastLayers, undefined);
  t.deepEqual(map.style._order, DEFAULT_LAYERS, 'All layers removed');

  deck.finalize();
  t.end();
});

/* global setTimeout */
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
