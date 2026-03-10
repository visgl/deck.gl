// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {Deck, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import MapboxLayer from '@deck.gl/mapbox/mapbox-layer';
import {getDeckInstance} from '@deck.gl/mapbox/deck-utils';
import {device} from '@deck.gl/test-utils/vitest';
import {equals} from '@math.gl/core';

import MockMapboxMap from './mapbox-gl-mock/map';
import {DEFAULT_PARAMETERS} from './fixtures';

class TestScatterplotLayer extends ScatterplotLayer {
  draw(params) {
    super.draw(params);
    this.props.onAfterRedraw({
      viewport: this.context.viewport,
      layer: this
    });
  }
}
TestScatterplotLayer.layerName = 'TestScatterplotLayer';

test('MapboxLayer#external Deck', () => {
  // Create Deck with merged parameters like MapboxOverlay._onAddInterleaved does
  const deck = new Deck({
    device,
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-layer-0',
        data: [],
        getPosition: d => d.position,
        getRadius: 10,
        getFillColor: [255, 0, 0]
      })
    ],
    parameters: {...DEFAULT_PARAMETERS, depthTest: false}
  });

  const layer = new MapboxLayer({id: 'scatterplot-layer-0'});

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  map.on('load', () => {
    // Initialize deck on the map (simulates MapboxOverlay behavior)
    getDeckInstance({map, deck});

    map.addLayer(layer);
    expect(deck.props.views.id === 'mapbox', 'mapbox view exists').toBeTruthy();

    map.fire('render');
    console.log('Map render does not throw');

    map.fire('remove');
    expect(deck.layerManager, 'External Deck should not be finalized with map').toBeTruthy();

    deck.finalize();

    map.fire('render');
    console.log('Map render does not throw');

    layer.render();
    console.log('Map render does not throw');
  });
});

test('MapboxLayer#external Deck multiple views supplied', () => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  map.on('load', () => {
    // Create Deck with default parameters like MapboxOverlay._onAddInterleaved does
    const deck = new Deck({
      device,
      views: [new MapView({id: 'view-two'}), new MapView({id: 'mapbox'})],
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      },
      layers: [
        new TestScatterplotLayer({
          id: 'scatterplot-map',
          data: [],
          getPosition: d => d.position,
          getRadius: 10,
          getFillColor: [255, 0, 0],
          onAfterRedraw: onRedrawLayer
        }),
        new TestScatterplotLayer({
          id: 'scatterplot-second-view',
          data: [],
          getPosition: d => d.position,
          getRadius: 10,
          getFillColor: [255, 0, 0],
          onAfterRedraw: onRedrawLayer
        })
      ],
      parameters: DEFAULT_PARAMETERS,
      layerFilter: ({viewport, layer}) => {
        if (viewport.id === 'mapbox') return layer.id === 'scatterplot-map';
        return layer.id === 'scatterplot-second-view';
      }
    });

    // Initialize deck on the map (simulates MapboxOverlay behavior)
    getDeckInstance({map, deck});

    const layerDefaultView = new MapboxLayer({id: 'scatterplot-map'});
    map.addLayer(layerDefaultView);

    map.on('render', () => {
      expect(drawLog, 'layers drawn into the correct views').toEqual([
        ['mapbox', 'scatterplot-map'],
        ['view-two', 'scatterplot-second-view']
      ]);

      deck.finalize();
    });
  });
});

test('MapboxLayer#external Deck custom views', () => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  map.on('load', () => {
    const deck = new Deck({
      device,
      views: [new MapView({id: 'view-two'})],
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      },
      layers: [
        new TestScatterplotLayer({
          id: 'scatterplot',
          data: [],
          getPosition: d => d.position,
          getRadius: 10,
          getFillColor: [255, 0, 0],
          onAfterRedraw: onRedrawLayer
        })
      ]
    });

    // Initialize deck on the map (simulates MapboxOverlay behavior)
    getDeckInstance({map, deck});

    map.addLayer(new MapboxLayer({id: 'scatterplot'}));
    map.on('render', () => {
      expect(drawLog, 'layer is drawn to both views').toEqual([
        ['mapbox', 'scatterplot'],
        ['view-two', 'scatterplot']
      ]);

      deck.finalize();
    });
  });
});

/** Used to compare view states */
export function objectEqual(actual, expected) {
  if (equals(actual, expected)) {
    return true;
  }
  if (typeof actual !== 'object' || typeof expected !== 'object') {
    return false;
  }

  const keys0 = Object.keys(actual);
  const keys1 = Object.keys(expected);
  if (keys0.length !== keys1.length) {
    return false;
  }
  for (const key of keys1) {
    if (!objectEqual(actual[key], expected[key])) {
      return false;
    }
  }
  return true;
}
