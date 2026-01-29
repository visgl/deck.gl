// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {Deck} from '@deck.gl/core';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {resolveLayers} from '@deck.gl/mapbox/resolve-layers';
import {getDeckInstance} from '@deck.gl/mapbox/deck-utils';
import {device} from '@deck.gl/test-utils';

import MockMapboxMap from './mapbox-gl-mock/map';

test('MapboxOverlay#resolveLayers', async () => {
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

  expect(() => resolveLayers(), 'All parameters missing').not.toThrow();
  expect(() => resolveLayers(map, deck, 'Map is not done loading')).not.toThrow();

  // Wait for style to load
  await sleep(10);

  // Initialize deck on the map (simulates MapboxOverlay behavior)
  getDeckInstance({map, deck});

  let lastLayers;
  for (const testCase of TEST_CASES) {
    resolveLayers(map, deck, lastLayers, testCase.layers);
    expect(map.style._order, testCase.title).toEqual(testCase.expected);
    lastLayers = testCase.layers;
  }

  map.setStyle({...MAP_STYLE});
  expect(map.style._order, 'Style is reset').toEqual(DEFAULT_LAYERS);

  // Wait for style to load
  await sleep(10);

  resolveLayers(map, deck, lastLayers, lastLayers);
  expect(map.style._order, 'Layers restored after style change').toEqual(
    TEST_CASES[TEST_CASES.length - 1].expected
  );

  resolveLayers(map, deck, lastLayers, undefined);
  expect(map.style._order, 'All layers removed').toEqual(DEFAULT_LAYERS);

  deck.finalize();
});

/* global setTimeout */
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
