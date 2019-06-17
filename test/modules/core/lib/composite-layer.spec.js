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

import test from 'tape-catch';
import {CompositeLayer, Layer, COORDINATE_SYSTEM} from 'deck.gl';

const SUB_LAYER_ID = 'sub-layer-id';
const BASE_LAYER_ID = 'composite-layer-id';

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
  wrapLongitude: false,
  modelMatrix: [1]
};

const SUB_LAYER_PROPS = {
  opacity: 0.3,
  newForwardProp: 'NFP',
  updateTriggers: {
    getColor: 'c',
    getPosition: 10
  }
};

// used for _subLayerProps to override sublayer props
const OVERRIDE_PROPS = {
  opacity: 0.5,
  newProp: 'abc',
  updateTriggers: {
    getColor: 'b',
    getCoverage: 100
  }
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
  const layer = new TestCompositeLayer(Object.assign({id: BASE_LAYER_ID}, BASE_LAYER_PROPS));
  t.ok(layer, 'CompositeLayer created');
  t.equal(layer.id, BASE_LAYER_ID, 'CompositeLayer id set correctly');
  t.ok(layer.props, 'CompositeLayer props not null');
  t.end();
});

test('CompositeLayer#getSubLayerProps', t => {
  const layer = new TestCompositeLayer(Object.assign({id: BASE_LAYER_ID}, BASE_LAYER_PROPS));

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

test('CompositeLayer#getSubLayerProps(override)', t => {
  const TEST_CASES = [
    {
      name: 'No sublayer props',
      baseLayerProps: BASE_LAYER_PROPS,
      // sublayerProps not defined
      overrideProps: OVERRIDE_PROPS,
      // result just contains base layer props
      expected: BASE_LAYER_PROPS
    },
    {
      name: 'With sub layer props and no override props',
      baseLayerProps: BASE_LAYER_PROPS,
      sublayerProps: SUB_LAYER_PROPS,
      // overrideProps not defined
      // sub layer props take precendence
      expected: Object.assign(
        {id: `${BASE_LAYER_ID}-${SUB_LAYER_ID}`},
        BASE_LAYER_PROPS,
        SUB_LAYER_PROPS,
        {
          updateTriggers: Object.assign({all: undefined}, SUB_LAYER_PROPS.updateTriggers)
        }
      )
    },
    {
      name: 'With overriding sub layer props',
      baseLayerProps: BASE_LAYER_PROPS,
      sublayerProps: SUB_LAYER_PROPS,
      overrideProps: OVERRIDE_PROPS,
      // overriding sub layer props take precendence
      expected: Object.assign(
        {id: `${BASE_LAYER_ID}-${SUB_LAYER_ID}`},
        BASE_LAYER_PROPS,
        SUB_LAYER_PROPS,
        OVERRIDE_PROPS,
        {
          updateTriggers: Object.assign(
            {all: undefined},
            SUB_LAYER_PROPS.updateTriggers,
            OVERRIDE_PROPS.updateTriggers
          )
        }
      )
    }
  ];

  for (const tc of TEST_CASES) {
    const {name, sublayerProps, baseLayerProps, overrideProps, expected} = tc;
    const layer = new TestCompositeLayer(
      Object.assign(
        {id: BASE_LAYER_ID},
        Object.assign({}, baseLayerProps, {
          _subLayerProps: {[SUB_LAYER_ID]: overrideProps}
        })
      )
    );
    const combinedSublayerProps = layer.getSubLayerProps(
      sublayerProps && Object.assign({id: SUB_LAYER_ID}, sublayerProps)
    );
    for (const propName in expected) {
      t.deepEqual(
        combinedSublayerProps[propName],
        expected[propName],
        `${name} : ${propName} sub layer prop should get set correctly`
      );
    }
  }

  t.end();
});
