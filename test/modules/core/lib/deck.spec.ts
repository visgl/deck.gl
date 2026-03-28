// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, log, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {FullscreenWidget} from '@deck.gl/widgets';
import {device} from '@deck.gl/test-utils/vitest';
import {sleep} from './async-iterator-test-utils';

const webglTest = device.type === 'webgl' ? test : test.skip;

test('Deck#constructor', async () => {
  const callbacks = {
    onDeviceInitialized: 0,
    onWebGLInitialized: 0,
    onBeforeRender: 0,
    onResize: 0,
    onLoad: 0
  };

  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 0
      },

      layers: [],

      onDeviceInitialized: () => callbacks.onDeviceInitialized++,
      onWebGLInitialized: () => callbacks.onWebGLInitialized++,
      onBeforeRender: () => callbacks.onBeforeRender++,
      onResize: () => callbacks.onResize++,

      onAfterRender: () => {
        try {
          expect(callbacks.onDeviceInitialized, 'onDeviceInitialized called').toBe(1);
          expect(callbacks.onWebGLInitialized, 'onWebGLInitialized called').toBe(
            device.type === 'webgl' ? 1 : 0
          );
          expect(callbacks.onLoad, 'onLoad called').toBe(1);
          expect(callbacks.onResize, 'onResize called').toBe(1);
          expect(callbacks.onBeforeRender, 'first draw').toBe(1);

          deck.finalize();
          expect(deck.layerManager, 'layerManager is finalized').toBeFalsy();
          expect(deck.viewManager, 'viewManager is finalized').toBeFalsy();
          expect(deck.deckRenderer, 'deckRenderer is finalized').toBeFalsy();
          resolve();
        } catch (error) {
          reject(error);
        }
      },

      onLoad: () => {
        try {
          callbacks.onLoad++;

          expect(deck.layerManager, 'layerManager initialized').toBeTruthy();
          expect(deck.viewManager, 'viewManager initialized').toBeTruthy();
          expect(deck.deckRenderer, 'deckRenderer initialized').toBeTruthy();
        } catch (error) {
          reject(error);
        }
      }
    });
  });

  console.log('Deck constructor did not throw');
});

test('Deck#abort', async () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 0},
    onError: err => {
      expect(err, 'Deck encounters error').toBeFalsy();
    }
  });

  deck.finalize();

  await sleep(50);

  console.log('Deck initialization aborted');
});

test('Deck#no views', async () => {
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {longitude: 0, latitude: 0, zoom: 0},
      views: [],
      layers: [],

      onAfterRender: () => {
        try {
          expect(deck.deckRenderer.renderCount, 'DeckRenderer did not render').toBe(0);
          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });

  console.log('Deck constructor did not throw');
});

webglTest('Deck#rendering, picking, logging', async () => {
  // Test logging functionalities
  log.priority = 4;

  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      layers: [
        new ScatterplotLayer({
          data: [{position: [0, 0]}, {position: [0, 0]}],
          radiusMinPixels: 100,
          pickable: true
        })
      ],

      onAfterRender: () => {
        try {
          const info = deck.pickObject({x: 0, y: 0});
          expect(info && info.index, 'Picked object').toBe(1);

          let infos = deck.pickMultipleObjects({x: 0, y: 0});
          expect(infos.length, 'Picked multiple objects').toBe(2);

          infos = deck.pickObjects({x: 0, y: 0, width: 1, height: 1});
          expect(infos.length, 'Picked objects').toBe(1);

          deck.finalize();
          log.priority = 0;
          resolve();
        } catch (error) {
          log.priority = 0;
          reject(error);
        }
      }
    });
  });
});

test('Deck#auto view state', async () => {
  let onViewStateChangeCalled = 0;

  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      views: [
        new MapView({id: 'default'}),
        new MapView({id: 'map'}),
        new MapView({id: 'minimap', viewState: {id: 'map', zoom: 12, pitch: 0, bearing: 0}})
      ],

      initialViewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      onViewStateChange: ({viewId, viewState}) => {
        onViewStateChangeCalled++;
        if (viewId === 'default') {
          // block view state change from the default view
          return {longitude: 0, latitude: 0, zoom: 12};
        }
        // use default (a.k.a. viewState)
        return null;
      },

      onLoad: () => {
        try {
          deck._onViewStateChange({
            viewId: 'default',
            viewState: {longitude: 0, latitude: 0, zoom: 11}
          });
          expect(onViewStateChangeCalled, 'onViewStateChange is called').toBe(1);
          expect(deck.getViewports()[0].longitude, 'default view state should not change').toBe(0);

          deck._onViewStateChange({
            viewId: 'map',
            viewState: {longitude: 1, latitude: 1, zoom: 11}
          });
          expect(onViewStateChangeCalled, 'onViewStateChange is called').toBe(2);
          expect(deck.getViewports()[0].longitude, 'default view state should not change').toBe(0);
          expect(deck.getViewports()[1].longitude, 'map longitude is updated').toBe(1);
          expect(deck.getViewports()[1].zoom, 'map zoom is updated').toBe(11);
          expect(deck.getViewports()[2].longitude, 'minimap longitude is updated').toBe(1);
          expect(deck.getViewports()[2].zoom, 'minimap zoom should not change').toBe(12);

          deck._onViewStateChange({
            viewId: 'minimap',
            viewState: {longitude: 2, latitude: 2, zoom: 12}
          });
          expect(onViewStateChangeCalled, 'onViewStateChange is called').toBe(3);
          expect(deck.getViewports()[1].longitude, 'map state should not change').toBe(1);
          expect(deck.getViewports()[2].longitude, 'minimap state should not change').toBe(1);

          deck.setProps({viewState: {longitude: 3, latitude: 3, zoom: 12}});
          deck._onViewStateChange({
            viewId: 'map',
            viewState: {longitude: 1, latitude: 1, zoom: 11}
          });
          expect(
            deck.getViewports()[0].longitude,
            'external viewState should override internal'
          ).toBe(3);
          expect(
            deck.getViewports()[1].longitude,
            'external viewState should override internal'
          ).toBe(3);

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#resourceManager', async () => {
  const layer1 = new ScatterplotLayer({
    id: 'scatterplot-global-data',
    data: 'deck://pins',
    getPosition: d => d.position
  });
  const layer2 = new ScatterplotLayer({
    id: 'scatterplot-shared-data-A',
    data: 'cities.json',
    getPosition: d => d.position
  });
  const layer3 = new ScatterplotLayer({
    id: 'scatterplot-shared-data-B',
    data: 'cities.json',
    getPosition: d => d.position
  });

  const deck = new Deck({
    device,
    width: 1,
    height: 1,

    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 0
    },

    layers: [layer1, layer2, layer3],

    onError: () => null
  });

  function update(props = {}) {
    return new Promise(resolve => {
      deck.setProps({
        ...props,
        onAfterRender: resolve
      });
    });
  }

  await update();
  // @ts-expect-error Accessing private member
  const {resourceManager} = deck.layerManager;
  expect(layer1.getNumInstances(), 'layer subscribes to global data resource').toBe(0);
  expect(resourceManager.contains('cities.json'), 'data url is cached').toBeTruthy();

  deck._addResources({
    pins: [{position: [1, 0, 0]}]
  });
  await update();
  expect(layer1.getNumInstances(), 'layer subscribes to global data resource').toBe(1);

  deck._addResources({
    pins: [{position: [1, 0, 0]}, {position: [0, 2, 0]}]
  });
  await update();
  expect(layer1.getNumInstances(), 'layer data is updated').toBe(2);

  await update({layers: []});
  await sleep(300);
  expect(resourceManager.contains('cities.json'), 'cached data is purged').toBeFalsy();

  deck._removeResources(['pins']);
  expect(resourceManager.contains('pins'), 'data resource is removed').toBeFalsy();

  deck.finalize();
});

test('Deck#getView with single view', async () => {
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      views: new MapView({id: 'map'}),

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      onLoad: () => {
        try {
          const mapView = deck.getView('map');
          expect(mapView, 'getView returns a view for valid id').toBeTruthy();
          expect(mapView?.id, 'getView returns the correct view').toBe('map');

          const unknownView = deck.getView('unknown');
          expect(unknownView, 'getView returns undefined for unknown id').toBeFalsy();

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#getView with multiple views', async () => {
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      views: [new MapView({id: 'map'}), new MapView({id: 'minimap'})],

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      onLoad: () => {
        try {
          const mapView = deck.getView('map');
          expect(mapView, 'getView returns a view for valid id').toBeTruthy();
          expect(mapView?.id, 'getView returns the correct view').toBe('map');

          const minimapView = deck.getView('minimap');
          expect(minimapView, 'getView returns a view for second valid id').toBeTruthy();
          expect(minimapView?.id, 'getView returns the correct view').toBe('minimap');

          const unknownView = deck.getView('unknown');
          expect(unknownView, 'getView returns undefined for unknown id').toBeFalsy();

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#props omitted are unchanged', async () => {
  const layer = new ScatterplotLayer({
    id: 'scatterplot-global-data',
    data: 'deck://pins',
    getPosition: d => d.position
  });

  const widget = new FullscreenWidget();

  // Initialize with widgets and layers.
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 0
      },

      layers: [layer],
      widgets: [widget],

      onLoad: () => {
        try {
          const {widgets, layers} = deck.props;
          expect(widgets && Array.isArray(widgets) && widgets.length, 'Widgets is set').toBe(1);
          expect(layers && Array.isArray(layers) && layers.length, 'Layers is set').toBe(1);

          // Render deck a second time without changing widget or layer props.
          deck.setProps({
            onAfterRender: () => {
              try {
                const {widgets, layers} = deck.props;
                expect(
                  widgets && Array.isArray(widgets) && widgets.length,
                  'Widgets remain set'
                ).toBe(1);
                expect(layers && Array.isArray(layers) && layers.length, 'Layers remain set').toBe(
                  1
                );

                deck.finalize();
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          });
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});
