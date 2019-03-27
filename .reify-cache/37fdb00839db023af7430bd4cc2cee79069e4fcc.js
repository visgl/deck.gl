"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var LayerManager,Layer,CompositeLayer;module.link('deck.gl',{LayerManager(v){LayerManager=v},Layer(v){Layer=v},CompositeLayer(v){CompositeLayer=v}},1);var gl;module.link('@deck.gl/test-utils',{gl(v){gl=v}},2);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
/* eslint-disable func-style, no-console, max-len */




class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

class TestCompositeLayer extends CompositeLayer {
  renderLayers() {
    return [
      new TestLayer(Object.assign({id: `${this.props.id}-sublayer-1`}, this.getSubLayerProps())),
      new TestLayer(Object.assign({id: `${this.props.id}-sublayer-2`}, this.getSubLayerProps()))
    ];
  }
}

TestCompositeLayer.layerName = 'TestCompositeLayer';

const LAYERS = [
  new TestLayer({id: 'primitive'}),
  new TestCompositeLayer({id: 'composite', stroked: true, filled: true})
];

test('LayerManager#constructor', t => {
  t.ok(LayerManager, 'LayerManager imported');

  let layerManager = new LayerManager(gl);
  t.ok(layerManager, 'LayerManager created');
  layerManager.finalize();
  t.pass('LayerManager finalized');

  layerManager = new LayerManager(null);
  t.ok(layerManager, 'LayerManager created without GL context');
  layerManager.finalize();
  t.pass('LayerManager finalized');

  t.end();
});

test('LayerManager#getLayers', t => {
  const layerManager = new LayerManager(gl);
  layerManager.setLayers(LAYERS);
  let layers = layerManager.getLayers();
  t.equal(layers.length, 4, 'LayerManager.getLayers()');
  layers = layerManager.getLayers({layerIds: ['composite']});
  t.equal(layers.length, 3, 'LayerManager.getLayers()');
  layers = layerManager.getLayers({layerIds: ['non-existent-id']});
  t.equal(layers.length, 0, 'LayerManager.getLayers()');
  t.end();
});

test('LayerManager#setLayers', t => {
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

  const DATA = [];
  const ALT_DATA = [1];
  const TEST_CASES = [
    {
      layers: [new SubLayer({id: 'primitive'})],
      initialize: true,
      update: true,
      finalize: false,
      dataChanged: true,
      propsChanged: true
    },
    {
      layers: [new SubLayer({id: 'primitive', data: DATA})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: true,
      propsChanged: false
    },
    {
      layers: [new SubLayer({id: 'primitive', data: DATA, size: 1})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: false,
      propsChanged: true
    },
    {
      layers: [new SubLayer({id: 'primitive', data: DATA, size: 1})],
      initialize: false,
      update: false,
      propsChanged: false
    },
    {
      layers: [new SubLayer({id: 'primitive', data: ALT_DATA, size: 1})],
      initialize: false,
      update: true,
      finalize: false,
      dataChanged: true,
      propsChanged: false
    },
    {
      layers: [],
      initialize: false,
      update: false,
      finalize: true
    }
  ];

  const layerManager = new LayerManager(gl);

  TEST_CASES.forEach(testCase => {
    const oldStats = Object.assign({}, stats);
    layerManager.setLayers(testCase.layers);
    t.is(
      stats.initializeCalled - oldStats.initializeCalled,
      testCase.initialize ? 1 : 0,
      `${testCase.initialize ? 'should' : 'shoudl not'} initialize layer`
    );
    t.is(
      stats.updateCalled - oldStats.updateCalled,
      testCase.update ? 1 : 0,
      `${testCase.update ? 'should' : 'shoudl not'} update layer`
    );
    if (testCase.update) {
      t.is(Boolean(stats.dataChanged), testCase.dataChanged, 'set dataChanged flag correctly');
      t.is(Boolean(stats.propsChanged), testCase.propsChanged, 'set propsChanged flag correctly');
    }
    t.is(
      stats.finalizeCalled - oldStats.finalizeCalled,
      testCase.finalize ? 1 : 0,
      `${testCase.finalize ? 'should' : 'shoudl not'} finalize layer`
    );
  });

  t.end();
});
