import test from 'tape-promise/tape';
import {Deck, log, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils';
import {sleep} from './async-iterator-test-utils';

test('Deck#constructor', t => {
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
    // This is required because the jsdom canvas does not have client width/height
    autoResizeDrawingBuffer: device.canvasContext.htmlCanvas.clientWidth > 0,

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
      t.is(callbacks.onWebGLInitialized, 1, 'onWebGLInitialized called');
      t.is(callbacks.onLoad, 1, 'onLoad called');
      t.is(callbacks.onResize, 1, 'onResize called');
      t.is(callbacks.onBeforeRender, 1, 'first draw');

      deck.finalize();
      t.notOk(deck.layerManager, 'layerManager is finalized');
      t.notOk(deck.viewManager, 'viewManager is finalized');
      t.notOk(deck.deckRenderer, 'deckRenderer is finalized');
      t.end();
    },

    onLoad: () => {
      callbacks.onLoad++;

      t.ok(deck.layerManager, 'layerManager initialized');
      t.ok(deck.viewManager, 'viewManager initialized');
      t.ok(deck.deckRenderer, 'deckRenderer initialized');
    }
  });

  t.pass('Deck constructor did not throw');
});

test('Deck#rendering, picking, logging', t => {
  // Test logging functionalities
  log.priority = 4;

  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    // This is required because the jsdom canvas does not have client width/height
    autoResizeDrawingBuffer: device.canvasContext.htmlCanvas.clientWidth > 0,

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
      t.is(info && info.index, 1, 'Picked object');

      let infos = deck.pickMultipleObjects({x: 0, y: 0});
      t.is(infos.length, 2, 'Picked multiple objects');

      infos = deck.pickObjects({x: 0, y: 0, width: 1, height: 1});
      t.is(infos.length, 1, 'Picked objects');

      deck.finalize();
      log.priority = 0;

      t.end();
    }
  });
});

test('Deck#auto view state', t => {
  let onViewStateChangeCalled = 0;

  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    // This is required because the jsdom canvas does not have client width/height
    autoResizeDrawingBuffer: device.canvasContext.canvas.clientWidth > 0,

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
      deck.viewManager._onViewStateChange('default', {
        viewState: {longitude: 0, latitude: 0, zoom: 11}
      });
      t.is(onViewStateChangeCalled, 1, 'onViewStateChange is called');
      t.is(deck.getViewports()[0].longitude, 0, 'default view state should not change');

      deck.viewManager._onViewStateChange('map', {
        viewState: {longitude: 1, latitude: 1, zoom: 11}
      });
      t.is(onViewStateChangeCalled, 2, 'onViewStateChange is called');
      t.is(deck.getViewports()[0].longitude, 0, 'default view state should not change');
      t.is(deck.getViewports()[1].longitude, 1, 'map longitude is updated');
      t.is(deck.getViewports()[1].zoom, 11, 'map zoom is updated');
      t.is(deck.getViewports()[2].longitude, 1, 'minimap longitude is updated');
      t.is(deck.getViewports()[2].zoom, 12, 'minimap zoom should not change');

      deck.viewManager._onViewStateChange('minimap', {
        viewState: {longitude: 2, latitude: 2, zoom: 12}
      });
      t.is(onViewStateChangeCalled, 3, 'onViewStateChange is called');
      t.is(deck.getViewports()[1].longitude, 1, 'map state should not change');
      t.is(deck.getViewports()[2].longitude, 1, 'minimap state should not change');

      deck.setProps({viewState: {longitude: 3, latitude: 3, zoom: 12}});
      deck.viewManager._onViewStateChange('map', {
        viewState: {longitude: 1, latitude: 1, zoom: 11}
      });
      t.is(deck.getViewports()[0].longitude, 3, 'external viewState should override internal');
      t.is(deck.getViewports()[1].longitude, 3, 'external viewState should override internal');

      deck.finalize();

      t.end();
    }
  });
});

test('Deck#resourceManager', async t => {
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
    // This is required because the jsdom canvas does not have client width/height
    autoResizeDrawingBuffer: device.canvasContext.htmlCanvas.clientWidth > 0,

    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 0
    },

    layers: [layer1, layer2, layer3],

    onError: () => null
  });

  function update(props) {
    return new Promise(resolve => {
      deck.setProps({
        ...props,
        onAfterRender: resolve
      });
    });
  }

  await update();
  const {resourceManager} = deck.layerManager;
  t.is(layer1.getNumInstances(), 0, 'layer subscribes to global data resource');
  t.ok(resourceManager.contains('cities.json'), 'data url is cached');

  deck._addResources({
    pins: [{position: [1, 0, 0]}]
  });
  await update();
  t.is(layer1.getNumInstances(), 1, 'layer subscribes to global data resource');

  deck._addResources({
    pins: [{position: [1, 0, 0]}, {position: [0, 2, 0]}]
  });
  await update();
  t.is(layer1.getNumInstances(), 2, 'layer data is updated');

  await update({layers: []});
  await sleep(300);
  t.notOk(resourceManager.contains('cities.json'), 'cached data is purged');

  deck._removeResources(['pins']);
  t.notOk(resourceManager.contains('pins'), 'data resource is removed');

  deck.finalize();
  t.end();
});
