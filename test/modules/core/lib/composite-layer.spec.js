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
import {LayerManager, CompositeLayer, Layer, COORDINATE_SYSTEM} from 'deck.gl';
import {gl, testLayer} from '@deck.gl/test-utils';

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

class TestLayer extends Layer {
  initializeState() {}
}

TestLayer.layerName = 'TestLayer';

class TestCompositeLayer extends CompositeLayer {
  initializeState() {
    this.state = {scale: 1};
  }

  renderLayers() {
    return [
      new TestLayer(this.getSubLayerProps(), {
        scale: this.state.scale
      })
    ];
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

  const layerManager = new LayerManager(gl);
  layerManager.setLayers([layer]);
  const sublayers = layer.getSubLayers();
  const subProps = sublayers[0].props;
  for (const propName in BASE_LAYER_PROPS) {
    t.equal(
      subProps[propName],
      BASE_LAYER_PROPS[propName],
      `CompositeLayer subLayerProp ${propName} ok`
    );
  }
  layerManager.finalize();

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
      Object.assign({id: BASE_LAYER_ID}, baseLayerProps, {
        _subLayerProps: {[SUB_LAYER_ID]: overrideProps}
      })
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

test('CompositeLayer#getSubLayerProps(accessor)', t => {
  class TestWrapperLayer extends CompositeLayer {
    initializeState() {}

    updateState({props}) {
      this.setState({
        data: props.data.map((d, i) => this.getSubLayerRow({position: [0, 0]}, d, i))
      });
    }

    renderLayers() {
      return [
        new TestLayer(
          {
            getColor: this.getSubLayerAccessor(this.props.getColor)
          },
          this.getSubLayerProps({id: 'wrapped'}),
          {
            data: this.state.data
          }
        ),
        new TestLayer(
          {
            getColor: this.props.getColor
          },
          this.getSubLayerProps({id: 'pass-through'}),
          {
            data: this.props.data
          }
        )
      ];
    }
  }

  TestWrapperLayer.layerName = 'TestWrapperLayer';
  TestWrapperLayer.defaultProps = {
    getColor: {type: 'accessor', value: [0, 0, 0]}
  };

  const testCases = [
    {
      props: {
        id: 'wrapper-layer',
        data: [{color: [255, 0, 0]}],
        getColor: d => d.color
      },
      onAfterUpdate: ({subLayers}) => {
        let props = subLayers[0].props;
        t.deepEqual(
          props.getColor(props.data[0]),
          [255, 0, 0],
          `sublayer ${subLayers[0].id} getColor returns correct result`
        );
        props = subLayers[1].props;
        t.deepEqual(
          props.getColor(props.data[0]),
          [255, 0, 0],
          `sublayer ${subLayers[1].id} getColor returns correct result`
        );
      }
    },
    {
      updateProps: {
        _subLayerProps: {
          wrapped: {
            getColor: d => d.color
          },
          'pass-through': {
            getColor: d => d.color
          }
        }
      },
      onAfterUpdate: ({subLayers}) => {
        let props = subLayers[0].props;
        t.deepEqual(
          props.getColor(props.data[0]),
          [255, 0, 0],
          `sublayer ${subLayers[0].id} getColor returns correct result`
        );
        props = subLayers[1].props;
        t.deepEqual(
          props.getColor(props.data[0]),
          [255, 0, 0],
          `sublayer ${subLayers[1].id} getColor returns correct result`
        );
      }
    }
  ];

  testLayer({Layer: TestWrapperLayer, testCases, onError: t.notOk});

  t.end();
});

test('CompositeLayer#getSubLayerRow, getSubLayerAccessor', t => {
  const layer = new TestCompositeLayer(Object.assign({id: BASE_LAYER_ID}, BASE_LAYER_PROPS));

  const originalRow = {id: 'original datum', value: 100};
  const sublayerRow = layer.getSubLayerRow({id: 'sublayer datum'}, originalRow, 0);

  let accessor = layer.getSubLayerAccessor(1);
  t.is(accessor, 1, 'returns valid accessor');

  accessor = layer.getSubLayerAccessor(d => d.value);
  t.is(accessor(originalRow), 100, 'returns valid accessor');
  t.is(accessor(sublayerRow), 100, 'returns valid accessor');

  accessor = layer.getSubLayerAccessor((d, {index}) => index);
  t.is(accessor(originalRow, {index: 1}), 1, 'returns valid accessor');
  t.is(accessor(sublayerRow, {index: 1}), 0, 'returns valid accessor');

  t.deepEqual(
    layer.getPickingInfo({
      info: {object: originalRow, index: 1}
    }),
    {object: originalRow, index: 1},
    'returns correct picking info'
  );
  t.deepEqual(
    layer.getPickingInfo({
      info: {object: sublayerRow, index: 1}
    }),
    {object: originalRow, index: 0},
    'returns correct picking info'
  );

  t.end();
});

test('CompositeLayer#setState', t => {
  const layerManager = new LayerManager(gl);
  const compositeLayer = new TestCompositeLayer(BASE_LAYER_PROPS);
  let subLayer = null;

  layerManager.setLayers([compositeLayer]);
  subLayer = compositeLayer.getSubLayers()[0];
  t.is(subLayer.props.scale, 1, 'sublayer has default props');

  layerManager.updateLayers();
  t.is(subLayer, compositeLayer.getSubLayers()[0], 'composite layer should not rerender');

  compositeLayer.setState({scale: 2});
  layerManager.updateLayers();
  t.not(subLayer, compositeLayer.getSubLayers()[0], 'composite layer should rerender');
  subLayer = compositeLayer.getSubLayers()[0];
  t.is(subLayer.props.scale, 2, 'sublayer has updated props from state');

  layerManager.finalize();

  t.end();
});
