// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {Deck, log, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {FullscreenWidget} from '@deck.gl/widgets';
import {device} from '@deck.gl/test-utils';
import {sleep} from './async-iterator-test-utils';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

function createPickingInfo(props = {}) {
  return {
    x: 0,
    y: 0,
    coordinate: [0, 0],
    layer: null,
    viewport: null,
    ...props
  };
}

function createPointPickResult(props = {}) {
  return {
    result: [createPickingInfo(props)],
    emptyInfo: createPickingInfo()
  };
}

async function waitForRender(deck: Deck): Promise<void> {
  await new Promise<void>(resolve => {
    deck.setProps({onAfterRender: resolve});
  });
}

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

test('Deck#abort', async t => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 0},
    onError: err => {
      t.notOk(err, 'Deck encounters error');
    }
  });

  deck.finalize();

  await sleep(50);

  t.pass('Deck initialization aborted');
  t.end();
});

test('Deck#no views', t => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,

    viewState: {longitude: 0, latitude: 0, zoom: 0},
    views: [],
    layers: [],

    onAfterRender: () => {
      t.is(deck.deckRenderer.renderCount, 0, 'DeckRenderer did not render');
      deck.finalize();
      t.end();
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

test('Deck#async picking', async t => {
  let rendered = false;

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
      rendered = true;
    }
  });

  // Wait for initial render
  await new Promise<void>(resolve => {
    deck.setProps({onAfterRender: resolve});
  });
  t.ok(rendered, 'Deck rendered');

  const info = await deck.pickObjectAsync({x: 0, y: 0});
  t.is(info && info.index, 1, 'Async picked object');

  const rectInfos = await deck.pickObjectsAsync({x: 0, y: 0, width: 1, height: 1});
  t.is(rectInfos.length, 1, 'Async picked objects');

  deck.finalize();
  t.end();
});

test('Deck#explicit sync picking unaffected by pickAsync', async t => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
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
    ]
  });

  await waitForRender(deck);

  const info = deck.pickObject({x: 0, y: 0});
  t.is(info && info.index, 1, 'Explicit sync picking still uses the sync API');

  deck.finalize();
  t.end();
});

test('Deck#does not expose pickMultipleObjectsAsync', async t => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: []
  });

  await waitForRender(deck);

  t.notOk('pickMultipleObjectsAsync' in deck, 'Async deep-pick API is removed from Deck');

  deck.finalize();
  t.end();
});

test('Deck#internal hover uses sync picking on WebGL auto mode', async t => {
  const hovered: number[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'auto',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onHover: info => hovered.push(info.index)
  });

  await waitForRender(deck);

  let syncCalls = 0;
  let asyncCalls = 0;

  // @ts-expect-error testing private method override
  deck._pick = () => {
    syncCalls++;
    return createPointPickResult({index: 2});
  };
  // @ts-expect-error testing private method override
  deck._pickAsync = () => {
    asyncCalls++;
    return Promise.resolve(createPointPickResult({index: 3}));
  };

  // @ts-expect-error testing private state injection
  deck._pickRequest = {
    mode: 'hover',
    x: 0,
    y: 0,
    radius: 0,
    event: {type: 'pointermove', offsetCenter: {x: 0, y: 0}}
  };

  // @ts-expect-error testing private method access
  deck._pickAndCallback();

  t.is(syncCalls, 1, 'sync internal picker is used');
  t.is(asyncCalls, 0, 'async internal picker is not used');
  t.deepEqual(hovered, [2], 'hover callback fires immediately with sync picking');

  deck.finalize();
  t.end();
});

test('Deck#async hover ignores stale results', async t => {
  const hovered: number[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onHover: info => hovered.push(info.index)
  });

  await waitForRender(deck);

  const firstPick = createDeferred<ReturnType<typeof createPointPickResult>>();
  const secondPick = createDeferred<ReturnType<typeof createPointPickResult>>();
  let asyncCalls = 0;

  // @ts-expect-error testing private method override
  deck._pickAsync = () => {
    asyncCalls++;
    return asyncCalls === 1 ? firstPick.promise : secondPick.promise;
  };

  // @ts-expect-error testing private state injection
  deck._pickRequest = {
    mode: 'hover',
    x: 0,
    y: 0,
    radius: 0,
    event: {type: 'pointermove', offsetCenter: {x: 0, y: 0}}
  };
  // @ts-expect-error testing private method access
  deck._pickAndCallback();

  // @ts-expect-error testing private state injection
  deck._pickRequest = {
    mode: 'hover',
    x: 1,
    y: 1,
    radius: 0,
    event: {type: 'pointermove', offsetCenter: {x: 1, y: 1}}
  };
  // @ts-expect-error testing private method access
  deck._pickAndCallback();

  secondPick.resolve(createPointPickResult({index: 22}));
  await sleep(0);
  firstPick.resolve(createPointPickResult({index: 11}));
  await sleep(0);

  t.deepEqual(hovered, [22], 'stale hover result is ignored');

  deck.finalize();
  t.end();
});

test('Deck#async pointerdown delays click callback until picking resolves', async t => {
  const clicked: number[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onClick: info => clicked.push(info.index)
  });

  await waitForRender(deck);

  const pointerDownPick = createDeferred<ReturnType<typeof createPointPickResult>>();

  // @ts-expect-error testing private method override
  deck._pickAsync = () => pointerDownPick.promise;

  // @ts-expect-error testing private method access
  deck._onPointerDown({offsetCenter: {x: 0, y: 0}});
  // @ts-expect-error testing private method access
  deck._onEvent({type: 'click', offsetCenter: {x: 0, y: 0}});

  t.deepEqual(clicked, [], 'click callback is deferred while pointerdown picking is pending');

  pointerDownPick.resolve(createPointPickResult({index: 7}));
  await sleep(0);

  t.deepEqual(clicked, [7], 'click callback uses resolved pointerdown picking info');

  deck.finalize();
  t.end();
});

test('Deck#controller pickPosition returns null in async mode', async t => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: []
  });

  await waitForRender(deck);

  // @ts-expect-error testing private method access
  t.equal(
    deck._pickPositionForController(0, 0),
    null,
    'controllers degrade gracefully in async mode'
  );

  deck.finalize();
  t.end();
});

test('Deck#pickAsync sync on WebGPU reports an error', async t => {
  const errors: Error[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onError: error => errors.push(error)
  });

  await waitForRender(deck);

  // @ts-expect-error testing private device override
  const fakeDevice = Object.create(deck.device);
  Object.defineProperty(fakeDevice, 'type', {value: 'webgpu'});
  Object.defineProperty(deck, 'device', {value: fakeDevice});

  deck.setProps({pickAsync: 'sync'});

  t.is(errors.length, 1, 'invalid sync-on-WebGPU configuration is reported');
  t.ok(
    errors[0].message.includes('`pickAsync: "sync"`'),
    'error message explains the invalid config'
  );

  deck.finalize();
  t.end();
});

test('Deck#auto view state', t => {
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
      t.is(onViewStateChangeCalled, 1, 'onViewStateChange is called');
      t.is(deck.getViewports()[0].longitude, 0, 'default view state should not change');

      deck._onViewStateChange({
        viewId: 'map',
        viewState: {longitude: 1, latitude: 1, zoom: 11}
      });
      t.is(onViewStateChangeCalled, 2, 'onViewStateChange is called');
      t.is(deck.getViewports()[0].longitude, 0, 'default view state should not change');
      t.is(deck.getViewports()[1].longitude, 1, 'map longitude is updated');
      t.is(deck.getViewports()[1].zoom, 11, 'map zoom is updated');
      t.is(deck.getViewports()[2].longitude, 1, 'minimap longitude is updated');
      t.is(deck.getViewports()[2].zoom, 12, 'minimap zoom should not change');

      deck._onViewStateChange({
        viewId: 'minimap',
        viewState: {longitude: 2, latitude: 2, zoom: 12}
      });
      t.is(onViewStateChangeCalled, 3, 'onViewStateChange is called');
      t.is(deck.getViewports()[1].longitude, 1, 'map state should not change');
      t.is(deck.getViewports()[2].longitude, 1, 'minimap state should not change');

      deck.setProps({viewState: {longitude: 3, latitude: 3, zoom: 12}});
      deck._onViewStateChange({
        viewId: 'map',
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

test('Deck#getView with single view', t => {
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
      const mapView = deck.getView('map');
      t.ok(mapView, 'getView returns a view for valid id');
      t.is(mapView?.id, 'map', 'getView returns the correct view');

      const unknownView = deck.getView('unknown');
      t.notOk(unknownView, 'getView returns undefined for unknown id');

      deck.finalize();
      t.end();
    }
  });
});

test('Deck#getView with multiple views', t => {
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
      const mapView = deck.getView('map');
      t.ok(mapView, 'getView returns a view for valid id');
      t.is(mapView?.id, 'map', 'getView returns the correct view');

      const minimapView = deck.getView('minimap');
      t.ok(minimapView, 'getView returns a view for second valid id');
      t.is(minimapView?.id, 'minimap', 'getView returns the correct view');

      const unknownView = deck.getView('unknown');
      t.notOk(unknownView, 'getView returns undefined for unknown id');

      deck.finalize();
      t.end();
    }
  });
});

test('Deck#props omitted are unchanged', async t => {
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
      t.is(widgets && Array.isArray(widgets) && widgets.length, 1, 'Widgets is set');
      t.is(layers && Array.isArray(layers) && layers.length, 1, 'Layers is set');

      // Render deck a second time without changing widget or layer props.
      deck.setProps({
        onAfterRender: () => {
          const {widgets: nextWidgets, layers: nextLayers} = deck.props;
          t.is(
            nextWidgets && Array.isArray(nextWidgets) && nextWidgets.length,
            1,
            'Widgets remain set'
          );
          t.is(
            nextLayers && Array.isArray(nextLayers) && nextLayers.length,
            1,
            'Layers remain set'
          );

          deck.finalize();
          t.end();
        }
      });
    }
  });
});
