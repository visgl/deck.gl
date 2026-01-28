// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {Deck, log, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {FullscreenWidget} from '@deck.gl/widgets';
import {device} from '@deck.gl/test-utils';
import {sleep} from './async-iterator-test-utils';

test('Deck#constructor', () => {
  const callbacks = {
    onWebGLInitialized: 0,
    onBeforeRender: 0,
    onResize: 0,
    onLoad: 0
  };

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

    onWebGLInitialized: () => callbacks.onWebGLInitialized++,
    onBeforeRender: () => callbacks.onBeforeRender++,
    onResize: () => callbacks.onResize++,

    onAfterRender: () => {
      expect(callbacks.onWebGLInitialized, 'onWebGLInitialized called').toBe(1);
      expect(callbacks.onLoad, 'onLoad called').toBe(1);
      expect(callbacks.onResize, 'onResize called').toBe(1);
      expect(callbacks.onBeforeRender, 'first draw').toBe(1);

      deck.finalize();
      expect(deck.layerManager, 'layerManager is finalized').toBeFalsy();
      expect(deck.viewManager, 'viewManager is finalized').toBeFalsy();
      expect(deck.deckRenderer, 'deckRenderer is finalized').toBeFalsy();
    },

    onLoad: () => {
      callbacks.onLoad++;

      expect(deck.layerManager, 'layerManager initialized').toBeTruthy();
      expect(deck.viewManager, 'viewManager initialized').toBeTruthy();
      expect(deck.deckRenderer, 'deckRenderer initialized').toBeTruthy();
    }
  });
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
});

test('Deck#no views', () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,

    viewState: {longitude: 0, latitude: 0, zoom: 0},
    views: [],
    layers: [],

    onAfterRender: () => {
      expect(deck.deckRenderer.renderCount, 'DeckRenderer did not render').toBe(0);
      deck.finalize();
    }
  });
});

test('Deck#rendering, picking, logging', () => {
  // Test logging functionalities
  log.priority = 4;

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
      const info = deck.pickObject({x: 0, y: 0});
      expect(info && info.index, 'Picked object').toBe(1);

      let infos = deck.pickMultipleObjects({x: 0, y: 0});
      expect(infos.length, 'Picked multiple objects').toBe(2);

      infos = deck.pickObjects({x: 0, y: 0, width: 1, height: 1});
      expect(infos.length, 'Picked objects').toBe(1);

      deck.finalize();
      log.priority = 0;
    }
  });
});

test('Deck#auto view state', () => {
  let onViewStateChangeCalled = 0;

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
      expect(deck.getViewports()[0].longitude, 'external viewState should override internal').toBe(
        3
      );
      expect(deck.getViewports()[1].longitude, 'external viewState should override internal').toBe(
        3
      );

      deck.finalize();
    }
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

test('Deck#props omitted are unchanged', async () => {
  const layer = new ScatterplotLayer({
    id: 'scatterplot-global-data',
    data: 'deck://pins',
    getPosition: d => d.position
  });

  const widget = new FullscreenWidget();

  // Initialize with widgets and layers.
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
      const {widgets, layers} = deck.props;
      expect(widgets && Array.isArray(widgets) && widgets.length, 'Widgets is set').toBe(1);
      expect(layers && Array.isArray(layers) && layers.length, 'Layers is set').toBe(1);

      // Render deck a second time without changing widget or layer props.
      deck.setProps({
        onAfterRender: () => {
          const {widgets, layers} = deck.props;
          expect(widgets && Array.isArray(widgets) && widgets.length, 'Widgets remain set').toBe(1);
          expect(layers && Array.isArray(layers) && layers.length, 'Layers remain set').toBe(1);

          deck.finalize();
        }
      });
    }
  });
});
