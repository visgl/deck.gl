// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
import test from 'tape-catch';
import {LayerManager, Viewport, Layer, CompositeLayer} from 'deck.gl';
import {gl} from '@deck.gl/test-utils';

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
  const layerManager = new LayerManager(gl);
  t.ok(layerManager, 'LayerManager created');
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
