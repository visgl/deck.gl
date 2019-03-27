"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var CompositeLayer,Layer,COORDINATE_SYSTEM;module.link('deck.gl',{CompositeLayer(v){CompositeLayer=v},Layer(v){Layer=v},COORDINATE_SYSTEM(v){COORDINATE_SYSTEM=v}},1);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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




const BASE_LAYER_PROPS = {
  opacity: 0.2,
  pickable: true,
  visible: false,
  parameters: {},
  getPolygonOffset: null,
  highlightedObjectIndex: 3,
  autoHighlight: true,
  highlightColor: [1, 1, 1],
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  coordinateOrigin: [1, 1, 1],
  modelMatrix: [1]
};

class TestLayer extends Layer {}

TestLayer.layerName = 'TestLayer';

class TestCompositeLayer extends CompositeLayer {
  renderLayers() {
    return [new TestLayer(this.getSubLayerProps())];
  }
}

TestCompositeLayer.layerName = 'TestCompositeLayer';

test('CompositeLayer#constructor', t => {
  const layer = new TestCompositeLayer(Object.assign({id: 'composite-layer'}, BASE_LAYER_PROPS));
  t.ok(layer, 'CompositeLayer created');
  t.equal(layer.id, 'composite-layer', 'CompositeLayer id set correctly');
  t.ok(layer.props, 'CompositeLayer props not null');
  t.end();
});

test('CompositeLayer#getSubLayerProps', t => {
  const layer = new TestCompositeLayer(Object.assign({id: 'composite-layer'}, BASE_LAYER_PROPS));

  // TODO - add table driven test cases for all forwarded sublayer props
  const baseProps = layer.getSubLayerProps();
  t.comment(JSON.stringify(baseProps));
  for (const propName in BASE_LAYER_PROPS) {
    t.equal(
      baseProps[propName],
      BASE_LAYER_PROPS[propName],
      `CompositeLayer baseLayerProp ${propName} ok`
    );
  }

  const sublayers = layer.renderLayers();
  const subProps = sublayers[0].props;
  for (const propName in BASE_LAYER_PROPS) {
    t.equal(
      subProps[propName],
      BASE_LAYER_PROPS[propName],
      `CompositeLayer subLayerProp ${propName} ok`
    );
  }

  t.end();
});
