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

test('MapboxLayer#external Deck', async () => {
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

  await map.once('load');

  // Initialize deck on the map (simulates MapboxOverlay behavior)
  getDeckInstance({map, deck});

  map.addLayer(layer);
  expect(deck.props.views.id === 'mapbox', 'mapbox view exists').toBeTruthy();

  expect(() => (map as any)._render(), 'Map render does not throw').not.toThrow();

  map.fire('remove');
  expect(deck.layerManager, 'External Deck should not be finalized with map').toBeTruthy();

  deck.finalize();

  expect(() => (map as any)._render(), 'Map render does not throw after finalize').not.toThrow();
  expect(() => layer.render(), 'Layer render does not throw after finalize').not.toThrow();
});

test('MapboxLayer#external Deck multiple views supplied', async () => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  await map.once('load');

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
  const renderPromise = map.once('render');
  map.addLayer(layerDefaultView);
  await renderPromise;

  expect((map as any)._renderError, 'render should not throw').toBeFalsy();
  expect(drawLog, 'layers drawn into the correct views').toEqual([
    ['mapbox', 'scatterplot-map'],
    ['view-two', 'scatterplot-second-view']
  ]);

  deck.finalize();
});

test('MapboxLayer#external Deck custom views', async () => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  await map.once('load');

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

  const renderPromise = map.once('render');
  map.addLayer(new MapboxLayer({id: 'scatterplot'}));
  await renderPromise;

  expect((map as any)._renderError, 'render should not throw').toBeFalsy();
  expect(drawLog, 'layer is drawn to both views').toEqual([
    ['mapbox', 'scatterplot'],
    ['view-two', 'scatterplot']
  ]);

  deck.finalize();
});

test('MapboxLayer#drawLayer with zero-size canvas', async () => {
  await new Promise<void>((resolve, reject) => {
    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 12
    });

    map.on('load', () => {
      const deck = new Deck({
        device,
        viewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [
          new ScatterplotLayer({
            id: 'scatterplot',
            data: [],
            getPosition: d => d.position,
            getRadius: 10,
            getFillColor: [255, 0, 0]
          })
        ],
        // Set zero dimensions before the first render so makeViewport returns null.
        // getDeckInstance wraps onLoad, so by the time this fires deck.isInitialized
        // is true and drawLayer won't return early.
        onLoad: () => {
          try {
            (deck as any).width = 0;
            (deck as any).height = 0;
            (map as any)._render();

            expect(
              (map as any)._renderError,
              'render should not throw when canvas has zero dimensions'
            ).toBeFalsy();

            deck.finalize();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      getDeckInstance({map, deck});
      map.addLayer(new MapboxLayer({id: 'scatterplot'}));
    });
  });
});

test('MapboxLayer#afterRender with zero-size canvas', async () => {
  // afterRender is triggered when deck has multiple views (hasNonMapboxViews).
  // It calls getViewport to replace the mapbox viewport and must not pass null
  // into deck._drawLayers when the canvas has zero dimensions.
  await new Promise<void>((resolve, reject) => {
    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 12
    });

    map.on('load', () => {
      const deck = new Deck({
        device,
        views: [new MapView({id: 'mapbox'}), new MapView({id: 'overview'})],
        viewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [
          new ScatterplotLayer({
            id: 'scatterplot',
            data: [],
            getPosition: d => d.position,
            getRadius: 10,
            getFillColor: [255, 0, 0]
          })
        ],
        onLoad: () => {
          try {
            (deck as any).width = 0;
            (deck as any).height = 0;
            (map as any)._render();

            expect(
              (map as any)._renderError,
              'afterRender should not throw when canvas has zero dimensions'
            ).toBeFalsy();

            deck.finalize();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      getDeckInstance({map, deck});
      map.addLayer(new MapboxLayer({id: 'scatterplot'}));
    });
  });
});

test('MapboxLayer#afterRender fires onBeforeRender/onAfterRender without non-Mapbox layers', async () => {
  // When there are no deck layers (and thus no non-Mapbox layers to draw),
  // afterRender should still fire onBeforeRender and onAfterRender callbacks
  // so consumers can track view state changes.
  await new Promise<void>((resolve, reject) => {
    const callLog: string[] = [];

    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 12
    });

    map.on('load', () => {
      const deck = new Deck({
        device,
        viewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [],
        parameters: DEFAULT_PARAMETERS,
        onBeforeRender: () => callLog.push('onBeforeRender'),
        onAfterRender: () => callLog.push('onAfterRender'),
        onLoad: () => {
          try {
            // Clear any callbacks from initialization
            callLog.length = 0;
            // Render after deck is initialized - no MapboxLayers on the map,
            // so afterRender's else branch (no non-Mapbox layers) should fire callbacks
            (map as any)._render();

            expect(callLog, 'onBeforeRender and onAfterRender should be called').toEqual([
              'onBeforeRender',
              'onAfterRender'
            ]);

            deck.finalize();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      getDeckInstance({map, deck});
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
