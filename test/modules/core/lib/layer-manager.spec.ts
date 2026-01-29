// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable func-style, no-console, max-len */
import {test, expect} from 'vitest';
import {LayerManager, ScatterplotLayer, Layer, CompositeLayer} from 'deck.gl';
import {device} from '@deck.gl/test-utils';

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

class TestCompositeLayer extends CompositeLayer {
  renderLayers() {
    return [
      new TestLayer({id: `${this.props.id}-sublayer-1`, ...this.getSubLayerProps()}),
      new TestLayer({id: `${this.props.id}-sublayer-2`, ...this.getSubLayerProps()})
    ];
  }
}

TestCompositeLayer.layerName = 'TestCompositeLayer';

const LAYERS = [
  new TestLayer({id: 'primitive'}),
  new TestCompositeLayer({id: 'composite', stroked: true, filled: true})
];

test('LayerManager#constructor', () => {
  expect(LayerManager, 'LayerManager imported').toBeTruthy();

  let layerManager = new LayerManager(device);
  expect(layerManager, 'LayerManager created').toBeTruthy();
  layerManager.finalize();
  console.log('LayerManager finalized');

  layerManager = new LayerManager(null);
  expect(layerManager, 'LayerManager created without GL context').toBeTruthy();
  layerManager.finalize();
  console.log('LayerManager finalized');
});

test('LayerManager#getLayers', () => {
  const layerManager = new LayerManager(device);
  layerManager.setLayers(LAYERS);
  let layers = layerManager.getLayers();
  expect(layers.length, 'LayerManager.getLayers()').toBe(4);
  layers = layerManager.getLayers({layerIds: ['composite']});
  expect(layers.length, 'LayerManager.getLayers()').toBe(3);
  layers = layerManager.getLayers({layerIds: ['non-existent-id']});
  expect(layers.length, 'LayerManager.getLayers()').toBe(0);
});

test('LayerManager#setLayers', () => {
  const stats = {
    initializeCalled: 0,
    updateCalled: 0,
    dataChanged: false,
    propsChanged: false,
    finalizeCalled: 0
  };

  class SubLayer extends Layer {
    initializeState() {
      stats.initializeCalled++;
    }

    updateState({changeFlags}) {
      stats.updateCalled++;
      stats.dataChanged = changeFlags.dataChanged;
      stats.propsChanged = changeFlags.propsChanged;
    }

    finalizeState() {
      stats.finalizeCalled++;
    }
  }

  SubLayer.defaultProps = {
    image: {type: 'object', value: null, async: true}
  };

  const DATA = [];
  const ALT_DATA = [1];
  const IMAGE = {};
  const ALT_IMAGE = {};
  const TEST_CASES = [
    {
      title: 'add layer with empty props',
      layers: [new SubLayer({id: 'primitive'})],
      initialize: true,
      update: true,
      finalize: false,
      dataChanged: true,
      propsChanged: true
    },
    {
      title: 'set data prop',
      layers: [new SubLayer({id: 'primitive', data: DATA})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: true,
      propsChanged: false
    },
    {
      title: 'set non-data prop',
      layers: [new SubLayer({id: 'primitive', data: DATA, size: 1})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: false,
      propsChanged: true
    },
    {
      title: 'no prop change',
      layers: [new SubLayer({id: 'primitive', data: DATA, size: 1})],
      initialize: false,
      update: false,
      propsChanged: false
    },
    {
      title: 'change data prop',
      layers: [new SubLayer({id: 'primitive', data: ALT_DATA, size: 1})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: true,
      propsChanged: false
    },
    {
      title: 'set non-data async prop',
      layers: [new SubLayer({id: 'primitive', data: ALT_DATA, size: 1, image: IMAGE})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: false,
      propsChanged: true
    },
    {
      title: 'change non-data async prop',
      layers: [new SubLayer({id: 'primitive', data: ALT_DATA, size: 1, image: ALT_IMAGE})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: false,
      propsChanged: true
    },
    {
      title: 'remove layer',
      layers: [],
      initialize: false,
      update: false,
      finalize: true
    }
  ];

  const layerManager = new LayerManager(device);

  TEST_CASES.forEach(testCase => {
    console.log(testCase.title);
    const oldStats = Object.assign({}, stats);
    layerManager.setLayers(testCase.layers);
    expect(
      stats.initializeCalled - oldStats.initializeCalled,
      `${testCase.initialize ? 'should' : 'shoudl not'} initialize layer`
    ).toBe(testCase.initialize ? 1 : 0);
    expect(
      stats.updateCalled - oldStats.updateCalled,
      `${testCase.update ? 'should' : 'shoudl not'} update layer`
    ).toBe(testCase.update ? 1 : 0);
    if (testCase.update) {
      expect(Boolean(stats.dataChanged), 'set dataChanged flag correctly').toBe(
        testCase.dataChanged
      );
      expect(Boolean(stats.propsChanged), 'set propsChanged flag correctly').toBe(
        testCase.propsChanged
      );
    }
    expect(
      stats.finalizeCalled - oldStats.finalizeCalled,
      `${testCase.finalize ? 'should' : 'shoudl not'} finalize layer`
    ).toBe(testCase.finalize ? 1 : 0);
  });
});

test('LayerManager#error handling', () => {
  const errorArgs = [];
  const onError = (error, layer) => errorArgs.push({error, layer});

  class BadLayer extends Layer {
    initializeState() {}

    updateState() {
      if (this.props.throw) {
        throw new Error();
      }
    }
  }

  const layerManager = new LayerManager(device);
  layerManager.setProps({onError});

  layerManager.setLayers([
    new ScatterplotLayer({id: 'scatterplot'}),
    new BadLayer({id: 'crash-on-init', throw: true}),
    new BadLayer({id: 'crash-on-update', throw: false})
  ]);

  expect(errorArgs.length, 'onError is called').toBe(1);
  expect(errorArgs[0].layer.id, 'onError is called with correct args').toBe('crash-on-init');

  layerManager.setLayers([
    new ScatterplotLayer({id: 'scatterplot'}),
    new BadLayer({id: 'crash-on-init', throw: true}),
    new BadLayer({id: 'crash-on-update', throw: true})
  ]);

  expect(errorArgs.length, 'onError is called').toBe(2);
  expect(errorArgs[1].layer.id, 'onError is called with correct args').toBe('crash-on-update');
});
